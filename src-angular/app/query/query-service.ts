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

/* Interface de comunicação com o Java */
import { JavaInputBuffer } from '../utilities/java-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';
import { Workspace } from '../workspace/workspace-interface';
import { CNST_ERP, CNST_ERP_PROTHEUS, CNST_MODALIDADE_CONTRATACAO } from '../workspace/workspace-constants';

/* Serviço de banco de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';

//Interfaces de agendamentos do Agent
import { Schedule, ScheduleQuery } from '../schedule/schedule-interface';

//Interface de consultas do Agent
import { QueryClient, Version } from './query-interface';
import { CNST_QUERY_VERSION_STANDARD } from './query-constants';

/* Serviço de configuração do Agent */
import { ConfigurationService } from '../configuration/configuration-service';
import { Configuration } from '../configuration/configuration-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, of, catchError, map, switchMap, forkJoin, from } from 'rxjs';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  
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
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _configurationService: ConfigurationService
  ) {
     this._http = http;
  }
  
  /* Método de consulta das consultas salvas do Agent */
  public getQueries(showLogs: boolean): Observable<QueryClient[]> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getQueries', showLogs));
    } else {
      
      //Escrita de logs (caso solicitado)
      if (showLogs) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.LOADING']);
      
      //Consulta da API de testes do Angular
      return this._http.get<QueryClient[]>(this._utilities.getLocalhostURL() + '/queries').pipe(
      map((queries: QueryClient[]) => {
        
        //Escrita de logs (caso solicitado)
        if (showLogs) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.LOADING_OK']);
        
        return queries;
      }), catchError((err: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.LOADING_ERROR'], err);
        throw err;
      }));
    }
  }
  
  /* Método de consulta das consultas salvas específicas de um agendamento do Agent */
  public getQueriesBySchedule(sc: Schedule): Observable<QueryClient[]> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('getQueriesBySchedule', sc));
    } else {
        
      //Consulta das traduções
      return this._translateService.getTranslations([
        new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING', [sc.name])
      ]).pipe(switchMap((translations: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.SCHEDULE_LOADING']);
        
        //Consulta da API de testes do Angular
        return this._http.get<QueryClient[]>(this._utilities.getLocalhostURL() + '/queries?scheduleId=' + sc.id).pipe(
        map((queries: QueryClient[]) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.SCHEDULE_LOADING_OK']);
          return queries;
        }), catchError((err: any) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.SCHEDULE_LOADING_ERROR'], err);
          throw err;
        }));
      }));
    }
  }
  
  /* Método de gravação das consultas do Agent */
  public saveQuery(q: QueryClient): Observable<boolean> {
    
    //Objeto que detecta se já existe uma consulta cadastrada com o mesmo nome da que será gravada
    let query_name: QueryClient = null;
    
    //Define se a consulta a ser cadastrada já possui um Id registrado, ou não
    let newId: boolean = (q.id == null);
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('saveQuery', q));
    } else {
      
      //Consulta das traduções, e das consultas cadastradas atualmente
      return forkJoin(
        this._translateService.getTranslations([
          new TranslationInput('QUERIES.MESSAGES.SAVE', [q.name]),
          new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR', [q.name]),
          new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR_SAME_NAME', [q.name])
        ]),
        this.getQueries(false))
      .pipe(switchMap((results: [TranslationInput[], QueryClient[]]) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, results[0]['QUERIES.MESSAGES.SAVE']);
        
        //Validação do campo de Id do banco de dados. Caso não preenchido, é gerado um novo Id
        if (newId) q.id = uuid();
        
        //Impede o cadastro de uma consulta com o mesmo nome
        query_name = results[1].filter((query: QueryClient) => (query.id != q.id)).find((query: QueryClient) => (query.name == q.name));
        if (query_name != undefined) {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['QUERIES.MESSAGES.SAVE_ERROR_SAME_NAME']);
          return of(false);
        } else {
          
          //Remoção do campo de suporte
          delete q.executionModeName;
          
          //Gravação pela API de testes do Angular
          if (newId) {
            return this._http.post(this._utilities.getLocalhostURL() + '/queries', q).pipe(
            map(() => {
              this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['QUERIES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          } else {
            return this._http.put(this._utilities.getLocalhostURL() + '/queries/' + q.id, q).pipe(
            map(() => {
              this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.SAVE_OK']);
              return true;
            }), catchError((err: any) => {
              this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['QUERIES.MESSAGES.SAVE_ERROR'], err);
              throw err;
            }));
          }
        }
      }))
    }
  }
  
  /* Método de remoção das consultas do Agent */
  public deleteQuery(q: QueryClient): Observable<boolean> {
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('deleteQuery', q));
    } else {
      
      //Consulta das traduções
      return this._translateService.getTranslations([
        new TranslationInput('QUERIES.MESSAGES.DELETE', [q.name]),
        new TranslationInput('QUERIES.MESSAGES.DELETE_ERROR', [q.name])
      ]).pipe(switchMap((translations: any) => {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.DELETE']);
        
        //Remoção pela API de testes do Angular
        return this._http.delete(this._utilities.getLocalhostURL() + '/queries/' + q.id).pipe(
        map(() => {
          this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.DELETE_OK']);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, translations['QUERIES.MESSAGES.DELETE_ERROR'], err);
          throw err;
        }));
      }));
    }
  }
  
  /* Método de exportação das consultas padrões do Agent */
  public exportQuery(sc: ScheduleQuery): Observable<boolean> {
    //Variável de suporte, que armazena todas as consultas padrões do Agent
    let queries: QueryClient[] = [];
    
    //Variável de suporte, que armazena os nomes de todas as consultas atualmente cadastradas no agendamento selecionado
    let query_names: string[] = sc.queries.map((q: QueryClient) => q.name);
    
    this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT']);
    
    //Realiza a exportação das consultas padrões do repositório do Agent
    //Caso não encontre nada, procura na tabela I01 do Protheus (caso aplicável)
    return this.exportQueryFromRepository(sc).pipe(switchMap((queries: QueryClient[]) => {
      if (queries.length > 0) {
        
        //Impede a sobreescrita de uma consulta que já tenha sido exportada anteriormente
        queries = queries.filter((q: QueryClient) => (query_names.includes(q.name) ? false : true));
        
        return this.saveAllQueries(sc, queries).pipe(map((res: boolean) => {
          return res;
        }));
      } else {
        
        return this.exportQueryFromI01(sc, (CNST_MODALIDADE_CONTRATACAO.find((v: any) => (v.value == sc.contractType)).canDecrypt))
        .pipe(switchMap((queries: QueryClient[]) => {
          
          //Impede a sobreescrita de uma consulta que já tenha sido exportada anteriormente
          queries = queries.filter((q: QueryClient) => (query_names.includes(q.name) ? false : true));
          
          return this.saveAllQueries(sc, queries).pipe(map((res: boolean) => {
            return res;
          }));
        }), catchError((err: any) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT_ERROR'], err);
          throw err;
        }));
      }
     }));
  }
  
  /* Método de gravação de múltiplas consultas simultaneamente */
  private saveAllQueries(sc: ScheduleQuery, queries: QueryClient[]): Observable<boolean> {
    
    //Variável de suporte, que armazena todas as requisições de gravação das consultas
    let obs_queries: Observable<boolean>[] = [];
    
    //Consulta das traduções
    return this._translateService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.EXPORT_SAVE', [sc.schedule.name]),
      new TranslationInput('QUERIES.MESSAGES.EXPORT_SAVE_ERROR', [sc.schedule.name]),
      new TranslationInput('QUERIES.MESSAGES.EXPORT_WARNING', [sc.schedule.name])
    ]).pipe(switchMap((translations: any) => {
      
      //Verifica se existem consultas a serem salvas
      if (queries.length > 0) {
        
        //Prepara as requisições a serem disparadas
        obs_queries = queries.map((query: any) => {
          query.scheduleId = sc.schedule.id;
          query.canDecrypt = CNST_MODALIDADE_CONTRATACAO.find((v: any) => { return v.value == sc.contractType }).canDecrypt;
          
          return this.saveQuery(query).pipe(map((res: boolean) => {
            return res;
          }));
        });
        
        //Dispara todas as gravações de consultas, simultaneamente
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.EXPORT_SAVE']);        
        return forkJoin(obs_queries).pipe(map(() => {
          this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT_OK'], null);
          return true;
        }), catchError((err: any) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, translations['QUERIES.MESSAGES.EXPORT_SAVE_ERROR']);
          throw err;
        }));
        
      } else if (this._electronService.isElectronApp) {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, translations['QUERIES.MESSAGES.EXPORT_WARNING']);
        return of(false);
      } else {
        return of(false);
      }
    }));
  }
  
  /* Método de consulta das queries padrões do repositório do Agent */
  public exportQueryFromRepository(sc: ScheduleQuery): Observable<QueryClient[]> {
    
    //Consulta das traduções
    return this._translateService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.EXPORT_STANDARD', [sc.schedule.name]),
      new TranslationInput('QUERIES.MESSAGES.EXPORT_STANDARD_OK', [sc.schedule.name]),
    ]).pipe(map((translations: any) => {
      this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.EXPORT_STANDARD']);
      
      //Consulta todas as consultas válidas para o agendamento atual
      let obj_queries: any[] = CNST_ERP.find((erp: any) => erp.ERP == sc.erp).Queries[sc.databaseType]
        .filter((q: any) => (q.Modulos.includes(sc.module) || (q.Modulos.length == 0)));
      
      //Converte para a interface de Query do Agent
      let queries: QueryClient[] = obj_queries.map((obj: any) => {
        let q: QueryClient = new QueryClient(obj.version);
        q.id = obj.id;
        q.scheduleId = obj.scheduleId;
        q.name = obj.name;
        q.query = obj.query;
        q.executionMode = obj.executionMode;
        q.canDecrypt = obj.canDecrypt;
        
        return q;
      });
      
      //Filtra apenas as consultas mais recentes, pelo seu número de versão
      let queries_filtered: QueryClient[] = [];
      queries.map((q: QueryClient) => {
        let query: QueryClient = queries_filtered.find((q1: QueryClient) => (q1.name == q.name));
        let index: number = queries_filtered.findIndex((q1: QueryClient) => (q1.name == q.name));
        if (query == null) {
          queries_filtered.push(q);
        } else if (
          (
               (q.version.getMajorVersion() >  query.version.getMajorVersion())
          )
          ||
          (
               (q.version.getMajorVersion() == query.version.getMajorVersion())
            && (q.version.getMinorVersion() >  query.version.getMinorVersion())
          )
          ||
          (
               (q.version.getMajorVersion() == query.version.getMajorVersion())
            && (q.version.getMinorVersion() == query.version.getMinorVersion())
            && (q.version.getPatchVersion() >  query.version.getPatchVersion())
          )
        ) {
          queries_filtered[index] = q;
        }
        
        return;
      });
      
      if (queries_filtered.length > 0) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.EXPORT_STANDARD_OK']);
      else if (sc.erp == CNST_ERP_PROTHEUS) this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT_STANDARD_WARNING']);
      else this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT_STANDARD_WARNING']);
      
      return queries_filtered;
    }));
  }
  
  /* Método de consulta das queries padrões da tabela I01 do Protheus */
  public exportQueryFromI01(sc: ScheduleQuery, decrypt: boolean): Observable<QueryClient[]> {
    
    //Consultas exportadas da tabela I01 do Protheus
    let queries: QueryClient[] = [];
    
    //Consulta das traduções
    return this._translateService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.EXPORT_I01_WARNING', [sc.schedule.name])
    ]).pipe(switchMap((translations: any) => {
      
      //Consulta da tabela I01 só pode ser feita pelo Electron
      if (this._electronService.isElectronApp) {
        this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT_I01'], null);
        
        //Consulta as informações necessárias para acessar o banco de dados de destino
        return forkJoin([
          this._workspaceService.getWorkspaces(false),
          this._databaseService.getDatabases(false),
          this._configurationService.getConfiguration(false)
        ]).pipe(switchMap((results: [Workspace[], Database[], Configuration]) => {
          this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT_I01_PREPARE'], null);
          let exportWorkspace: Workspace = results[0].find((w: Workspace) => (w.id === sc.schedule.workspaceId));
          let exportDatabase: Database = results[1].find((db: Database) => (db.id === exportWorkspace.databaseIdRef));
          
          //Verifica se o ambiente do agendamento possui ERP Protheus
          if (exportWorkspace.license.source == CNST_ERP_PROTHEUS) {
            exportDatabase.password = this._electronService.ipcRenderer.sendSync('decrypt', exportDatabase.password);
            
            //Preparação do buffer de entrada para o Java
            let javaInput: JavaInputBuffer = {
              workspace: null,
              database: exportDatabase,
              schedule: null,
              queries: null,
              scripts: null,
              configuration: results[2]
            }
            
            //Criptografia do pacote a ser enviado
            let params = this._electronService.ipcRenderer.sendSync('encrypt', JSON.stringify(javaInput));
            
            //Envio da requisição para o Electron, e processamento da resposta
            return this._electronService.ipcRenderer.invoke('exportQuery', params).then((res: any) => {
              if (res.err) {console.log(res.err);
                throw res.err;
              } else {
                queries = res.message.map((q: QueryClient) => {
                  q.scheduleId = sc.schedule.id;
                  q.canDecrypt = decrypt;
                  q.version = new Version(CNST_QUERY_VERSION_STANDARD);
                  q.query = this._electronService.ipcRenderer.sendSync('encrypt', q.query);
                  return q;
                });
              }
                
              return queries;
            });
          } else {
            this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.EXPORT_I01_ERROR_NOTPROTHEUS'], null);
          }
          return of(queries);
        }));
      } else {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, translations['QUERIES.MESSAGES.EXPORT_I01_WARNING']);
        return of(queries);
      }
    }));
  }
}
