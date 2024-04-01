/* Componentes padrões do Electron */
import { dialog } from 'electron';

/* Dependência do Node, usada para consultar o endereço dos arquivos da Máquina */
import * as path from 'path';

/* Dependência de manipulação de arquivos da máquina do usuário */
import * as fs from 'fs-extra';

/* Dependência de conversão de arquivos XML p/ JSON */
import * as xml2js from 'xml2js';

/* Dependência para gravação de arquivos de log */
import * as winston from 'winston';

/* Serviço central do Electron */
import Main from '../electron-main';

/* Serviço de tradução do Electron */
import { TranslationService } from './services/translation-service';
import { TranslationInput } from '../src-angular/app/services/translation/translation-interface';

/* Interface de ambientes do Agent */
import { Workspace } from '../src-angular/app/workspace/workspace-interface';

/* Interface de bancos de dados do Agent */
import { Database } from '../src-angular/app/database/database-interface';

/* Interface de agendamentos do Agent */
import { Schedule } from '../src-angular/app/schedule/schedule-interface';

/* Interfaces de logs do Agent-Client */
import { AgentLogMessage } from '../src-angular/app/monitor/monitor-interface';

/* Interface de consultas do Agent */
import { QueryClient } from '../src-angular/app/query/query-interface';

/* Interface de rotinas do Agent */
import { ScriptClient } from '../src-angular/app/script/script-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../src-angular/app/utilities/utilities-constants';
import {
  CNST_AGENT_CLIENT_DATABASE_NAME,
  CNST_AGENT_CLIENT_DATABASE_NAME_DEV,
  CNST_AGENT_CLIENT_DATABASE_NAME_MIRROR,
  CNST_REMOTE_LOGS_PATH,
  CNST_LOGS_PATH,
  CNST_TMP_PATH,
  CNST_JRE_PATH,
  CNST_LOGS_REGEX,
  CNST_LOGS_FILENAME,
  CNST_LOGS_MIRROR_FILENAME,
  CNST_LOGS_EXTENSION,
  CNST_LOGS_SPACING,
  CNST_OS_LINEBREAK,
  CNST_LOGS_TAGS_CLIENT,
  CNST_LOGS_TAGS_MIRROR
} from './electron-constants';

/* Interface do banco de dados do Agent */
import { ClientData } from './electron-interface';

/* Interface de validação de arquivos Agent */
import { FileValidation } from './files-interface';

/* Serviço de configuração do Agent */
import { ConfigurationService } from './services/configuration-service';
import { Configuration } from '../src-angular/app/configuration/configuration-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, from, map, switchMap, of, catchError, concat, zip } from 'rxjs';

export class Files {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Caminho completo do arquivo de banco do Agent, seja desenvolvimento ou produção
  private static filepath: string = null;
  
  //Armazena as configurações do sistema de log do Agent, para mensagens json (INFO / DEBUG / WARN)
  private static loggerJSON: any = null;
  private static loggerJSONMIRROR: any = null;

  //Armazena as configurações do sistema de log do Agent, para mensagens de texto (ERROR)
  private static loggerTEXT: any = null;
  private static loggerTEXTMIRROR: any = null;

  //Armazena a data em que os arquivos de log foram inicializados
  private static startDate: Date = new Date();

  /*********************************/
  /******* MÉTODOS DO MÓDULO  ******/
  /*********************************/
  /* Método de formatação de uma data do Javascript, para a máscara do arquivo de log */
  public static formatDate(inputDate: Date): string {
    let day: number = inputDate.getUTCDate();
    let month: number = inputDate.getUTCMonth() + 1;
    let year: number = inputDate.getUTCFullYear();
    
    let str_day = day.toString().padStart(2, '0');
    let str_month = month.toString().padStart(2, '0');
    
    return `${year}-${str_month}-${str_day}`;
  }

  /* Método de formatação de uma data/hora do Javascript, para a máscara do arquivo de log */
  public static formatTimestamp(inputDate: Date): string {
    let year: number = inputDate.getFullYear();
    let month: number = inputDate.getMonth() + 1;
    let day: number = inputDate.getDate();
    let hour: number = inputDate.getHours();
    let minute: number = inputDate.getMinutes();
    let second: number = inputDate.getSeconds();
    let millisecond: number = inputDate.getMilliseconds();
    let offset: number = inputDate.getTimezoneOffset();

    let str_month: string = month.toString().padStart(2, '0');
    let str_day: string = day.toString().padStart(2, '0');
    let str_hour: string = hour.toString().padStart(2, '0');
    let str_minute: string = minute.toString().padStart(2, '0');
    let str_second: string = second.toString().padStart(2, '0');
    let str_millisecond: string = millisecond.toString().padStart(3, '0');
    let str_offset: string = (offset <= 0 ? '+' : '-') + (offset / 60).toString().padStart(2, '0') + ':' + (offset % 60).toString().padStart(2, '0');
    
    return `${year}-${str_month}-${str_day} ${str_hour}:${str_minute}:${str_second}.${str_millisecond}${str_offset}`;
  }

  /* Método para calcular a diferença, em dias, entre duas datas */
  public static dateDiff(d1: Date, d2: Date): number {
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }

  /* Método de remoção dos arquivos de log antigos do Agent */
  public static deleteOldLogs() {
    
    //Leitura da configuração atual do Agent
    ConfigurationService.getConfiguration(false).subscribe((conf: Configuration) => {
      
      //Define a data mais antiga a ser mantida dos arquivos de log
      let maxDate: Date = new Date();
      maxDate.setDate(new Date().getDate() - conf.logfilesToKeep);
      
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DELETE_OLD_LOGS'], null, null, null, null, null);
      
      //Realiza a leitura do nome de todos os arquivos presentes no diretório de log do Agent
      fs.readdir(CNST_LOGS_PATH(), (err: any, files: any) => {
        files.forEach((file: any) => {
          
          //Filtra apenas os arquivos de log válidos
          let regexLogs = new RegExp(CNST_LOGS_REGEX);
          if (regexLogs.test(file)) {
            
            /*
              Converte a data do nome do arquivo para um objeto de data,
              e remove o arquivo de log, caso o mesmo seja muito antigo.
            */
            let year: number = file.substring(file.length - 14, file.length - 10);
            let month: number = file.substring(file.length - 9, file.length - 7);
            let day: number = file.substring(file.length - 6, file.length - 4);
            let logDate: Date = new Date(year, month - 1, day);
            
            if (logDate.getTime() < maxDate.getTime()) fs.remove(CNST_LOGS_PATH() + '/' + file);
          }
        });
        
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DELETE_OLD_LOGS_OK'], null, null, null, null, null);
      });
    });
  }
  
  /* Método de escrita dos arquivos de log do Agent */
  public static writeToLog(loglevel: any, system: string, message: string, execId: string, scheduleId: string, err: any, logDate: Date, mirrorOverwrite: string): boolean {
    
    //Inicializa o objeto a ser escrito no log
    let obj: any = {
      mirror: (((Main.getMirrorMode() == 2) || (Main.getMirrorMode() == 3) || ((Main.getMirrorMode() == 1) && (system == CNST_SYSTEMLEVEL.JAVA))) ? CNST_LOGS_TAGS_MIRROR : CNST_LOGS_TAGS_CLIENT),
      timestamp: ((logDate == null) ? new Date() : logDate),
      logDate: ((logDate == null) ? Files.formatTimestamp(new Date()) : Files.formatTimestamp(logDate)),
      loglevel: loglevel.tag,
      system: system,
      message: JSON.stringify(message).replaceAll('\"', '')
    };

    //Sobreescrita da função de sincronização de logs
    if (mirrorOverwrite != null) obj.mirror = mirrorOverwrite;

    //Adiciona os campos de execId / scheduleId ao objeto, caso estes valores tenham sido passados ao método
    if (execId != null) obj['execId'] = execId;
    if (scheduleId != null) obj['scheduleId'] = scheduleId;

    //Realiza a escrita no arquivo de log
    if (message) {
      switch (loglevel.level) {
        case CNST_LOGLEVEL.ERROR.level:
          (obj.mirror == CNST_LOGS_TAGS_CLIENT ? Files.loggerJSON.error(obj) : Files.loggerJSONMIRROR.error(obj));
          break;
        case CNST_LOGLEVEL.WARN.level:
          (obj.mirror == CNST_LOGS_TAGS_CLIENT ? Files.loggerJSON.warn(obj) : Files.loggerJSONMIRROR.warn(obj));
          break;
        case CNST_LOGLEVEL.INFO.level:
          (obj.mirror == CNST_LOGS_TAGS_CLIENT ? Files.loggerJSON.info(obj) : Files.loggerJSONMIRROR.info(obj));
          break;
        case CNST_LOGLEVEL.DEBUG.level:
          (obj.mirror == CNST_LOGS_TAGS_CLIENT ? Files.loggerJSON.debug(obj) : Files.loggerJSONMIRROR.debug(obj));
          break;
      }
    } else if (err) {
      (obj.mirror == CNST_LOGS_TAGS_CLIENT ? Files.loggerTEXT.error(err) : Files.loggerTEXTMIRROR.error(err));
    }

    return true;
  }
  
  /* Método de validação da integridade dos arquivos XML / JSON, que serão enviados para o GoodData */
  public static checkFileIntegrityLocally(fileFolder: string): Observable<FileValidation[]> {

    //Número de arquivos com erros encontrados
    let errorsJSON: number = 0;
    let errorsXML: number = 0;

    //Armazena o array de observáveis que irão validar cada um dos arquivos xml / json encontrados
    let validators: Observable<any>[] = [];
    
    //Verifica se existem arquivos locais para serem enviados ao GoodData
    if (fileFolder != '') {
      
      //Consulta das traduções
      let translations1: any = TranslationService.getTranslations([
        new TranslationInput('SCHEDULES.MESSAGES.VALIDATION', [fileFolder]),
        new TranslationInput('SCHEDULES.MESSAGES.VALIDATION_OK', [fileFolder]),
        new TranslationInput('SCHEDULES.MESSAGES.VALIDATION_ERROR', [fileFolder])
      ]);
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations1['SCHEDULES.MESSAGES.VALIDATION'], null, null, null, null, null);
      
      //Extrai todos os nomes dos arquivos de um diretório, com suas extensões.
      let files: string[] = Files.getFileNames(fileFolder);
      files.map((file: string) => {
        
        //Consulta das traduções
        let translations2: any = TranslationService.getTranslations([
          new TranslationInput('SCHEDULES.MESSAGES.VALIDATION_FILE', [file]),
          new TranslationInput('SCHEDULES.MESSAGES.VALIDATION_FILE_OK', [file]),
          new TranslationInput('SCHEDULES.MESSAGES.VALIDATION_FILE_ERROR', [file])
        ]);
        
        //Extrai a extensão do arquivo
        let extension: string = file.split('.').filter(Boolean).slice(1).join('.').toUpperCase();
        
        //Validação de arquivos XML.
        //Comandos de TIMEOUT foram adicionados para a ordenação do arquivo de log ficar correta.
        if (extension == 'XML') {
          validators.push(new Observable<FileValidation>((subscriber: any) => {
            setTimeout(() => {
              Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations2['SCHEDULES.MESSAGES.VALIDATION_FILE'], null, null, null, null, null);
            let xmlData: string = fs.readFileSync(path.join(fileFolder, file)).toString();
            xml2js.parseString(xmlData, (err, result) => {
              if (err == null) {
                Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations2['SCHEDULES.MESSAGES.VALIDATION_FILE_OK'], null, null, null, null, null);
                subscriber.next(new FileValidation('XML', 0));
                subscriber.complete();
              } else {
                Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations2['SCHEDULES.MESSAGES.VALIDATION_FILE_ERROR'], null, null, null, null, null);
                setTimeout(() => { Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, null, null, null, err.toString(), null, null); }, 100);
                subscriber.next(new FileValidation('XML', 1));
                subscriber.complete();
              }
            });
          }, 100);
          }));
        }
        
        //Validação de arquivos JSON
        //Comandos de TIMEOUT foram adicionados para a ordenação do arquivo de log ficar correta.
        else if (extension == 'JSON') {
          validators.push(new Observable<FileValidation>((subscriber: any) => {
            setTimeout(() => {
              Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations2['SCHEDULES.MESSAGES.VALIDATION_FILE'], null, null, null, null, null);
            try {
              fs.readJsonSync(path.join(fileFolder, file), { throws: true });
              Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations2['SCHEDULES.MESSAGES.VALIDATION_FILE_OK'], null, null, null, null, null);
              subscriber.next(new FileValidation('JSON', 0));
              subscriber.complete();
            } catch (err: any) {
              Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations2['SCHEDULES.MESSAGES.VALIDATION_FILE_ERROR'], null, null, null, null, null);
              setTimeout(() => { Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, null, null, null, err.toString(), null, null); }, 100);
              subscriber.next(new FileValidation('JSON', 1));
              subscriber.complete();
            }
            }, 100);
          }));
        }
      });
      
      //Retorna o observável final do método
      if (validators.length == 0) return of([]);
      else return new Observable<FileValidation[]>((subscriber: any) => {
        let i: number = 0;
        let errors: FileValidation[] = [];
        
        //Itera por todos os observáveis de validação dos arquivos, e coleta suas respostas, um por um, de maneira síncrona
        concat(...validators).pipe(map((file: FileValidation) => {
          i = i + 1;
          if (file.errors == 1) {
            switch (file.type) {
            case 'XML':
              errorsXML = errorsXML + 1;
              break;
            case 'JSON':
              errorsJSON = errorsJSON + 1;
              break;
            }
          }
          
          if (validators.length == i) {
            if (errorsXML > 0) errors.push(new FileValidation('XML', errorsXML));
            if (errorsJSON > 0) errors.push(new FileValidation('JSON', errorsJSON));
            subscriber.next(errors)
            subscriber.complete();
          }
        })).subscribe();
      });
    } else {
      return of([]);
    }
  }
  
  /* Método de validação de um arquivo JSON */
  public static validateJSON(filepath: string): boolean {
    let json: any = fs.readJsonSync(filepath, { throws: true });
    return true;
  }
  
  /* Método de leitura dos arquivos de log gerados pelo Agent */
  public static getFileNames(filePath: string): Array<string> {
    return fs.readdirSync(filePath);
  }
  
  /* Método de leitura dos arquivos de log gerados pelo Agent */
  public static readLogs(): Array<string> {
    let logs: Array<string> = [];
    
    //Realiza a leitura do nome de todos os arquivos presentes no diretório de log do Agent
    let files: any = fs.readdirSync(CNST_LOGS_PATH());
    files.map((file: string) => {
      
      //Filtra apenas os arquivos de log válidos
      let regexLogs = new RegExp(CNST_LOGS_REGEX);
      if (regexLogs.test(file)) {
        
        //Realiza a leitura de todas as linhas do arquivo de log, e as armazena
        fs.readFileSync(CNST_LOGS_PATH() + '/' + file).toString().split(CNST_OS_LINEBREAK()).map((line: string) => {
          logs.push(line);
        });
        logs.pop();
      }
    });
    
    //Retorna todas as linhas, de todos os arquivos de log válidos, que foram lidos.
    return logs;
  }

  /*
    Método de inicialização do banco de dados do Agent, e seus arquivos de log.
    Caso não exista banco, é criado um com as configurações iniciais padrões.
  */
  public static initApplicationData(showLogs: boolean, language: string): void {

    //Apaga os arquivos temporários de logs / configuração do acesso remoto
    if ((Main.getMirrorMode() == 0) || (Main.getMirrorMode() == 1)) {
      fs.emptyDirSync(CNST_REMOTE_LOGS_PATH());
      if (fs.existsSync(CNST_AGENT_CLIENT_DATABASE_NAME_MIRROR())) fs.removeSync(CNST_AGENT_CLIENT_DATABASE_NAME_MIRROR());
    }

    //Encerramento dos canais de logs anteriores (caso existam)
    Files.terminateLogStreams();

    //Atualiza a data de inicialização dos logs
    Files.startDate = new Date();

    //Inicializa o canal de log p/ mensagens de debug / info
    Files.loggerJSON = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format((info) => {
          const {
            mirror, logDate, loglevel, system, message, level, ...rest
          } = info;
          delete info.timestamp;
          delete info.level;
          return info;
        })(),
        winston.format.json({ deterministic: false })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: (Main.getMirrorMode() == 3 ? CNST_REMOTE_LOGS_PATH() : CNST_LOGS_PATH()) + '/' + CNST_LOGS_FILENAME + '-' + Files.formatDate(new Date()) + '.' + CNST_LOGS_EXTENSION
        })
      ]
    });

    //Inicializa o canal de log p/ mensagens de debug / info, disparadas remotamente
    Files.loggerJSONMIRROR = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format((info) => {
          const {
            mirror, logDate, loglevel, system, message, level, ...rest
          } = info;
          delete info.timestamp;
          delete info.level;
          return info;
        })(),
        winston.format.json({ deterministic: false })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: (Main.getMirrorMode() == 3 ? CNST_REMOTE_LOGS_PATH() : CNST_LOGS_PATH()) + '/' + CNST_LOGS_FILENAME + '-' + CNST_LOGS_MIRROR_FILENAME + '-' + Files.formatDate(new Date()) + '.' + CNST_LOGS_EXTENSION
        })
      ]
    });

    //Inicializa o canal de log p/ mensagens de erro
    Files.loggerTEXT = winston.createLogger({
      level: 'error',
      format: winston.format.printf(({ message }) => {
        return `${message}`;
      }),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: (Main.getMirrorMode() == 3 ? CNST_REMOTE_LOGS_PATH() : CNST_LOGS_PATH()) + '/' + CNST_LOGS_FILENAME + '-' + Files.formatDate(new Date()) + '.' + CNST_LOGS_EXTENSION
        })
      ]
    });

    //Inicializa o canal de log p/ mensagens de erro, disparadas remotamente
    Files.loggerTEXTMIRROR = winston.createLogger({
      level: 'error',
      format: winston.format.printf(({ message }) => {
        return `${message}`;
      }),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: (Main.getMirrorMode() == 3 ? CNST_REMOTE_LOGS_PATH() : CNST_LOGS_PATH()) + '/' + CNST_LOGS_FILENAME + '-' + CNST_LOGS_MIRROR_FILENAME + '-' + Files.formatDate(new Date()) + '.' + CNST_LOGS_EXTENSION
        })
      ]
    });

    //Verifica se existe um banco da instância espelhada no diretório de dados do Agent
    if (fs.existsSync(CNST_AGENT_CLIENT_DATABASE_NAME_MIRROR())) {
        Files.filepath = CNST_AGENT_CLIENT_DATABASE_NAME_MIRROR();
      if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DATABASE_MIRROR'], null, null, null, null, null);

    //Caso não exista, verifica se existe um banco de testes/desenv no mesmo diretório
    } else if (fs.existsSync(CNST_AGENT_CLIENT_DATABASE_NAME_DEV())) {
      Files.filepath = CNST_AGENT_CLIENT_DATABASE_NAME_DEV();
      if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DATABASE_DEVELOPMENT'], null, null, null, null, null);
      
    //Caso não exista, procura por um banco de produção no mesmo diretório
    } else if (fs.existsSync(CNST_AGENT_CLIENT_DATABASE_NAME())) {
      Files.filepath = CNST_AGENT_CLIENT_DATABASE_NAME();
      if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DATABASE_PRODUCTION'], null, null, null, null, null);
      
    //Caso também não exista, é criado um novo arquivo de banco, de produção, 
    } else {
      if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DATABASE_CREATE'], null, null, null, null, null);
      fs.createFileSync(CNST_AGENT_CLIENT_DATABASE_NAME());

      //Gravação das configurações iniciais do banco de dados do Agent-Client
      let db: ClientData = new ClientData();
      db.configuration.javaJREDir = CNST_JRE_PATH();
      fs.writeJsonSync(
        CNST_AGENT_CLIENT_DATABASE_NAME(),
        db,
        {
          spaces: CNST_LOGS_SPACING,
          'EOL': CNST_OS_LINEBREAK()
        }
      );
      
      Files.filepath = CNST_AGENT_CLIENT_DATABASE_NAME();
      if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DATABASE_CREATE_OK'], null, null, null, null, null);
    }
    
    //Cria o diretório de arquivos temporários do Agent (Caso ainda não exista)
    if (!fs.existsSync(CNST_TMP_PATH())) {
      fs.mkdirSync(CNST_TMP_PATH());
    }
  }

  /* Método de encerramento dos canais de logs */
  public static terminateLogStreams(): void {
    if (Files.loggerJSON) {
      Files.loggerJSON.end();
      Files.loggerJSON = null;
    }
    if (Files.loggerJSONMIRROR) {
      Files.loggerJSONMIRROR.end();
      Files.loggerJSONMIRROR = null;
    }
    if (Files.loggerTEXT) {
      Files.loggerTEXT.end();
      Files.loggerTEXT = null;
    }
    if (Files.loggerTEXTMIRROR) {
      Files.loggerTEXTMIRROR.end();
      Files.loggerTEXTMIRROR = null;
    }
  }

  /* Método de leitura do banco do Agent */
  public static readApplicationData(): Observable<ClientData> {
    return from(fs.readJson(Files.filepath)).pipe(map((data: ClientData) => {
      
      data.workspaces = data.workspaces.map((parameter: Workspace) => {
        return new Workspace().toObject(parameter);
      });
      
      data.databases = data.databases.map((parameter: Database) => {
        return new Database().toObject(parameter);
      });
      
      data.schedules = data.schedules.map((parameter: Schedule) => {
        return new Schedule().toObject(parameter);
      });
      
      data.queries = data.queries.map((parameter: QueryClient) => {
        return new QueryClient(null).toObject(parameter);
      });
      
      data.scripts = data.scripts.map((parameter: ScriptClient) => {
        return new ScriptClient(null).toObject(parameter);
      });

      return data;
    }));
  }
  
  /* Método de escrita do banco do Agent */
  public static writeApplicationData(db: ClientData): Observable<boolean> {
    return from(fs.writeJson(
      Files.filepath,
      db,
      {
        spaces: CNST_LOGS_SPACING,
        'EOL': CNST_OS_LINEBREAK()
      }
    )).pipe(map((r: any) => {
      return true;
    }));
  }

  /* Método de escrita do banco do Agent */
  public static writeMirrorData(db: ClientData): Observable<boolean> {
    return from(fs.writeJson(
      CNST_AGENT_CLIENT_DATABASE_NAME_MIRROR(),
      db,
      {
        spaces: CNST_LOGS_SPACING,
        'EOL': CNST_OS_LINEBREAK()
      }
    )).pipe(map((r: any) => {
      return true;
    }));
  }

  /*
    Método de escrita dos arquivos de log de um Agent remoto
    Caso não exista arquivo de log, é criado um novo.
  */
  public static writeRemoteLogData(lines: string[]): void {
    
    //Apaga todos os arquivos de log existentes no diretório
    fs.emptyDirSync(CNST_REMOTE_LOGS_PATH());

    //Cria um novo arquivo de log
    let logfile: string = CNST_REMOTE_LOGS_PATH() + '/' + CNST_LOGS_FILENAME + '-' + Files.formatDate(new Date()) + '.' + CNST_LOGS_EXTENSION;

    //Realiza a escrita de todo o log recebido no arquivo
    let stream: any = fs.createWriteStream(logfile, { flags: 'a' });
    lines.map((line: string) => {
      stream.write(line + CNST_OS_LINEBREAK());
    });

    stream.end();
  }

  /*
    Método de anexação dos arquivos de log do Agent.

    Este método é disparado para fazer a sincronização dos arquivos de log deste Agent-Client,
    após o término do acesso remoto do servidor central da TOTVS, e/ou de outro Client.
  */
  public static appendLogData(newLogs: string): void {

    //Armazena cada uma das linhas de log recebidas, em formato JSON
    let logMessage: AgentLogMessage = null;

    //Armazena todas as mensagens de log atuais deste Agent-Client
    let agentLogMessagesCurrent: Array<AgentLogMessage> = [];

    //Armazena todas as mensagens de log recebidas para serem anexadas à este Agent-Client
    let agentLogMessagesNew: Array<AgentLogMessage> = [];
    
    //Armazena todas as mensagens de log recebidas para serem anexadas à este Agent-Client
    let agentLogMessagesFinal: Array<AgentLogMessage> = [];

    //Armazena todas as datas (ano-mês-dia) únicas das mensagens de log lidas.
    let logfiles: Set<string> = new Set();

    //Variável de suporte, usada para armazenar a última linha de log lida.
    let lastMessage: any = null;

    //Conversão JSONstring => JSON
    agentLogMessagesNew = JSON.parse(newLogs);

    //Conversão JSON => Objeto
    agentLogMessagesNew = agentLogMessagesNew.map((message: AgentLogMessage) => {
      return new AgentLogMessage(null, null, null, null, null, null, null, null, null).toObject(message);
    });

    //Leitura de todas as mensagens de log atualmente presentes no log deste Agent-Client
    Files.readLogs().map((log: string) => {
      try {
        let messages: any = JSON.parse(log);
        messages.str_logDate = messages.logDate;
        messages.logDate = new Date('' + messages.logDate);
        agentLogMessagesCurrent.push(messages);
        lastMessage = messages;
        
      //Conversão dos textos de log de erro
      } catch (ex) {
        agentLogMessagesCurrent.push(new AgentLogMessage(lastMessage.mirror, lastMessage.logDate, lastMessage.str_logDate, CNST_LOGLEVEL.ERROR.tag, lastMessage.system, log, lastMessage.level, lastMessage.execId, lastMessage.scheduleId));
      }
    });
    
    /*
      Remoção de todas as mensagens de log antigas, que já estão ordenadas corretamente

      Todas as mensagens mais antigas que a mensagem mais recente recebida, estão ordenadas.
      Apenas as mensagens dos arquivos de log remoto precisam ser ordenadas.
    */
    agentLogMessagesCurrent = agentLogMessagesCurrent.filter((message: AgentLogMessage) => {
      return (Files.dateDiff(message.logDate, agentLogMessagesNew[0].logDate) <= 1);
    });
    
    //Combina todas as mensagens de log, e as ordena.
    agentLogMessagesFinal = agentLogMessagesCurrent.concat(agentLogMessagesNew)
      .sort((a: AgentLogMessage, b: AgentLogMessage) => (a.logDate.getTime() - b.logDate.getTime()));
    
    //Extrai todas as datas distintas encontradas nos logs
    agentLogMessagesFinal.filter((message1: AgentLogMessage) => {
      let date: string = Files.formatDate(message1.logDate);
      let check: boolean = logfiles.has(date);
      logfiles.add(date);
      return !check;
    }).map((message2: AgentLogMessage) => {

      //Cria um novo arquivo de log, em branco, para a reescrita completa do mesmo
      let logfile: string = CNST_LOGS_PATH() + '/' + CNST_LOGS_FILENAME + '-' + Files.formatDate(message2.logDate) + '.' + CNST_LOGS_EXTENSION;
      let logfileMirror: string = CNST_LOGS_PATH() + '/' + CNST_LOGS_FILENAME + '-' + CNST_LOGS_MIRROR_FILENAME + '-' + Files.formatDate(message2.logDate) + '.' + CNST_LOGS_EXTENSION;
      fs.truncateSync(logfile);
      fs.truncateSync(logfileMirror);

      let lastLine: string = null;
      agentLogMessagesFinal.map((line: AgentLogMessage) => {
        if (!(lastLine === line.message)) {
          
          let level: any = null;
          switch (line.loglevel) {
            case CNST_LOGLEVEL.ERROR.tag: level = CNST_LOGLEVEL.ERROR; break;
            case CNST_LOGLEVEL.WARN.tag: level = CNST_LOGLEVEL.WARN; break;
            case CNST_LOGLEVEL.INFO.tag: level = CNST_LOGLEVEL.INFO; break;
            case CNST_LOGLEVEL.DEBUG.tag: level = CNST_LOGLEVEL.DEBUG; break;
          }

          Files.writeToLog(level, line.system, line.message, line.execId, line.scheduleId, null, line.logDate, line.mirror);
        }
        lastLine = line.message;
      });
    });
  }

  /* Método de seleção de um diretório da máquina do usuário */
  public static getFolder(b: any): Observable<string> {
    return from(dialog.showOpenDialog(b, {
      title: TranslationService.CNST_TRANSLATIONS['ELECTRON.FOLDER_SELECT'],
      properties: [
        'openDirectory'
      ]
    //Retorna o caminho informado, caso o popup não tenha sido cancelado
    })).pipe(map((r: any) => {
      if (r.canceled) {
        return null;
      } else {
        return '' + r.filePaths[0];
      }
    }));
  }

  /* Método de seleção de todas as mensagens de log geradas pela instância espelhada do Agent */
  public static getLogDataToSync(): AgentLogMessage[] {

    //Variável de suporte, usada para armazenar a última linha de log lida.
    let lastMessage: any = null;

    //Armazena todas as mensagens de log atuais deste Agent-Client
    let agentLogMessages: Array<AgentLogMessage> = [];

    //Leitura de todas as mensagens de log atualmente presentes no log deste Agent-Client
    Files.readLogs().map((log: string) => {
      try {
        let messages: any = JSON.parse(log);
        messages.logDate = new Date('' + messages.logDate);
        agentLogMessages.push(messages);
        lastMessage = messages;

      //Conversão dos textos de log de erro
      } catch (ex) {
        agentLogMessages.push(new AgentLogMessage(lastMessage.mirror, lastMessage.logDate, lastMessage.str_logDate, CNST_LOGLEVEL.ERROR.tag, lastMessage.system, log, lastMessage.level, lastMessage.execId, lastMessage.scheduleId));
      }
    });

    /*
      Remoção de todas as mensagens de log que não foram geradas por este Agent-Client

      Apenas as mensagens que não estão ainda armazenadas n
    */
    agentLogMessages = agentLogMessages.filter((message: AgentLogMessage) => {
      return ((message.mirror == CNST_LOGS_TAGS_MIRROR) && (message.logDate.getTime() >= Files.startDate.getTime()));
    });

    return agentLogMessages;
  }

  /* Método de seleção de um diretório da máquina do usuário */
  public static getFile(b: any): Observable<string> {
    return from(dialog.showOpenDialog(b, {
      title: TranslationService.CNST_TRANSLATIONS['ELECTRON.FILE_SELECT_DRIVER'],
      properties: [],
      filters: [
        {
          name: 'Java files (.jar)',
          extensions: ['jar']
        }
      ]
    //Retorna o caminho informado, caso o popup não tenha sido cancelado
    })).pipe(map((r: any) => {
      if (r.canceled) {
        return TranslationService.CNST_TRANSLATIONS['BUTTONS.SELECT'];
      } else {
        return '' + r.filePaths[0];
      }
    }));
  }
}
