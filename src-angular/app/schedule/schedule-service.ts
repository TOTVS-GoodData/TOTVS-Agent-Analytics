/* Componentes padrões do Angular */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Serviço de consulta do acesso remoto (MirrorMode) */
import { MirrorService } from '../services/mirror-service';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';
import { Workspace } from '../workspace/workspace-interface';

/* Serviço de banco de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';

/* Interfaces de agendamentos do Agent */
import {
  Schedule,
  ETLParameterClient,
  SQLParameterClient
} from './schedule-interface';

/* Serviço de consultas do Agent */
import { QueryService } from '../query/query-service';
import { QueryClient } from '../query/query-interface';

/* Serviço de rotinas do Agent */
import { ScriptService } from '../script/script-service';
import { ScriptClient } from '../script/script-interface';

/* Serviço de rotinas do Agent */
import { ConfigurationService } from '../configuration/configuration-service';
import { Configuration } from '../configuration/configuration-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, of, catchError, map, switchMap, forkJoin, from } from 'rxjs';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Comunicação http com a API de testes (Angular).
  private _http: HttpClient;
  
  /**************************/
  /*** MÉTODOS DO SERVIÇO ***/
  /**************************/
  constructor(
    private http: HttpClient,
    private _electronService: ElectronService,
    private _mirrorService: MirrorService,
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _configurationService: ConfigurationService,
    private _translateService: TranslationService,
    private _queryService: QueryService,
    private _scriptService: ScriptService,
    private _utilities: Utilities
  ) {
    this._http = http;
  }
  
  /* Método de consulta dos agendamentos salvos do Agent */
  public getSchedules(showLogs: boolean): Observable<Schedule[]> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('AC_getSchedules', showLogs));
    } else {
      
      //Escrita de logs (caso solicitado)
      if (showLogs) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING']);
      
      //Consulta da API de testes do Angular
      return this._http.get<Schedule[]>(this._utilities.getLocalhostURL() + '/schedules').pipe(
      switchMap((schedules: Schedule[]) => {
        
        //Converte a data de execução de cada agendamento, para o fuso horário configurado no Agent.
        return this._configurationService.getConfiguration(false).pipe(map((conf: Configuration) => {
          schedules = schedules.map((s: Schedule) => {
            if (s.lastExecution != undefined) s.lastExecutionString = s.lastExecution.toLocaleString(conf.locale, { timeZone: conf.timezone });
            return s;
          });
          
          //Escrita de logs (caso solicitado)
          if (showLogs) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING_OK']);
          
          return schedules;
        }), catchError((err: any) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING_ERROR'], err);
          throw err;
        }));
      }), catchError((err: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING_ERROR'], err);
        throw err;
      }));
    }
  }
  
  /* Método de gravação dos agendamentos do Agent */
  public saveSchedule(s: Schedule): Observable<number> {
    
    //Objeto que detecta se já existe um agendamento cadastrado com o mesmo nome do que será gravado
    let schedule_name: Schedule = null;
    
    //Define se o agendamento a ser cadastrado já possui um Id registrado, ou não
    let newId: boolean = (s.id == null);
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('AC_saveSchedule', [s]));
    } else {
      
      //Consulta das traduções, e dos agendamentos cadastrados atualmente
      return forkJoin(
        this._translateService.getTranslations([
          new TranslationInput('SCHEDULES.MESSAGES.SAVE', [s.name]),
          new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR', [s.name]),
          new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME', [s.name])
        ]),
        this.getSchedules(false))
      .pipe(switchMap((results: [TranslationInput[], Schedule[]]) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, results[0]['SCHEDULES.MESSAGES.SAVE']);
      
        //Validação do campo de Id do agendamento. Caso não preenchido, é gerado um novo Id
        if (newId) s.id = uuid();
        
        //Validação do campo de Id dos parâmetros de ETL. Caso não preenchido, é gerado um novo Id
        s.ETLParameters = s.ETLParameters.map((param: ETLParameterClient) => {
          if (param.id == null) param.id = uuid();
          return param;
        });
        
        //Validação do campo de Id dos parâmetros de SQL. Caso não preenchido, é gerado um novo Id
        s.SQLParameters = s.SQLParameters.map((param: SQLParameterClient) => {
          if (param.id == null) param.id = uuid();
          return param;
        });
        
        //Impede o cadastro de um agendamento com o mesmo nome
        schedule_name = results[1].filter((schedule: Schedule) => (schedule.id != s.id)).find((schedule: Schedule) => (schedule.name == s.name));
        if (schedule_name != undefined) {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME']);
          return of(0);
        } else {
          
          //Gravação pela API de testes do Angular
          if (newId) {
            return this._http.post(this._utilities.getLocalhostURL() + '/schedules', s).pipe(
            map(() => {
              this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.SAVE_OK']);
              return 0;
            }), catchError((err: any) => {
              this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['SCHEDULES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          } else {
            return this._http.put(this._utilities.getLocalhostURL() + '/schedules/' + s.id, s).pipe(
            map(() => {
              this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.SAVE_OK']);
              return 0;
            }), catchError((err: any) => {
              this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['SCHEDULES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          }
        }
      }));
    }
  }
  
  /* Método de remoção dos agendamentos do Agent */
  public deleteSchedule(s: Schedule): Observable<boolean> {
  
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('AC_deleteSchedule', s));
    } else {
      
      //Consulta das traduções
      return this._translateService.getTranslations([
        new TranslationInput('SCHEDULES.MESSAGES.DELETE', [s.name]),
        new TranslationInput('SCHEDULES.MESSAGES.DELETE_ERROR', [s.name])
      ]).pipe(switchMap((translations: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['SCHEDULES.MESSAGES.DELETE']);
        
        //Remoção pela API de testes do Angular
        return this._http.delete(this._utilities.getLocalhostURL() + '/schedules/' + s.id).pipe(
        map(() => {
          this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['SCHEDULES.MESSAGES.DELETE_OK']);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, translations['SCHEDULES.MESSAGES.DELETE_ERROR'], err);
          throw err;
        }));
      }));
    }
  }
  
  /* Método para execução imediata de um agendamento */
  public runSchedule(s: Schedule): Observable<number> {
    if (this._electronService.isElectronApp) {
      
      //Consulta das traduções
      return this._translateService.getTranslations([
        new TranslationInput('SCHEDULES.MESSAGES.RUN_MANUAL', [s.name])
      ]).pipe(switchMap((translations: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.INFO, translations['SCHEDULES.MESSAGES.RUN_MANUAL']);
        
        //Solicita a execução do agendamento pelo Electron (assíncrono)
        let res: number = null;
        if (this._mirrorService.getMirrorMode() != 2) {
          return from(this._electronService.ipcRenderer.invoke('AC_executeAndUpdateScheduleLocally', s)).pipe(switchMap((res: number) => {
            return this.printMessage(s, res).pipe(map((res: number) => {
              return res;
            }));
          }));
        } else {
          return from(this._electronService.ipcRenderer.invoke('AC_executeAndUpdateScheduleRemotelly', s)).pipe(switchMap((res: number) => {
            return this.printMessage(s, res).pipe(map((res: number) => {
              return res;
            }));
          }));
        }
      }));
    } else {
      return this.printMessage(s, -998).pipe(map((res: number) => {
        return res;
      }));
    }
  }
  
  /* Método usado para mostrar a mensagem final ao usuário, após a execução do agendamento ter sido concluída */
  private printMessage(s: Schedule, res: number): Observable<number> {
    return this._translateService.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.SCHEDULE_ALREADY_EXECUTING', [s.name]),
      new TranslationInput('SCHEDULES.MESSAGES.VALIDATION_ERROR', [s.fileFolder])
    ]).pipe(map((translations: any) => {
      if (res == 0) {
        this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.RUN_OK']);
      } else if (res == -1) {
        this._utilities.writeToLog(CNST_LOGLEVEL.WARN, translations['SCHEDULES.MESSAGES.SCHEDULE_ALREADY_EXECUTING']);
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, translations['SCHEDULES.MESSAGES.SCHEDULE_ALREADY_EXECUTING']);
      } else if (res == -2) {
        this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, translations['SCHEDULES.MESSAGES.VALIDATION_ERROR']);
      } else if (res == -998) {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.RUN_WARNING']);
      } else if (res == -999) {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.CONNECTION_ERROR']);
      } else {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['ANGULAR.ERROR']);
      }
      
      return res;
    }));
  }
}
