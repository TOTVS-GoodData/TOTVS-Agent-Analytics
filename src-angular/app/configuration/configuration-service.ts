import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { Configuration } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { CNST_CONFIGURATION_MESSAGES } from './configuration-messages';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private _http: HttpClient;
  
  constructor(
    private http: HttpClient,
    private _electronService: ElectronService,
    private _utilities: Utilities
  ) {
    this._http = http;
  }
  
  public getConfiguration(): Observable<Configuration> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_CONFIGURATION_MESSAGES.CONFIG_LOADING);
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getConfiguration'));
    } else {
      return this._http.get<Configuration>(this._utilities.getLocalhostURL() + '/configuration').pipe(
      map((configuration: Configuration) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_CONFIGURATION_MESSAGES.CONFIG_LOADING_OK);
        this._utilities.debugMode = configuration.debug;
        return configuration;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_CONFIGURATION_MESSAGES.CONFIG_LOADING_ERROR, err);
        throw err;
      }));
    }
  }
  
  public saveConfiguration(conf: Configuration): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_CONFIGURATION_MESSAGES.CONFIG_SAVE);
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('saveConfiguration', conf));
    } else {
      return this._http.put(this._utilities.getLocalhostURL() + '/configuration', conf).pipe(
      map(() => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_CONFIGURATION_MESSAGES.CONFIG_SAVE_OK);
        this._utilities.debugMode = conf.debug;
        return true;
      }), catchError((err: any) => {
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, CNST_CONFIGURATION_MESSAGES.CONFIG_SAVE_ERROR, err);
        throw err;
      }));
    }
  }
}