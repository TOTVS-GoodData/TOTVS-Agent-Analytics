/* Componentes padrões do Angular */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Serviço de consulta do acesso remoto (MirrorMode) */
import { MirrorService } from '../services/mirror-service';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Serviço de configuração do Agent */
import { ConfigurationService } from '../configuration/configuration-service';
import { Configuration } from '../configuration/configuration-interface';

/* Interface de comunicação com o Java */
import { JavaInputBuffer } from '../utilities/java-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, of, catchError, map, switchMap, forkJoin, from } from 'rxjs';

//Interface de bancos de dados do Agent
import { Database } from './database-interface';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  
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
    private _mirrorService: MirrorService,
    private _utilities: Utilities,
    private _translateService: TranslationService,
    private _configurationService: ConfigurationService
  ) {
    this._http = http;
  }
  
  /* Método de consulta dos bancos de dados salvos do Agent */
  public getDatabases(showLogs: boolean): Observable<Database[]> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('AC_getDatabases', showLogs));
    } else {
      
      //Escrita de logs (caso solicitado)
      if (showLogs) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.LOADING']);
      
      //Consulta da API de testes do Angular
      return this._http.get<Database[]>(this._utilities.getLocalhostURL() + '/databases').pipe(
      map((databases: Database[]) => {
        
        //Escrita de logs (caso solicitado)
        if (showLogs) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.LOADING_OK']);
        
        return databases;
      }), catchError((err: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.LOADING_ERROR'], err);
        throw err;
      }));
    }
  }
  
  /* Método de gravação dos bancos de dados do Agent */
  public saveDatabase(db: Database): Observable<boolean> {
    
    //Objeto que detecta se já existe um banco de dados cadastrado com o mesmo nome do que será gravado
    let db_name: Database = null;
    
    //Define se o banco a ser cadastrado já possui um Id registrado, ou não
    let newId: boolean = (db.id == null);
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('AC_saveDatabase', db));
    } else {
      
      //Consulta das traduções, e dos bancos de dados cadastrados atualmente
      return forkJoin(
        this._translateService.getTranslations([
          new TranslationInput('DATABASES.MESSAGES.SAVE', [db.name]),
          new TranslationInput('DATABASES.MESSAGES.SAVE_ERROR', [db.name]),
          new TranslationInput('DATABASES.MESSAGES.SAVE_ERROR_SAME_NAME', [db.name])
        ]),
        this.getDatabases(false)
      ).pipe(switchMap((results: [TranslationInput[], Database[]]) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, results[0]['DATABASES.MESSAGES.SAVE']);
        
        //Validação do campo de Id do banco de dados. Caso não preenchido, é gerado um novo Id
        if (newId) db.id = uuid();
        
        //Impede o cadastro de um banco de dados com o mesmo nome
        db_name = results[1].filter((database: Database) => (database.id != db.id)).find((database: Database) => (database.name == db.name));
        if (db_name != undefined) {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['DATABASES.MESSAGES.SAVE_ERROR_SAME_NAME']);
          return of(false);
        } else {
          
          //Gravação pela API de testes do Angular
          if (newId) {
            return this._http.post(this._utilities.getLocalhostURL() + '/databases', db).pipe(
            map(() => {
              this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['DATABASES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          } else {
            return this._http.put(this._utilities.getLocalhostURL() + '/databases/' + db.id, db).pipe(
            map(() => {
              this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['DATABASES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          }
        }
      }));
    }
  }
  
  /* Método de remoção dos bancos de dados do Agent */
  public deleteDatabase(db: Database): Observable<boolean> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('AC_deleteDatabase', db));
    } else {
      
      //Consulta das traduções
      return this._translateService.getTranslations([
        new TranslationInput('DATABASES.MESSAGES.DELETE', [db.name]),
        new TranslationInput('DATABASES.MESSAGES.DELETE_ERROR', [db.name])
      ]).pipe(switchMap((translations: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['DATABASES.MESSAGES.DELETE']);
        
        //Remoção pela API de testes do Angular
        return this._http.delete(this._utilities.getLocalhostURL() + '/databases/' + db.id).pipe(
        map(() => {
          this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.DELETE_OK']);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.DELETE_ERROR'], err);
          throw err;
        }));
      }));
    }
  }
  
  /* Método para teste de conexão ao banco de dados do Agent */
  public testConnection(db: Database, showMessage: boolean): Observable<number> {
    let password: string = null;
    
    //Consulta das traduções, e das informações necessárias para envio do pacote
    return forkJoin([
      this._translateService.getTranslations([
        new TranslationInput('DATABASES.MESSAGES.LOGIN', [db.name]),
        new TranslationInput('DATABASES.MESSAGES.LOGIN_ERROR', [db.name]),
      ]),
      this._configurationService.getConfiguration(false)
    ]).pipe(switchMap((results: [any, Configuration]) => {
      
      //Teste de conexão c/ banco de dados só pode ser feito pelo Electron
      if (this._electronService.isElectronApp) {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, results[0]['DATABASES.MESSAGES.LOGIN']);
        
        //Descriptografia da senha armazenada no Agent, para posterior envio para o Java
        if (db.id != null) db.password = this._electronService.ipcRenderer.sendSync('AC_decrypt', db.password);
        
        //Preparação do buffer de entrada para o Java
        let javaInput: JavaInputBuffer = {
          workspace: null,
          database: db,
          schedule: null,
          queries: null,
          scripts: null,
          configuration: results[1]
        }
        
        //Criptografia do pacote a ser enviado
        let params = this._electronService.ipcRenderer.sendSync('AC_encrypt', JSON.stringify(javaInput));

        //Envio da requisição para o Electron, e processamento da resposta
        if ((this._mirrorService.getMirrorMode() == 0) || (this._mirrorService.getMirrorMode() == 1)) {
          return from(this._electronService.ipcRenderer.invoke('AC_testDatabaseConnectionLocally', params)).pipe(switchMap((res: number) => {
            return this.printMessage(db, res, showMessage).pipe(map((res: number) => {
              return res;
            }));
          }));
        } else {
          return from(this._electronService.ipcRenderer.invoke('AC_testDatabaseConnectionRemotelly', params)).pipe(switchMap((res: number) => {
            return this.printMessage(db, res, showMessage).pipe(map((res: number) => {
              return res;
            }));
          }));
        }
      } else {
        return this.printMessage(db, -998, showMessage).pipe(map((res: number) => {
          return res;
        }));
      }
    }));
  }
  
  /* Método usado para mostrar a mensagem final ao usuário, após o teste de conexão ao banco ter sido concluído */
  private printMessage(db: Database, res: number, showMessage: boolean): Observable<number> {
    return this._translateService.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.LOGIN_ERROR', [db.name])
    ]).pipe(map((translations: any) => {
      if (res == 0) {
        if (showMessage) this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.LOGIN_OK']);
      } else if (res == 1) {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.LOGIN_ERROR']);
      } else if (res == -998) {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.LOGIN_WARNING']);
      } else if (res == -999) {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.CONNECTION_ERROR']);
      } else {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['ANGULAR.ERROR']);
      }
      
      return res;
    }));
  }
}
