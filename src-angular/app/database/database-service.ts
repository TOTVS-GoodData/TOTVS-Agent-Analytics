import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { Database, JavaInputBuffer } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { CNST_DATABASE_MESSAGES } from './database-messages';

import { map, switchMap } from 'rxjs/operators';
import { Observable, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private _http: HttpClient;
  
  constructor(
    private http: HttpClient,
    private _electronService: ElectronService,
    private _utilities: Utilities
  ) {
     this._http = http;
  }
  
  public getDatabases(): Observable<Database[]> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_DATABASE_MESSAGES.DATABASE_LOADING);
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getDatabases'));
    } else {
      return this._http.get<Database[]>(this._utilities.getLocalhostURL() + '/databases').pipe(
      map((databases: Database[]) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_DATABASE_MESSAGES.DATABASE_LOADING_OK);
        return databases;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_DATABASE_MESSAGES.DATABASE_LOADING_ERROR, err);
        throw err;
      }));
    }
  }
  
  public saveDatabase(db: Database): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_DATABASE_MESSAGES.DATABASE_SAVE(db.name));
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('saveDatabase', db));
    } else {
      if (db.id) {
        return this._http.put(this._utilities.getLocalhostURL() + '/databases/' + db.id, db).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_DATABASE_MESSAGES.DATABASE_SAVE_OK);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_DATABASE_MESSAGES.DATABASE_SAVE_ERROR(db.name), err);
          throw err;
        }));
      } else {
        return this.getDatabases().pipe(switchMap((database: Database[]) => {
          db.id = this._utilities.findNextId(database);
          return this._http.post(this._utilities.getLocalhostURL() + '/databases', db).pipe(
          map(() => {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_DATABASE_MESSAGES.DATABASE_SAVE_OK);
            return true;
          }), catchError((err: any) => {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_DATABASE_MESSAGES.DATABASE_SAVE_ERROR(db.name), err);
            throw err;
          }));
        }));
      }
    }
  }
  
  public deleteDatabase(db: Database): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_DATABASE_MESSAGES.DATABASE_DELETE(db.name));
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('deleteDatabase', db));
    } else {
      return this._http.delete(this._utilities.getLocalhostURL() + '/databases/' + db.id).pipe(
      map(() => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_DATABASE_MESSAGES.DATABASE_DELETE_OK);
        return true;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_DATABASE_MESSAGES.DATABASE_DELETE_ERROR(db.name), err);
        throw err;
      }));
    }
  }
  
  public testConnection(decrypt: boolean, db: Database): boolean {
    let password: string = null;
    let testConnection = {
      success: null,
      err: null
    };
    if (this._electronService.isElectronApp) {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_DATABASE_MESSAGES.DATABASE_LOGIN(db.name));
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
      testConnection = this._electronService.ipcRenderer.sendSync('testDatabaseConnection', params);
      
      if (!testConnection.success) {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_DATABASE_MESSAGES.DATABASE_LOGIN_ERROR(db.name), testConnection.err);
      } else {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, CNST_DATABASE_MESSAGES.DATABASE_LOGIN_OK);
      }
    } else {
      testConnection.success = true;
      testConnection.err = null;
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, CNST_DATABASE_MESSAGES.DATABASE_LOGIN_WARNING);
    }
    
    return testConnection.success;
  }
}