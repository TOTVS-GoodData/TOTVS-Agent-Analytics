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

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

import { map, switchMap, filter } from 'rxjs/operators';
import { Observable, of, catchError, forkJoin, from } from 'rxjs';

import uuid from 'uuid-v4';

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
    private _translateService: TranslationService,
    private _queryService: QueryService,
    private _scriptService: ScriptService,
    private _utilities: Utilities
  ) {
    this._http = http;
  }
  
  public getSchedules(showLogs: boolean): Observable<Schedule[]> {
    return this._translateService.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.LOADING', []),
      new TranslationInput('SCHEDULES.MESSAGES.LOADING_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.LOADING_ERROR', [])
    ]).pipe(switchMap((translations: any) => {
      if (showLogs) this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCHEDULES.MESSAGES.LOADING']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('getSchedules', showLogs));
      } else {
        return this._http.get<Schedule[]>(this._utilities.getLocalhostURL() + '/schedules').pipe(
        map((schedules: Schedule[]) => {
          if (showLogs) this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCHEDULES.MESSAGES.LOADING_OK']);
          return schedules;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['SCHEDULES.MESSAGES.LOADING_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
  
  public saveSchedule(s: Schedule): Observable<boolean> {
    let schedule_name: Schedule = null;
    let newId: boolean = false;
    return forkJoin(
      this._translateService.getTranslations([
        new TranslationInput('SCHEDULES.MESSAGES.SAVE', [s.name]),
        new TranslationInput('SCHEDULES.MESSAGES.SAVE_OK', []),
        new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR', [s.name]),
        new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME', [s.name])
      ]), this.getSchedules(false))
    .pipe(switchMap((results: [TranslationInput[], Schedule[]]) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, results[0]['SCHEDULES.MESSAGES.SAVE']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('saveSchedule', s));
      } else {
        newId = (s.id == null);
        if (newId) s.id = uuid();
        schedule_name = results[1].filter((schedule: Schedule) => (schedule.id != s.id)).find((schedule: Schedule) => (schedule.name == s.name));
        if (schedule_name != undefined) {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, results[0]['SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME']);
          return of(false);
        } else {
          if (newId) {
            return this._http.post(this._utilities.getLocalhostURL() + '/schedules', s).pipe(
            map(() => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, results[0]['SCHEDULES.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, results[0]['SCHEDULES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          } else {
            return this._http.put(this._utilities.getLocalhostURL() + '/schedules/' + s.id, s).pipe(
            map(() => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, results[0]['SCHEDULES.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, results[0]['SCHEDULES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          }
        }
      }
    }));
  }
  
  public deleteSchedule(s: Schedule): Observable<boolean> {
    return this._translateService.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.DELETE', [s.name]),
      new TranslationInput('SCHEDULES.MESSAGES.DELETE_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.DELETE_ERROR', [s.name])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCHEDULES.MESSAGES.DELETE']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('deleteSchedule', s));
      } else {
        return this._http.delete(this._utilities.getLocalhostURL() + '/schedules/' + s.id).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCHEDULES.MESSAGES.DELETE_OK']);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['SCHEDULES.MESSAGES.DELETE_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
}