/* Serviço de logs / arquivos do Agent */
import { Files } from '../files';

/* Serviço de tradução do Electron */
import { TranslationService } from './translation-service';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../../src-angular/app/utilities/utilities-constants';

/* Interface do banco de dados do Agent */
import { DatabaseData } from '../electron-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from './workspace-service';
import { Workspace } from '../../src-angular/app/workspace/workspace-interface';

/* Serviço de bancos de dados do Agent */
import { DatabaseService } from './database-service';
import { Database } from '../../src-angular/app/database/database-interface';

/* Serviço de agendamentos do Agent */
import { ScheduleService } from './schedule-service';
import { Schedule } from '../../src-angular/app/schedule/schedule-interface';

/* Interface de consultas do Agent */
import { QueryClient } from '../../src-angular/app/query/query-interface';

/* Interface de versionamento do Agent */
import { Version } from '../../src-angular/app/utilities/version-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, switchMap, map, of, catchError, forkJoin } from 'rxjs';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

export class QueryService {
  
  /*******************/
  /*   CONSULTAS     */
  /*******************/
  /* Método de consulta das queries salvas do Agent */
  public static getQueries(showLogs: boolean): Observable<QueryClient[]> {
    
    //Escrita de logs (caso solicitado)
    if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.LOADING'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno das consultas cadastradas
    return Files.readApplicationData().pipe(map((db: DatabaseData) => {
      return db.queries;
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de consulta das queries pertencentes a um agendamento do Agent */
  public static getQueriesBySchedule(sc: Schedule, showLogs: boolean): Observable<QueryClient[]> {
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING', [sc.name])
    ]);
    
    //Escrita de logs (caso solicitado)
    if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SCHEDULE_LOADING'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno das consultas válidas
    return Files.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.queries.filter((query: QueryClient) => {
        return (query.scheduleId === sc.id)
      });
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.SCHEDULE_LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /*
    Método de gravação das consultas do Agent
    
    Este método recebe múltiplas consultas a serem gravadas ao mesmo tempo, e retorna um número,
    indicando o total de erros encontrados ao salvar as consultas.
    Retorna 0 caso nenhum erro tenha sido encontrado.
    Retorna -1 caso ocorra um erro geral na gravação das consultas (como permissão de gravação)
  */
  public static saveQuery(q: QueryClient[]): Observable<number> {
    
    //Objeto que detecta se já existe uma consulta cadastrada com o mesmo nome da que será gravada
    let query_name: QueryClient = null;
    
    //Define se a consulta a ser cadastrada já possui um Id registrado, ou não
    let newId: boolean = false;
    
    //Contabiliza o total de erros gerados ao tentar salvar todas as consultas
    let errors: number = (q.length == 0 ? null : 0);
    
    //Leitura do banco de dados atual do Agent
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      
      //Itera por todas as consultas que devem ser gravadas
      let validate: any = q.map((qq: QueryClient) => {
        
        //Consulta das traduções
        let translations: any = TranslationService.getTranslations([
          new TranslationInput('QUERIES.MESSAGES.SAVE', [qq.name]),
          new TranslationInput('QUERIES.MESSAGES.SAVE_OK', [qq.name]),
          new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR_SAME_NAME', [qq.name]),
          new TranslationInput('QUERIES.MESSAGES.SAVE_WARNING_ALREADY_EXISTS', [qq.name])
        ]);
        
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SAVE'], null, null, null);
        
        //Validação do campo de Id da consulta. Caso não preenchido, é gerado um novo Id
        newId = (qq.id == null);
        if (newId) qq.id = uuid();
        
        //Verifica se já existe uma consulta cadastrada com o mesmo nome, no mesmo agendamento
        query_name = _dbd.queries.filter((query: QueryClient) => (query.id != qq.id)).find((query: QueryClient) => ((query.name == qq.name) && (query.scheduleId == qq.scheduleId)));
        if (query_name != undefined) {
          
          //Caso a consulta seja padrão (Recebida pelo Agent-Server), a mesma é ignorada. Caso contraŕio, é gerado um erro.
          if (!query_name.TOTVS) {
            errors = errors + 1;
            return { query: qq, level: CNST_LOGLEVEL.ERROR, message: translations['QUERIES.MESSAGES.SAVE_ERROR_SAME_NAME'] };
          } else {
            return { query: qq, level: CNST_LOGLEVEL.WARN, message: translations['QUERIES.MESSAGES.SAVE_WARNING_ALREADY_EXISTS'] };
          }
        } else {
          
          //Remoção dos campos de suporte
          delete qq.executionModeName;
          
          //Inclusão da consulta no banco do Agent
          if (newId) {
            _dbd.queries.push(qq);
          } else {
            let index = _dbd.queries.findIndex((query: QueryClient) => { return query.id === qq.id; });
            _dbd.queries[index] = qq;
          }
          return { query: qq, level: CNST_LOGLEVEL.DEBUG, message: translations['QUERIES.MESSAGES.SAVE_OK'] };
        }
      });
      
      //Gravação de todas as consultas no banco do Agent
      return Files.writeApplicationData(_dbd).pipe(map((res: boolean) => {
        
        //Caso a gravação funcione, é gerado o log de sucesso / erro / avisos para todas as consultas consideradas
        if (res) {
          validate.map((obj: any) => {
            Files.writeToLog(obj.level, CNST_SYSTEMLEVEL.ELEC, obj.message, null, null, null);
          });
          
          return errors;
        
        //Caso contrário, é gerada uma mensagem de erro para cada consulta a ser gravada
        } else {
          validate.map((obj: any) => {
            
            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR', [obj.query.name]),
            ]);
            
            if (obj.level != CNST_LOGLEVEL.ERROR) Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SAVE_ERROR'], null, null, null);
            else Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, obj.message, null, null, null);
          });
          
          return -1;
        }
      }));
    }), catchError((err: any) => {
      throw err;
    }));
  }
  
  /* Método de remoção das consultas do Agent */
  public static deleteQuery(q: QueryClient): Observable<boolean> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.DELETE', [q.name]),
      new TranslationInput('QUERIES.MESSAGES.DELETE_ERROR', [q.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.DELETE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e remoção da consulta cadastrada
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.queries.findIndex((query: QueryClient) => { return query.id === q.id; });
      _dbd.queries.splice(index, 1);
      
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.DELETE_ERROR'], null, null, err);
        throw err;
    }));
  }
  
  /* Método de atualização das consultas padrões */
  public static updateAllQueries(): Observable<boolean> {
    return of(true);
    /*
    //Variável de suporte, que armazena a versão atualizada disponível de cada consulta do Agent
    let updatedQueries: QueryClient[] = [];
    
    //Variável de suporte, que armazena todas as requisições de gravação das consultas
    let obs_queries: Observable<boolean>[] = [];
    
    //Consulta das informações cadastradas no Agent
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.QUERY_UPDATER'], null, null, null);
    return forkJoin([
      QueryService.getQueries(false),
      ScheduleService.getSchedules(false),
      WorkspaceService.getWorkspaces(false),
      DatabaseService.getDatabases(false)
    ]).pipe(switchMap((results: [QueryClient[], Schedule[], Workspace[], Database[]]) => {
      
      /*
        Itera por todas as consultas cadastradas pelo usuário,
        procurando uma versão mais atualizada de cada.
        
        Consultas customizadas, ou criadas pelo usuário são ignoradas.
        Apenas a consulta mais recente para cada versão Major/Minor é retornada.
      
      updatedQueries = results[0].map((q: QueryClient) => {
        
        //Extrai o ERP e o banco de dados de cada consulta cadastrada
        let s: Schedule = results[1].find((s: Schedule) => (q.scheduleId == s.id));
        let w: Workspace = results[2].find((w: Workspace) => (s.workspaceId == w.id));
        let db: Database = results[3].find((db: Database) => (w.databaseIdRef == db.id));
        
        //Filtra apenas as consultas padrões, e que não foram customizadas pelo usuário
        let isStandardQuery: boolean = ((CNST_ERP.find((erp: any) => (erp.ERP == w.license.source)).Queries[db.brand].find((q_erp: any) => {
          let version: Version = new Version(q_erp.version);
          return (
               (q_erp.name == q.name)
            && (q_erp.query == q.command)
            && (version.major == q.version.major)
            && (version.minor == q.version.minor)
            && (version.patch == q.version.patch)
          );
        })) != undefined);
        
        //Caso a consulta seja válida, procura por atualizações da mesma
        if (isStandardQuery) {
          
          //Retorna todas as atualizações válidas da consulta padrão, e ordena a partir da mais recente
          let updates: any[] = CNST_ERP.find((erp: any) => (erp.ERP == w.license.source)).Queries[db.brand].filter((q_erp: any) => {
            let version: Version = new Version(q_erp.version);
            return (
                 (q_erp.name == q.name)
              && (version.major == q.version.major)
              && (version.minor == q.version.minor)
              && (version.patch > q.version.patch)
            );
          }).sort((a: any, b: any) => {
            let aVersion: Version = new Version(a.version);
            let bVersion: Version = new Version(b.version);
            
            return (bVersion.patch - aVersion.patch);
          });
          
          //Retorna apenas a consulta mais recente (Se houver)
          if (updates[0] != undefined) {
            
            //Conversão de JSON -> Objeto (Para uso dos métodos da interface "Version")
            let v1 = new Version(null);
            let v2 = new Version(updates[0].version);
            v1.jsonToObject(q.version);
            
            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.QUERY_UPDATER_AVAILABLE', [q.name, v1.getVersion(), v2.getVersion()])
            ]);
            
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.QUERY_UPDATER_AVAILABLE'], null, null, null);
            q.version = v2;
            q.command = updates[0].query;
            return q;
          } else {
            return undefined;
          }
        } else {
          
          //Consulta das traduções
          let translations: any = TranslationService.getTranslations([
            new TranslationInput('ELECTRON.QUERY_UPDATER_NOT_STANDARD', [q.name])
          ]);
          Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.QUERY_UPDATER_NOT_STANDARD'], null, null, null);
          
          return undefined;
        }
      }).filter((q: QueryClient) => (q != undefined));
      
      //Prepara as requisições de atualização a serem disparadas
      if (updatedQueries.length > 0) {
        obs_queries = updatedQueries.map((q: QueryClient) => {
          return of(true);
//        return this.saveQuery(q).pipe(map((res: boolean) => {
  //          return res;
    //      }));
        });
        
        //Dispara todas as gravações de consultas, simultaneamente
        return forkJoin(obs_queries).pipe(map(() => {
          Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.QUERY_UPDATER_OK'], null, null, null);
          return true;
        }), catchError((err: any) => {
          Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.QUERY_UPDATER_ERROR'], null, null, null);
          throw err;
        }));
      } else {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.QUERY_UPDATER_NO_UPDATES'], null, null, null);
        return of(true);
      }
    }));*/
  }
}
