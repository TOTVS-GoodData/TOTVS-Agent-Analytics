/* Classe global do Agent */
import { TOTVS_Agent_Analytics } from '../../app';

/* Dependência Node.js p/ comunicação via Socket */
import { WebSocket, WebSocketServer } from 'ws';

/* Serviço de arquivos */
import { Files } from '../files';
import { FileValidation } from '../files-interface';

import Main from '../../electron-main';

/* Constantes do Agent-Server */
import {
  CNST_SERVER_SOURCE,
  CNST_SERVER_PORT,
  CNST_SERVER_HOSTNAME,
  CNST_SERVER_IP
} from '../electron-constants';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../../src-angular/app/utilities/utilities-constants';

/* Serviço de tradução do Electron */
import { TranslationService } from '../../src-electron/services/translation-service';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

/* Interfaces de comunicação com o Agent-Server */
import {
  ServerCommunication,
  Package,
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
import { CNST_SERVER_IP_TYPES } from '../../src-angular/app/services/server/server-constants';

/* Serviço de criptografia do Agent */
import { EncryptionService } from '../encryption/encryption-service';

/* Interface de comunicação com o Java */
import { JavaInputBuffer } from '../../src-angular/app/utilities/java-interface';

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

/* Interfaces de logs do Agent-Client */
import { AgentLogMessage } from '../../src-angular/app/monitor/monitor-interface';

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
  //Variável que armazena a referência do webSocket para o Agent-Server
  private static ws: WebSocket = null;

  //Buffer de recebimento de dados (concatenado p/ comunicações acima do limite do socket)
  private static longBuffer: string = null;

  //Buffer de envio de dados, contendo os pacotes a serem enviados ao Agent-Server
  private static packages: Package[] = [];

  //Referência da função de temporização para envio de pacotes ao Agent-Server
  private static packageTimer: any = null;

  //Referência da função de temporização para reconectar ao Agent-Server
  private static refreshTimer: any = null;
  /*
    Função de callback, a ser executada após o recebimento de uma mensagem do Agent-Server

    Esta função só é usada quando o Agent-Client envia um pedido ao Agent-Server, e precisa esperar a sua resposta.
    Apenas um callback por vez pode existir. Ou seja, o Agent-Client precisa esperar o término de uma requisição, para enviar a próxima.
  */
  private static callbackFunction: any = null;
  private static CB_getAvailableLicenses: any = null;
  private static CB_getAvailableExecutionWindows: any = null;
  private static CB_getLatestETLParameters: any = null;
  private static CB_getLatestSQLParameters: any = null;

  //Armazena temporariamente o código de ativação do Agent, para primeira conexão ao servidor
  private static temporarySerialNumber: string = null;
  
  //Armazena o código serial deste Agent, enquanto a desativação está em andamento
  private static deactivatedSerialNumber: string = null;

  //Armazena a data de início do acesso remoto
  private static mirrorModeDateStart: Date = null;

  //Velocidade de transferência dos pacotes a serem enviados, do Agent-Client, para o Agent-Server (em milissegundos)
  private static CNST_SERVER_TRANSFER_TIME: number = 100;

  //Tempo de reconexão ao Agent-Server (em minutos)
  private static CNST_SERVER_REFRESH_TIME: number = 30;

  /**************************/
  /*** MÉTODOS DO SERVIÇO ***/
  /**************************/
  /* Método de reconexão ao Agent-Server */
  public static refreshServerConnectionTimer(): void {

    //Interrompe o temporizador
    clearInterval(ServerService.refreshTimer);

    //Reinicia o temporizador
    ServerService.refreshTimer = setInterval(() => {
      if (ServerService.ws == null) { ServerService.startWebSocketConnection().subscribe(); }
    }, ServerService.CNST_SERVER_REFRESH_TIME * 1000 * 60);
  }

  /* Método de inicialização do servidor do Agent, para recebimento de comandos do Agent-Server */
  public static startWebSocketConnection(): Observable<boolean> {
    
    //Retorna o observável de inicialização do Agent-Server
    return new Observable<boolean>((subscriber: any) => {

      //Define o hostname do Agent-Server, dependendo se a aplicação está sendo executada em desenv / prod.
      let serverHostname: string = (TOTVS_Agent_Analytics.isProduction() ? CNST_SERVER_HOSTNAME.PRODUCTION : CNST_SERVER_HOSTNAME.DEVELOPMENT);
      let serverIpType: string = (TOTVS_Agent_Analytics.isProduction() ? CNST_SERVER_IP.PRODUCTION : CNST_SERVER_IP.DEVELOPMENT);

      //WebSocket de comunicação com o Agent-Server
      if (ServerService.ws != null) {
        ServerService.ws.close();
        ServerService.packages = [];
        clearInterval(ServerService.packageTimer);
      }
      ServerService.ws = new WebSocket(
        (serverIpType == CNST_SERVER_IP_TYPES.IPV4
          ? 'ws://' + serverHostname + ':'
          : 'ws://[' + serverHostname + ']:'
        ) + CNST_SERVER_PORT
      );
      
      //Inicializa a conexão com o Agent-Server da TOTVS
      ServerService.ws.on('open', () => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.CONNECTED'], null, null, null, null, null);

        //Inicializa o temporizador para transferência de um pacote, para o socket do Agent-Server
        ServerService.startAgentPackageTimer();

        //Inicializa o temporizador para manter a conexão viva
        ServerService.refreshServerConnectionTimer();

        subscriber.next(true);
        subscriber.complete();
      });

      //Tratamento de erros na comunicação do WebSocket com o Agent-Server
      ServerService.ws.on('error', (err: any) => {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.ERROR'], null, null, null, null, null);
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, null, null, null, err, null, null);

        subscriber.next(false);
        subscriber.complete();
      });

      //Evento disparado ao encerrar a conexão com o Agent-Server
      ServerService.ws.on('close', () => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.DISCONNECTED'], null, null, null, null, null);
        ServerService.ws = null;
      });

      //Configura o evento disparado ao receber a resposta da palavra de comando, pelo Agent-Server
      ServerService.ws.on('message', (buffer: any) => {
        ServerService.parseServerResponse(buffer).subscribe();
      });
    });
  }

  /* Método de processamento das mensagens recebidas pelo Agent-Server (INPUT / OUTPUT) */
  public static parseServerResponse(buffer: any): Observable<any> {
    
    //Adiciona o pacote recebido ao buffer concatenado
    ServerService.longBuffer = (ServerService.longBuffer == null ? buffer : ServerService.longBuffer + buffer);
    
    //Realiza a validação da palavra (criptografia, destino do pacote, etc). Ignora palavras inválidas.
    return ServerService.validateCommandWord(ServerService.longBuffer).pipe(switchMap((command: ServerCommunication) => {
      if (command != null) {

        //Reseta o buffer recebido do comando que foi aprovado
        ServerService.longBuffer = '';
        
        //Disparo da rotina para processar a palavra de comando.
        switch (command.word) {

          /****************************************/
          /*** Recebimento de mensagens (INPUT) ***/
          /****************************************/
          /* Método de teste de comunicação do Agent-Client, com o Agent-Server */
          case 'pingAgent':
            return ServerService.pingAgent(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('pingAgent', res);
            }));
            break;

          /* Método de desativação desta instância do Agent-Client */
          case 'deactivateAgent':
            return ServerService.deactivateAgent(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('deactivateAgent', res);
            }));
            break;

          /* Método de envio das configurações atuais deste Agent-Client, para o Agent-Server */
          case 'requestAgentData':
            return ServerService.requestAgentData(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('requestAgentData', res);
            }));
            break;

          /* Método de envio dos arquivos de logs deste Agent-Client, para o Agent-Server */
          case 'requestAgentLogs':
            return ServerService.requestAgentLogs(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('requestAgentLogs', res);
            }));
            break;

          /*
            Método de envio dos arquivos de logs deste Agent-Client, para o Agent-Server
            Este método é disparado pela instância espelhada do Agent-Client, para receber apenas os logs desde o início do acesso remoto.
          */
          case 'getAgentLogsSinceRemoteStart':
            return ServerService.getAgentLogsSinceRemoteStart(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('getAgentLogsSinceRemoteStart', res);
            }));
            break;

          /* Método de controle do acesso remoto (MirrorMode), do Agent-Client */
          case 'setMirrorMode':
            return ServerService.setMirrorMode(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('setMirrorMode', res);
            }));
            break;

          /* Método de sobrescrita do arquivo de configuração do Agent-Client (MirrorMode) */
          case 'publishAgentDataFromMirror':
            return ServerService.publishAgentDataFromMirror(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('publishAgentDataFromMirror', res);
            }));
            break;

          /* Método de sobrescrita do arquivo de configuração do Agent-Client (Client p/ Client) */
          case 'publishAgentDataFromClient':
            return ServerService.publishAgentDataFromClient(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('publishAgentDataFromClient', res);
            }));
            break;
            
          /* Método de anexação de novas mensagens de log do Agent-Client / Instância espelhada (MirrorMode) */
          case 'appendLogData':
            return ServerService.appendLogData(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('appendLogData', res);
            }));
            break;

          /* Método de teste de conexão ao banco de dados do Agent-Client */
          case 'requestDatabaseConnectionTest':
            return ServerService.requestDatabaseConnectionTest(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('requestDatabaseConnectionTest', res);
            }));
            break;

          /* Método de execução remota e imediata de um agendamento do Agent-Client */
          case 'requestScheduleExecution':
            return ServerService.requestScheduleExecution(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('requestScheduleExecution', res);
            }));
            break;

          /* Método de validação da integridade dos arquivos XML / JSON a serem enviados pelo Agent-Client */
          case 'requestFileIntegrityTest':
            return ServerService.requestFileIntegrityTest(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('requestFileIntegrityTest', res);
            }));
            break;

          /* Método de exportação da tabela I01 do Protheus */
          case 'requestQueryExportFromI01':
            return ServerService.requestQueryExportFromI01(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('requestQueryExportFromI01', res);
            }));
            break;

          /****************************************/
          /***    Envio de mensagens (OUTPUT)   ***/
          /****************************************/
          /* Método de teste de comunicação com o Agent-Server */
          case 'pingServer':
            return ServerService.callbackFunction(command);
            break;

          /* Método de solicitação do SerialNumber deste Agent-Client (Ativação) */
          case 'requestSerialNumber':
            return ServerService.callbackFunction(command);
            break;

          /* Método de solicitação das licenças disponíveis para esta instalação do Agent-Client */
          case 'getAvailableLicenses':
            return ServerService.CB_getAvailableLicenses(command);
            break;

          /* Método de solicitação das janelas de execução dos agendamentos válidas para esta instalação do Agent-Client */
          case 'getAvailableExecutionWindows':
            return ServerService.CB_getAvailableExecutionWindows(command);
            break;

          /* Método de solicitação dos últimos parâmetros de ETL disponíveis para esta licença do Agent-Client */
          case 'getLatestETLParameters':
            return ServerService.CB_getLatestETLParameters(command);
            break;

          /* Método de solicitação dos últimos parâmetros de SQL disponíveis para esta licença do Agent-Client */
          case 'getLatestSQLParameters':
            return ServerService.CB_getLatestSQLParameters(command);
            break;

          /* Método de solicitação das últimas consultas disponíveis para esta licença do Agent-Client */
          case 'getLatestQueries':
            return ServerService.callbackFunction(command);
            break;

          /* Método de solicitação das últimas rotinas disponíveis para esta licença do Agent-Client */
          case 'getLatestScripts':
            return ServerService.callbackFunction(command);
            break;

          /*
            Método de atualização de todos os objetos do Agent-Server
            Executado automaticamente pelo Electron
            
            Consultas
            Rotinas
            Parâmetros de ETL
            Parâmetros de SQL
          */
          case 'getUpdates':
            return ServerService.callbackFunction(command);
            break;
            
          /****************************************/
          /*** Instância espelhada (MirrorMode) ***/
          /****************************************/
          /* Método de envio das alterações feitas na instância espelhada do Agent-Client, para o Agent-Server */
          case 'deactivateMirrorMode':
            return ServerService.callbackFunction(command);
            break;

          /* Método de solicitação dos arquivos de log do Agent-Client, desde o início do acesso remoto */
          case 'requestAgentLogsSinceRemoteStart':
            return ServerService.callbackFunction(command);
            break;
            
          /* Método de teste de conexão remota ao banco de dados do Agent-Client */
          case 'testDatabaseConnectionRemotelly':
            return ServerService.callbackFunction(command);
            break;

          /* Método de validação da integridade dos arquivos XML / JSON a serem enviados pelo Agent-Client remoto */
          case 'checkFileIntegrityRemotelly':
            return ServerService.callbackFunction(command);
            break;

          /* Método de disparo da execução de um agendamento do Agent-Client */
          case 'requestScheduleExecutionRemotelly':
            return ServerService.callbackFunction(command);
            break;
            
          /* Método de exportação da tabela I01 do Protheus (Teste Remoto / Disparo Remoto) */
          case 'requestQueryExportFromI01Remotelly':
            return ServerService.callbackFunction(command);
            break;
















            
          /* Método de acesso remoto ao Agent-Client (Client p/ Client) */
          case 'requestRemoteAccessFromClient':
            return ServerService.callbackFunction(command);
            break;

          /* Método de escrita dos arquivos de log do Agent-Client, para o acesso remoto (Client p/ Client) */
          case 'publishAgentLogsAsMirror':
            return ServerService.publishAgentLogsAsMirror(command).pipe(switchMap((res: responseObj) => {
              return ServerService.writeResponseToAgentServerSocket('publishAgentLogsAsMirror', res);
            }));
            break;
        }
      } else return of(null);
    }));
  }

  /* Método de preparação da palavra de comando, para envio ao Agent-Server */
  private static prepareCommandWord(word: string, errorCode: number, args: any[]): Observable<string> {

    //Consulta da configuração atual do Agent
    return ConfigurationService.getConfiguration(false).pipe(map((configuration: Configuration) => {

      //Montagem e criptografia da palavra de comando a ser enviada
      let command: ServerCommunication = {
        source: (ServerService.deactivatedSerialNumber != null ? ServerService.deactivatedSerialNumber : configuration.serialNumber),
        destination: CNST_SERVER_SOURCE,
        mirror: ((TOTVS_Agent_Analytics.getMirrorMode() == 2) || (TOTVS_Agent_Analytics.getMirrorMode() == 3)),
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

  /* Método de solicitação de um comando para o Agent-Server */
  private static writeRequestToAgentServerSocket(word: string, args: any[]): Observable<boolean> {

    //Prepara o comando a ser enviado ao socket
    return ServerService.prepareCommandWord(
      word,
      null,
      args
    ).pipe(switchMap((buffer: string) => {
      if (ServerService.ws == null) {
        return ServerService.startWebSocketConnection().pipe(map((b: boolean) => {
          if (b) ServerService.packages.push(new Package(word, buffer, 0));
          return b;
        }));
      } else {
        ServerService.packages.push(new Package(word, buffer, 0));
        return of(true);
      }
    }));
  }
  
  /* Método de resposta de uma palavra recebida pelo Agent-Server */
  private static writeResponseToAgentServerSocket(word: string, res: responseObj): Observable<boolean> {

    //Prepara o comando a ser enviado ao socket
    return ServerService.prepareCommandWord(
      word,
      res.errorCode,
      res.response
    ).pipe(map((buffer: string) => {
      ServerService.packages.push(new Package(word, buffer, 1));
      return true;
    }));
  }

  /* Método de trasferência de um pacote, para o socket do Agent-Server */
  private static startAgentPackageTimer(): void {
    ServerService.packageTimer = setInterval(() => {
      if (ServerService.packages.length > 0) {

        let packageToSend: Package = ServerService.packages[ServerService.packages.length - 1];

        //Consulta das traduções
        let translations: any = TranslationService.getTranslations([
          new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_REQUEST', [packageToSend.word]),
          new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_RESPONSE', [packageToSend.word]),
          new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_RESPONSE_OK', [packageToSend.word])
        ]);

        //Envia a resposta para o socket
        if (packageToSend.type == 0) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_REQUEST'], null, null, null, null, null);
        else Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_RESPONSE'], null, null, null, null, null);
        ServerService.ws.send(packageToSend.buffer);
        ServerService.packages.pop();
        if (packageToSend.type == 0) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_REQUEST_OK'], null, null, null, null, null);
        else Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_RESPONSE_OK'], null, null, null, null, null);
      }
    }, ServerService.CNST_SERVER_TRANSFER_TIME);
  }

  /****************************************/
  /*** Recebimento de mensagens (INPUT) ***/
  /****************************************/
  /* Método de teste de comunicação do Agent-Client, com o Agent-Server */
  private static pingAgent(command: ServerCommunication): Observable<responseObj> {

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);

    return of(new responseObj(['pong'], null));
  }

  /* Método de desativação desta instância do Agent-Client */
  private static deactivateAgent(command: ServerCommunication): Observable<responseObj> {

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);

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

  /* Método de envio das configurações atuais deste Agent-Client, para o Agent-Server */
  private static requestAgentData(command: ServerCommunication): Observable<responseObj> {

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);

    return Files.readApplicationData().pipe(map((db: ClientData) => {
      return new responseObj([db], null);
    }));
  }

  /* Método de envio dos arquivos de logs deste Agent-Client, para o Agent-Server */
  private static requestAgentLogs(command: ServerCommunication): Observable<responseObj> {

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);
    
    return of(new responseObj(Files.readLogs(), null));
  }

  /*
    Método de envio dos arquivos de logs deste Agent, para o Agent-Server
    Este método é disparado pela instância espelhada do Agent, para receber apenas os logs desde o início do acesso remoto.
  */
  private static getAgentLogsSinceRemoteStart(command: ServerCommunication): Observable<responseObj> {

    //Armazena todas as mensagens de log a serem anexadas para o Agent-Server
    let agentLogMessages: Array<AgentLogMessage> = [];

    //Variável de suporte, usada para armazenar a última linha de log lida.
    let lastMessage: any = null;

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);

    //Leitura de todas as mensagens de log atualmente presentes no log deste Agent-Client
    Files.readLogs().map((log: string) => {
      try {
        let messages: any = JSON.parse(log);
        messages.str_logDate = messages.logDate;
        messages.logDate = new Date('' + messages.logDate);
        agentLogMessages.push(messages);
        lastMessage = messages;

      //Conversão dos textos de log de erro
      } catch (ex) {
        agentLogMessages.push(new AgentLogMessage(lastMessage.mirror, lastMessage.logDate, lastMessage.str_logDate, CNST_LOGLEVEL.ERROR.tag, lastMessage.system, log, lastMessage.level, lastMessage.execId, lastMessage.scheduleId));
      }
    });

    /* Remoção de todas as mensagens de log que não foram geradas após o início do acesso remoto */
    agentLogMessages = agentLogMessages.filter((message: AgentLogMessage) => {
      return (Files.dateDiff(ServerService.mirrorModeDateStart, message.logDate) >= 0);
    });
    
    return of(new responseObj([JSON.stringify(agentLogMessages)], null));
  }
  
  /* Método de controle do acesso remoto (MirrorMode), do Agent-Client */
  public static setMirrorMode(command: ServerCommunication): Observable<responseObj> {
    let mirror: number = Number(command.args[0]);

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);

    //Atualiza a data de início do acesso remoto
    if (mirror == 1) ServerService.mirrorModeDateStart = new Date();
    else ServerService.mirrorModeDateStart = null;

    TOTVS_Agent_Analytics.setMirrorMode(mirror);
    Files.initApplicationData(false, 'pt-BR');
    return Main.updateMirrorModePreferences().pipe(map((b: boolean) => {
      return new responseObj([true], null);
    }));
  }

  /* Método de sobrescrita do arquivo de configuração do Agent-Client (MirrorMode) */
  private static publishAgentDataFromMirror(command: ServerCommunication): Observable<responseObj> {

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);

    let db: ClientData = Object.assign(new ClientData(), command.args[0]);
    return Files.writeApplicationData(db).pipe(map((b: boolean) => {
      return new responseObj([(b ? 1 : 0)], null);
    }));
  }

  /* Método de sobrescrita do arquivo de configuração do Agent-Client (Client p/ Client) */
  private static publishAgentDataFromClient(command: ServerCommunication): Observable<responseObj> {

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);

    let db: ClientData = Object.assign(new ClientData(), command.args[0]);
    return Files.writeMirrorData(db).pipe(map((b: boolean) => {
      return new responseObj([(b ? 1 : 0)], null);
    }));
  }
  
  /* Método de anexação de novas mensagens de log do Agent-Client / Instância espelhada (MirrorMode) */
  private static appendLogData(command: ServerCommunication): Observable<responseObj> {

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);

    Files.appendLogData(command.args[0]);
    return of(new responseObj([true], null));
  }

  /* Método de teste de conexão ao banco de dados do Agent-Client */
  private static requestDatabaseConnectionTest(command: ServerCommunication): Observable<responseObj> {

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);

    return from(DatabaseService.testDatabaseConnectionLocally(command.args[0])).pipe(map((res: number) => {
      return new responseObj([], res);
    }));
  }

  /* Método de execução remota e imediata de um agendamento do Agent-Client */
  private static requestScheduleExecution(command: ServerCommunication): Observable<responseObj> {

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);

    return ScheduleService.executeAndUpdateScheduleLocally(command.args[0], command.args[1]).pipe(map((res: number) => {
      return new responseObj([res], null);
    }));
  }

  /* Método de validação da integridade dos arquivos XML / JSON a serem enviados pelo Agent-Client */
  private static requestFileIntegrityTest(command: ServerCommunication): Observable<responseObj> {

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);

    return ScheduleService.getSchedules(false).pipe(switchMap((schedules: Schedule[]) => {
      let s: Schedule = schedules.find((schedule: Schedule) => schedule.id == command.args[0]);
      return Files.checkFileIntegrityLocally(s.fileFolder).pipe(map((res: FileValidation[]) => {
        return new responseObj(res, null);
      }));
    }));
  }

  /* Método de exportação da tabela I01 do Protheus */
  private static requestQueryExportFromI01(command: ServerCommunication): Observable<responseObj> {

    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD', [command.source, command.word])
    ]);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.NEW_WORD'], null, null, null, null, null);

    return QueryService.exportQueriesFromI01Locally(command.args[0], command.args[1]).pipe(map((res: QueryClient[]) => {
      return new responseObj(res, null);
    }));
  }
  
  /****************************************/
  /***    Envio de mensagens (OUTPUT)   ***/
  /****************************************/
  /* Método de teste de comunicação com o Agent-Server */
  public static pingServer(): Observable<boolean> {
    return ServerService.writeRequestToAgentServerSocket('pingServer', []).pipe(switchMap((b: boolean) => {
      return new Observable<boolean>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.callbackFunction = (res: ServerCommunication) => {

            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            if (res.args[0] == 'pong') subscriber.next(true);
            else subscriber.next(false);
            subscriber.complete();
            return of(true);
          };

        //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(false);
          subscriber.complete();
        }
      });
    }));
  }
  
  /* Método de solicitação do SerialNumber deste Agent-Client (Ativação) */
  public static requestSerialNumber(args: string[]): Observable<number> {

    //Armazena temporariamente o código de ativação do Agent
    ServerService.temporarySerialNumber = args[0];
    
    return ServerService.writeRequestToAgentServerSocket('requestSerialNumber', args).pipe(switchMap((b: boolean) => {
      return new Observable<number>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.callbackFunction = (res: ServerCommunication) => {

            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            //Verifica se o Agent-Server enviou um SerialNumber para esta instância do Agent
            if (res.args[0] != null) {
              return ConfigurationService.getConfiguration(false).pipe(switchMap((configuration: Configuration) => {
                Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER'], null, null, null, null, null);

                //Realiza a gravação do serialNumber desta instância do Agent
                configuration.serialNumber = res.args[0];
                configuration.instanceName = res.args[1];

                return Files.readApplicationData().pipe(switchMap((_dbd: ClientData) => {
                  _dbd.configuration = configuration;
                  return Files.writeApplicationData(_dbd).pipe(switchMap((b: boolean) => {

                    //Remove o código de ativação temporário do Agent
                    ServerService.temporarySerialNumber = null;
                    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_OK'], null, null, null, null, null);

                    if (b) subscriber.next(1);
                    else subscriber.next(0);
                    subscriber.complete();

                    return of(1);

                  //Tratamento de erros
                  }), catchError((err: any) => {
                    Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_ERROR'], null, null, null, null, null);
                    return of(0);
                  }));
                }));
              }));

            //Caso o SerialNumber não tenha sido recebido, é gerado um log de erro de acordo com o código recebido
            } else {
              switch (res.errorCode) {
                case (-1):
                  Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_ERROR_INVALID'], null, null, null, null, null);
                  break;
                case (-2):
                  Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_ERROR_COMMUNICATION'], null, null, null, null, null);
                  break;
              }
              subscriber.next(res.errorCode);
              subscriber.complete();
              return of(false);
            }
          };

        //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(null);
          subscriber.complete();
        }
      });
    }));
  }
  
  /* Método de solicitação das licenças disponíveis para esta instalação do Agent-Client */
  public static getAvailableLicenses(showLogs: boolean): Observable<AvailableLicenses> {
    return ServerService.writeRequestToAgentServerSocket('getAvailableLicenses', []).pipe(switchMap((b: boolean) => {
      return new Observable<AvailableLicenses>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.CB_getAvailableLicenses = (res: ServerCommunication) => {

            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            subscriber.next(res.args[0]);
            subscriber.complete();
            return of(true);
          };

        //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(null);
          subscriber.complete();
        }
      });
    }));
  }

  /* Método de solicitação das janelas de execução dos agendamentos válidas para esta instalação do Agent-Client */
  public static getAvailableExecutionWindows(): Observable<string[]> {
    return ServerService.writeRequestToAgentServerSocket('getAvailableExecutionWindows', []).pipe(switchMap((b: boolean) => {
      return new Observable<string[]>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.CB_getAvailableExecutionWindows = (res: ServerCommunication) => {

            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);
            
            subscriber.next(res.args[0]);
            subscriber.complete();
            return of(true);
          };

        //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(null);
          subscriber.complete();
        }
      });
    }));
  }

  /* Método de solicitação dos últimos parâmetros de ETL disponíveis para esta licença do Agent-Client */
  public static getLatestETLParameters(license: License): Observable<ETLParameterCommunication> {
    return ServerService.writeRequestToAgentServerSocket('getLatestETLParameters', [license]).pipe(switchMap((b: boolean) => {
      return new Observable<ETLParameterCommunication>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.CB_getLatestETLParameters = (res: ServerCommunication) => {

            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            subscriber.next(res.args[0]);
            subscriber.complete();
            return of(true);
          };

        //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(null);
          subscriber.complete();
        }
      });
    }));
  }

  /* Método de solicitação dos últimos parâmetros de SQL disponíveis para esta licença do Agent-Client */
  public static getLatestSQLParameters(license: License, database: string): Observable<SQLParameterCommunication> {
    return ServerService.writeRequestToAgentServerSocket('getLatestSQLParameters', [license, database]).pipe(switchMap((b: boolean) => {
      return new Observable<SQLParameterCommunication>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.CB_getLatestSQLParameters = (res: ServerCommunication) => {

            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            subscriber.next(res.args[0]);
            subscriber.complete();
            return of(true);
          };

        //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(null);
          subscriber.complete();
        }
      });
    }));
  }
  
  /* Método de solicitação das últimas consultas disponíveis para esta licença do Agent-Client */
  public static saveLatestQueries(license: License, database: Database, scheduleId: string): Observable<number> {
    return ServerService.writeRequestToAgentServerSocket('getLatestQueries', [license, database.brand]).pipe(switchMap((b: boolean) => {
      return new Observable<number>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.callbackFunction = (res: ServerCommunication) => {

            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            //Conversão da resposta do Agent-Server, para o objeto de comunicação das consultas
            let queries: QueryCommunication = Object.assign(new QueryCommunication(), res.args[0]);

            //Itera por todas as consultas recebidas, e define o código de agendamento de cada uma delas
            let queriesToSave: QueryClient[] = queries.Queries.map((q: QueryClient) => {
              q.scheduleId = scheduleId;
              return q;
            });

            //Gravação de todas as consultas recebidas pelo Agent-Server
            if (queriesToSave.length > 0) {
              return QueryService.saveQuery(queriesToSave).pipe(switchMap((errors: number) => {
                subscriber.next(errors);
                subscriber.complete();
                return of(1);
              }));
            } else {
              Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.IMPORT_NO_DATA'], null, null, null, null, null);

              //Caso a origem dos dados seja do Protheus, é realizada uma consulta à tabela I01 (Caso aplicável)
              if (license.source == CNST_ERP_PROTHEUS) {
                Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.IMPORT_I01'], null, null, null, null, null);

                //Leitura da configuração atual do Agent
                return ConfigurationService.getConfiguration(false).pipe(switchMap((conf: Configuration) => {
                  Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.IMPORT_I01_PREPARE'], null, null, null, null, null);
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

                  if ((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1)) {
                    return QueryService.exportQueriesFromI01Locally(params, scheduleId).pipe(switchMap((queriesI01: QueryClient[]) => {
                      return QueryService.saveQuery(queriesI01).pipe(map((errors: number) => {
                        subscriber.next(errors);
                        subscriber.complete();
                        return of(true);
                      }));
                    }));
                  } else {
                    return ServerService.requestQueryExportFromI01Remotelly(params, scheduleId).pipe(switchMap((res: any) => {
                      if (res.errorCode == null) {
                        return QueryService.saveQuery(res.args).pipe(switchMap((errors: number) => {
                          return ServerService.requestAgentLogsSinceRemoteStart().pipe(map((res2: boolean) => {
                            subscriber.next(errors);
                            subscriber.complete();
                            return true;
                          }));
                        }));
                      } else {
                        subscriber.next(res.errorCode);
                        subscriber.complete();
                        return of(false);
                      }
                    }));
                  }
                }));

                //Caso a origem dos dados não seja do Protheus, é gerada uma mensagem de erro
              } else {
                Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.IMPORT_NO_DATA_ERROR'], null, null, null, null, null);
                subscriber.next(-2);
                subscriber.complete();
                return of(false);
              }
            }
          };
          
        //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(null);
          subscriber.complete();
        }
      });
    }));
  }
  
  /* Método de solicitação das últimas rotinas disponíveis para esta licença do Agent-Client */
  public static saveLatestScripts(license: License, brand: string, scheduleId: string): Observable<number> {
    return ServerService.writeRequestToAgentServerSocket('getLatestScripts', [license, brand]).pipe(switchMap((b: boolean) => {
      return new Observable<number>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.callbackFunction = (res: ServerCommunication) => {

            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            //Conversão da resposta do Agent-Server, para o objeto de comunicação das rotinas
            let scripts: ScriptCommunication = Object.assign(new ScriptCommunication(), res.args[0]);

            //Itera por todas as rotinas recebidas, e define o código de agendamento de cada uma delas
            let scriptsToSave: ScriptClient[] = scripts.Scripts.map((s: ScriptClient) => {
              s.scheduleId = scheduleId;
              return s;
            });
          
            /*
            Realiza a gravação das rotinas padrões.
            Caso não tenha recebido nenhuma rotina do Agent - Server, é gerado um código de erro
            */
            if (scriptsToSave.length > 0) {
              return ScriptService.saveScript(scriptsToSave).subscribe((errors: number) => {
                subscriber.next(errors);
                subscriber.complete();
                return of(true);
              });
            } else {
              Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.IMPORT_NO_DATA'], null, null, null, null, null);
              Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.IMPORT_NO_DATA_ERROR'], null, null, null, null, null);
              subscriber.next(-2);
              subscriber.complete();
              return of(false);
            }
          };

        //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(null);
          subscriber.complete();
        }
      });
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
  public static getUpdates(): Observable<number> {

    //Objetos a serem processados pelo Agent-Server
    let queryUpdates: QueryServer[] = [];
    let scriptUpdates: ScriptServer[] = [];
    let ETLParameterUpdates: ETLParameterServer[] = [];
    let SQLParameterUpdates: SQLParameterServer[] = [];

    //Consulta das informações necessárias
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.UPDATES'], null, null, null, null, null);
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

      return ServerService.writeRequestToAgentServerSocket('getUpdates', [data]).pipe(switchMap((b: boolean) => {
        return new Observable<number>((subscriber: any) => {
          if (b) {

            //Definição da função de callback para a próxima resposta do Agent-Server
            ServerService.callbackFunction = (res: ServerCommunication) => {

              //Consulta das traduções
              let translations: any = TranslationService.getTranslations([
                new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
              ]);
              Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

              //Conversão da resposta do Agent-Server, para o objeto de comunicação das rotinas
              let dataUpdate: DataUpdate = Object.assign(new DataUpdate(null, null, null, null), res.args[0]);

              /*
                Itera por todas as consultas atualmente gravadas no Agent-Client,
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
                Itera por todas as rotinas atualmente gravadas no Agent-Client,
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
                Itera por todos os agendamentos atualmente gravados no Agent-Client,
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
                if ((res[0] == null) && (res[1] == null) && (res[2] == null)) {
                  subscriber.next(null);
                  subscriber.complete();
                  return of(true);
                } else {
                  subscriber.next(res[0] + res[1] + res[2]);
                  subscriber.complete();
                  return of(false);
                }
              }));
            };

          //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
          } else {
            subscriber.next(-999);
            subscriber.complete();
          }
        });
      }));
    }));
  }
  
  /****************************************/
  /*** Instância espelhada (MirrorMode) ***/
  /****************************************/
  /* Método de envio das alterações feitas na instância espelhada do Agent-Client, para o Agent-Server */
  public static deactivateMirrorMode(db: ClientData, agentLogMessages: string): Observable<boolean> {
    return ServerService.writeRequestToAgentServerSocket('deactivateMirrorMode', [db, agentLogMessages]).pipe(switchMap((b: boolean) => {
      return new Observable<boolean>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.callbackFunction = (res: ServerCommunication) => {
            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            subscriber.next(Boolean(res.args[0]));
            subscriber.complete();
            return of(true);
          };

        //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(false);
          subscriber.complete();
        }
      });
    }));
  }

  /* Método de solicitação dos arquivos de log do Agent-Client, desde o início do acesso remoto */
  public static requestAgentLogsSinceRemoteStart(): Observable<boolean> {
    return ConfigurationService.getConfiguration(false).pipe(switchMap((conf: Configuration) => {
      return ServerService.writeRequestToAgentServerSocket('requestAgentLogsSinceRemoteStart', [conf.serialNumber]).pipe(switchMap((b: boolean) => {
        return new Observable<boolean>((subscriber: any) => {
          if (b) {

            //Definição da função de callback para a próxima resposta do Agent-Server
            ServerService.callbackFunction = (res: ServerCommunication) => {

              //Consulta das traduções
              let translations: any = TranslationService.getTranslations([
                new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
              ]);
              Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

              return ServerService.appendLogData(res).pipe(switchMap((res2: responseObj) => {
                if (res2.errorCode) subscriber.next(false);
                else subscriber.next(true);

                subscriber.complete();
                return of(res2.errorCode);
              }));
            };

            //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
          } else {
            subscriber.next(-1);
            subscriber.complete();
          }
        });
      }));
    }));
  }

  /* Método de teste de conexão remota ao banco de dados do Agent-Client */
  public static testDatabaseConnectionRemotelly(inputBuffer: string): Observable<number> {
    return ServerService.writeRequestToAgentServerSocket('testDatabaseConnectionRemotelly', [inputBuffer]).pipe(switchMap((b: boolean) => {
      return new Observable<number>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.callbackFunction = (res: ServerCommunication) => {

            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            subscriber.next(res.errorCode);
            subscriber.complete();
            return of(res.errorCode);
          };

        //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(-1);
          subscriber.complete();
        }
      });
    }));
  }
  
  /* Método de disparo da execução de um agendamento do Agent-Client */
  public static requestScheduleExecutionRemotelly(inputBuffer: string, scheduleId: string): Observable<number> {
    return ServerService.writeRequestToAgentServerSocket('requestScheduleExecutionRemotelly', [inputBuffer, scheduleId]).pipe(switchMap((b: boolean) => {
      return new Observable<number>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.callbackFunction = (res: ServerCommunication) => {

            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            if (res.errorCode) subscriber.next(res.errorCode);
            else subscriber.next(Number(res.args[0]));
            subscriber.complete();
            return of(Number(res.args[0]));
          };

        //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(-1);
          subscriber.complete();
        }
      });
    }));
  }
  
  /* Método de validação da integridade dos arquivos XML / JSON a serem enviados pelo Agent-Client remoto */
  public static checkFileIntegrityRemotelly(scheduleId: string): Observable<FileValidation[]> {
    return ServerService.writeRequestToAgentServerSocket('checkFileIntegrityRemotelly', [scheduleId]).pipe(switchMap((b: boolean) => {
      return new Observable<FileValidation[]>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.callbackFunction = (res: ServerCommunication) => {

            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            let files: FileValidation[] = [];
            res.args.map((file: string) => {
              let f: FileValidation = Object.assign(new FileValidation(null, null), file);
              files.push(f);
            });

            subscriber.next(files);
            subscriber.complete();
            return of(true);
          };

          //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(-1);
          subscriber.complete();
        }
      });
    }));
  }
  
  /* Método de exportação da tabela I01 do Protheus (Teste Remoto / Disparo Remoto) */
  public static requestQueryExportFromI01Remotelly(inputBuffer: string, scheduleId: string): Observable<ServerCommunication> {
    return ServerService.writeRequestToAgentServerSocket('requestQueryExportFromI01Remotelly', [inputBuffer, scheduleId]).pipe(switchMap((b: boolean) => {
      return new Observable<ServerCommunication>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.callbackFunction = (res: ServerCommunication) => {

            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            subscriber.next(res);
            subscriber.complete();
            return of(res);
          };

        //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(-1);
          subscriber.complete();
        }
      });
    }));
  }















  /* Método de acesso remoto ao Agent (Client p/ Client) */
  public static requestRemoteAccessFromClient(inputBuffer: string): Observable<number> {
    return ServerService.writeRequestToAgentServerSocket('requestRemoteAccessFromClient', [inputBuffer]).pipe(switchMap((b: boolean) => {
      return new Observable<number>((subscriber: any) => {
        if (b) {

          //Definição da função de callback para a próxima resposta do Agent-Server
          ServerService.callbackFunction = (res: ServerCommunication) => {
            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE', [res.word])
            ]);
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SERVER_COMMUNICATION.MESSAGES.REQUEST_RESPONSE'], null, null, null, null, null);

            subscriber.next(Number(res.args[0]));
            subscriber.complete();
            return of(true);
          };

          //Tratamento de erro (Falha no envio do pacote para o Agent-Server)
        } else {
          subscriber.next(-1);
          subscriber.complete();
        }
      });
    }));
  }




















  /* Método de escrita dos arquivos de log do Agent-Client, para o acesso remoto (Client p/ Client) */
  private static publishAgentLogsAsMirror(command: ServerCommunication): Observable<responseObj> {
    Files.writeRemoteLogData(command.args);
    return of(new responseObj([true], null));
  }
}