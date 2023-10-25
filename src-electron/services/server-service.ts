/* Nome padrão para pacotes destinados ao Agent-Server */
import {
  CNST_SERVER_SOURCE,
  CNST_SERVER_PORT,
  CNST_SERVER_HOSTNAME
} from '../constants-electron';

/* Constante que define o modo de execução do Agent (Desenv / Prod) */
import { CNST_APPLICATION_PRODUCTION } from '../../app';

/* Dependência Node.js p/ comunicação via Socket */
import net from 'net';

/* Interface de comunicação com o Agent-Server */
import {
  ServerCommunication,
  SocketCommunication
} from '../../src-angular/app/services/server/server-interface';

/* Serviços do Electron */
import { Files } from '../files';
import { Functions } from '../functions';
import { Execute } from '../execute';

/* Interface de comunicação com o Java */
import { JavaInputBuffer } from '../../src-angular/app/utilities/java-interface';

/* Interface de versionamento do Agent */
import { Version } from '../../src-angular/app/utilities/version-interface';

/* Interfaces do Electron */
import { DatabaseData } from '../electron-interface';

/* Serviço de tradução do Electron */
import { TranslationService } from '../../src-electron/services/translation-service';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../../src-angular/app/utilities/utilities-constants';

/* Interfaces de comunicação com o Agent-Server */
import {
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
  DataUpdate
} from '../../src-angular/app/services/server/server-interface';

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
import { Observable, of, map, lastValueFrom, switchMap, forkJoin, catchError } from 'rxjs';

export class ServerService {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Variável que armazena a referência do servidor instanciado
  private static server: any = null;
  
  //Define se a inicialização do servidor foi efetuada com sucesso
  private static serverStarted: boolean = false;
  
  //Registra todas as conexões existentes com o Agent-Server
  private static sockets: SocketCommunication[] = [];
  
  //Armazena temporariamente o código de ativação do Agent, para primeira conexão ao servidor
  private static temporarySerialNumber: string = null;
  
  /**************************/
  /*** MÉTODOS DO SERVIÇO ***/
  /**************************/
  /* Método de desligamento do Agent-Server */
  private static shutdownServer(): void {
    ServerService.sockets.map((s: SocketCommunication) => {
      s.socket.end();
    });
    ServerService.sockets = [];
    ServerService.server.close();
  }
  
  /* Método de inicialização do servidor do Agent, para recebimento de comandos do Agent-Server */
  public static startServer(clientPort: number): Observable<boolean> {
    
    //Verifica se o servidor do Agent já está ativado
    if (ServerService.server != null) {
      ServerService.shutdownServer();
      ServerService.server = null;
    }
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.START', ['' + clientPort]),
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.FINISH', ['' + clientPort])
    ]);
    
    //Evento disparado ao se conectar ao Agent-Server
    ServerService.server = net.createServer((socket: any) => {
      
      //Evento disparado ao receber uma nova palavra de comando, do Agent-Server
      socket.on('data', (buffer: string) => {
        ServerService.validateCommandWord(buffer).subscribe((command: ServerCommunication) => {
          if (command != null) {
            
            //Adiciona a nova conexão ao conjunto
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
              case 'requestAgentData':
                Files.readApplicationData().subscribe((db: DatabaseData) => {
                  ServerService.prepareCommandWord(
                    'requestAgentData',
                    [db]
                  ).subscribe((buffer: string) => {
                    socket.write(buffer);
                  });
                });
                break;
              case 'ping':
                ServerService.prepareCommandWord(
                  'ping',
                  ['pong']
                ).subscribe((buffer: string) => {
                  socket.write(buffer);
                });
                break;
            }
          }
        });
      });
      
      //Evento disparado ao perder a conexão com o Agent-Server
      socket.on('close', () => {
        Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.FINISH'], null, null, null);
      });
    });
    
    //Evento disparado ao desligar o Agent-Server
    ServerService.server.on('close', () => {
      Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.FINISH'], null, null, null);
    });
    
    //Ativa o listener da porta local do Agent
    return new Observable<boolean>((subscriber: any) => {
      ServerService.server.listen(clientPort, 'localhost', null, () => {
        Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.START'], null, null, null);
        subscriber.next(true);
        subscriber.complete();
      });
      
      //Tratamento de erro na inicialização do Agent-Server
      ServerService.server.once('error', (err: any) => {
        if (!ServerService.serverStarted) {
          ServerService.serverStarted = true;
          Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.ERROR'], null, null, null);
          subscriber.next(false);
          subscriber.complete();
        }
      });
    });
  }
  
  /* Método de preparação da palavra de comando, para o Agent-Server */
  private static prepareCommandWord(word: string, args: any[]): Observable<string> {
    
    //Consulta da configuração atual do Agent
    return ConfigurationService.getConfiguration(false).pipe(map((configuration: Configuration) => {
      
      //Montagem e criptografia da palavra de comando a ser enviada
      let command: ServerCommunication = {
        source: configuration.serialNumber,
        destination: CNST_SERVER_SOURCE,
        word: word,
        errorCode: null,
        args: args
      };
      
      return Functions.encrypt(JSON.stringify(command));
    }));
  }
  
  /* Método de validação da palavra de comando, recebida do Agent-Server */
  private static validateCommandWord(obj: any): Observable<ServerCommunication> {
    
    //Consulta da configuração atual do Agent
    return ConfigurationService.getConfiguration(false).pipe(map((configuration: Configuration) => {
      
      //Descriptografa o comando recebido, e converte-o para o objeto de comunicação
      let command: ServerCommunication = JSON.parse(Functions.decrypt(obj.toString()));
      
      //Verifica se o pacote recebido é destinado para esta instância do Agent
      if (
           ((command.destination == configuration.serialNumber) && (ServerService.temporarySerialNumber == null))
        || ((command.destination == ServerService.temporarySerialNumber) && (ServerService.temporarySerialNumber != null))
      ) {
        return command;
      } else {
        return null;
      }
    }));
  }
  
  /*
    Método para envio de pacotes ao servidor da TOTVS
    Retorna um observável que emite uma única vez após
    o término da thread de comunicação com o servidor.
  */
  private static sendCommandToServer(command: string, word: string, callbackFunction: any): Observable<any> {
    
    //Define o hostname do Agent-Server, dependendo se a aplicação está sendo executada em desenv / prod.
    let serverHostname: string = (CNST_APPLICATION_PRODUCTION ? CNST_SERVER_HOSTNAME.DEVELOPMENT : CNST_SERVER_HOSTNAME.PRODUCTION);
    
    return new Observable<any>((subscriber: any) => {
      
      //Socket de comunicação com o Agent-Server
      let client: any = new net.Socket();
      
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
      client.connect(CNST_SERVER_PORT, serverHostname, () => {
	      Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.CONNECTED'], null, null, null);
	      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_COMMAND'], null, null, null);
        
        //Envia o pacote para o servidor
        client.write(command);
        
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_COMMAND_OK'], null, null, null);
      });
      
      //Evento disparado ao receber a resposta da palavra de comando, pelo Agent-Server
      client.on('data', (buffer: string) => {
        ServerService.validateCommandWord(buffer).subscribe((command: ServerCommunication) => {
          
          //Verifica se a palavra de comando recebida é destinada para esta thread de execução
          if (command != null) {
            if (command.word == word) {
              Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_COMMAND_RESPONSE'], null, null, null);
              
              //Executa a função de callback da thread
              callbackFunction(command).subscribe((res: any) => {
                response = res;
                client.end();
              });
            }
          }
        });
	    });
      
      client.on('error', (err: any) => {
        hasErrors = true;
        subscriber.next(null);
        subscriber.complete();
      });
      
      //Evento disparado ao encerrar a conexão com o Agent-Server
      client.on('close', () => {
        if (!hasErrors) Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.DISCONNECTED'], null, null, null);
        subscriber.next(response);
        subscriber.complete();
      });
    });
  }
  
  /* Método de solicitação do SerialNumber do Agent */
  public static requestSerialNumber(args: string[]): Observable<number> {
    
    //Prepara o envio da porta de comunicação para o Agent-Server
    return ConfigurationService.getConfiguration(false).pipe(switchMap((configuration: Configuration) => {
      args.push('' + configuration.clientPort);
      
      //Inicializa o servidor de comunicação com o Agent-Server
      return ServerService.startServer(configuration.clientPort).pipe(switchMap((b: boolean) => {
        
        //Armazena temporariamente o código de ativação do Agent
        ServerService.temporarySerialNumber = args[0];
        
        //Prepara a palavra de comando a ser enviada, com criptografia
        return ServerService.prepareCommandWord('requestSerialNumber', args).pipe(switchMap((buffer: string) => {
          
          //Envia o comando para o servidor da TOTVS, e processa a resposta
          //(HOF - Higher Order Function)
          return ServerService.sendCommandToServer(
            buffer,
            'requestSerialNumber',
            (response: ServerCommunication) => {
              return ConfigurationService.getConfiguration(false).pipe(switchMap((configuration: Configuration) => {
                
                if (response.args[0] != null) {
                  
                  Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SERIAL_NUMBER'], null, null, null);
                  
                  //Realiza a gravação do serialNumber desta instância do Agent
                  configuration.serialNumber = response.args[0];
                  return ConfigurationService.saveConfiguration(configuration).pipe(map((b: number) => {
                    
                    //Remove o código de ativação temporário do Agent
                    ServerService.temporarySerialNumber = null;
                    
                    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SERIAL_NUMBER_OK'], null, null, null);
                    if (b == 1) return 1;
                    else return 0;
                  }, (err: any) => {
                    Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SERIAL_NUMBER_ERROR'], null, null, null);
                  }));
                } else {
                  switch (response.errorCode) {
                    case (-1):
                      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SERIAL_NUMBER_ERROR_INVALID'], null, null, null);
                      break;
                    case (-2):
                      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SERIAL_NUMBER_ERROR_COMMUNICATION'], null, null, null);
                      break;
                  }
                  return of(response.errorCode);
                }
              }));
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
    return ServerService.prepareCommandWord('updateCommunicationPort', args).pipe(switchMap((buffer: string) => {
      
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
    return ServerService.prepareCommandWord('getAvailableLicenses', []).pipe(switchMap((buffer: string) => {
      
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
      }), catchError((err: any) => {
        console.log('DEU ERRO');
        let x: AvailableLicenses = new AvailableLicenses('a', 'b', []);
        return of(x);
      }));
    }));
  }
  
  /* Método de solicitação das últimas consultas disponíveis para esta licença do Agent */
  public static saveLatestQueries(license: License, database: Database, scheduleId: string): Observable<boolean> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('getLatestQueries', [license, database.brand]).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'getLatestQueries',
        (response: ServerCommunication) => {
          let queries: QueryCommunication = Object.assign(new QueryCommunication(), response.args[0]);
          let queriesToSave: QueryClient[] = queries.Queries.map((q: QueryClient) => {
            q.scheduleId = scheduleId;
            return q;
          });
          
          /*
            Realiza a gravação das consultas padrões.
            Caso não tenha recebido nenhuma consulta do Agent-Server, é enviado o comando "false", para solicitar a leitura da I01 (se for Protheus).
          */
          if (queriesToSave.length == 0) {
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT_NO_DATA'], null, null, null);
            if (license.source == CNST_ERP_PROTHEUS) {
              Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT_I01'], null, null, null);
              return ConfigurationService.getConfiguration(false).pipe(switchMap((conf: Configuration) => {
                Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT_I01_PREPARE'], null, null, null);
                database.password = Functions.decrypt(database.password);
                
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
                let params = Functions.encrypt(JSON.stringify(javaInput));
                
                //Envio da requisição para o Electron, e processamento da resposta
                return Execute.exportQuery(params).pipe(switchMap((res: any) => {
                  if (res.err) {
                    throw res.err;
                  } else {
                    queriesToSave = res.message.map((q: QueryClient) => {
                      q.scheduleId = scheduleId;
                      q.TOTVS = true;
                      q.version = new Version(null);
                      q.command = Functions.encrypt(q.command);
                      return q;
                    });
                    
                    return QueryService.saveQuery(queriesToSave).pipe(map((res: number) => {
                      return res;
                    }));
                  }
                }));
              }));
            } else {
              Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT_NO_DATA_ERROR'], null, null, null);
              return of(-2);
            }
          } else {
            return QueryService.saveQuery(queriesToSave).pipe(map((res: number) => {
              return res;
            }));
          }
        }
      ).pipe(map((res: boolean) => {
        return res;
      }));
    }));
  }
  
  /* Método de solicitação das últimas rotinas disponíveis para esta licença do Agent */
  public static saveLatestScripts(license: License, brand: string, scheduleId: string): Observable<boolean> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('getLatestScripts', [license, brand]).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'getLatestScripts',
        (response: ServerCommunication) => {
          let scripts: ScriptCommunication = Object.assign(new ScriptCommunication(), response.args[0]);
          let scriptsToSave: ScriptClient[] = scripts.Scripts.map((s: ScriptClient) => {
            s.scheduleId = scheduleId;
            return s;
          });
          
          /*
            Realiza a gravação das rotinas padrões.
            Caso não tenha recebido nenhuma rotina do Agent-Server, é enviado o comando "false", para solicitar a leitura da I01 (se for Protheus).
          */
          if (scriptsToSave.length == 0) {
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.EXPORT_NO_DATA'], null, null, null);
            Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT_NO_DATA_ERROR'], null, null, null);
            return of(-2);
          } else {
            return ScriptService.saveScript(scriptsToSave).pipe(map((res: number) => {
              return res;
            }));
          }
        }
      ).pipe(map((res: boolean) => {
        return res;
      }));
    }));
  }
  
  /* Método de solicitação dos últimos parâmetros de ETL disponíveis para esta licença do Agent */
  public static getLatestETLParameters(license: License): Observable<ETLParameterCommunication> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('getLatestETLParameters', [license]).pipe(switchMap((buffer: string) => {
      
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
    return ServerService.prepareCommandWord('getLatestSQLParameters', [license, database]).pipe(switchMap((buffer: string) => {
      
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
  
  /*
    Método de atualização de todos os objetos do Agent-Server
    
    Consultas
    Rotinas
    Parâmetros de ETL
    Parâmetros de SQL
  */
  public static getUpdatesFromServer(): Observable<boolean> {
    
    //Conjuntos usados para deduplicar os dados que devem ser solicitadas ao Agent-Server
    let querySets: Set<any> = new Set();
    let scriptSets: Set<any> = new Set();
    let ETLParameterSets: Set<any> = new Set();
    let SQLParameterSets: Set<any> = new Set();
    
    //Objetos a serem processados pelo Agent-Server
    let queryUpdates: QueryServer[] = [];
    let scriptUpdates: ScriptServer[] = [];
    let ETLParameterUpdates: ETLParameterServer[] = [];
    let SQLParameterUpdates: SQLParameterServer[] = [];
    
    //Consulta das informações necessárias
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
        
        //Retorna a consulta a ser analisada pelo Agent-Server
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
      
      let data: DataUpdate = new DataUpdate(
        ETLParameterUpdates,
        SQLParameterUpdates,
        queryUpdates,
        scriptUpdates
      );
      
      //Prepara a palavra de comando a ser enviada, com criptografia
      return ServerService.prepareCommandWord('getUpdates', [data]).pipe(switchMap((buffer: string) => {
        
        //Envia o comando para o servidor da TOTVS, e processa a resposta
        //(HOF - Higher Order Function)
        return ServerService.sendCommandToServer(
          buffer,
          'getUpdates',
          (response: ServerCommunication) => {
            return of(response.args[0]);
          }
        ).pipe(switchMap((res: DataUpdate) => {
          let queriesToSave: QueryClient[] = results[3].map((query: QueryClient) => {
            let updated: QueryServer = new QueryServer().toObject(res.Queries.find((q: QueryServer) => (query.id == q.id)));
            if (updated.version.getPatchVersion() > query.version.getPatchVersion()) {
              query.command = updated.command;
              query.version = updated.version;
              query.executionMode = updated.executionMode;
              
              return query;
            } else {
              return null;
            }
          }).filter((q: QueryClient) => (q != null));
          
          let scriptsToSave: ScriptClient[] = results[4].map((script: ScriptClient) => {
            let updated: ScriptServer = new ScriptServer().toObject(res.Scripts.find((s: ScriptServer) => (script.id == s.id)));
            if (updated.version.getPatchVersion() > script.version.getPatchVersion()) {
              script.command = updated.command;
              script.version = updated.version;
              
              return script;
            } else {
              return null;
            }
          }).filter((s: ScriptClient) => (s != null));
          
          return forkJoin([
            QueryService.saveQuery(queriesToSave),
            ScriptService.saveScript(scriptsToSave)
          ]).pipe(map((res: [number, number]) => {
            return true;
          }));
        }));
      }));
    }));
  }
}
