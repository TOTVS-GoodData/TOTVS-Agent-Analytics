/* Componentes padrões do Angular */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';

/* Interface de configuração do Agent */
import { Configuration } from './configuration-interface';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Serviço compartilhado de comunicação com o menu principal do Agent */
import { MenuService } from '../services/menu-service';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, map, switchMap, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Comunicação http com a API de testes (Angular).
  private _http: HttpClient;
  
  /**************************/
  /*** MÉTODOS DO SERVIÇO ***/
  /**************************/
  constructor(
    private http: HttpClient,
    private _electronService: ElectronService,
    private _utilities: Utilities,
    private _translateService: TranslationService,
    private _menuService: MenuService
  ) {
    this._http = http;
  }
  
  /* Método de consulta das configuraçãoes salvas do Agent */
  public getConfiguration(showLogs: boolean): Observable<Configuration> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('AC_getConfiguration', showLogs));
    } else {
      
      //Escrita de logs (caso solicitado)
      if (showLogs) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING']);
      
      //Consulta da API de testes do Angular
      return this._http.get<Configuration>(this._utilities.getLocalhostURL() + '/configuration').pipe(
      map((configuration: Configuration) => {
        
        //Escrita de logs (caso solicitado)
        if (showLogs) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING_OK']);
        
        this._utilities.debugMode = configuration.debug;
        return configuration;
      }), catchError((err: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING_ERROR'], err);
        throw err;
      }));
    }
  }
  
  /* Método de gravação das configurações do Agent */
  public saveConfiguration(conf: Configuration): Observable<number> {
    
    //Vai entender essa maluquice do compilador, sei la
    return this._translateService.getTranslations([
      new TranslationInput('SERVICES.SERVER.MESSAGES.LOADING_LICENSES', [])
    ]).pipe(switchMap((translations: any) => {
      
      //Redirecionamento da requisição p/ Electron (caso disponível)
      if (this._electronService.isElectronApp) {
        return this._electronService.ipcRenderer.invoke('AC_saveConfiguration', conf).then((b: number) => {
          if (b == 1) {
            this._translateService.use(conf.locale).subscribe((b: boolean) => {
              this._menuService.updateMenu();
            });
            return 1;
          } else return b;
        });
      } else {
        
        //Consulta da API de testes do Angular
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE']);
        return this._http.put(this._utilities.getLocalhostURL() + '/configuration', conf).pipe(
        switchMap(() => {
          this._translateService.use(conf.locale);
          return this._translateService.updateStandardTranslations().pipe(map((b: boolean) => {
            this._menuService.updateMenu();
            this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE_OK']);
            this._utilities.debugMode = conf.debug;
            return 1;
          }));
        }), catchError((err: any) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE_ERROR'], err);
          throw err;
        }));
      }
    }));
  }
}
