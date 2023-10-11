/* Componentes padrões do Angular */
import { Injectable } from '@angular/core';

/* Serviço de comunicação com o Electron */
import { ElectronService } from 'ngx-electronyzer';

/* Componentes de utilitários do Agent */
import { Utilities } from '../../utilities/utilities';
import { CNST_LOGLEVEL } from '../../utilities/utilities-constants';

/* Serviço de tradução do Agent */
import { TranslationService } from '../translation/translation-service';
import { TranslationInput } from '../translation/translation-interface';

/* Interfaces de comunicação com o Agent-Server */
import {
  License,
  AvailableLicenses,
  QueryCommunication,
  ScriptCommunication,
  ETLParameterCommunication,
  SQLParameterCommunication
} from './server-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  
  /**************************/
  /*** MÉTODOS DO SERVIÇO ***/
  /**************************/
  constructor(
    private _electronService: ElectronService,
    private _utilities: Utilities,
    private _translateService: TranslationService
  ) {}
  
  /* Método de consulta das licenças válidas para este Agent */
  public getAvailableLicenses(showLogs: boolean): Observable<AvailableLicenses> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getAvailableLicenses', showLogs));
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_LICENSES_WARNING']);
      return of(null);
    }
  }
  
  /* Método de consulta das consultas padrões para esta licença do Agent */
  public getLatestQueries(license: License, database: string): Observable<QueryCommunication> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getLatestQueries', license, database));
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_SQL_PARAMETERS_WARNING']);
      return of(null);
    }
  }
  
  /* Método de consulta das rotinas padrões para esta licença do Agent */
  public getLatestScripts(license: License, database: string): Observable<ScriptCommunication> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getLatestScripts', license, database));
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_SQL_PARAMETERS_WARNING']);
      return of(null);
    }
  }
  
  /* Método de consulta dos parâmetros de ETL padrões para esta licença do Agent */
  public getLatestETLParameters(license: License): Observable<ETLParameterCommunication> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getLatestETLParameters', license));
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_ETL_PARAMETERS_WARNING']);
      return of(null);
    }
  }
  
  /* Método de consulta dos parâmetros de SQL padrões para esta licença do Agent */
  public getLatestSQLParameters(license: License, database: string): Observable<SQLParameterCommunication> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getLatestSQLParameters', license, database));
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_SQL_PARAMETERS_WARNING']);
      return of(null);
    }
  }
}
