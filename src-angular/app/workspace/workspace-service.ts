/* Componentes padrões do Angular */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/* Serviço de comunicação com o Electron */
import { ElectronService } from 'ngx-electronyzer';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Interface de ambientes do Agent */
import { Workspace } from '../workspace/workspace-interface';

/* Interface de bancos de dados do Agent */
import { Database } from '../database/database-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, of, catchError, map, switchMap, forkJoin } from 'rxjs';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  
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
    private _translateService: TranslationService
  ) {
    this._http = http;
  }
  
  /* Método de consulta dos ambientes salvos do Agent */
  public getWorkspaces(): Observable<Workspace[]> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getWorkspaces'));
    } else {
      
      //Consulta da API de testes do Angular
      this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING']);
      return this._http.get<Workspace[]>(this._utilities.getLocalhostURL() + '/workspaces').pipe(
      map((workspaces: Workspace[]) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_OK']);
        return workspaces;
      }), catchError((err: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_ERROR'], err);
        throw err;
      }));
    }
  }
  
  /* Método de consulta dos ambientes pertencentes a um banco de dados do Agent */
  public getWorkspacesByDatabase(db: Database): Observable<Workspace[]> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getWorkspacesByDatabase', db));
    } else {
      
      //Consulta das traduções
      return this._translateService.getTranslations([
        new TranslationInput('WORKSPACES.MESSAGES.LOADING_DATABASES', [db.name])
      ]).pipe(switchMap((translations: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['WORKSPACES.MESSAGES.LOADING_DATABASES']);
        
        //Consulta da API de testes do Angular
        return this._http.get<Workspace[]>(this._utilities.getLocalhostURL() + '/workspaces?databaseIdRef=' + db.id).pipe(
        map((workspaces: Workspace[]) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_DATABASES_OK']);
          return workspaces;
        }), catchError((err: any) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_DATABASES_ERROR'], err);
          throw err;
        }));
      }));
    }
  }
  
  /* Método de gravação dos ambientes do Agent */
  public saveWorkspace(w: Workspace): Observable<boolean> {
    
    //Objeto que detecta se já existe um banco de dados cadastrado com o mesmo nome do que será gravado
    let workspace_name: Workspace = null;
    
    //Define se o banco a ser cadastrado já possui um Id registrado, ou não
    let newId: boolean = (w.id == null);
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('saveWorkspace', w));
    } else {
      
      //Consulta das traduções, e dos ambientes cadastrados atualmente
      return forkJoin(
        this._translateService.getTranslations([
          new TranslationInput('WORKSPACES.MESSAGES.SAVE', [w.name]),
          new TranslationInput('WORKSPACES.MESSAGES.SAVE_ERROR', [w.name]),
          new TranslationInput('WORKSPACES.MESSAGES.SAVE_ERROR_SAME_NAME', [w.name])
        ]),
        this.getWorkspaces()
      ).pipe(switchMap((results: [TranslationInput[], Workspace[]]) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, results[0]['WORKSPACES.MESSAGES.SAVE']);
        
        //Validação do campo de Id do ambiente. Caso não preenchido, é gerado um novo Id
        if (newId) w.id = uuid();
        
        //Impede o cadastro de um ambiente com o mesmo nome
        workspace_name = results[1].filter((workspace: Workspace) => (workspace.id != w.id)).find((workspace: Workspace) => (workspace.name == w.name));
        if (workspace_name != undefined) {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['WORKSPACES.MESSAGES.SAVE_ERROR_SAME_NAME']);
          return of(false);
        } else {
          
          //Gravação pela API de testes do Angular
          if (newId) {
            return this._http.post(this._utilities.getLocalhostURL() + '/workspaces', w).pipe(
            map(() => {
              this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['WORKSPACES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          } else {
            return this._http.put(this._utilities.getLocalhostURL() + '/workspaces/' + w.id, w).pipe(
            map(() => {
              this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['WORKSPACES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          }
        }
      }));
    }
  }
  
  /* Método de remoção dos ambientes do Agent */
  public deleteWorkspace(w: Workspace): Observable<boolean> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('deleteWorkspace', w));
    } else {
    
      //Consulta das traduções
      return this._translateService.getTranslations([
        new TranslationInput('WORKSPACES.MESSAGES.DELETE', [w.name]),
        new TranslationInput('WORKSPACES.MESSAGES.DELETE_ERROR', [w.name])
      ]).pipe(switchMap((translations: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['WORKSPACES.MESSAGES.DELETE']);
        
        //Remoção pela API de testes do Angular
        return this._http.delete(this._utilities.getLocalhostURL() + '/workspaces/' + w.id).pipe(
        map(() => {
          this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.DELETE_OK']);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, translations['WORKSPACES.MESSAGES.DELETE_ERROR'], err);
          throw err;
        }));
      }));
    }
  }
}