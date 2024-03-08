/* Componentes padrões do Angular */
import { Injectable } from '@angular/core';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../../core/services';

/* Componentes de utilitários do Agent */
import { Utilities } from '../../utilities/utilities';
import { CNST_LOGLEVEL } from '../../utilities/utilities-constants';

/* Constante da modalidade de contratação "Plataforma" */
import { CNST_MODALIDADE_CONTRATACAO_PLATAFORMA } from '../../workspace/workspace-constants';

/* Interface de banco de dados do Agent */
import { Database } from '../../database/database-interface';

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
import { Observable, of, switchMap } from 'rxjs';

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
    
    //Vai entender essa maluquice do compilador, sei la
    return this._translateService.getTranslations([
      new TranslationInput('SERVICES.SERVER.MESSAGES.LOADING_LICENSES', [])
    ]).pipe(switchMap((translations: any) => {
      
      //Redirecionamento da requisição p/ Electron (caso disponível)
      if (this._electronService.isElectronApp) {
        return this._electronService.ipcRenderer.invoke('AC_getAvailableLicenses', showLogs).then((res: AvailableLicenses) => {
          return res;
          });
      } else {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.COMMUNICATION_WARNING']);
        return of(new AvailableLicenses(CNST_MODALIDADE_CONTRATACAO_PLATAFORMA, 'T12345', []));
      }
    }));
  }
  
  /* Método de consulta das consultas padrões para esta licença do Agent */
  public saveLatestQueries(license: License, database: Database, scheduleId: string): Observable<number> {
    
    //Vai entender essa maluquice do compilador, sei la
    return this._translateService.getTranslations([
      new TranslationInput('SERVICES.SERVER.MESSAGES.LOADING_LICENSES', [])
    ]).pipe(switchMap((translations: any) => {
      
      //Redirecionamento da requisição p/ Electron (caso disponível)
      if (this._electronService.isElectronApp) {
        return this._electronService.ipcRenderer.invoke('AC_saveLatestQueries', license, database, scheduleId).then((res: number) => {
          return res;
        });
      } else {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.COMMUNICATION_WARNING']);
        return of(-1);
      }
    }));
  }
  
  /* Método de consulta das rotinas padrões para esta licença do Agent */
  public saveLatestScripts(license: License, brand: string, scheduleId: string): Observable<number> {
    
    //Vai entender essa maluquice do compilador, sei la
    return this._translateService.getTranslations([
      new TranslationInput('SERVICES.SERVER.MESSAGES.LOADING_LICENSES', [])
    ]).pipe(switchMap((translations: any) => {
      
      //Redirecionamento da requisição p/ Electron (caso disponível)
      if (this._electronService.isElectronApp) {
        return this._electronService.ipcRenderer.invoke('AC_saveLatestScripts', license, brand, scheduleId).then((res: number) => {
          return res;
        });
      } else {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.COMMUNICATION_WARNING']);
        return of(-1);
      }
    }));
  }
  
  /* Método de consulta dos parâmetros de ETL padrões para esta licença do Agent */
  public getLatestETLParameters(license: License): Observable<ETLParameterCommunication> {

    //Vai entender essa maluquice do compilador, sei la
    return this._translateService.getTranslations([
      new TranslationInput('SERVICES.SERVER.MESSAGES.LOADING_LICENSES', [])
    ]).pipe(switchMap((translations: any) => {
      
      //Redirecionamento da requisição p/ Electron (caso disponível)
      if (this._electronService.isElectronApp) {
        return this._electronService.ipcRenderer.invoke('AC_getLatestETLParameters', license).then((res: ETLParameterCommunication) => {
          return res;
        });
      } else {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.COMMUNICATION_WARNING']);
        return of(null);
      }
    }));
  }
  
  /* Método de consulta dos parâmetros de SQL padrões para esta licença do Agent */
  public getLatestSQLParameters(license: License, brand: string): Observable<SQLParameterCommunication> {
    
    //Vai entender essa maluquice do compilador, sei la
    return this._translateService.getTranslations([
      new TranslationInput('SERVICES.SERVER.MESSAGES.LOADING_LICENSES', [])
    ]).pipe(switchMap((translations: any) => {
      
      //Redirecionamento da requisição p/ Electron (caso disponível)
      if (this._electronService.isElectronApp) {
        return this._electronService.ipcRenderer.invoke('AC_getLatestSQLParameters', license, brand).then((res: SQLParameterCommunication) => {
          return res;
        });
      } else {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.COMMUNICATION_WARNING']);
        return of(null);
      }
    }));
  }
  
  /* Método de consulta das janelas de execução disponíveis para este Agent */
  public getAvailableExecutionWindows(): Observable<string[]> {
    
    //Vai entender essa maluquice do compilador, sei la
    return this._translateService.getTranslations([
      new TranslationInput('SERVICES.SERVER.MESSAGES.LOADING_EXECUTION_WINDOWS', [])
    ]).pipe(switchMap((translations: any) => {
      
      //Redirecionamento da requisição p/ Electron (caso disponível)
      if (this._electronService.isElectronApp) {
        return this._electronService.ipcRenderer.invoke('AC_getAvailableExecutionWindows').then((res: string[]) => {
          return res;
        });
      } else {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.COMMUNICATION_WARNING']);
        return of(null);
      }
    }));
  }
}
