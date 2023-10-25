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

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';

/* Serviço de banco de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';

/* Interfaces de agendamentos do Agent */
import { Schedule, ScheduleQuery } from '../schedule/schedule-interface';

/* Interface de consultas do Agent */
import { QueryClient } from './query-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, of, catchError, map, switchMap, forkJoin } from 'rxjs';

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
    private _databaseService: DatabaseService
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
  public saveQuery(q: QueryClient[]): Observable<number> {
    
    //Objeto que detecta se já existe uma consulta cadastrada com o mesmo nome da que será gravada
    let query_name: QueryClient = null;
    
    //Define se a consulta a ser cadastrada já possui um Id registrado, ou não
    let newId: boolean = false;
    
    //Redirecionamento da requisição p/ Electron (caso disponível)
    if (this._electronService.isElectronApp) {
      return of(this._electronService.ipcRenderer.sendSync('saveQuery', q));
    } else {
       
      //Itera por todas as consultas que devem ser gravadas
      let obs_queries: any[] = q.map((qq: QueryClient) => {
        return new Observable<boolean>((subscriber: any) => {
          
          //Consulta das traduções, e das consultas cadastradas atualmente
          return forkJoin(
            this._translateService.getTranslations([
              new TranslationInput('QUERIES.MESSAGES.SAVE', [qq.name]),
              new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR', [qq.name]),
              new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR_SAME_NAME', [qq.name])
            ]),
            this.getQueries(false))
          .subscribe((results: [TranslationInput[], QueryClient[]]) => {
            this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, results[0]['QUERIES.MESSAGES.SAVE']);
            
            //Validação do campo de Id do banco de dados. Caso não preenchido, é gerado um novo Id
            newId = (qq.id == null);
            if (newId) qq.id = uuid();
            
            //Impede o cadastro de uma consulta com o mesmo nome
            query_name = results[1].filter((query: QueryClient) => (query.id != qq.id)).find((query: QueryClient) => ((query.name == qq.name) && (query.scheduleId == qq.scheduleId)));
            if (query_name != undefined) {
              this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['QUERIES.MESSAGES.SAVE_ERROR_SAME_NAME']);
              subscriber.next(false);
              subscriber.complete();
            } else {
              
              //Remoção do campo de suporte
              delete qq.executionModeName;
              
              //Gravação pela API de testes do Angular
              if (newId) {
                return this._http.post(this._utilities.getLocalhostURL() + '/queries', qq).subscribe(() => {
                  this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.SAVE_OK']);
                  subscriber.next(true);
                  subscriber.complete();
                }, catchError((err: any) => {
                  this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['QUERIES.MESSAGES.SAVE_ERROR'], err);
                  throw err;
                }));
              } else {
                return this._http.put(this._utilities.getLocalhostURL() + '/queries/' + qq.id, qq).subscribe(() => {
                  this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.SAVE_OK']);
                  subscriber.next(true);
                  subscriber.complete();
                }, catchError((err: any) => {
                  this._utilities.writeToLog(CNST_LOGLEVEL.ERROR, results[0]['QUERIES.MESSAGES.SAVE_ERROR'], err);
                  throw err;
                }));
              }
            }
          });
        });
      });
      
      /*
        Executa cada um dos observáveis, para cada consulta a ser salva. 
        Contabiliza o número total de erros dos observáveis, e retorna o mesmo.
        Caso todos os observáveis falhem, retorna -1.
      */
      return forkJoin(obs_queries).pipe(map((res: any) => {
        let errors: number = 0;
        res.map((res2: boolean) => {
          if (!res2) errors = errors + 1;
        });
        
        if (errors == obs_queries.length) errors = -1;
        return errors;
      }));
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
}
