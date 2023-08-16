import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { Script, Database, Schedule, ScheduleScript, JavaInputBuffer } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

import { WorkspaceService } from '../workspace/workspace-service';
import { DatabaseService } from '../database/database-service';

import { map, switchMap } from 'rxjs/operators';
import { Observable, of, catchError, forkJoin } from 'rxjs';

import uuid from 'uuid-v4';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  private _http: HttpClient;
  
  constructor(
    private http: HttpClient,
    private _electronService: ElectronService,
    private _translateService: TranslationService,
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _utilities: Utilities
  ) {
     this._http = http;
  }
  
  public getScripts(): Observable<Script[]> {
    return this._translateService.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.LOADING', []),
      new TranslationInput('SCRIPTS.MESSAGES.LOADING_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.LOADING_ERROR', [])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.LOADING']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('getScripts'));
      } else {
        return this._http.get<Script[]>(this._utilities.getLocalhostURL() + '/scripts').pipe(
        map((scripts: Script[]) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.LOADING_OK']);
          return scripts;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.LOADING_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
  
  public getScriptsBySchedule(sc: Schedule): Observable<Script[]> {
    return this._translateService.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.SCHEDULE_LOADING', [sc.name]),
      new TranslationInput('SCRIPTS.MESSAGES.SCHEDULE_LOADING_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.SCHEDULE_LOADING_ERROR', [sc.name])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.SCHEDULE_LOADING']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('getScriptsBySchedule', sc));
      } else {
        return this._http.get<Script[]>(this._utilities.getLocalhostURL() + '/scripts?scheduleId=' + sc.id).pipe(
        map((scripts: Script[]) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.SCHEDULE_LOADING_OK']);
          return scripts;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.SCHEDULE_LOADING_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
  
  public saveScript(s: Script): Observable<boolean> {
    let script_name: Script = null;
    let newId: boolean = false;
    return forkJoin(
      this._translateService.getTranslations([
        new TranslationInput('SCRIPTS.MESSAGES.SAVE', [s.name]),
        new TranslationInput('SCRIPTS.MESSAGES.SAVE_OK', []),
        new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR', [s.name]),
        new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME', [s.name])
      ]), this.getScripts())
    .pipe(switchMap((results: [TranslationInput[], Script[]]) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, results[0]['SCRIPTS.MESSAGES.SAVE']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('saveScript', s));
      } else {
        newId = (s.id == null);
        if (newId) s.id = uuid();
        script_name = results[1].filter((script: Script) => (script.id != s.id)).find((script: Script) => (script.name == s.name));
        if (script_name != undefined) {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, results[0]['SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME']);
          return of(false);
        } else {
          if (s.id) {
            return this._http.post(this._utilities.getLocalhostURL() + '/scripts', s).pipe(
            map(() => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, results[0]['SCRIPTS.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, results[0]['SCRIPTS.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          } else {
            return this._http.put(this._utilities.getLocalhostURL() + '/scripts/' + s.id, s).pipe(
            map(() => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, results[0]['SCRIPTS.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, results[0]['SCRIPTS.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          }
        }
      }
    }));
  }
  
  public deleteScript(s: Script): Observable<boolean> {
    return this._translateService.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.DELETE', [s.name]),
      new TranslationInput('SCRIPTS.MESSAGES.DELETE_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.DELETE_ERROR', [s.name])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.DELETE']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('deleteScript', s));
      } else {
        return this._http.delete(this._utilities.getLocalhostURL() + '/scripts/' + s.id).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.DELETE_OK']);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.DELETE_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
  
  public exportScript(ss: ScheduleScript): Observable<boolean> {
    let scripts: Script[] = [];
    let decrypt: boolean = false;
    let script_names: string[] = [];
    
    return this._translateService.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT', []),
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT_SAVE', [ss.schedule.name]),
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT_SAVE_ERROR', [ss.schedule.name]),
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT_WARNING', [ss.schedule.name])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.EXPORT']);
      script_names = ss.scripts.map((s: Script) => s.name);
      return this.exportScriptFromRepository(ss).pipe(switchMap((scripts: Script[]) => {
        scripts = scripts.filter((s: Script) => (script_names.includes(s.name) ? false : true));
        if (scripts.length > 0) {
          let obs_scripts: Observable<boolean>[] = scripts.map((script: any) => {
            let s: Script = new Script();
            s.scheduleId = ss.schedule.id;
            s.name = script.name;
            s.canDecrypt = _constants.CNST_MODALIDADE_CONTRATACAO.find((v: any) => (v.value == ss.contractType)).canDecrypt;
            s.script = script.script;
            return this.saveScript(s).pipe(map((res: boolean) => {
              return res;
            }));
          });
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.EXPORT_SAVE']);
          return forkJoin(obs_scripts).pipe(
          map(() => {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, translations['SCRIPTS.MESSAGES.EXPORT_OK'], null);
            return true;
          }), catchError((err: any) => {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.EXPORT_SAVE_ERROR']);
            throw err;
          }));
        } else if (this._electronService.isElectronApp) {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, translations['SCRIPTS.MESSAGES.EXPORT_WARNING']);
          return of(false);
        } else {
          return of(false);
        }
      }));
    }));
  }
  
  public exportScriptFromRepository(ss: ScheduleScript): Observable<Script[]> {
    return this._translateService.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT_STANDARD', []),
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT_STANDARD_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT_STANDARD_WARNING', [])
    ]).pipe(map((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.EXPORT_STANDARD']);
      let scrips: any[] = _constants.CNST_ERP.find((erp: any) => erp.ERP == ss.erp).Scripts[ss.databaseType]
        .filter((s: any) => (s.Modulos.includes(ss.module) || (s.Modulos.length == 0)));
      
      if (scrips.length > 0) this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.EXPORT_STANDARD_OK']);
      else this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.EXPORT_STANDARD_WARNING']);
      
      return scrips;
    }));
  }
}