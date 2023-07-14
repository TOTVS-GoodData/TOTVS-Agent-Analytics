import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { DatabaseData, Workspace, Database , Java, Schedule, Query, Configuration } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { CNST_WORKSPACE_MESSAGES } from './workspace-messages';

import { map, switchMap } from 'rxjs/operators';
import { Observable, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private _http: HttpClient;
  
  constructor(
    private http: HttpClient,
    private _electronService: ElectronService,
    private _utilities: Utilities
  ) {
    this._http = http;
  }
  
  public getWorkspaces(): Observable<Workspace[]> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING);
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getWorkspaces'));
    } else {
      return this._http.get<Workspace[]>(this._utilities.getLocalhostURL() + '/workspaces').pipe(
      map((workspaces: Workspace[]) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_OK);
        return workspaces;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_ERROR, err);
        throw err;
      }));
    }
  }
  
  public getWorkspacesByJavaConfiguration(j: Java): Observable<Workspace[]> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING);
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getWorkspacesByJavaConfiguration', j));
    } else {
      return this._http.get<Workspace[]>(this._utilities.getLocalhostURL() + '/workspaces?javaId=' + j.id).pipe(
      map((workspaces: Workspace[]) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_OK);
        return workspaces;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_ERROR, err);
        throw err;
      }));
    }
  }
  
  public getWorkspacesByDatabase(db: Database): Observable<Workspace[]> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_DATABASES(db.name));
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getWorkspacesByDatabase', db));
    } else {
      return this._http.get<Workspace[]>(this._utilities.getLocalhostURL() + '/workspaces?databaseId=' + db.id).pipe(
      map((workspaces: Workspace[]) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_DATABASES_OK);
        return workspaces;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_DATABASES_ERROR, err);
        throw err;
      }));
    }
  }
  
  public saveWorkspace(w: Workspace): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_WORKSPACE_MESSAGES.WORKSPACE_SAVE(w.name));
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('saveWorkspace', w));
    } else {
      if (w.id) {
        return this._http.put(this._utilities.getLocalhostURL() + '/workspaces/' + w.id, w).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_WORKSPACE_MESSAGES.WORKSPACE_SAVE_OK);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_WORKSPACE_MESSAGES.WORKSPACE_SAVE_ERROR(w.name), err);
          throw err;
        }));
      } else {
        return this._http.post(this._utilities.getLocalhostURL() + '/workspaces', w).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_WORKSPACE_MESSAGES.WORKSPACE_SAVE_OK);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_WORKSPACE_MESSAGES.WORKSPACE_SAVE_ERROR(w.name), err);
          throw err;
        }));
      }
    }
  }
  
  public deleteWorkspace(w: Workspace): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_WORKSPACE_MESSAGES.WORKSPACE_DELETE(w.name));
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('deleteWorkspace', w));
    } else {
      return this._http.delete(this._utilities.getLocalhostURL() + '/workspaces/' + w.id).pipe(
      map(() => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_WORKSPACE_MESSAGES.WORKSPACE_DELETE_OK);
        return true;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_WORKSPACE_MESSAGES.WORKSPACE_DELETE_ERROR(w.name), err);
        throw err;
      }));
    }
  }
}
