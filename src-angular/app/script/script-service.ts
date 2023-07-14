import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { Script, Database, Schedule, ScheduleScript, JavaInputBuffer } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { WorkspaceService } from '../workspace/workspace-service';
import { DatabaseService } from '../database/database-service';

import { CNST_SCRIPT_MESSAGES } from './script-messages';

import { map, switchMap } from 'rxjs/operators';
import { Observable, of, catchError, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  private _http: HttpClient;
  
  constructor(
    private http: HttpClient,
    private _electronService: ElectronService,
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _utilities: Utilities
  ) {
     this._http = http;
  }
  
  public getScripts(): Observable<Script[]> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_LOADING);
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getScripts'));
    } else {
      return this._http.get<Script[]>(this._utilities.getLocalhostURL() + '/scripts').pipe(
      map((scripts: Script[]) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_LOADING_OK);
        return scripts;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_SCRIPT_MESSAGES.SCRIPT_LOADING_ERROR, err);
        throw err;
      }));
    }
  }
  
  public getScriptsBySchedule(sc: Schedule): Observable<Script[]> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_SCHEDULE_LOADING(sc.name));
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getScriptsBySchedule', sc));
    } else {
      return this._http.get<Script[]>(this._utilities.getLocalhostURL() + '/scripts?scheduleId=' + sc.id).pipe(
      map((scripts: Script[]) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_SCHEDULE_LOADING_OK);
        return scripts;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_SCRIPT_MESSAGES.SCRIPT_SCHEDULE_LOADING_ERROR, err);
        throw err;
      }));
    }
  }
  
  public saveScript(s: Script): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_SAVE(s.name));
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('saveScript', s));
    } else {
      if (s.id) {
        return this._http.put(this._utilities.getLocalhostURL() + '/scripts/' + s.id, s).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_SAVE_OK);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_SCRIPT_MESSAGES.SCRIPT_SAVE_ERROR(s.name), err);
          throw err;
        }));
      } else {
        return this._http.post(this._utilities.getLocalhostURL() + '/scripts', s).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_SAVE_OK);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_SCRIPT_MESSAGES.SCRIPT_SAVE_ERROR(s.name), err);
          throw err;
        }));
      }
    }
  }
  
  public deleteScript(s: Script): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_DELETE(s.name));
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('deleteScript', s));
    } else {
      return this._http.delete(this._utilities.getLocalhostURL() + '/scripts/' + s.id).pipe(
      map(() => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_DELETE_OK);
        return true;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_SCRIPT_MESSAGES.SCRIPT_DELETE_ERROR(s.name), err);
        throw err;
      }));
    }
  }
  
  public exportScript(ss: ScheduleScript): Observable<boolean> {
    let scripts: Script[] = [];
    let decrypt: boolean = false;
    let script_names: string[] = [];
    
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_EXPORT);
    script_names = ss.scripts.map((s: Script) => s.name);
    scripts = this.exportScriptFromRepository(ss);
    scripts = scripts.filter((s: Script) => (script_names.includes(s.name) ? false : true));
    if (scripts.length > 0) {
      let obs_scripts: Observable<boolean>[] = scripts.map((script: any) => {
        let s: Script = new Script();
        s.scheduleId = ss.schedule.id;
        s.name = script.name;
        s.canDecrypt = (ss.contractType == _constants.CNST_MODALIDADE_CONTRATACAO_PLATAFORMA ? true : false);
        s.script = script.script;
        return this.saveScript(s);
      });
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_EXPORT_SAVE(ss.schedule.name));
      return forkJoin(obs_scripts).pipe(
      map(() => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, CNST_SCRIPT_MESSAGES.SCRIPT_EXPORT_OK, null);
        return true;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_SCRIPT_MESSAGES.SCRIPT_EXPORT_SAVE_ERROR(ss.schedule.name));
        throw err;
      }));
    } else if (this._electronService.isElectronApp) {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, CNST_SCRIPT_MESSAGES.SCRIPT_EXPORT_WARNING(ss.schedule.name));
      return of(false);
    } else {
      return of(false);
    }
  }
  
  public exportScriptFromRepository(ss: ScheduleScript): Script[] {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_EXPORT_STANDARD);
    let scrips: any[] = _constants.CNST_ERP.find((erp: any) => erp.ERP == ss.erp).Scripts[ss.databaseType]
      .filter((s: any) => (s.Modulos.includes(ss.module) || (s.Modulos.length == 0)));
    
    if (scrips.length > 0) this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_EXPORT_STANDARD_OK);
    else this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_EXPORT_STANDARD_WARNING);
    
    return scrips;
  }
}