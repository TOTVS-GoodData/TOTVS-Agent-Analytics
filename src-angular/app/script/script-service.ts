/* Componentes padrões do Angular */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/* Serviço de comunicação com o Electron */
import { ElectronService } from 'ngx-electronyzer';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';
import * as _constants from '../utilities/constants-angular';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';
import { CNST_ERP, CNST_MODALIDADE_CONTRATACAO } from '../workspace/workspace-constants';

/* Serviço de banco de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';

//Interfaces de agendamentos do Agent
import { Schedule, ScheduleScript } from '../schedule/schedule-interface';

//Interface de rotinas do Agent
import { Script } from './script-interface';
import { CNST_QUERY_VERSION_STANDARD } from '../query/query-constants';

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
  public getScripts(showLogs: boolean): Observable<Script[]> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getScripts', showLogs));
    } else {
      
      //Escrita de logs (caso solicitado)
      if (showLogs) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING']);
      
      //Consulta da API de testes do Angular
      return this._http.get<Script[]>(this._utilities.getLocalhostURL() + '/scripts').pipe(
      map((scripts: Script[]) => {
        
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
  public getScriptsBySchedule(sc: Schedule): Observable<Script[]> {
    
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
        return this._http.get<Script[]>(this._utilities.getLocalhostURL() + '/scripts?scheduleId=' + sc.id).pipe(
        map((scripts: Script[]) => {
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
  public saveScript(s: Script): Observable<boolean> {
    
    //Objeto que detecta se já existe uma consulta cadastrada com o mesmo nome da que será gravada
    let script_name: Script = null;
    
    //Define se a consulta a ser cadastrada já possui um Id registrado, ou não
    let newId: boolean = (s.id == null);
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('saveScript', s));
    } else {
      
      //Consulta das traduções
      return forkJoin(
        this._translateService.getTranslations([
          new TranslationInput('SCRIPTS.MESSAGES.SAVE', [s.name]),
          new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR', [s.name]),
          new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME', [s.name])
        ]),
        this.getScripts(false))
      .pipe(switchMap((results: [TranslationInput[], Script[]]) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, results[0]['SCRIPTS.MESSAGES.SAVE']);
        
        //Validação do campo de Id do banco de dados. Caso não preenchido, é gerado um novo Id
        if (newId) s.id = uuid();
        
        //Impede o cadastro de uma consulta com o mesmo nome
        script_name = results[1].filter((script: Script) => (script.id != s.id)).find((script: Script) => (script.name == s.name));
        if (script_name != undefined) {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME']);
          return of(false);
        } else {
          
          //Gravação pela API de testes do Angular
          if (newId) {
            return this._http.post(this._utilities.getLocalhostURL() + '/scripts', s).pipe(
            map(() => {
              this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['SCRIPTS.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          } else {
            return this._http.put(this._utilities.getLocalhostURL() + '/scripts/' + s.id, s).pipe(
            map(() => {
              this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, results[0]['SCRIPTS.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['SCRIPTS.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          }
        }
      }));
    }
  }
  
  /* Método de remoção das consultas do Agent */
  public deleteScript(s: Script): Observable<boolean> {
    
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
  
  /* Método de exportação das rotinas padrões do Agent */
  public exportScript(ss: ScheduleScript): Observable<boolean> {
    
    //Variável de suporte, que armazena todas as rotinas padrões do Agent
    let scripts: Script[] = [];
    
    //Variável de suporte, que armazena os nomes de todas as rotinas atualmente cadastradas no agendamento selecionado
    let script_names: string[] = ss.scripts.map((s: Script) => s.name);
    
    //Variável de suporte, que armazena todas as requisições de gravação das rotinas
    let obs_scripts: Observable<boolean>[] = [];
    
    this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.EXPORT']);
    
    //Realiza a exportação das rotinas padrões do repositório do Agent
    return this._translateService.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT_SAVE', [ss.schedule.name]),
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT_SAVE_ERROR', [ss.schedule.name]),
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT_WARNING', [ss.schedule.name])
    ]).pipe(switchMap((translations: any) => {
      
      //Consulta todas as rotinas padrões existentes para este agendamento
      scripts = this.exportScriptFromRepository(ss);
      
      //Verifica se existem rotinas a serem salvas
      if (scripts.length > 0) {
        
        //Impede a sobreescrita de uma rotina que já tenha sido exportada anteriormente
        scripts = scripts.filter((s: Script) => (script_names.includes(s.name) ? false : true));
        
        //Verifica se ainda existem rotinas a serem salvas
        if (scripts.length > 0) {
          //Prepara as requisições a serem disparadas
          obs_scripts = scripts.map((script: any) => {
            let s: Script = new Script(CNST_QUERY_VERSION_STANDARD);
            s.scheduleId = ss.schedule.id;
            s.name = script.name;
            s.canDecrypt = CNST_MODALIDADE_CONTRATACAO.find((v: any) => (v.value == ss.contractType)).canDecrypt;
            s.script = script.script;
            return this.saveScript(s).pipe(map((res: boolean) => {
              return res;
            }));
          });
          
          //Dispara todas as gravações de rotinas, simultaneamente
          this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.EXPORT_SAVE']);
          return forkJoin(obs_scripts).pipe(
          map(() => {
            this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.EXPORT_OK'], null);
            return true;
          }), catchError((err: any) => {
            this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.EXPORT_SAVE_ERROR']);
            throw err;
          }));
        } else {
          this._utilities.createNotification(CNST_LOGLEVEL.WARN, translations['SCRIPTS.MESSAGES.EXPORT_WARNING'], null);
          return of(true);
        }
      } else {
        return of(false);
      }
    }));
  }
  
  /* Método de consulta das rotinas padrões do repositório do Agent */
  public exportScriptFromRepository(ss: ScheduleScript): Script[] {
    this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.EXPORT_STANDARD']);
    let obj_scripts: Script[] = CNST_ERP.find((erp: any) => erp.ERP == ss.erp).Scripts[ss.databaseType]
      .filter((s: any) => (s.Modulos.includes(ss.module) || (s.Modulos.length == 0)));
    
    //Converte para a interface de Query do Agent
    let scripts: Script[] = obj_scripts.map((obj: any) => {
      let s: Script = new Script(obj.version);
      s.id = obj.id;
      s.scheduleId = obj.scheduleId;
      s.name = obj.name;
      s.script = obj.script;
      s.canDecrypt = obj.canDecrypt;
      
      return s;
    });
    
    if (scripts.length > 0) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.EXPORT_STANDARD_OK']);
    else this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.EXPORT_STANDARD_WARNING']);
    
    return scripts;
  }
}