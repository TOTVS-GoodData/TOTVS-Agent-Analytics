import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { Query, Workspace, Database, Schedule, ScheduleQuery, JavaInputBuffer } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

import { WorkspaceService } from '../workspace/workspace-service';
import { DatabaseService } from '../database/database-service';

import { map, switchMap } from 'rxjs/operators';
import { Observable, of, catchError, forkJoin, from } from 'rxjs';

import uuid from 'uuid-v4';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
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
  
  public getQueries(): Observable<Query[]> {
    return this._translateService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.LOADING', []),
      new TranslationInput('QUERIES.MESSAGES.LOADING_OK', []),
      new TranslationInput('QUERIES.MESSAGES.LOADING_ERROR', [])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.LOADING']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('getQueries'));
      } else {
        return this._http.get<Query[]>(this._utilities.getLocalhostURL() + '/queries').pipe(
        map((queries: Query[]) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.LOADING_OK']);
          return queries;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['QUERIES.MESSAGES.LOADING_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
  
  public getQueriesBySchedule(sc: Schedule): Observable<Query[]> {
    return this._translateService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING', [sc.name]),
      new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING_OK', []),
      new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING_ERROR', [])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.SCHEDULE_LOADING']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('getQueriesBySchedule', sc));
      } else {
        return this._http.get<Query[]>(this._utilities.getLocalhostURL() + '/queries?scheduleId=' + sc.id).pipe(
        map((queries: Query[]) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.SCHEDULE_LOADING_OK']);
          return queries;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['QUERIES.MESSAGES.SCHEDULE_LOADING_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
  
  public saveQuery(q: Query): Observable<boolean> {
    return this._translateService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.SAVE', [q.name]),
      new TranslationInput('QUERIES.MESSAGES.SAVE_OK', []),
      new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR', [q.name])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.SAVE']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('saveQuery', q));
      } else {
        if (q.id) {
          return this._http.put(this._utilities.getLocalhostURL() + '/queries/' + q.id, q).pipe(
          map(() => {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.SAVE_OK']);
            return true;
          }), catchError((err: any) => {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['QUERIES.MESSAGES.SAVE_ERROR'], err);
            throw err;
          }));
        } else {
          q.id = uuid();
          return this._http.post(this._utilities.getLocalhostURL() + '/queries', q).pipe(
          map(() => {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.SAVE_OK']);
            return true;
          }), catchError((err: any) => {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['QUERIES.MESSAGES.SAVE_ERROR'], err);
            throw err;
          }));
        }
      }
    }));
  }
  
  public deleteQuery(q: Query): Observable<boolean> {
    return this._translateService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.DELETE', [q.name]),
      new TranslationInput('QUERIES.MESSAGES.DELETE_OK', []),
      new TranslationInput('QUERIES.MESSAGES.DELETE_ERROR', [q.name])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.DELETE']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('deleteQuery', q));
      } else {
        return this._http.delete(this._utilities.getLocalhostURL() + '/queries/' + q.id).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.DELETE_OK']);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['QUERIES.MESSAGES.DELETE_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
  
  public exportQuery(sc: ScheduleQuery): Observable<boolean> {
    let queries: Query[] = [];
    let decrypt: boolean = false;
    let query_names: string[] = [];
    
    return this._translateService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.EXPORT', [])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.EXPORT']);
      query_names = sc.queries.map((q: Query) => q.name);
      return this.exportQueryFromRepository(sc).pipe(switchMap((queries: Query[]) => {
        if (queries.length > 0) {
          queries = queries.filter((q: Query) => (query_names.includes(q.name) ? false : true));
          return this.saveAllQueries(sc, queries).pipe(map((res: boolean) => {
            return res;
          }));
        } else {
          return this.exportQueryFromI01(sc, (_constants.CNST_MODALIDADE_CONTRATACAO.find((v: any) => (v.value == sc.contractType)).canDecrypt)).pipe(switchMap((queries: Query[]) => {
            queries = queries.filter((q: Query) => (query_names.includes(q.name) ? false : true));
            return this.saveAllQueries(sc, queries).pipe(map((res: boolean) => {
              return res;
            }));
          }));
        }
       }));
    }));
  }
  
  private saveAllQueries(sc: ScheduleQuery, queries: Query[]): Observable<boolean> {
    return this._translateService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.EXPORT_SAVE', [sc.schedule.name]),
      new TranslationInput('QUERIES.MESSAGES.EXPORT_SAVE_ERROR', [sc.schedule.name]),
      new TranslationInput('QUERIES.MESSAGES.EXPORT_OK', []),
      new TranslationInput('QUERIES.MESSAGES.EXPORT_WARNING', [sc.schedule.name])
    ]).pipe(switchMap((translations: any) => {
      if (queries.length > 0) {
        let obs_queries: Observable<boolean>[] = queries.map((query: any) => {
          let q: Query = new Query();
          q.scheduleId = sc.schedule.id;
          q.name = query.name;
          q.executionMode = query.executionMode;
          q.canDecrypt = _constants.CNST_MODALIDADE_CONTRATACAO.find((v: any) => { return v.value == sc.contractType }).canDecrypt;
          q.query = query.query;
          return this.saveQuery(q).pipe(map((res: boolean) => {
            return res;
          }));
        });
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.EXPORT_SAVE']);
        return forkJoin(obs_queries).pipe(map(() => {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, translations['QUERIES.MESSAGES.EXPORT_OK'], null);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['QUERIES.MESSAGES.EXPORT_SAVE_ERROR']);
          throw err;
        }));
      } else if (this._electronService.isElectronApp) {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, translations['QUERIES.MESSAGES.EXPORT_WARNING']);
        return of(false);
      } else {
        return of(false);
      }
    }));
  }
  
  public exportQueryFromRepository(sc: ScheduleQuery): Observable<Query[]> {
    return this._translateService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.EXPORT_STANDARD', [sc.schedule.name]),
      new TranslationInput('QUERIES.MESSAGES.EXPORT_STANDARD_OK', [sc.schedule.name]),
      new TranslationInput('QUERIES.MESSAGES.EXPORT_STANDARD_WARNING', [])
    ]).pipe(map((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.EXPORT_STANDARD']);
      let queries: any[] = _constants.CNST_ERP.find((erp: any) => erp.ERP == sc.erp).Queries[sc.databaseType]
        .filter((q: any) => (q.Modulos.includes(sc.module) || (q.Modulos.length == 0)));
      
      if (queries.length > 0) this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.EXPORT_STANDARD_OK']);
      else this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.EXPORT_STANDARD_WARNING']);
      
      return queries;
    }));
  }
  
  public exportQueryFromI01(sc: ScheduleQuery, decrypt: boolean): Observable<Query[]> {
    return this._translateService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.EXPORT_I01', []),
      new TranslationInput('QUERIES.MESSAGES.EXPORT_I01_PREPARE', []),
      new TranslationInput('QUERIES.MESSAGES.EXPORT_I01_ERROR_NOTPROTHEUS', []),
      new TranslationInput('QUERIES.MESSAGES.EXPORT_I01_WARNING', [sc.schedule.name])
    ]).pipe(switchMap((translations: any) => {
      if (this._electronService.isElectronApp) {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['EXPORT_I01'], null);
        return forkJoin([
          this._workspaceService.getWorkspaces(),
          this._databaseService.getDatabases()
        ]).pipe(map((results: [Workspace[], Database[]]) => {
          let queries: Query[] = null;
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['EXPORT_I01_PREPARE'], null);
          let exportWorkspace: Workspace = results[0].find((w: Workspace) => (w.id === sc.schedule.workspaceId));
          let exportDatabase: Database = results[1].find((db: Database) => (db.id === exportWorkspace.databaseIdRef));
          
          if (exportWorkspace.erp == _constants.CNST_ERP_PROTHEUS) {
            exportDatabase.password = this._electronService.ipcRenderer.sendSync('decrypt', exportDatabase.password);
            
            let javaInput: JavaInputBuffer = {
              workspace: null,
              database: exportDatabase,
              schedule: null,
              queries: null,
              scripts: null
            }
            
            let params = this._electronService.ipcRenderer.sendSync('encrypt', JSON.stringify(javaInput));
            let res = this._electronService.ipcRenderer.sendSync('exportQuery', params);
            queries = res.message.map((q: Query) => {
              q.scheduleId = sc.schedule.id;
              q.canDecrypt = decrypt;
              q.query = this._electronService.ipcRenderer.sendSync('encrypt', q.query);
              return q;
            });
          } else {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['EXPORT_I01_ERROR_NOTPROTHEUS'], null);
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['EXPORT_I01_ERROR_NOTPROTHEUS']);
            queries = [];
          }
          return queries;
        }));
      } else {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, translations['QUERIES.MESSAGES.EXPORT_I01_WARNING']);
        return of([]);
      }
    }));
  }
}