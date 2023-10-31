/* Componentes padrões do Angular */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';

/* Serviço de banco de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';

/* Interfaces de agendamentos do Agent */
import { Schedule, ScheduleScript } from '../schedule/schedule-interface';

/* Interface de rotinas do Agent */
import { ScriptClient } from './script-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, of, catchError, map, switchMap, forkJoin } from 'rxjs';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  
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
    private _utilities: Utilities,
    private _translateService: TranslationService,
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService
  ) {
    this._http = http;
  }
  
  /* Método de consulta das consultas salvas do Agent */
  public getScripts(showLogs: boolean): Observable<ScriptClient[]> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getScripts', showLogs));
    } else {
      
      //Escrita de logs (caso solicitado)
      if (showLogs) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING']);
      
      //Consulta da API de testes do Angular
      return this._http.get<ScriptClient[]>(this._utilities.getLocalhostURL() + '/scripts').pipe(
      map((scripts: ScriptClient[]) => {
        
        //Escrita de logs (caso solicitado)
        if (showLogs) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING_OK']);
        
        return scripts;
      }), catchError((err: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING_ERROR'], err);
        throw err;
      }));
    }
  }
  
  /* Método de consulta das rotinas salvas específicas de um agendamento do Agent */
  public getScriptsBySchedule(sc: Schedule): Observable<ScriptClient[]> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getScriptsBySchedule', sc));
    } else {
      
      //Consulta das traduções
      return this._translateService.getTranslations([
        new TranslationInput('SCRIPTS.MESSAGES.SCHEDULE_LOADING', [sc.name]),
      ]).pipe(switchMap((translations: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.SCHEDULE_LOADING']);
        
        //Consulta da API de testes do Angular
        return this._http.get<ScriptClient[]>(this._utilities.getLocalhostURL() + '/scripts?scheduleId=' + sc.id).pipe(
        map((scripts: ScriptClient[]) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.SCHEDULE_LOADING_OK']);
          return scripts;
        }), catchError((err: any) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.SCHEDULE_LOADING_ERROR'], err);
          throw err;
        }));
      }));
    }
  }
  
  /* Método de gravação das consultas do Agent */
  public saveScript(s: ScriptClient[]): Observable<number> {
    
    //Objeto que detecta se já existe uma consulta cadastrada com o mesmo nome da que será gravada
    let script_name: ScriptClient = null;
    
    //Define se a consulta a ser cadastrada já possui um Id registrado, ou não
    let newId: boolean = false;
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('saveScript', s));
    } else {
      
      //Itera por todas as consultas que devem ser gravadas
      let obs_scripts: any[] = s.map((ss: ScriptClient) => {
        return new Observable<boolean>((subscriber: any) => {
          
          //Consulta das traduções
          return forkJoin(
            this._translateService.getTranslations([
              new TranslationInput('SCRIPTS.MESSAGES.SAVE', [ss.name]),
              new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR', [ss.name]),
              new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME', [ss.name])
            ]),
            this.getScripts(false))
          .subscribe((results: [TranslationInput[], ScriptClient[]]) => {
            this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, results[0]['SCRIPTS.MESSAGES.SAVE']);
            
            //Validação do campo de Id do banco de dados. Caso não preenchido, é gerado um novo Id
            newId = (ss.id == null);
            if (newId) ss.id = uuid();
            
            //Impede o cadastro de uma consulta com o mesmo nome
            script_name = results[1].filter((script: ScriptClient) => (script.id != ss.id)).find((script: ScriptClient) => ((script.name == ss.name) && (script.scheduleId == ss.scheduleId)));
            if (script_name != undefined) {
              this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME']);
              subscriber.next(false);
              subscriber.complete();
            } else {
              
              //Gravação pela API de testes do Angular
              if (newId) {
                return this._http.post(this._utilities.getLocalhostURL() + '/scripts', ss).subscribe(() => {
                  this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.SAVE_OK']);
                  subscriber.next(true);
                  subscriber.complete();
                }, catchError((err: any) => {
                  this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['SCRIPTS.MESSAGES.SAVE_ERROR'], err);
                  throw err;
                }));
              } else {
                return this._http.put(this._utilities.getLocalhostURL() + '/scripts/' + ss.id, ss).subscribe(() => {
                  this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, results[0]['SCRIPTS.MESSAGES.SAVE_OK']);
                  subscriber.next(true);
                  subscriber.complete();
                }, catchError((err: any) => {
                  this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['SCRIPTS.MESSAGES.SAVE_ERROR'], err);
                  throw err;
                }));
              }
            }
          });
        });
      });
      
      /*
        Executa cada um dos observáveis, para cada rotina a ser salva. 
        Contabiliza o número total de erros dos observáveis, e retorna o mesmo.
        Caso todos os observáveis falhem, retorna -1.
      */
      return forkJoin(obs_scripts).pipe(map((res: any) => {
        let errors: number = 0;
        res.map((res2: boolean) => {
          if (!res2) errors = errors + 1;
        });
        
        if (errors == obs_scripts.length) errors = -1;
        return errors;
      }));
    }
  }
  
  /* Método de remoção das consultas do Agent */
  public deleteScript(s: ScriptClient): Observable<boolean> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('deleteScript', s));
    } else {
      
      //Consulta das traduções
      return this._translateService.getTranslations([
        new TranslationInput('SCRIPTS.MESSAGES.DELETE', [s.name]),
        new TranslationInput('SCRIPTS.MESSAGES.DELETE_ERROR', [s.name])
      ]).pipe(switchMap((translations: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.DELETE']);
        
        //Remoção pela API de testes do Angular
        return this._http.delete(this._utilities.getLocalhostURL() + '/scripts/' + s.id).pipe(
        map(() => {
          this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.DELETE_OK']);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.DELETE_ERROR'], err);
          throw err;
        }));
      }));
    }
  }
}
