/* Nome padrão para pacotes destinados ao Agent-Server */
import {
  CNST_SERVER_SOURCE,
  CNST_SERVER_PORT,
  CNST_SERVER_HOSTNAME
} from '../constants-electron';

/* Dependência Node.js p/ comunicação via Socket */
import net from 'net';

/* Interface de comunicação com o Agent-Server */
import {
  ServerCommunication,
  SocketCommunication
} from '../server-interface';

/* Serviços do Electron */
import { Files } from '../files';
import { Functions } from '../functions';

/* Interfaces do Electron */
import { DatabaseData } from '../electron-interface';

/* Serviço de tradução do Electron */
import { TranslationService } from '../../src-electron/services/translation-service';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../../src-angular/app/utilities/utilities-constants';

/* Serviço de configuração do Agent */
import { ConfigurationService } from './configuration-service';
import { Configuration } from '../../src-angular/app/configuration/configuration-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, of, map, switchMap } from 'rxjs';

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
                  })
                });
                break;
              case 'def':
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
      if (command.destination == configuration.serialNumber) {
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
  private static sendCommandToServer(command: string, word: string, callbackFunction: any): Observable<boolean> {
    return new Observable<boolean>((subscriber: any) => {
      
      //Socket de comunicação com o Agent-Server
      let client: any = new net.Socket();
      
      //Resposta final desta instância de conexão ao servidor
      let response: boolean = false;
      
      //Consulta das traduções
      let translations: any = TranslationService.getTranslations([
        new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_COMMAND', [word]),
        new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.SEND_COMMAND_RESPONSE', [word])
      ]);
      
      //Inicializa a conexão com o servidor da TOTVS
      client.connect(CNST_SERVER_PORT, CNST_SERVER_HOSTNAME, () => {
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
              callbackFunction(command).subscribe((b: boolean) => {
                response = b;
                client.end();
              });
            }
          }
        });
	    });
      
      //Evento disparado ao encerrar a conexão com o Agent-Server
      client.on('close', () => {
	      Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.DISCONNECTED'], null, null, null);
        subscriber.next(response);
        subscriber.complete();
      });
    });
  }
  
  /* Método de solicitação do SerialNumber do Agent */
  public static requestSerialNumber(args: string[]): Observable<boolean> {
    
    //Prepara a palavra de comando a ser enviada, com criptografia
    return ServerService.prepareCommandWord('requestSerialNumber', args).pipe(switchMap((buffer: string) => {
      
      //Envia o comando para o servidor da TOTVS, e processa a resposta
      //(HOF - Higher Order Function)
      return ServerService.sendCommandToServer(
        buffer,
        'requestSerialNumber',
        (response: ServerCommunication) => {
          return ConfigurationService.getConfiguration(false).pipe(switchMap((configuration: Configuration) => {
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SERIAL_NUMBER'], null, null, null);
            
            //Realiza a gravação do serialNumber desta instância do Agent
            configuration.serialNumber = response.args[0];
            return ConfigurationService.saveConfiguration(configuration).pipe(map((b: boolean) => {
              Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SERIAL_NUMBER_OK'], null, null, null);
              return b;
            }, (err: any) => {
              Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.SERIAL_NUMBER_ERROR'], null, null, null);
            }));
          }));
        }
      ).pipe(map((b: boolean) => {
        return b;
      }));
    }));
  }
}