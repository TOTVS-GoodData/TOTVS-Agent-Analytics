/* Serviço de logs / arquivos do Agent */
import { Files } from '../files';

/* Serviço de execução do Java pelo Agent */
import { Execute } from '../execute';

/* Serviço de tradução do Electron */
import { TranslationService } from './translation-service';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../../src-angular/app/utilities/utilities-constants';
import { Functions } from '../functions';
import {
  CNST_LOGS_PATH,
  CNST_LOGS_FILENAME,
  CNST_LOGS_EXTENSION
} from '../constants-electron';

/* Interface do banco de dados do Agent */
import { DatabaseData } from '../electron-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from './workspace-service';
import { Workspace } from '../../src-angular/app/workspace/workspace-interface';

/* Serviço de bancos de dados do Agent */
import { DatabaseService } from './database-service';
import { Database } from '../../src-angular/app/database/database-interface';

/* Interface de agendamentos do Agent */
import { Schedule } from '../../src-angular/app/schedule/schedule-interface';

/* Serviço de consultas do Agent */
import { QueryService } from './query-service';
import { Query } from '../../src-angular/app/query/query-interface';

/* Serviço de rotinas do Agent */
import { ScriptService } from './script-service';
import { Script } from '../../src-angular/app/script/script-interface';

/* Serviço de configuração do Agent */
import { ConfigurationService } from './configuration-service';
import { Configuration } from '../../src-angular/app/configuration/configuration-interface';

/* Interface de comunicação com o Java */
import { JavaInputBuffer } from '../../src-angular/app/utilities/interface-java';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, switchMap, map, of, catchError, forkJoin } from 'rxjs';

export class ScheduleService {
  
  /*******************/
  /*  AGENDAMENTOS   */
  /*******************/
  /* Método de consulta dos agendamentos salvos do Agent */
  public static getSchedules(showLogs: boolean): Observable<Schedule[]> {
    
    //Escrita de logs (caso solicitado)
    if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno dos agendamentos cadastrados
    return Files.readApplicationData().pipe(map((db: DatabaseData) => {
      return db.schedules;
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de consulta dos agendamentos a serem executados pelo Agent */
  public static getSchedulesToExecute(): Observable<Schedule[]> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.TRIGGERSCHEDULES_LOADING', [Functions.formatDate(new Date())])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.TRIGGERSCHEDULES_LOADING'], null, null, null);
    
    //Consulta de todos os agendamentos cadastrados no Agent
    return ScheduleService.getSchedules(false).pipe(
      map((schedules: Schedule[]) => {
        schedules = schedules.filter((s: Schedule) => {
          
          //Define a data/hora atual
          let now: Date = new Date();
          
          //
          if (s.lastExecution == null) s.windows = s.windows.filter((w: string) => {
            let execute: boolean = false;
            
            let dateWindow = new Date();
            let hour: number = parseInt(w.substring(0, 2));
            let minute: number = parseInt(w.substring(3, 5));
            dateWindow.setHours(hour, minute, 0);
            if ((dateWindow <= now) && ((dateWindow > s.lastExecution) || (s.lastExecution == null))) {
              execute = true;
            }
            return execute;
          });
          
          return ((s.windows.length > 0) && (s.enabled));
        });
        
        //Retorna todos os agendamentos a serem executados
        if (schedules.length > 0) Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.TRIGGERSCHEDULES_LOADING_OK'], null, null, null);
        return schedules;
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.TRIGGERSCHEDULES_LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de gravação dos agendamentos do Agent */
  public static saveSchedule(sc: Schedule): Observable<boolean> {
    
    //Objeto que detecta se já existe um agendamento cadastrado com o mesmo nome do que será gravado
    let schedule_name: Schedule = null;
    
    //Define se o agendamento a ser cadastrado já possui um Id registrado, ou não
    let newId: boolean = (sc.id == null);
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.SAVE', [sc.name]),
      new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR', [sc.name]),
      new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME', [sc.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.SAVE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      
      //Validação do campo de Id do agendamento. Caso não preenchido, é gerado um novo Id
      if (newId) sc.id = uuid();
      
      //Impede o cadastro de um agendamento com o mesmo nome
      schedule_name = _dbd.schedules.filter((schedule: Schedule) => (schedule.id != sc.id)).find((schedule: Schedule) => (schedule.name == sc.name));
      if (schedule_name != undefined) {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME'], null, null, null);
        return of(false);
      } else {
        
        //Inclusão do agendamento no banco do Agent
        if (newId) {
          _dbd.schedules.push(sc);
        } else {
          let index = _dbd.schedules.findIndex((schedule: Schedule) => { return schedule.id === sc.id; });
          _dbd.schedules[index] = sc;
        }
      }
      
      //Gravação do agendamento no banco do Agent
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.SAVE_ERROR'], null, null, err);
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
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.DELETE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e remoção do agendamento cadastrado
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.schedules.findIndex((schedule: Schedule) => { return schedule.id === sc.id; });
      _dbd.schedules.splice(index, 1);
      
      //Remoção das consultas cadastradas no agendamento
      _dbd.queries = _dbd.queries.filter((q: Query) => {
        return (q.scheduleId != sc.id);
      });
      
      //Remoção das rotinas cadastradas no agendamento
      _dbd.scripts = _dbd.scripts.filter((s: Script) => {
        return (s.scheduleId != sc.id);
      });
      
      //Remoção do agendamento no banco do Agent
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.DELETE_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de execução de um agendamento do Agent */
  public static executeAndUpdateSchedule(s: Schedule): Observable<boolean> {
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.RUN_PREPARE'], null, null, null);
    
    //Consulta todas as informações necessárias para execução do agendamento pelo Java
    return forkJoin([
      WorkspaceService.getWorkspaces(),
      DatabaseService.getDatabases(),
      QueryService.getQueriesBySchedule(s),
      ScriptService.getScriptsBySchedule(s),
      ConfigurationService.getConfiguration(false)
    ]).pipe(switchMap(((results: [Workspace[], Database[], Query[], Script[], Configuration]) => {
      
      //Define o ambiente do agendamento
      let w: Workspace = results[0].find((w: Workspace) => (w.id === s.workspaceId));
      
      //Define o banco de dados do agendamento
      let db: Database = results[1].find((db: Database) => (db.id === w.databaseIdRef));
      
      //Define todas as consultas do agendamento, e descriptografa as mesmas
      let q: Query[] = results[2];
      q.map((q: Query) => {
        q.query = Functions.decrypt(q.query);
      });
      
      //Define todas as rotinas do agendamento, e descriptografa as mesmas
      let scr: Script[] = results[3];
      scr.map((s: Script) => {
        s.script = Functions.decrypt(s.script);
      });
      
      let conf: Configuration = results[4];
      conf.logPath = CNST_LOGS_PATH;
      
      //Descriptografia da senha do banco de dados no Agent, para posterior envio para o Java (caso exista)
      if (db) db.password = Functions.decrypt(db.password);
      
      //Descriptografia da senha do usuário do GoodData, para posterior envio para o Java
      w.GDPassword = Functions.decrypt(w.GDPassword);
      
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
      let params = Functions.encrypt(JSON.stringify(javaInput));
      
      //Solicita a execução do pacote criptografado ao Java, e atualiza os dados do agendamento imediatamente
      return Execute.runAgent(params, s.id).pipe(switchMap((b: boolean) => {
        
        //Consulta das traduções
        let translations2: any = TranslationService.getTranslations([
          new TranslationInput('SCHEDULES.MESSAGES.RUN_EXECUTIONDATE', [s.lastExecution + '']),
          new TranslationInput('SCHEDULES.MESSAGES.RUN_ERROR', [s.name])
        ]);
        
        //Atualiza a data de última execução do agendamento, e grava o mesmo no banco de dados do Agent
        s.lastExecution = new Date();
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations2['SCHEDULES.MESSAGES.RUN_EXECUTIONDATE'], null, null, null);
        return ScheduleService.saveSchedule(s).pipe(map((b: boolean) => {
          return b;
        }), catchError((err: any) => {
          Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations2['SCHEDULES.MESSAGES.RUN_ERROR'], null, null, err);
          throw err;
        }));
      }));
    })));
  }
}