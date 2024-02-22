/* Classe global do Agent */
import { TOTVS_Agent_Analytics } from '../../app';

/* Dependência Node.js p/ comunicação via Socket */
import net from 'net';

/* Serviços do Electron */
import { Functions } from '../functions';
import { Execute } from '../execute';

/* Serviço de arquivos */
import { Files } from '../files';
import { FileValidation } from '../files-interface';

import Main from '../../electron-main';

/* Constantes do Agent-Server */
import {
  CNST_SERVER_SOURCE,
  CNST_SERVER_PORT,
  CNST_SERVER_HOSTNAME
} from '../electron-constants';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../../src-angular/app/utilities/utilities-constants';

/* Serviço de tradução do Electron */
import { TranslationService } from '../../src-electron/services/translation-service';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

/* Interfaces de comunicação com o Agent-Server */
import {
  ServerCommunication,
  SocketCommunication,
  License,
  AvailableLicenses,
  QueryCommunication,
  ScriptCommunication,
  ETLParameterCommunication,
  SQLParameterCommunication,
  QueryServer,
  ScriptServer,
  ETLParameterServer,
  SQLParameterServer,
  DataUpdate,
  responseObj
} from '../../src-angular/app/services/server/server-interface';

/* Serviço de criptografia do Agent */
import { EncryptionService } from '../encryption/encryption-service';

/* Interface de comunicação com o Java */
import { JavaInputBuffer } from '../../src-angular/app/utilities/java-interface';

/* Interface de versionamento do Agent */
import { Version } from '../../src-angular/app/utilities/version-interface';

/* Interfaces do Electron */
import { ClientData } from '../electron-interface';

/* Constante que define o ERP "Protheus" */
import { CNST_ERP_PROTHEUS } from '../../src-angular/app/workspace/workspace-constants';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from './workspace-service';
import { Workspace } from '../../src-angular/app/workspace/workspace-interface';

/* Interface de bancos de dados do Agent */
import { DatabaseService } from './database-service';
import { Database } from '../../src-angular/app/database/database-interface';

/* Serviço de agendametos do Agent */
import { ScheduleService } from './schedule-service';
import {
  Schedule,
  ETLParameterClient,
  SQLParameterClient
} from '../../src-angular/app/schedule/schedule-interface';

/* Serviço de rotinas do Agent */
import { ScriptService } from './script-service';
import { ScriptClient } from '../../src-angular/app/script/script-interface';

/* Serviço de consultas do Agent */
import { QueryService } from './query-service';
import { QueryClient } from '../../src-angular/app/query/query-interface';

/* Serviço de configuração do Agent */
import { ConfigurationService } from './configuration-service';
import { Configuration } from '../../src-angular/app/configuration/configuration-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, of, map, lastValueFrom, switchMap, forkJoin, catchError, from } from 'rxjs';

export class ServerService {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Variável que armazena a referência do servidor instanciado
  private static server: any = null;
  
  //Registra todas as conexões existentes com o Agent-Server
  private static sockets: SocketCommunication[] = [];
  
  //Buffer de recebimento de dados (concatenado p/ comunicações acima do limite do socket)
  private static longBuffer: string = null;
  
  //Armazena temporariamente o código de ativação do Agent, para primeira conexão ao servidor
  private static temporarySerialNumber: string = null;
  
  //Armazena o código serial deste Agent, enquanto a desativação está em andamento.
  private static deactivatedSerialNumber: string = null;

  /**************************/
  /*** MÉTODOS DO SERVIÇO ***/
  /**************************/
  /* Método de desligamento do serviço de servidor do Agent */
  private static shutdownServer(): void {
    ServerService.sockets.map((s: SocketCommunication) => {
      s.socket.end();
    });
    ServerService.sockets = [];
    ServerService.server.close();
  }
  
  /* Método de inicialização do servidor do Agent, para recebimento de comandos do Agent-Server */
  public static startServer(clientPort: number): Observable<boolean> {
    
    //Verifica se o servidor do Agent já está ativado. Caso já esteja, o mesmo é desligado
    if (ServerService.server != null) {
      ServerService.shutdownServer();
      ServerService.server = null;
    }
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.START', ['' + clientPort]),
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.FINISH', ['' + clientPort])
    ]);
    
    //Configuração dos eventos do servidor local, e controle do socket
    ServerService.server = net.createServer((socket: any) => {
      
      //Evento disparado ao receber uma nova palavra de comando, do Agent-Server
      socket.on('data', (buffer: string) => {
        
        //Adiciona o pacote recebido ao buffer concatenado
        ServerService.longBuffer = (ServerService.longBuffer == null ? buffer : ServerService.longBuffer + buffer);
        
        //Realiza a validação da palavra (criptografia, destino do pacote, etc). Ignora palavras inválidas.
        ServerService.validateCommandWord(ServerService.longBuffer).pipe(switchMap((command: ServerCommunication) => {
          if (command != null) {
            
            //Limpeza do buffer
            ServerService.longBuffer = null;
            
            //Caso seja uma conexão válida, adiciona a mesma ao conjunto atual
            ServerService.sockets.push({
              socket: socket,
              serialNumber: command.source
            });
            
            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null);
            
            //Disparo da rotina para processar a palavra de comando.
            switch (command.word) {
              
              //Desativação deste Agent
              case 'deactivateAgent':
                return ServerService.deactivateAgent(command).pipe(switchMap((res: responseObj) => {
                  return ServerService.sendResponseToServer(socket, 'deactivateAgent', res);
                }));
                break;
                
              //Envio da configuração atual deste Agent (workspaces, databases, etc), para o Agent-Server
              case 'requestAgentData':
                return ServerService.requestAgentData(command).pipe(switchMap((res: responseObj) => {
                  return ServerService.sendResponseToServer(socket, 'requestAgentData', res);
                }));
                break;
              
              //Envio dos arquivos de log deste Agent, para o Agent-Server
              case 'requestAgentLogs':
                return ServerService.requestAgentLogs(command).pipe(switchMap((res: responseObj) => {
                  return ServerService.sendResponseToServer(socket, 'requestAgentLogs', res);
                }));
                break;
              
              //Comando de ping deste serviço
              case 'ping':
                return ServerService.ping(command).pipe(switchMap((res: responseObj) => {
                  return ServerService.sendResponseToServer(socket, 'ping', res);
                }));
                break;
                
              //Comando de controle do acesso remoto (Mirror Mode)
              case 'setMirrorMode':
                return ServerService.setMirrorMode(command).pipe(switchMap((res: responseObj) => {
                  return ServerService.sendResponseToServer(socket, 'setMirrorMode', res);
                }));
                break;
              
              //Comando de sobreescrita do arquivo de configuração do Agent (Mirror Mode)
              case 'publishAgentData':
                return ServerService.publishAgentData(command).pipe(switchMap((res: responseObj) => {
                  return ServerService.sendResponseToServer(socket, 'publishAgentData', res);
                }));
                break;

              //Comando de escrita do arquivo de configuração do Agent, para o acesso remoto (Client p/ Client)
              case 'publishAgentDataAsMirror':
                return ServerService.publishAgentDataAsMirror(command).pipe(switchMap((res: responseObj) => {
                  return ServerService.sendResponseToServer(socket, 'publishAgentDataAsMirror', res);
                }));
                break;

              //Comando de escrita do arquivos de log do Agent, para o acesso remoto (Client p/ Client)
              case 'publishAgentLogsAsMirror':
                return ServerService.publishAgentLogsAsMirror(command).pipe(switchMap((res: responseObj) => {
                  return ServerService.sendResponseToServer(socket, 'publishAgentLogsAsMirror', res);
                }));
                break;

              //Comando de teste de conexão ao banco de dados do Agent (Teste Local / Disparo Remoto)
              case 'requestDatabaseConnectionTest':
                return ServerService.requestDatabaseConnectionTest(command).pipe(switchMap((res: responseObj) => {
                  return ServerService.sendResponseToServer(socket, 'requestDatabaseConnectionTest', res);
                }));
                break;
              
              //Comando de execução remota e imediata de um agendamento do Agent (Teste Local / Disparo Remoto)
              case 'requestScheduleExecution':
                return ServerService.requestScheduleExecution(command).pipe(switchMap((res: responseObj) => {
                  return ServerService.sendResponseToServer(socket, 'requestScheduleExecution', res);
                }));
                break;
              
              //Comando de execução remota e imediata da validação dos arquivos locais de um agendamento
              case 'requestFileIntegrityTest':
                return ServerService.requestFileIntegrityTest(command).pipe(switchMap((res: responseObj) => {
                  return ServerService.sendResponseToServer(socket, 'requestFileIntegrityTest', res);
                }));
                break;
              
              //Comando de exportação da tabela I01 do Protheus (Teste Local / Disparo Remoto)
              case 'requestQueryExport':
                return ServerService.requestQueryExport(command).pipe(switchMap((res: responseObj) => {
                  return ServerService.sendResponseToServer(socket, 'requestQueryExport', res);
                }));
                break;
            }
          } else { return of(null); }
        })).subscribe();
      });
      
      //Configuração do evento disparado ao terminar a conexão com o Agent-Server
      socket.on('close', () => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.DISCONNECTED'], null, null, null);
      });
    });
    
    //Evento disparado ao desligar este servidor local
    ServerService.server.on('close', () => {
      Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.FINISH'], null, null, null);
    });
    
    //Retorna o observável de inicialização do servidor local
    return new Observable<boolean>((subscriber: any) => {
      ServerService.server.listen(clientPort, 'localhost', null, () => {
        Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.START'], null, null, null);
        subscriber.next(true);
        subscriber.complete();
      });
      
      //Tratamento de erro na inicialização do servidor local
      ServerService.server.once('error', (err: any) => {
        Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.ERROR'], null, null, null);
        subscriber.next(false);
        subscriber.complete();
      });
    });
  }
  
  /* Método de preparação da palavra de comando, para envio ao Agent-Server */
  private static prepareCommandWord(word: string, errorCode: number, args: any[]): Observable<string> {
    
    //Consulta da configuração atual do Agent
    return ConfigurationService.getConfiguration(false).pipe(map((configuration: Configuration) => {
      
      //Montagem e criptografia da palavra de comando a ser enviada
      let command: ServerCommunication = {
        source: (ServerService.deactivatedSerialNumber != null ? ServerService.deactivatedSerialNumber : configuration.serialNumber),
        destination: CNST_SERVER_SOURCE,
        word: word,
        errorCode: errorCode,
        args: args
      };
      
      ServerService.deactivatedSerialNumber = null;
      return EncryptionService.encrypt(JSON.stringify(command));
    }));
  }
  
  /* Método de validação da palavra de comando, recebida do Agent-Server */
  private static validateCommandWord(obj: any): Observable<ServerCommunication> {
    
    //Consulta da configuração atual do Agent
    return ConfigurationService.getConfiguration(false).pipe(map((configuration: Configuration) => {
      try {
        //Descriptografa o comando recebido, e converte-o para o objeto de comunicação
        let command: ServerCommunication = JSON.parse(EncryptionService.decrypt(obj.toString()));
        
        //Verifica se o pacote recebido é destinado para esta instância do Agent
        if (
             ((command.destination == configuration.serialNumber) && (ServerService.temporarySerialNumber == null))
          || ((command.destination == ServerService.temporarySerialNumber) && (ServerService.temporarySerialNumber != null))
        ) {
          return command;
        } else {
          return null;
        }
      } catch {
        return null;
      }
    }));
  }
  
  /****************************************/
  /***    Envio de mensagens (OUTPUT)   ***/
  /****************************************/
  /* Método de resposta de uma palavra recebida pelo Agent-Server */
  private static sendResponseToServer(socket: any, word: string, res: responseObj): Observable<boolean> {
    
    //Prepara o comando a ser enviado ao socket
    return ServerService.prepareCommandWord(
      word,
      res.errorCode,
      res.response
    ).pipe(map((buffer: string) => {
      
      //Envia a resposta para o socket
      socket.write(buffer);
      return true;
    }));
  }
  
  /*
    Método para envio de pacotes ao servidor da TOTVS
    
    Retorna um observável que emite uma única vez após
    o término da thread de comunicação com o servidor.
  */
  private static sendCommandToServer(command: string, word: string, callbackFunction: any): Observable<any> {
    
    //Define o hostname do Agent-Server, dependendo se a aplicação está sendo executada em desenv / prod.
    let serverHostname: string = (TOTVS_Agent_Analytics.isProduction() ? CNST_SERVER_HOSTNAME.DEVELOPMENT : CNST_SERVER_HOSTNAME.PRODUCTION);
    
    //Retorna o observável para envio do comando ao Agent-Server
    return new Observable<any>((subscriber: any) => {
      
      //Socket de comunicação com o Agent-Server
      let socket: any = new net.Socket();
      
      //Buffer de recebimento de dados (concatenado p/ comunicações acima do limite do socket)
      let longBuffer: string = null;
      
      //Resposta final desta instância de conexão ao servidor
      let response: any = null;
      
      //Detecta se ocorreu algum erro na inicialização do servidor
      let hasErrors: boolean = false;
      
      //Consulta das traduções
      let translations: any = TranslationService.getTranslations([
        new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_COMMAND', [word]),
        new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_COMMAND_RESPONSE', [word])
      ]);
      
      //Inicializa a conexão com o servidor da TOTVS
      socket.connect(CNST_SERVER_PORT, serverHostname, () => {
	      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.CONNECTED'], null, null, null);
	      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_COMMAND'], null, null, null);
        
        //Envia o pacote para o servidor
        socket.write(command);
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_COMMAND_OK'], null, null, null);
      });
      
      //Configura o evento disparado ao receber a resposta da palavra de comando, pelo Agent-Server
      socket.on('data', (buffer: any) => {
        
        //Adiciona o pacote recebido ao buffer concatenado
        longBuffer = (longBuffer == null ? buffer : longBuffer + buffer);
        
        //Realiza a validação da palavra (criptografia, destino do pacote, etc). Ignora palavras inválidas.
        ServerService.validateCommandWord(longBuffer).subscribe((command: ServerCommunication) => {
          if ((command != null) && (command.word == word)) {
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_COMMAND_RESPONSE'], null, null, null);
            
            //Executa a função de callback desta thread, e encerra a conexão
            callbackFunction(command).subscribe((res: any) => {
              response = res;
              socket.end();
            });
          }
        });
	    });
      
      //Tratamento de erros na comunicação do socket com o Agent-Server
      socket.on('error', (err: any) => {
        console.log(err);
        hasErrors = true;
        subscriber.next(null);
        subscriber.complete();
      });
      
      //Evento disparado ao encerrar a conexão com o Agent-Server. Emite o resultado da função de callback do método
      socket.on('close', () => {
        if (!hasErrors) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.DISCONNECTED'], null, null, null);
        subscriber.next(response);
        subscriber.complete();
      });
    });
  }
  
  /* Método de resposta de uma palavra recebida pelo Agent-Server */
  public static pingServer(): Observable<boolean> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('ping', null, []).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'ping',
        (response: ServerCommunication) => {
          return of(response.args[0]);
        }
      ).pipe(map((res: string) => {
        if (res == 'pong') return true;
        else return false;
      }));
    }));
  }
  
  /* Método de solicitação do SerialNumber do Agent (Ativação) */
  public static requestSerialNumber(args: string[]): Observable<number> {
    
    //Prepara o envio da porta de comunicação para o Agent-Server
    return ConfigurationService.getConfiguration(false).pipe(switchMap((configuration: Configuration) => {
      args.push('' + configuration.clientPort);
      
      //Inicializa o servidor local de comunicação com o Agent-Server
      return ServerService.startServer(configuration.clientPort).pipe(switchMap((b: boolean) => {
        
        //Armazena temporariamente o código de ativação do Agent
        ServerService.temporarySerialNumber = args[0];
        
        //Prepara a palavra de comando a ser enviada, com criptografia
        return ServerService.prepareCommandWord('requestSerialNumber', null, args).pipe(switchMap((buffer: string) => {
          
          //Envia o comando para o servidor da TOTVS, e processa a resposta pela função de callback
          //(HOF - Higher Order Function)
          return ServerService.sendCommandToServer(
            buffer,
            'requestSerialNumber',
            (response: ServerCommunication) => {
              
              //Verifica se o Agent-Server enviou um SerialNumber para esta instância do Agent
              if (response.args[0] != null) {
                return ConfigurationService.getConfiguration(false).pipe(switchMap((configuration: Configuration) => {
                  Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER'], null, null, null);
                  
                  //Realiza a gravação do serialNumber desta instância do Agent
                  configuration.serialNumber = response.args[0];
                  configuration.instanceName = response.args[1];
                  
                  return Files.readApplicationData().pipe(switchMap((_dbd: ClientData) => {
                    _dbd.configuration = configuration;
                    return Files.writeApplicationData(_dbd).pipe(map((b: boolean) => {
                      
                      //Remove o código de ativação temporário do Agent
                      ServerService.temporarySerialNumber = null;
                      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_OK'], null, null, null);
                      if (b) return 1;
                      else return 0;
                    
                    //Tratamento de erros
                    }, (err: any) => {
                      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_ERROR'], null, null, null);
                    }));
                  }));
                }));
              
              //Caso o SerialNumber não tenha sido recebido, é gerado um log de erro de acordo com o código recebido
              } else {
                switch (response.errorCode) {
                  case (-1):
                    Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_ERROR_INVALID'], null, null, null);
                    break;
                  case (-2):
                    Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_ERROR_COMMUNICATION'], null, null, null);
                    break;
                }
                return of(response.errorCode);
              }
            }
          ).pipe(map((b: number) => {
            return b;
          }));
        }));
      }));
    }));
  }
  
  /* Método de atualização da porta de comunicação do Agent */
  public static updateCommunicationPort(args: string[]): Observable<boolean> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('updateCommunicationPort', null, args).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'updateCommunicationPort',
        (response: ServerCommunication) => {
          return of(response.args[0]);
        }
      ).pipe(map((b: boolean) => {
        if (b != null) return b;
        else return false;
      }));
    }));
  }
  
  /* Método de solicitação das licenças disponíveis para esta instalação do Agent */
  public static getAvailableLicenses(showLogs: boolean): Observable<AvailableLicenses> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('getAvailableLicenses', null, []).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'getAvailableLicenses',
        (response: ServerCommunication) => {
          return of(response.args[0]);
        }
      ).pipe(map((res: AvailableLicenses) => {
        return res;
      }));
    }));
  }
  
  /* Método de solicitação das janelas de execução dos agendamentos válidas para esta instalação do Agent */
  public static getAvailableExecutionWindows(): Observable<string[]> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('getAvailableExecutionWindows', null, []).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'getAvailableExecutionWindows',
        (response: ServerCommunication) => {
          return of(response.args[0]);
        }
      ).pipe(map((res: string[]) => {
        return res;
      }));
    }));
  }
  
  /* Método de solicitação dos últimos parâmetros de ETL disponíveis para esta licença do Agent */
  public static getLatestETLParameters(license: License): Observable<ETLParameterCommunication> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('getLatestETLParameters', null, [license]).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'getLatestETLParameters',
        (response: ServerCommunication) => {
          return of(response.args[0]);
        }
      ).pipe(map((res: ETLParameterCommunication) => {
        return res;
      }));
    }));
  }
  
  /* Método de solicitação dos últimos parâmetros de SQL disponíveis para esta licença do Agent */
  public static getLatestSQLParameters(license: License, database: string): Observable<SQLParameterCommunication> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('getLatestSQLParameters', null, [license, database]).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'getLatestSQLParameters',
        (response: ServerCommunication) => {
          return of(response.args[0]);
        }
      ).pipe(map((res: SQLParameterCommunication) => {
        return res;
      }));
    }));
  }
  
  /* Método de solicitação das últimas consultas disponíveis para esta licença do Agent */
  public static saveLatestQueries(license: License, database: Database, scheduleId: string): Observable<number> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('getLatestQueries', null, [license, database.brand]).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'getLatestQueries',
        (response: ServerCommunication) => {
          
          //Conversão da resposta do Agent-Server, para o objeto de comunicação das consultas
          let queries: QueryCommunication = Object.assign(new QueryCommunication(), response.args[0]);
          
          //Itera por todas as consultas recebidas, e define o código de agendamento de cada uma delas
          let queriesToSave: QueryClient[] = queries.Queries.map((q: QueryClient) => {
            q.scheduleId = scheduleId;
            return q;
          });
          
          //Gravação de todas as consultas recebidas pelo Agent-Server
          if (queriesToSave.length > 0) {
            return QueryService.saveQuery(queriesToSave).pipe(map((res: number) => {
              return res;
            }));
          } else {
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.IMPORT_NO_DATA'], null, null, null);
            
            //Caso a origem dos dados seja do Protheus, é realizada uma consulta à tabela I01 (Caso aplicável)
            if (license.source == CNST_ERP_PROTHEUS) {
              Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.IMPORT_I01'], null, null, null);
              
              //Leitura da configuração atual do Agent
              return ConfigurationService.getConfiguration(false).pipe(switchMap((conf: Configuration) => {
                Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.IMPORT_I01_PREPARE'], null, null, null);
                database.password = EncryptionService.decrypt(database.password);
                
                //Preparação do buffer de entrada para o Java
                let javaInput: JavaInputBuffer = {
                  workspace: null,
                  database: database,
                  schedule: null,
                  queries: null,
                  scripts: null,
                  configuration: conf
                }
                
                //Criptografia do pacote a ser enviado
                let params = EncryptionService.encrypt(JSON.stringify(javaInput));
                
                if (Main.getMirrorMode() != 2) {
                  return QueryService.exportQueriesFromI01Locally(params, scheduleId).pipe(switchMap((queriesI01: QueryClient[]) => {
                    return QueryService.saveQuery(queriesI01).pipe(map((q: number) => {
                      return q;
                    }));
                  }));
                } else {
                  return ServerService.exportQueriesFromI01Remotelly(params, scheduleId).pipe(switchMap((res: any) => {
                    if (res.errorCode == null) {
                      return QueryService.saveQuery(res.args).pipe(map((q: number) => {
                        return q;
                      }));
                    } else {
                      return of(res.errorCode);
                    }
                  }));
                }
              }));
            
            //Caso a origem dos dados não seja do Protheus, é gerada uma mensagem de erro
            } else {
              Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.IMPORT_NO_DATA_ERROR'], null, null, null);
              return of(-2);
            }
          }
        }
      ).pipe(map((res: number) => {
        return res;
      }));
    }));
  }
  
  /* Método de solicitação das últimas rotinas disponíveis para esta licença do Agent */
  public static saveLatestScripts(license: License, brand: string, scheduleId: string): Observable<number> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('getLatestScripts', null, [license, brand]).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'getLatestScripts',
        (response: ServerCommunication) => {
          
          //Conversão da resposta do Agent-Server, para o objeto de comunicação das rotinas
          let scripts: ScriptCommunication = Object.assign(new ScriptCommunication(), response.args[0]);
          
          //Itera por todas as rotinas recebidas, e define o código de agendamento de cada uma delas
          let scriptsToSave: ScriptClient[] = scripts.Scripts.map((s: ScriptClient) => {
            s.scheduleId = scheduleId;
            return s;
          });
          
          /*
            Realiza a gravação das rotinas padrões.
            Caso não tenha recebido nenhuma rotina do Agent-Server, é gerado um código de erro
          */
          if (scriptsToSave.length > 0) {
            return ScriptService.saveScript(scriptsToSave).pipe(map((res: number) => {
              return res;
            }));
          } else {
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.IMPORT_NO_DATA'], null, null, null);
            Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.IMPORT_NO_DATA_ERROR'], null, null, null);
            return of(-2);
          }
        }
      ).pipe(map((res: number) => {
        return res;
      }));
    }));
  }
  
  /*
    Método de atualização de todos os objetos do Agent-Server
    Executado automaticamente pelo Electron
    
    Consultas
    Rotinas
    Parâmetros de ETL
    Parâmetros de SQL
  */
  public static getUpdatesFromServer(): Observable<number> {
    
    //Objetos a serem processados pelo Agent-Server
    let queryUpdates: QueryServer[] = [];
    let scriptUpdates: ScriptServer[] = [];
    let ETLParameterUpdates: ETLParameterServer[] = [];
    let SQLParameterUpdates: SQLParameterServer[] = [];
    
    //Consulta das informações necessárias
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.UPDATES'], null, null, null);
    return forkJoin([
      ScheduleService.getSchedules(false),
      WorkspaceService.getWorkspaces(false),
      DatabaseService.getDatabases(false),
      QueryService.getQueries(false),
      ScriptService.getScripts(false)
    ]).pipe(switchMap((results: [Schedule[], Workspace[], Database[], QueryClient[], ScriptClient[]]) => {
      
      /*
        Remove todas as consultas que são não padrões do comando de atualização
        Busca as informações de licença / banco de dados de cada consulta
      */
      queryUpdates = results[3].filter((q: QueryClient) => (q.TOTVS))
      .map((q: QueryClient) => {
        let schedule: Schedule = results[0].find((sch: Schedule) => (sch.id == q.scheduleId));
        let workspace: Workspace = results[1].find((wrk: Workspace) => (schedule.workspaceId = wrk.id));
        let database: Database = results[2].find((dat: Database) => (workspace.databaseIdRef == dat.id));
        
        //Retorna a consulta a ser analisada pelo Agent-Server
        return q.toServer(q.id, workspace.license.id, database.brand);
      });
      
      /*
        Remove todas as rotinas que são não padrões do comando de atualização
        Busca as informações de licença / banco de dados de cada rotina
      */
      scriptUpdates = results[4].filter((s: ScriptClient) => (s.TOTVS))
      .map((s: ScriptClient) => {
        let schedule: Schedule = results[0].find((sch: Schedule) => (sch.id == s.scheduleId));
        let workspace: Workspace = results[1].find((wrk: Workspace) => (schedule.workspaceId = wrk.id));
        let database: Database = results[2].find((dat: Database) => (workspace.databaseIdRef == dat.id));
        
        //Retorna a rotina a ser analisada pelo Agent-Server
        return s.toServer(s.id, workspace.license.id, database.brand);
      });
      
      //Remove todos os parâmetros de ETL que são não padrões do comando de atualização
      results[0].map((s: Schedule) => {
        let scheduleParameters: ETLParameterServer[] = s.ETLParameters.filter((param: ETLParameterClient) => (param.TOTVS))
        
        //Busca as informações de licença / banco de dados de cada parâmetro de ETL
        .map((param: ETLParameterClient) => {
          let workspace: Workspace = results[1].find((wrk: Workspace) => (s.workspaceId = wrk.id));
          let database: Database = results[2].find((dat: Database) => (workspace.databaseIdRef == dat.id));
          
          //Retorna a consulta a ser analisada pelo Agent-Server
          return param.toServer(workspace.license.id);
        });
        
        ETLParameterUpdates = ETLParameterUpdates.concat(scheduleParameters);
      });
      
      //Remove todos os parâmetros de SQL que são não padrões do comando de atualização
      results[0].map((s: Schedule) => {
        let scheduleParameters: SQLParameterServer[] = s.SQLParameters.filter((param: SQLParameterClient) => (param.TOTVS))
        
        //Busca as informações de licença / banco de dados de cada parâmetro de SQL
        .map((param: SQLParameterClient) => {
          let workspace: Workspace = results[1].find((wrk: Workspace) => (s.workspaceId = wrk.id));
          let database: Database = results[2].find((dat: Database) => (workspace.databaseIdRef == dat.id));
          
          //Retorna a consulta a ser analisada pelo Agent-Server
          return param.toServer(workspace.license.id, database.brand);
        });
        
        SQLParameterUpdates = SQLParameterUpdates.concat(scheduleParameters);
      });
      
      //Inicialização do objeto de atualizações, a ser enviado ao Agent-Server
      let data: DataUpdate = new DataUpdate(
        ETLParameterUpdates,
        SQLParameterUpdates,
        queryUpdates,
        scriptUpdates
      );
      
      //Prepara a palavra de comando a ser enviada, com criptografia
      return ServerService.prepareCommandWord('getUpdates', null, [data]).pipe(switchMap((buffer: string) => {
        
        //Envia o comando para o servidor da TOTVS, e processa a resposta
        //(HOF - Higher Order Function)
        return ServerService.sendCommandToServer(
          buffer,
          'getUpdates',
          (response: ServerCommunication) => {
            
            //Conversão da resposta do Agent-Server, para o objeto de comunicação das rotinas
            let dataUpdate: DataUpdate = Object.assign(new DataUpdate(null, null, null, null), response.args[0]);
            
            /*
              Itera por todas as consultas atualmente gravadas no Agent,
              procurando a resposta do Agent-Server para cada uma delas.
              Caso a consulta não possua atualização disponível, a mesma é removida do vetor
            */
            let queriesToSave: QueryClient[] = results[3].map((query: QueryClient) => {
              let updated: QueryServer = new QueryServer().toObject(dataUpdate.Queries.find((q: QueryServer) => (query.id == q.id)));
              
              //Caso a resposta do Agent-Server seja uma versão acima da instalada atualmente, o vetor é atualizado
              if (updated.version.getPatchVersion() > query.version.getPatchVersion()) {
                query.command = updated.command;
                query.version = updated.version;
                query.executionMode = updated.executionMode;
                
                return query;
              } else {
                return null;
              }
            }).filter((q: QueryClient) => (q != null));
            
            /*
              Itera por todas as rotinas atualmente gravadas no Agent,
              procurando a resposta do Agent-Server para cada uma delas.
              Caso a rotina não possua atualização disponível, a mesma é removida do vetor
            */
            let scriptsToSave: ScriptClient[] = results[4].map((script: ScriptClient) => {
              let updated: ScriptServer = new ScriptServer().toObject(dataUpdate.Scripts.find((s: ScriptServer) => (script.id == s.id)));
              
              //Caso a resposta do Agent-Server seja uma versão acima da instalada atualmente, o vetor é atualizado
              if (updated.version.getPatchVersion() > script.version.getPatchVersion()) {
                script.command = updated.command;
                script.version = updated.version;
                
                return script;
              } else {
                return null;
              }
            }).filter((s: ScriptClient) => (s != null));
            
            
            /*
              Itera por todos os agendamentos atualmente gravados no Agent,
              procurando a resposta do Agent-Server para cada parâmetro de ETL / SQL deles.
              Caso o agendamento não possua nenhum parâmetro com atualização disponível, o mesma é removido do vetor
            */
            let schedulesToSave: Schedule[] = results[0].map((s: Schedule) => {
              let hasUpdates: boolean = false;
              
              //Procura por atualizações em cada parâmetro de ETL do agendamento
              s.ETLParameters = s.ETLParameters.map((param: ETLParameterClient) => {
                let updated: ETLParameterServer = new ETLParameterServer().toObject(dataUpdate.ETLParameters.find((p: ETLParameterServer) => (param.id == p.id)));
                
                //Caso a resposta do Agent-Server seja uma versão acima da instalada atualmente, o vetor é atualizado
                if (updated.version.getPatchVersion() > param.version.getPatchVersion()) {
                  hasUpdates = true;
                  param.command = updated.command;
                  param.version = updated.version;
                }
                return param;
              });
              
              //Procura por atualizações em cada parâmetro de SQL do agendamento
              s.SQLParameters = s.SQLParameters.map((param: SQLParameterClient) => {
                let updated: SQLParameterServer = new SQLParameterServer().toObject(dataUpdate.SQLParameters.find((p: SQLParameterServer) => (param.id == p.id)));
                
                //Caso a resposta do Agent-Server seja uma versão acima da instalada atualmente, o vetor é atualizado
                if (updated.version.getPatchVersion() > param.version.getPatchVersion()) {
                  hasUpdates = true;
                  param.command = updated.command;
                  param.version = updated.version;
                  param.sql = updated.sql;
                }
                return param;
              });
              
              /*
                Caso pelo menos uma atualização dentra sido encontrada, o agendamento é mantido.
                Caso contrário, o mesmo é removido do vetor
              */
              if (hasUpdates) return s;
              else return null;
            }).filter((s: Schedule) => (s != null));
            
            //Dispara os serviços de atualização de cada objeto
            return forkJoin([
              QueryService.saveQuery(queriesToSave),
              ScriptService.saveScript(scriptsToSave),
              ScheduleService.saveSchedule(schedulesToSave)
            ]).pipe(map((res: [number, number, number]) => {
              if ((res[0] == null) && (res[1] == null) && (res[2] == null)) return null;
              else return res[0] + res[1] + res[2];
            }));
          }
        ).pipe(map((res: number) => {
          return res;
        }));
      }));
    }));
  }
  
  /* Método de envio das alterações feitas na instância espelhada do Agent, para o Agent-Server */
  public static deactivateMirrorMode(db: ClientData): Observable<boolean> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('deactivateMirrorMode', null, [db]).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'deactivateMirrorMode',
        (response: ServerCommunication) => {
          return of(response);
        }
      ).pipe(map((res: ServerCommunication) => {
        return Boolean(res.args[0]);
      }));
    }));
  }
  
  /* Método de teste de conexão ao banco de dados do Agent (Teste Remoto / Disparo Remoto) */
  public static testDatabaseConnectionRemotelly(inputBuffer: string): Observable<number> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('testDatabaseConnection', null, [inputBuffer]).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'testDatabaseConnection',
        (response: ServerCommunication) => {
          return of(response);
        }
      ).pipe(map((res: ServerCommunication) => {
        return res.errorCode;
      }));
    }));
  }
  
  /* Método de teste de conexão ao banco de dados do Agent (Teste Remoto / Disparo Remoto) */
  public static executeAndUpdateScheduleRemotelly(inputBuffer: string, scheduleId: string): Observable<number> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('executeAndUpdateSchedule', null, [inputBuffer, scheduleId]).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'executeAndUpdateSchedule',
        (response: ServerCommunication) => {
          return of(response);
        }
      ).pipe(map((res: ServerCommunication) => {
        if (res.errorCode) return res.errorCode;
        else return Number(res.args[0]);
      }));
    }));
  }
  
  /* Método de validação dos arquivos locais de um agendamento (Teste Remoto / Disparo Remoto) */
  public static checkFileIntegrityRemotelly(scheduleId: string): Observable<FileValidation[]> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('checkFileIntegrity', null, [scheduleId]).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'checkFileIntegrity',
        (response: ServerCommunication) => {
          return of(response);
        }
      ).pipe(map((res: ServerCommunication) => {
        let files: FileValidation[] = [];
        res.args.map((file: string) => {
          let f: FileValidation = Object.assign(new FileValidation(null, null), file);
          files.push(f);
        });
        
        return files;
      }));
    }));
  }
  
  /* Método de teste de conexão ao banco de dados do Agent (Teste Remoto / Disparo Remoto) */
  public static exportQueriesFromI01Remotelly(inputBuffer: string, scheduleId: string): Observable<ServerCommunication> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('exportQueriesFromI01', null, [inputBuffer, scheduleId]).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'exportQueriesFromI01',
        (response: ServerCommunication) => {
          return of(response);
        }
      ).pipe(map((res: ServerCommunication) => {
        return res;
      }));
    }));
  }

  /* Método de acesso remoto ao Agent (Client p/ Client) */
  public static requestRemoteAccess(inputBuffer: string): Observable<boolean> {

    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('requestRemoteAccess', null, [inputBuffer]).pipe(switchMap((buffer: string) => {

      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'requestRemoteAccess',
        (response: ServerCommunication) => {
          return of(response);
        }
      ).pipe(map((res: ServerCommunication) => {
        return Boolean(res.args[0]);
      }));
    }));
  }

  /****************************************/
  /*** Recebimento de mensagens (INPUT) ***/
  /****************************************/
  /* Método de envio das configurações atuais deste Agent, para o Agent-Server */
  private static deactivateAgent(command: ServerCommunication): Observable<responseObj> {
    return ConfigurationService.getConfiguration(false).pipe(switchMap((conf: Configuration) => {
      ServerService.deactivatedSerialNumber = conf.serialNumber;
      return Files.readApplicationData().pipe(switchMap((_dbd: ClientData) => {
        _dbd.configuration.serialNumber = null;
        return Files.writeApplicationData(_dbd).pipe(map((b: boolean) => {
          if (b) Main.updateDeactivationPreferrences();
          return new responseObj([b], null);
        }));
      }));
    }));
  }
  
  /* Método de envio das configurações atuais deste Agent, para o Agent-Server */
  private static requestAgentData(command: ServerCommunication): Observable<responseObj> {
    return Files.readApplicationData().pipe(map((db: ClientData) => {
      return new responseObj([db], null);
    }));
  }
  
  /* Método de envio das configurações atuais deste Agent, para o Agent-Server */
  private static requestAgentLogs(command: ServerCommunication): Observable<responseObj> {
    return of(new responseObj(Files.readLogs(), null));
  }
  
  /* Método de teste de comunicação do Agent, com o Agent-Server */
  private static ping(command: ServerCommunication): Observable<responseObj> {
    return of(new responseObj(['pong'], null));
  }
  
  /* Método de controle do acesso remoto (MirrorMode), do Agent-Server */
  public static setMirrorMode(command: ServerCommunication): Observable<responseObj> {
    Main.setMirrorMode(Number(command.args[0]));
    return Main.updateMirrorModePreferences().pipe(map((b: boolean) => {
      return new responseObj([true], null);
    }));
  }
  
  /* Método de sobrescrita do arquivo de configuração do Agent (MirrorMode) */
  private static publishAgentData(command: ServerCommunication): Observable<responseObj> {
    let db: ClientData = Object.assign(new ClientData(), command.args[0]);
    return Files.writeApplicationData(db).pipe(map((b: boolean) => {
      return new responseObj([(b ? 1 : 0)], null);
    }));
  }

  /* Método de escrita do arquivo de configuração do agent, para o acesso remoto (Client p/ Client) */
  private static publishAgentDataAsMirror(command: ServerCommunication): Observable<responseObj> {
    let db: ClientData = Object.assign(new ClientData(), command.args[0]);
    return Files.writeMirrorData(db).pipe(map((b: boolean) => {
      return new responseObj([(b ? 1 : 0)], null);
    }));
  }

  /* Método de escrita do arquivo de configuração do agent, para o acesso remoto (Client p/ Client) */
  private static publishAgentLogsAsMirror(command: ServerCommunication): Observable<responseObj> {
    Files.writeRemoteLogData(command.args);
    return of(new responseObj([true], null));
  }

  /* Método de teste de conexão ao banco de dados do Agent (Teste Local / Disparo Remoto) */
  private static requestDatabaseConnectionTest(command: ServerCommunication): Observable<responseObj> {
    return from(DatabaseService.testDatabaseConnectionLocally(command.args[0])).pipe(map((res: number) => {
      return new responseObj([], res);
    }));
  }
  
  /* Método de execução remota e imediata de um agendamento do Agent  (Teste Local / Disparo Remoto) */
  private static requestScheduleExecution(command: ServerCommunication): Observable<responseObj> {
    return ScheduleService.executeAndUpdateScheduleLocally(command.args[0], command.args[1]).pipe(map((res: number) => {
      return new responseObj([res], null);
    }));
  }
  
  /* Método de execução remota e imediata de um agendamento do Agent  (Teste Local / Disparo Remoto) */
  private static requestFileIntegrityTest(command: ServerCommunication): Observable<responseObj> {
    return ScheduleService.getSchedules(false).pipe(switchMap((schedules: Schedule[]) => {
      let s: Schedule = schedules.find((schedule: Schedule) => schedule.id == command.args[0]);
      return Files.checkFileIntegrityLocally(s.fileFolder).pipe(map((res: FileValidation[]) => {
        return new responseObj(res, null);
      }));
    }));
  }
  
  /* Método de exportação da tabela I01 do Protheus (Teste Local / Disparo Remoto) */
  private static requestQueryExport(command: ServerCommunication): Observable<responseObj> {
    return QueryService.exportQueriesFromI01Locally(command.args[0], command.args[1]).pipe(map((res: QueryClient[]) => {
      return new responseObj(res, null);
    }));
  }
}
