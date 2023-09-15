/* Componentes padrões do Electron */
import { dialog } from 'electron';

/* Dependência de manipulação de arquivos da máquina do usuário */
import * as fs from 'fs-extra';

/* Dependência para gravação de arquivos de log */
import * as winston from 'winston';

/* Serviço de tradução do Electron */
import { TranslationService } from './services/translation-service';
import { TranslationInput } from '../src-angular/app/services/translation/translation-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../src-angular/app/utilities/utilities-constants';
import {
  CNST_DATABASE_NAME,
  CNST_DATABASE_NAME_DEV,
  CNST_LOGS_PATH,
  CNST_TMP_PATH,
  CNST_LOGS_REGEX,
  CNST_LOGS_FILENAME,
  CNST_LOGS_EXTENSION,
  CNST_LOGS_SPACING,
  CNST_OS_LINEBREAK
} from './constants-electron';

/* Interface do banco de dados do Agent */
import { DatabaseData } from './electron-interface';

/* Serviço de configuração do Agent */
import { ConfigurationService } from './services/configuration-service';
import { Configuration } from '../src-angular/app/configuration/configuration-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, from, map } from 'rxjs';

export class Files {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Caminho completo do arquivo de banco do Agent, seja desenvolvimento ou produção
  private static filepath: string = null;
  
  //Armazena as configurações do sistema de log do Agent, para mensagens json (INFO / DEBUG / WARN)
  private static loggerJSON: any = null;
  
  //Armazena as configurações do sistema de log do Agent, para mensagens de texto (ERROR)
  private static loggerTEXT: any = null;
  
  /*********************************/
  /******* MÉTODOS DO MÓDULO  ******/
  /*********************************/
  /*Método de formatação de uma data do Javascript, para a máscara do arquivo de log*/
  public static formatDate(inputDate: Date): string {
    let day: number = inputDate.getDate();
    let month: number = inputDate.getMonth() + 1;
    let year: number = inputDate.getFullYear();
    
    let str_day = day.toString().padStart(2, '0');
    let str_month = month.toString().padStart(2, '0');
    
    return `${year}-${str_month}-${str_day}`;
  }
  
  /* Método de remoção dos arquivos de log antigos do Agent */
  public static deleteOldLogs() {
    
    //Leitura da configuração atual do Agent
    ConfigurationService.getConfiguration(true).subscribe((conf: Configuration) => {
      
      //Define a data mais antiga a ser mantida dos arquivos de log
      let maxDate: Date = new Date();
      maxDate.setDate(new Date().getDate() - conf.logfilesToKeep);
      
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING_OK'], null, null, null);
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DELETE_OLD_LOGS'], null, null, null);
      
      //Realiza a leitura do nome de todos os arquivos presentes no diretório de log do Agent
      fs.readdir(CNST_LOGS_PATH, (err: any, files: any) => {
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
            
            if (logDate.getTime() < maxDate.getTime()) fs.remove(CNST_LOGS_PATH + '/' + file);
          }
        });
        
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DELETE_OLD_LOGS_OK'], null, null, null);
      });
    });
  }
  
  /* Método de escrita dos arquivos de log do Agent */
  public static writeToLog(loglevel: any, system: string, message: string, execId: string, scheduleId: string, err: any): boolean {
    
    //Inicializa o objeto a ser escrito no log
    let obj: any = {
      timestamp: new Date(),
      loglevel: loglevel.tag,
      system: system,
      message: JSON.stringify(message).replaceAll('\"', '')
    };
    
    //Adiciona os campos de execId / scheduleId ao objeto, caso estes valores tenham sido passados ao método
    if (execId != null) obj['execId'] = execId;
    if (scheduleId != null) obj['scheduleId'] = scheduleId;
    
    //Realiza a escrita no arquivo de log
    if (message) {
      switch (loglevel.level) {
        case CNST_LOGLEVEL.ERROR.level: Files.loggerJSON.error(obj); break;
        case CNST_LOGLEVEL.WARN.level: Files.loggerJSON.warn(obj); break;
        case CNST_LOGLEVEL.INFO.level: Files.loggerJSON.info(obj); break;
        case CNST_LOGLEVEL.DEBUG.level: Files.loggerJSON.debug(obj); break;
      }
    } else if (err) Files.loggerTEXT.error(err);
    
    return true;
  }
  
  /* Método de leitura dos arquivos de log gerados pelo Agent */
  public static readLogs(): Array<string> {
    let logs: Array<string> = [];
    
    //Realiza a leitura do nome de todos os arquivos presentes no diretório de log do Agent
    let files: any = fs.readdirSync(CNST_LOGS_PATH);
    files.map((file: string) => {
      
      //Filtra apenas os arquivos de log válidos
      let regexLogs = new RegExp(CNST_LOGS_REGEX);
      if (regexLogs.test(file)) {
        
        //Realiza a leitura de todas as linhas do arquivo de log, e as armazena
        fs.readFileSync(CNST_LOGS_PATH + '/' + file).toString().split(CNST_OS_LINEBREAK()).map((line: string) => {
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
  public static initApplicationData(language: string): void {
    
    //Inicializa o canal de log p/ mensagens de debug / info
    Files.loggerJSON = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ssZ' }),
        winston.format((info) => {
          const {
            timestamp, loglevel, system, message, level, ...rest
          } = info;
          return {
            timestamp, loglevel, system, message, level, ...rest,
          };
        })(),
        winston.format.json({ deterministic: false })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: CNST_LOGS_PATH + '/' + CNST_LOGS_FILENAME + '-' + Files.formatDate(new Date()) + '.' + CNST_LOGS_EXTENSION
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
          filename: CNST_LOGS_PATH + '/' + CNST_LOGS_FILENAME + '-' + Files.formatDate(new Date()) + '.' + CNST_LOGS_EXTENSION
        })
      ]
    });
    
    //Verifica se existe um banco de testes/desenv. no diretório de dados do Agent
    if (fs.existsSync(CNST_DATABASE_NAME_DEV)) {
      Files.filepath = CNST_DATABASE_NAME_DEV;
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DATABASE_DEVELOPMENT'], null, null, null);
      
    //Caso não exista, procura por um banco de produção no mesmo diretório
    } else if (fs.existsSync(CNST_DATABASE_NAME)) {
      Files.filepath = CNST_DATABASE_NAME;
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DATABASE_PRODUCTION'], null, null, null);
      
    //Caso também não exista, é criado um novo arquivo de banco, de produção, 
    } else {
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DATABASE_CREATE'], null, null, null);
      fs.createFileSync(CNST_DATABASE_NAME);
      
      fs.writeJsonSync(
        CNST_DATABASE_NAME,
        new DatabaseData(),
        {
          spaces: CNST_LOGS_SPACING,
          'EOL': CNST_OS_LINEBREAK()
        }
      );
      
      Files.filepath = CNST_DATABASE_NAME;
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.DATABASE_CREATE_OK'], null, null, null);
    }
    
    //Cria o diretório de arquivos temporários do Agent (Caso ainda não exista)
    if (!fs.existsSync(CNST_TMP_PATH)) {
      fs.mkdirSync(CNST_TMP_PATH);
    }
  }
  
  /* Método de leitura do banco do Agent */
  public static readApplicationData(): Observable<DatabaseData> {
    return from(fs.readJson(Files.filepath));
  }
  
  /* Método de escrita do banco do Agent */
  public static writeApplicationData(db: DatabaseData): Observable<boolean> {
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