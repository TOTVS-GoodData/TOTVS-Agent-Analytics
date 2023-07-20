import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { Schedule, Workspace, Database, Query, Script, JavaInputBuffer } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { WorkspaceService } from '../workspace/workspace-service';
import { DatabaseService } from '../database/database-service';
import { QueryService } from '../query/query-service';
import { ScriptService } from '../script/script-service';

import { CNST_SCHEDULE_MESSAGES } from './schedule-messages';

import { map, switchMap, filter } from 'rxjs/operators';
import { Observable, of, catchError, forkJoin, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private _http: HttpClient;
  
  constructor(
    private http: HttpClient,
    private _electronService: ElectronService,
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _queryService: QueryService,
    private _scriptService: ScriptService,
    private _utilities: Utilities
  ) {
    this._http = http;
  }
  
  public getSchedules(showLogs: boolean): Observable<Schedule[]> {
    if (showLogs) this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCHEDULE_MESSAGES.SCHEDULE_LOADING);
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getSchedules', showLogs));
    } else {
      return this._http.get<Schedule[]>(this._utilities.getLocalhostURL() + '/schedules').pipe(
      map((schedules: Schedule[]) => {
        if (showLogs) this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCHEDULE_MESSAGES.SCHEDULE_LOADING_OK);
        return schedules;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_SCHEDULE_MESSAGES.SCHEDULE_LOADING_ERROR, err);
        throw err;
      }));
    }
  }
  
  public saveSchedule(s: Schedule): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCHEDULE_MESSAGES.SCHEDULE_SAVE(s.name));
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('saveSchedule', s));
    } else {
      if (s.id) {
        return this._http.put(this._utilities.getLocalhostURL() + '/schedules/' + s.id, s).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCHEDULE_MESSAGES.SCHEDULE_SAVE_OK);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_SCHEDULE_MESSAGES.SCHEDULE_SAVE_ERROR(s.name), err);
          throw err;
        }));
      } else {
        return this._http.post(this._utilities.getLocalhostURL() + '/schedules', s).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCHEDULE_MESSAGES.SCHEDULE_SAVE_OK);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_SCHEDULE_MESSAGES.SCHEDULE_SAVE_ERROR(s.name), err);
          throw err;
        }));
      }
    }
  }
  
  public deleteSchedule(s: Schedule): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCHEDULE_MESSAGES.SCHEDULE_DELETE(s.name));
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('deleteSchedule', s));
    } else {
      return this._http.delete(this._utilities.getLocalhostURL() + '/schedules/' + s.id).pipe(
      map(() => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCHEDULE_MESSAGES.SCHEDULE_DELETE_OK);
        return true;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_SCHEDULE_MESSAGES.SCHEDULE_DELETE_ERROR(s.name), err);
        throw err;
      }));
    }
  }
}