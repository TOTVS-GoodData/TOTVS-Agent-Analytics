import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { Configuration } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

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
    private _translateService: TranslationService,
    private _utilities: Utilities
  ) {
    this._http = http;
  }
  
  public getConfiguration(showLogs: boolean): Observable<Configuration> {
    return this._translateService.getTranslations([
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING', []),
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING_OK', []),
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING_ERROR', [])
    ]).pipe(switchMap((translations: any) => {
      if (showLogs) this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['CONFIGURATION.MESSAGES.LOADING']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('getConfiguration', showLogs));
      } else {
        return this._http.get<Configuration>(this._utilities.getLocalhostURL() + '/configuration').pipe(
        map((configuration: Configuration) => {
          if (showLogs) this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['CONFIGURATION.MESSAGES.LOADING_OK']);
          this._utilities.debugMode = configuration.debug;
          return configuration;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['CONFIGURATION.MESSAGES.LOADING_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
  
  public saveConfiguration(conf: Configuration): Observable<boolean> {
    return this._translateService.getTranslations([
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE_OK', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE_ERROR', [])
    ]).pipe(switchMap((translations: any) => {
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['CONFIGURATION.MESSAGES.SAVE']);
      if (this._electronService.isElectronApp) {
        return of(this._electronService.ipcRenderer.sendSync('saveConfiguration', conf));
      } else {
        return this._http.put(this._utilities.getLocalhostURL() + '/configuration', conf).pipe(
        map(() => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['CONFIGURATION.MESSAGES.SAVE_OK']);
          this._utilities.debugMode = conf.debug;
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.ERROR, translations['CONFIGURATION.MESSAGES.SAVE_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
}