import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { Java } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { CNST_JAVA_MESSAGES } from './java-messages';

import { map, switchMap } from 'rxjs/operators';
import { Observable, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JavaService {
  private _http: HttpClient;
  
  constructor(
    private http: HttpClient,
    private _electronService: ElectronService,
    private _utilities: Utilities
  ) {
    this._http = http;
  }
  
  public getJavaConfigurations(): Observable<Java[]> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_JAVA_MESSAGES.JAVA_LOADING);
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getJavaConfigurations'));
    } else {
      return this._http.get<Java[]>(this._utilities.getLocalhostURL() + '/javas').pipe(
      map((javas: Java[]) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_JAVA_MESSAGES.JAVA_LOADING_OK);
        return javas;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_JAVA_MESSAGES.JAVA_LOADING_ERROR, err);
        throw err;
      }));
    }
  }
  
  public saveJavaConfiguration(j: Java): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_JAVA_MESSAGES.JAVA_SAVE(j.name));
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('saveJavaConfiguration', j));
    } else {
      if (j.id) {
        return this._http.put(this._utilities.getLocalhostURL() + '/javas/' + j.id, j).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_JAVA_MESSAGES.JAVA_SAVE_OK);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_JAVA_MESSAGES.JAVA_SAVE_ERROR(j.name), err);
          throw err;
        }));
      } else {
        return this.getJavaConfigurations().pipe(switchMap((java: Java[]) => {
          j.id = this._utilities.findNextId(java);
          return this._http.post(this._utilities.getLocalhostURL() + '/javas', j).pipe(
          map(() => {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_JAVA_MESSAGES.JAVA_SAVE_OK);
            return true;
          }), catchError((err: any) => {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_JAVA_MESSAGES.JAVA_SAVE_ERROR(j.name), err);
            throw err;
          }));
        }));
      }
    }
  }
  
  public deleteJavaConfiguration(j: Java): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_JAVA_MESSAGES.JAVA_DELETE(j.name));
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('deleteJavaConfiguration', j));
    } else {
      return this._http.delete(this._utilities.getLocalhostURL() + '/javas/' + j.id).pipe(
      map(() => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_JAVA_MESSAGES.JAVA_DELETE_OK);
        return true;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_JAVA_MESSAGES.JAVA_DELETE_ERROR(j.name), err);
        throw err;
      }));
    }
  }
}