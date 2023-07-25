import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { Database, JavaInputBuffer } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

import { map, switchMap } from 'rxjs/operators';
import { Observable, of, catchError, forkJoin } from 'rxjs';

import uuid from 'uuid-v4';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private _http: HttpClient;
  
  constructor(
    private http: HttpClient,
    private _electronService: ElectronService,
    private _translateService: TranslationService,
    private _utilities: Utilities
  ) {
     this._http = http;
  }
  
  public getDatabases(): Observable<Database[]> {
    return this._translateService.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.LOADING', []),
      new TranslationInput('DATABASES.MESSAGES.LOADING_OK', []),
      new TranslationInput('DATABASES.MESSAGES.LOADING_ERROR', [])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['DATABASES.MESSAGES.LOADING']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('getDatabases'));
      } else {
        return this._http.get<Database[]>(this._utilities.getLocalhostURL() + '/databases').pipe(
        map((databases: Database[]) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['DATABASES.MESSAGES.LOADING_OK']);
          return databases;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.LOADING_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
  
  public saveDatabase(db: Database): Observable<boolean> {
    return forkJoin(
      this._translateService.getTranslations([
        new TranslationInput('DATABASES.MESSAGES.SAVE', [db.name]),
        new TranslationInput('DATABASES.MESSAGES.SAVE_OK', []),
        new TranslationInput('DATABASES.MESSAGES.SAVE_ERROR', [db.name]),
        new TranslationInput('DATABASES.MESSAGES.SAVE_ERROR_SAME_NAME', [db.name])
      ]),
      this.getDatabases())
    .pipe(switchMap((results: [TranslationInput[], Database[]]) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, results[0]['DATABASES.MESSAGES.SAVE']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('saveDatabase', db));
      } else {
        let db_name: Database = results[1].find((database: Database) => (database.name == db.name));
        if (db_name != undefined) {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, results[0]['DATABASES.MESSAGES.SAVE_ERROR_SAME_NAME']);
          return of(false);
        } else {
          if (db.id) {
            return this._http.put(this._utilities.getLocalhostURL() + '/databases/' + db.id, db).pipe(
            map(() => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, results[0]['DATABASES.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, results[0]['DATABASES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          } else {
            db.id = uuid();
            return this._http.post(this._utilities.getLocalhostURL() + '/databases', db).pipe(
            map(() => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, results[0]['DATABASES.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, results[0]['DATABASES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          }
        }
      }
    }));
  }
  
  public deleteDatabase(db: Database): Observable<boolean> {
    return this._translateService.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.DELETE', [db.name]),
      new TranslationInput('DATABASES.MESSAGES.DELETE_OK', []),
      new TranslationInput('DATABASES.MESSAGES.DELETE_ERROR', [db.name])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['DATABASES.MESSAGES.DELETE']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('deleteDatabase', db));
      } else {
        return this._http.delete(this._utilities.getLocalhostURL() + '/databases/' + db.id).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['DATABASES.MESSAGES.DELETE_OK']);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.DELETE_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
  
  public testConnection(decrypt: boolean, db: Database): Observable<boolean> {
    let password: string = null;
    let connectionResult: boolean = false;
    let testConnection = {
      success: null,
      err: null
    };
    
    return this._translateService.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.LOGIN', [db.name]),
      new TranslationInput('DATABASES.MESSAGES.LOGIN_OK', []),
      new TranslationInput('DATABASES.MESSAGES.LOGIN_ERROR', [db.name]),
      new TranslationInput('DATABASES.MESSAGES.LOGIN_WARNING', []),
    ]).pipe(switchMap((translations: any) => {
      if (this._electronService.isElectronApp) {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['DATABASES.MESSAGES.LOGIN']);
        if (decrypt) {
          db.password = this._electronService.ipcRenderer.sendSync('decrypt', db.password);
        }
        
        let javaInput: JavaInputBuffer = {
          workspace: null,
          database: db,
          schedule: null,
          queries: null,
          scripts: null
        }
        
        let params = this._electronService.ipcRenderer.sendSync('encrypt', JSON.stringify(javaInput));
        return this._electronService.ipcRenderer.invoke('testDatabaseConnection', params).then((testConnection: any) => {
          if (!testConnection.success) {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.LOGIN_ERROR'], testConnection.err);
          } else {
            connectionResult = true;
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, translations['DATABASES.MESSAGES.LOGIN_OK']);
          }
          return connectionResult;
        });
      } else {
        connectionResult = true;
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, translations['DATABASES.MESSAGES.LOGIN_WARNING']);
        return of(connectionResult);
      }
    }));
  }
}