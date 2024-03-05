/* Dependências do Node */
import * as path from 'path';
import * as childProcess from 'child_process';

/* Dependência usada para escrita de arquivos na máquina */
import * as fs from 'fs-extra';

/* Serviço de logs / arquivos do Agent */
import { Files } from './files';

/* Serviço de tradução do Electron */
import { TranslationService } from './services/translation-service';
import { TranslationInput } from '../src-angular/app/services/translation/translation-interface';

/* Serviço de tradução do Angular */
import { CNST_TRANSLATIONS } from '../src-angular/app/services/translation/translation-constants';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../src-angular/app/utilities/utilities-constants';
import {
  CNST_JAVA_CLASS_TESTCONNECTION,
  CNST_JAVA_CLASS_EXPORTQUERY,
  CNST_JAVA_CLASS_RUNAGENT,
  CNST_JAR_PATH_FAST,
  CNST_COMMAND_FILE,
  CNST_OS_LINEBREAK,
} from './electron-constants';

/* Interface de consultas do Agent */
import { QueryClient } from '../src-angular/app/query/query-interface';

/* Serviço de configuração do Agent */
import { ConfigurationService } from './services/configuration-service';
import { Configuration } from '../src-angular/app/configuration/configuration-interface';

/* Interfaces de comunicação com o Agent-Server */
import { responseObj } from '../src-angular/app/services/server/server-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, switchMap, of } from 'rxjs';

/* Interface de cadastro dos processos do Java em execução no Agent */
export class JavaProcess {
  childRef: any;
  scheduleId: string;
  execId: string;
  locale: string;
  
  constructor(child: any, scheduleId: string, execId: string, locale: string) {
    this.childRef = child;
    this.scheduleId = scheduleId;
    this.execId = execId;
    this.locale = locale;
  }
}

/* Interface de comunicação com o Java (input) */
export class JavaOutputBuffer {
  timestamp: string;
  level: number;
  message_string: string;
  message_json: any;
}

export class Execute {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Tag "<buffer>", gerada pelas mensagens do Java
  private static CNST_BUFFER_BEGIN_TAG: string = '<buffer>';
  private static CNST_BUFFER_BEGIN_SIZE: number = 8;
  
  //Tag "</buffer>", gerada pelas mensagens do Java
  private static CNST_BUFFER_END_TAG: string = '</buffer>';
  private static CNST_BUFFER_END_SIZE: number = 9;
  
  //Armazena as referências de todos os processos do Node atualmente em execução
  private static processes: JavaProcess[] = [];
  
  /*********************************/
  /******* MÉTODOS DO MÓDULO  ******/
  /*********************************/
  /*
    Método que gera um novo processo do Java pelo Node, 
    e controla os canais de comunicação do mesmo
    (stdOut, stdErr, stdClose).
    Retorna um observável que emite uma única vez após
    o término do processo.
  */
  public static callJavaExecution(startMessage: string, endMessage: string, jClass: string, inputBuffer: string, scheduleId: string, stdDataFunction: any, stdCloseFunction: any): Observable<any> {
    
    //Define o código de execução deste processo (Apenas disponível caso exista um agendamento vinculado)
    let execId: string = (scheduleId != null ? Math.floor(Math.random() * 10000) + '' : null);
    
    //Consulta da configuração atual do Agent
    return ConfigurationService.getConfiguration(true).pipe(switchMap((conf: Configuration) => {
      
      //Cria o arquivo de comando do Java
      let commandPath: string = path.join(conf.javaTmpDir, CNST_COMMAND_FILE + '_' + execId);
      fs.writeFile(commandPath, inputBuffer);
      
      //Define o idioma/país atualmente utilizado pelo Agent para configuração da JVM do Java (Locale)
      let language: string = conf.getLocaleLanguage();
      let country: string = conf.getLocaleCountry();
      
      //Escrita da mensagem de inicialização no log
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS[startMessage], execId, scheduleId, null);
      
      //Configuração da JVM, e da classe do Java a ser executada
      let child: any = childProcess.spawn(
        (conf.javaJREDir == null ? 'java' : path.join(conf.javaJREDir, 'bin', 'java')),
        [
          '-Duser.language=' + language,
          '-Duser.country=' + country,
          '-Xmx'+ conf.javaXmx + 'm',
          '-Djava.io.tmpdir=' + conf.javaTmpDir,
          '-classpath', CNST_JAR_PATH_FAST(), jClass, commandPath
        ]
      );
      
      //Armazenamento do processo em execução dentro do Agent
      Execute.processes.push(new JavaProcess(child, scheduleId, execId, conf.locale));
      
      //Retorna o observável que irá controlar este processo
      return new Observable<any>((subscriber: any) => {
        
        /*
          Armazena a mensagem de erro tratada recebida
          pelo observável, com o objetivo de retorná-la
          à interface do Agent (Angular)
        */
        let obs_errorMessage: string = null;
        
        /*************************************/
        /**** Evento de dados do processo ****/
        /*************************************/
        //Variáveis de suporte, para controle dos indexes de posição da mensagem recebida
        let obs_stdOutputStartIndex: number = 0;
        let obs_stdOutputFinalIndex: number = 0;
        let obs_stdOutputPosition: number = 0;
        
        //Buffer que armazena todos os dados recebidos pelo canal de erro do processo
        let obs_stdOutputBuffer: string = null;
        
        //Função de processamento do canal de dados
        child.stdout.on('data', (stdOutputBuffer: string) => {
          
          //Concatena a mensagem recebida com o buffer de dados deste observável
          obs_stdOutputBuffer += stdOutputBuffer;
          
          //Calcula a posição inicial / final da próxima mensagem recebida, via tags
          obs_stdOutputStartIndex = obs_stdOutputBuffer.indexOf(Execute.CNST_BUFFER_BEGIN_TAG, obs_stdOutputPosition);
          obs_stdOutputFinalIndex = obs_stdOutputBuffer.indexOf(Execute.CNST_BUFFER_END_TAG, obs_stdOutputPosition);
          
          //Caso uma mensagem completa tenha sido recebida (<buffer> mensagem </buffer>), processa-a
          if (obs_stdOutputFinalIndex > obs_stdOutputPosition) {
            obs_stdOutputPosition = obs_stdOutputFinalIndex + Execute.CNST_BUFFER_END_SIZE;
            
            //Recorta apenas a última mensagem não processada
            let buffer: string = obs_stdOutputBuffer.substring(obs_stdOutputStartIndex + Execute.CNST_BUFFER_BEGIN_SIZE, obs_stdOutputFinalIndex).toString();
            
            //Remove as quebras de linha da mensagem no início do buffer, caso existam
            if (buffer.endsWith(CNST_OS_LINEBREAK())) buffer = buffer.substring(0, buffer.toString().length - 1);
            if (buffer.startsWith(CNST_OS_LINEBREAK())) buffer = buffer.substring(1, buffer.toString().length);
            
            /*
              Tenta converter a mensagem para um objeto da interface de comunicação do Agent com o Java
              Caso não tenha sucesso, escreve a mensagem como foi recebida no arquivo de log (erro stacktrace)
              Caso consiga, formata a mensagem dos dados, e escreve no log
            */
            try {
              
              //Conversão da mensagem para a interface de comunicação com o Java
              let obj: JavaOutputBuffer = JSON.parse(buffer);
              
              //Procura o nível de execução da mensagem (INFO / WARN / DEBUG / ERROR)
              let loglevel = Object.getOwnPropertyNames.call(Object, CNST_LOGLEVEL).map((p: string) => {
                return CNST_LOGLEVEL[p];
              }).find((loglevel: any) => { return (loglevel.level == obj.level); });
              
              //Escrita do objeto recebido no arquivo de log (Ex: query da tabela I01)
              if (obj.message_json) {
                Files.writeToLog(loglevel, CNST_SYSTEMLEVEL.JAVA, JSON.stringify(obj.message_json), execId, scheduleId, null);
                
                //Executa a função de processamento de objetos recebidos pelo Java 
                stdDataFunction(obj.message_json);
                
              //Escrita da mensagem tratada no arquivo de log
              } else {
                Files.writeToLog(loglevel, CNST_SYSTEMLEVEL.JAVA, obj.message_string, execId, scheduleId, null);
              }
            
            //Escrita da mensagem não tratada (stacktrace) no arquivo de log
            } catch (ex) {
              Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.JAVA, null, execId, scheduleId, buffer);
            }
          }
        });
        
        /*************************************/
        /**** Evento de erros do processo ****/
        /*************************************/
        //Variáveis de suporte, para controle dos indexes de posição da mensagem recebida
        let obs_stdErrorStartIndex: number = 0;
        let obs_stdErrorFinalIndex: number = 0;
        let obs_stdErrorPosition: number = 0;
        
        //Buffer que armazena todos os dados recebidos pelo canal de erro do processo
        let obs_stdErrorBuffer: string = null;
        
        //Função de controle do canal de erros
        child.stderr.on('data', (stdErrorBuffer: string) => {
          
          //Concatena a mensagem recebida com o buffer de erros deste observável
          obs_stdErrorBuffer += stdErrorBuffer;
          
          //Calcula a posição inicial / final da próxima mensagem recebida, via tags
          obs_stdErrorStartIndex = obs_stdErrorBuffer.indexOf(Execute.CNST_BUFFER_BEGIN_TAG, obs_stdErrorPosition);
          obs_stdErrorFinalIndex = obs_stdErrorBuffer.indexOf(Execute.CNST_BUFFER_END_TAG, obs_stdErrorPosition);
          
          //Caso uma mensagem completa tenha sido recebida (<buffer> mensagem </buffer>), processa-a
          if (obs_stdErrorFinalIndex > obs_stdErrorPosition) {
            obs_stdErrorPosition = obs_stdErrorFinalIndex + Execute.CNST_BUFFER_END_SIZE;
            
            //Recorta apenas a última mensagem não processada
            let buffer: string = obs_stdErrorBuffer.substring(obs_stdErrorStartIndex + Execute.CNST_BUFFER_BEGIN_SIZE, obs_stdErrorFinalIndex).toString();
            
            //Remove as quebras de linha da mensagem no início do buffer, caso existam
            if (buffer.endsWith(CNST_OS_LINEBREAK())) buffer = buffer.substring(0, buffer.toString().length - 1);
            if (buffer.startsWith(CNST_OS_LINEBREAK())) buffer = buffer.substring(1, buffer.toString().length);
            
            /*
              Tenta converter a mensagem para um objeto da interface de comunicação do Agent com o Java
              Caso não tenha sucesso, escreve a mensagem como foi recebida no arquivo de log (erro stacktrace)
              Caso consiga, formata a mensagem de erro, e escreve no log
            */
            try {
              
              //Conversão da mensagem para a interface de comunicação com o Java
              let obj: JavaOutputBuffer = JSON.parse(buffer);
              
              //Procura o nível de execução da mensagem (INFO / WARN / DEBUG / ERROR)
              let loglevel = Object.getOwnPropertyNames.call(Object, CNST_LOGLEVEL).map((p: string) => {
                return CNST_LOGLEVEL[p];
              }).find((loglevel: any) => { return (loglevel.level == obj.level); });
              
              //Armazena a mensagem recebida para retorno após término do processo
              obs_errorMessage = obj.message_string;
              
              //Escrita da mensagem tratada no arquivo de log
              Files.writeToLog(loglevel, CNST_SYSTEMLEVEL.JAVA, obs_errorMessage, execId, scheduleId, null);
              
            //Escrita da mensagem não tratada (stacktrace) no arquivo de log
            } catch (ex) {
              Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.JAVA, null, execId, scheduleId, buffer);
            }
          }
        });
        
        /*************************************/
        /*** Evento de término do processo ***/
        /*************************************/
        child.on('close', (statusCode: number) => {
          
          //Consulta das traduções, e escrita da mensagem final no log do Agent
          let translations: any = TranslationService.getTranslations([
            new TranslationInput(endMessage, [statusCode + ''])
          ]);
          Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations[endMessage], null, null, null);
          
          //Remoção do processo terminado da pilha de controle do Agent
          Execute.processes = Execute.processes.filter((jp: JavaProcess) => jp.execId != execId);
          
          //Executa a função de tratamento final do processo, e retorna seu resultado
          if (stdCloseFunction != null) {
            let closeResponse: any = stdCloseFunction(statusCode, obs_errorMessage);
            subscriber.next(closeResponse);
          
            //Finaliza o observável
            subscriber.complete();
          }
        });
        
        //Finaliza o observável caso o mesmo deva ser executado de forma assíncrona
        if (stdCloseFunction == null) {
          subscriber.next(true);
          subscriber.complete();
        }
      });
    }));
  }
  
  /* Método de teste de conexão ao banco de dados */
  public static getJavaVersion(): Observable<string[]> {
    let javaData: string = '';
    return ConfigurationService.getConfiguration(true).pipe(switchMap((conf: Configuration) => {
      
      //Define o idioma/país atualmente utilizado pelo Agent para configuração da JVM do Java (Locale)
      let language: string = conf.getLocaleLanguage();
      let country: string = conf.getLocaleCountry();
      
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.JAVA_VERSION'], null, null, null);
      
      //Configuração da JVM
      let child: any = childProcess.spawn(
        (conf.javaJREDir == null ? 'java' : path.join(conf.javaJREDir, 'bin', 'java')),
        [
          '-version',
          '-Duser.language=' + language,
          '-Duser.country=' + country
        ]
      );
      
      //Retorna o observável que irá controlar este processo
      return new Observable<any>((subscriber: any) => {
        
        //Função de controle do canal de erros
        //Por algum motivo insano na história recente da humanidade, a versão do java é retornada como erro pelo OS.
        child.stderr.on('data', (stdErrorBuffer: string) => {
            javaData += stdErrorBuffer
        });
        
        child.on('close', (statusCode: number) => {
          Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.JAVA_VERSION_OK'], null, null, null);
          subscriber.next(javaData.split(CNST_OS_LINEBREAK()));
          subscriber.complete();
        });
      });
    }));
  }
  
  /* Método de teste de conexão ao banco de dados */
  public static testDatabaseConnection(inputBuffer: string): Observable<number> {
    return Execute.callJavaExecution(
      'ELECTRON.DATABASE_LOGIN_ELEC_START',
      'ELECTRON.DATABASE_LOGIN_ELEC_FINISH',
      CNST_JAVA_CLASS_TESTCONNECTION,
      inputBuffer,
      null,
      (obj: any) => {
        return null;
      },
      (statusCode: number, err: any) => {
        return statusCode;
      }
    );
  }
  
  /* Método de exportação das consultas da tabela I01 do Protheus */
  public static exportQuery(inputBuffer: string): Observable<any> {
    
    //Armazena todas as consultas geradas pelo Java
    let exportQuerybuffer: Array<QueryClient> = [];
    
    //Solicita a criação de um processo do Java para exportação de consultas
    //(HOF - Higher Order Function)
    return Execute.callJavaExecution(
      'ELECTRON.EXPORT_QUERY_ELEC_START',
      'ELECTRON.EXPORT_QUERY_ELEC_FINISH',
      CNST_JAVA_CLASS_EXPORTQUERY,
      inputBuffer,
      null,
      (obj: QueryClient) => {
        try {
          exportQuerybuffer.push(obj);
        } catch(ex: any) {
          console.log(ex);
        }
      },
      (statusCode: number, err: string) => {
        let res: any = {
          success: (statusCode == 0 ? true : false),
          err: err,
          message: exportQuerybuffer
        };
        
        return res;
      }
    );
  }
  
  /* Método de execução de um agendamento do Agent (Envio de dados p/ GoodData) */
  public static runAgent(inputBuffer: string, scheduleId: string): Observable<number> {
    
    //Impede o dispardo do agendamento, caso o mesmo já esteja em execução
    if (Execute.processes.find((jp: JavaProcess) => (jp.scheduleId == scheduleId)) != undefined) {
      return of(-1);
    } else {
      
      //Solicita a criação de um processo do Java para execução das consultas do agendamento
      //(HOF - Higher Order Function)
      return Execute.callJavaExecution(
        'ELECTRON.RUN_AGENT_ELEC_START',
        'ELECTRON.RUN_AGENT_ELEC_FINISH',
        CNST_JAVA_CLASS_RUNAGENT,
        inputBuffer,
        scheduleId,
        (obj: any) => {
          return null;
        },
        null
      );
    }
  }
  
  /* Método que finaliza todos os processos mapeados pelo Agent */
  public static killAllProcesses(): boolean {
    Execute.processes.map((jp: JavaProcess) => {
      Execute.killProcess(jp.scheduleId, jp.execId);      
    });
    
    return true;
  }
  
  /* Método que finaliza um processo de maneira forçada (Solicitado pelo usuário) */
  public static killProcess(scheduleId: string, execId: string): number {
    
    //Processo com o código de agendamento / execução recebidos (Caso exista)
    let process: JavaProcess = Execute.processes.find((jp: JavaProcess) => ((jp.scheduleId == scheduleId) && (jp.execId == execId)));
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('ELECTRON.PROCESS_KILL', [scheduleId, execId]),
      new TranslationInput('ELECTRON.PROCESS_KILL_OK', [scheduleId, execId]),
      new TranslationInput('ELECTRON.PROCESS_KILL_WARN', [scheduleId, execId]),
      new TranslationInput('ELECTRON.PROCESS_KILL_ERROR', [scheduleId, execId])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.PROCESS_KILL'], null, null, null);
    
    //Caso o processo tenha sido encontrado, o mesmo é terminado
    if (process) {
      if (process.childRef.kill('SIGTERM')) {
        Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.JAVA, CNST_TRANSLATIONS[process.locale].ELECTRON.JAVA_EXECUTION_CANCELLED, execId, scheduleId, null);
        Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.PROCESS_KILL_OK'], null, null, null);
        
        //Remoção do processo da pilha de controle do Agent
        Execute.processes = Execute.processes.filter((jp: JavaProcess) => jp.execId != execId);
        
        return 1;
      } else {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.PROCESS_KILL_ERROR'], null, null, null);
        return 0;
      }
      
    //Caso o processo não seja encontrado, o mesmo é apenas removido da pilha de controle do Agent
    } else {
      
      /*
        Escreve a mensagem de término de execução para cada idioma configurado no Agent.
        
        Este processo só será executado caso alguma falha ocorra no encerramento
        do Agent, como um desligamento de máquina imediato.
      */
      Object.getOwnPropertyNames.call(Object, CNST_TRANSLATIONS).map((p: string) => {
        Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.JAVA, CNST_TRANSLATIONS[p].ELECTRON.JAVA_EXECUTION_CANCELLED, execId, scheduleId, null);
      });
      
      Files.writeToLog(CNST_LOGLEVEL.WARN, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.PROCESS_KILL_WARN'], null, null, null);
      
      return 2;
    }
  }
}
