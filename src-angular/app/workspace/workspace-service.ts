import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { DatabaseData, Workspace, Database, Schedule, Query, Configuration } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

import { map, switchMap } from 'rxjs/operators';
import { Observable, of, catchError, forkJoin } from 'rxjs';

import uuid from 'uuid-v4';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private _http: HttpClient;
  
  constructor(
    private http: HttpClient,
    private _electronService: ElectronService,
    private _translateService: TranslationService,
    private _utilities: Utilities
  ) {
    this._http = http;
  }
  
  public getWorkspaces(): Observable<Workspace[]> {
    return this._translateService.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.LOADING', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_ERROR', [])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['WORKSPACES.MESSAGES.LOADING']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('getWorkspaces'));
      } else {
        return this._http.get<Workspace[]>(this._utilities.getLocalhostURL() + '/workspaces').pipe(
        map((workspaces: Workspace[]) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['WORKSPACES.MESSAGES.LOADING_OK']);
          return workspaces;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['WORKSPACES.MESSAGES.LOADING_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
  
  public getWorkspacesByDatabase(db: Database): Observable<Workspace[]> {
    return this._translateService.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_DATABASES', [db.name]),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_DATABASES_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_DATABASES_ERROR', [])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['WORKSPACES.MESSAGES.LOADING_DATABASES']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('getWorkspacesByDatabase', db));
      } else {
        return this._http.get<Workspace[]>(this._utilities.getLocalhostURL() + '/workspaces?databaseIdRef=' + db.id).pipe(
        map((workspaces: Workspace[]) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['WORKSPACES.MESSAGES.LOADING_DATABASES_OK']);
          return workspaces;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['WORKSPACES.MESSAGES.LOADING_DATABASES_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
  
  public saveWorkspace(w: Workspace): Observable<boolean> {
    let workspace_name: Workspace = null;
    let newId: boolean = false;
    return forkJoin(
      this._translateService.getTranslations([
        new TranslationInput('WORKSPACES.MESSAGES.SAVE', [w.name]),
        new TranslationInput('WORKSPACES.MESSAGES.SAVE_OK', []),
        new TranslationInput('WORKSPACES.MESSAGES.SAVE_ERROR', [w.name]),
        new TranslationInput('WORKSPACES.MESSAGES.SAVE_ERROR_SAME_NAME', [w.name])
      ]), this.getWorkspaces())
    .pipe(switchMap((results: [TranslationInput[], Workspace[]]) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, results[0]['WORKSPACES.MESSAGES.SAVE']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('saveWorkspace', w));
      } else {
        newId = (w.id == null)
        if (newId) w.id = uuid();
        workspace_name = results[1].filter((workspace: Workspace) => (workspace.id != w.id)).find((workspace: Workspace) => (workspace.name == w.name));
        if (workspace_name != undefined) {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, results[0]['WORKSPACES.MESSAGES.SAVE_ERROR_SAME_NAME']);
          return of(false);
        } else {
          if (newId) {
            return this._http.post(this._utilities.getLocalhostURL() + '/workspaces', w).pipe(
            map(() => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, results[0]['WORKSPACES.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, results[0]['WORKSPACES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          } else {
            return this._http.put(this._utilities.getLocalhostURL() + '/workspaces/' + w.id, w).pipe(
            map(() => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, results[0]['WORKSPACES.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, results[0]['WORKSPACES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          }
        }
      }
    }));
  }
  
  public deleteWorkspace(w: Workspace): Observable<boolean> {
    return this._translateService.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.DELETE', [w.name]),
      new TranslationInput('WORKSPACES.MESSAGES.DELETE_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.DELETE_ERROR', [w.name])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['WORKSPACES.MESSAGES.DELETE']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('deleteWorkspace', w));
      } else {
        return this._http.delete(this._utilities.getLocalhostURL() + '/workspaces/' + w.id).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['WORKSPACES.MESSAGES.DELETE_OK']);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['WORKSPACES.MESSAGES.DELETE_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
}