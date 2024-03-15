/* Serviço de logs / arquivos do Agent */
import { Files } from '../files';

/* Serviço de execução do Java pelo Agent */
import { Execute } from '../execute';

/* Serviço de criptografia do Agent */
import { EncryptionService } from '../encryption/encryption-service';

/* Serviço de tradução do Electron */
import { TranslationService } from './translation-service';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../../src-angular/app/utilities/utilities-constants';
import { Functions } from '../functions';
import {
  CNST_LOGS_PATH,
  CNST_LOGS_FILENAME,
  CNST_LOGS_EXTENSION,
  CNST_OS_SLASH
} from '../electron-constants';

/* Interface do banco de dados do Agent */
import { ClientData } from '../electron-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from './workspace-service';
import { Workspace } from '../../src-angular/app/workspace/workspace-interface';

/* Serviço de bancos de dados do Agent */
import { DatabaseService } from './database-service';
import { Database } from '../../src-angular/app/database/database-interface';

/* Interface de agendamentos do Agent */
import {
  Schedule,
  ETLParameterClient,
  SQLParameterClient
} from '../../src-angular/app/schedule/schedule-interface';

/* Serviço de consultas do Agent */
import { QueryService } from './query-service';
import { QueryClient } from '../../src-angular/app/query/query-interface';

/* Serviço de rotinas do Agent */
import { ScriptService } from './script-service';
import { ScriptClient } from '../../src-angular/app/script/script-interface';

/* Serviço de configuração do Agent */
import { ConfigurationService } from './configuration-service';
import { Configuration } from '../../src-angular/app/configuration/configuration-interface';

/* Interface de comunicação com o Java */
import { JavaInputBuffer } from '../../src-angular/app/utilities/java-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, switchMap, map, of, catchError, forkJoin } from 'rxjs';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

export class ScheduleService {
  
  /*******************/
  /*  AGENDAMENTOS   */
  /*******************/
  /* Método de consulta dos agendamentos salvos do Agent */
  public static getSchedules(showLogs: boolean): Observable<Schedule[]> {
    
    //Escrita de logs (caso solicitado)
    if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING'], null, null, null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno dos agendamentos cadastrados
    return Files.readApplicationData().pipe(map((db: ClientData) => {
      
      //Converte a data de execução de cada agendamento, para o fuso horário configurado no Agent.
      db.schedules = db.schedules.map((s: Schedule) => {
        if (s.lastExecution != undefined) s.lastExecutionString = new Date(s.lastExecution).toLocaleString(db.configuration.locale, {timeZone: db.configuration.timezone});
        return s;
      });
      
      return db.schedules;
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING_ERROR'], null, null, err, null, null);
      throw err;
    }));
  }
  
  /* Método de consulta dos agendamentos a serem executados pelo Agent */
  public static getSchedulesToExecute(): Observable<Schedule[]> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.TRIGGERSCHEDULES_LOADING', [Functions.formatDate(new Date())])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.TRIGGERSCHEDULES_LOADING'], null, null, null, null, null);
    
    //Consulta de todos os agendamentos cadastrados no Agent
    return ScheduleService.getSchedules(false).pipe(
      map((schedules: Schedule[]) => {
        schedules = schedules.filter((s: Schedule) => {
          
          //Define a data/hora atual
          let now: Date = new Date();
          
          //Filtra todas as janelas de execução válidas para o disparo do agendamento
          let windows: string[] = s.windows.filter((w: string) => {
            let execute: boolean = false;
            let executionDate: Date = (s.lastExecution == undefined ? new Date('2000-01-01') : new Date(s.lastExecution));
            
            let dateWindow = new Date();
            
            let hour: number = parseInt(w.substring(0, 2));
            let minute: number = parseInt(w.substring(3, 5));
            dateWindow.setHours(hour, minute, 0, 0);
            if ((dateWindow.getTime() > executionDate.getTime()) && (dateWindow.getTime() <= now.getTime())) execute = true;
            return execute;
          });
          return ((windows.length > 0) && (s.enabled));
        });
        
        //Retorna todos os agendamentos a serem executados
        if (schedules.length > 0) Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.TRIGGERSCHEDULES_LOADING_OK'], null, null, null, null, null);
        return schedules;
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.TRIGGERSCHEDULES_LOADING_ERROR'], null, null, err, null, null);
      throw err;
    }));
  }
  
  /*
    Método de gravação dos agendamentos do Agent
    
    Este método recebe múltiplos agendamentos a serem gravadas ao mesmo tempo, e retorna um número,
    indicando o total de erros encontrados ao salvar os agendamentos.
    Retorna 0 caso nenhum erro tenha sido encontrado.
    Retorna -1 caso ocorra um erro geral na gravação dos agendamentos (como permissão de gravação)
  */
  public static saveSchedule(sc: Schedule[]): Observable<number> {
    
    //Objeto que detecta se já existe um agendamento cadastrado com o mesmo nome do que será gravado
    let schedule_name: Schedule = null;
    
    //Define se o agendamento a ser cadastrado já possui um Id registrado, ou não
    let newId: boolean = false;
    
    //Contabiliza o total de erros gerados ao tentar salvar todas as consultas
    let errors: number = (sc.length == 0 ? null : 0);
    
    //Leitura do banco de dados atual do Agent
    return Files.readApplicationData().pipe(switchMap((_dbd: ClientData) => {
      
      //Itera por todos os agendamentos que devem ser gravados
      let validate: any = sc.map((sc2: Schedule) => {
      
        //Consulta das traduções
        let translations: any = TranslationService.getTranslations([
          new TranslationInput('SCHEDULES.MESSAGES.SAVE', [sc2.name]),
          new TranslationInput('SCHEDULES.MESSAGES.SAVE_OK', [sc2.name]),
          new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR', [sc2.name]),
          new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME', [sc2.name])
        ]);
        
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.SAVE'], null, null, null, null, null);
        
        //Validação do campo de Id do agendamento. Caso não preenchido, é gerado um novo Id
        newId = (sc2.id == null);
        if (newId) sc2.id = uuid();
        
        //Validação do campo de Id dos parâmetros de ETL. Caso não preenchido, é gerado um novo Id
        sc2.ETLParameters = sc2.ETLParameters.map((param: ETLParameterClient) => {
          if (param.id == null) param.id = uuid();
          
          //Remoção dos campos de suporte
          delete param.moduleName;
          delete param.TOTVSName;
          
          return param;
        });
        
        //Validação do campo de Id dos parâmetros de SQL. Caso não preenchido, é gerado um novo Id
        sc2.SQLParameters = sc2.SQLParameters.map((param: SQLParameterClient) => {
          if (param.id == null) param.id = uuid();
          
          //Remoção dos campos de suporte
          delete param.moduleName;
          delete param.TOTVSName;
          
          return param;
        });
        
        //Impede o cadastro de um agendamento com o mesmo nome
        schedule_name = _dbd.schedules.filter((schedule: Schedule) => (schedule.id != sc2.id)).find((schedule: Schedule) => (schedule.name == sc2.name));
        if (schedule_name != undefined) {
          errors = errors + 1;
          return { schedule: sc2, level: CNST_LOGLEVEL.ERROR, message: translations['SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME'] };
        } else {
          
          //Inclusão do agendamento no banco do Agent
          if (newId) {
            _dbd.schedules.push(sc2);
          } else {
            let index = _dbd.schedules.findIndex((schedule: Schedule) => { return schedule.id === sc2.id; });
            _dbd.schedules[index] = sc2;
          }
          return { schedule: sc2, level: CNST_LOGLEVEL.DEBUG, message: translations['SCHEDULES.MESSAGES.SAVE_OK'] };
        }
      });
      
      //Gravação do agendamento no banco do Agent
      return Files.writeApplicationData(_dbd).pipe(map((res: boolean) => {
        
        //Caso a gravação funcione, é gerado o log de sucesso / erro / avisos para todos os agendamentos considerados
        if (res) {
          validate.map((obj: any) => {
            Files.writeToLog(obj.level, CNST_SYSTEMLEVEL.ELEC, obj.message, null, null, null, null, null);
          });
          
          return errors;
        
        //Caso contrário, é gerada uma mensagem de erro para cada agendamento a ser gravado
        } else {
          validate.map((obj: any) => {
            
            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR', [obj.schedule.name]),
            ]);
            
            if (obj.level != CNST_LOGLEVEL.ERROR) Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.SAVE_ERROR'], null, null, null, null, null);
            else Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, obj.message, null, null, null, null, null);
          });
          
          return -1;
        }
      }));
    }), catchError((err: any) => {
      throw err;
    }));
  }
  
  /* Método de remoção dos agendamentos do Agent */
  public static deleteSchedule(sc: Schedule): Observable<boolean> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.DELETE', [sc.name]),
      new TranslationInput('SCHEDULES.MESSAGES.DELETE_ERROR', [sc.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.DELETE'], null, null, null, null, null);
    
    //Leitura do banco de dados atual do Agent, e remoção do agendamento cadastrado
    return Files.readApplicationData().pipe(switchMap((_dbd: ClientData) => {
      let index = _dbd.schedules.findIndex((schedule: Schedule) => { return schedule.id === sc.id; });
      _dbd.schedules.splice(index, 1);
      
      //Remoção das consultas cadastradas no agendamento
      _dbd.queries = _dbd.queries.filter((q: QueryClient) => {
        return (q.scheduleId != sc.id);
      });
      
      //Remoção das rotinas cadastradas no agendamento
      _dbd.scripts = _dbd.scripts.filter((s: ScriptClient) => {
        return (s.scheduleId != sc.id);
      });
      
      //Remoção do agendamento no banco do Agent
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.DELETE_ERROR'], null, null, err, null, null);
      throw err;
    }));
  }
  
  /* Método que prepara a execução de um agendamento do Agent pelo Java */
  public static prepareScheduleToExecute(s: Schedule): Observable<string> {
    
    //Consulta todas as informações necessárias para execução do agendamento pelo Java
    return forkJoin([
      WorkspaceService.getWorkspaces(false),
      DatabaseService.getDatabases(false),
      QueryService.getQueriesBySchedule(s, false),
      ScriptService.getScriptsBySchedule(s, false),
      ConfigurationService.getConfiguration(false)
    ]).pipe(map(((results: [Workspace[], Database[], QueryClient[], ScriptClient[], Configuration]) => {
      
      //Consulta das traduções
      let translations: any = TranslationService.getTranslations([
        new TranslationInput('SCHEDULES.MESSAGES.RUN_PREPARE', [s.name])
      ]);
      
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.RUN_PREPARE'], null, null, null, null, null);
      
      //Define o ambiente do agendamento
      let w: Workspace = results[0].find((w: Workspace) => (w.id === s.workspaceId));
      
      //Define o banco de dados do agendamento
      let db: Database = results[1].find((db: Database) => (db.id === w.databaseIdRef));
      
      //Define todas as consultas do agendamento, e descriptografa as mesmas
      let q: QueryClient[] = results[2];
      q.map((q: QueryClient) => {
        q.command = EncryptionService.decrypt(q.command);
      });
      
      //Define todas as rotinas do agendamento, e descriptografa as mesmas
      let scr: ScriptClient[] = results[3];
      scr.map((s: ScriptClient) => {
        s.command = EncryptionService.decrypt(s.command);
      });
      
      let conf: Configuration = results[4];
      conf.logPath = CNST_LOGS_PATH();
      
      //Descriptografia da senha do banco de dados no Agent, para posterior envio para o Java (caso exista)
      if (db) db.password = EncryptionService.decrypt(db.password);
      
      //Descriptografia da senha do usuário do GoodData, para posterior envio para o Java
      w.GDPassword = EncryptionService.decrypt(w.GDPassword);
      
      //Preparação do buffer de entrada para o Java
      let javaInput: JavaInputBuffer = {
        workspace: w,
        database: db,
        schedule: s,
        queries: q,
        scripts: scr,
        configuration: conf
      }
      
      //Criptografia do pacote a ser enviado
      let params = EncryptionService.encrypt(JSON.stringify(javaInput));
      return params;
    })));
  }
  
  /* Método de atualização da data/hora de última execução do agendamento */
  public static updateScheduleLastExecution(s: Schedule): Observable<number> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.RUN_EXECUTIONDATE', [s.lastExecution + '']),
      new TranslationInput('SCHEDULES.MESSAGES.RUN_ERROR', [s.name])
    ]);
    
    //Atualização da data / hora de última execução do agendamento
    return ConfigurationService.getConfiguration(false).pipe(switchMap((conf: Configuration) => {
      s.lastExecution = new Date();
      s.lastExecutionString = new Date(s.lastExecution).toLocaleString(conf.locale, {timeZone: conf.timezone});
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.RUN_EXECUTIONDATE'], null, null, null, null, null);
      return ScheduleService.saveSchedule([s]).pipe(map((res: number) => {
        return res;
      }), catchError((err: any) => {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.RUN_ERROR'], null, null, err, null, null);
        throw err;
      }));
    }));
  }
  
  /* Método de execução de um agendamento do Agent */
  public static executeAndUpdateScheduleLocally(inputBuffer: string, scheduleId: string): Observable<number> {
    return Execute.runAgent(inputBuffer, scheduleId).pipe(map((res: number) => {
      return res;
    }));
  }
}
