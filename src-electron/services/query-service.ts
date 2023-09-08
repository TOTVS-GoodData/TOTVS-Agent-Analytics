/* Serviço de logs / arquivos do Agent */
import { Files } from '../files';

/* Serviço de tradução do Electron */
import { TranslationService } from './translation-service';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../../src-angular/app/utilities/utilities-constants';

/* Interface do banco de dados do Agent */
import { DatabaseData } from '../electron-interface';

/* Interface de agendamentos do Agent */
import { Schedule } from '../../src-angular/app/schedule/schedule-interface';

/* Interface de consultas do Agent */
import { Query } from '../../src-angular/app/query/query-interface';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, switchMap, map, of, catchError } from 'rxjs';

export class QueryService {
  
  /*******************/
  /*   CONSULTAS     */
  /*******************/
  /* Método de consulta das queries salvas do Agent */
  public static getQueries(): Observable<Query[]> {
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.LOADING'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno das consultas cadastradas
    return Files.readApplicationData().pipe(map((db: DatabaseData) => {
      return db.queries;
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de consulta das queries pertencentes a um agendamento do Agent */
  public static getQueriesBySchedule(sc: Schedule): Observable<Query[]> {
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING', [sc.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SCHEDULE_LOADING'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno das consultas válidas
    return Files.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.queries.filter((query: Query) => {
        return (query.scheduleId === sc.id)
      });
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.SCHEDULE_LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de gravação das consultas do Agent */
  public static saveQuery(q: Query): Observable<boolean> {
    
    //Objeto que detecta se já existe uma consulta cadastrada com o mesmo nome da que será gravada
    let query_name: Query = null;
    
    //Define se o banco de dados a ser cadastrado já possui um Id registrado, ou não
    let newId: boolean = (q.id == null);
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.SAVE', [q.name]),
      new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR', [q.name]),
      new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR_SAME_NAME', [q.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SAVE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      
      //Validação do campo de Id da consulta. Caso não preenchido, é gerado um novo Id
      if (newId) q.id = uuid();
      
      //Impede o cadastro de uma consulta com o mesmo nome
      query_name = _dbd.queries.filter((query: Query) => (query.id != q.id)).find((query: Query) => (query.name == q.name));
      if (query_name != undefined) {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SAVE_ERROR_SAME_NAME'], null, null, null);
        return of(false);
      } else {
        
        //Remoção do campo de suporte
        delete q.executionModeName;
        
        //Inclusão da consulta no banco do Agent
        if (newId) {
          _dbd.queries.push(q);
        } else {
          let index = _dbd.queries.findIndex((query: Query) => { return query.id === q.id; });
          _dbd.queries[index] = q;
        }
      }
      
      //Gravação da consulta no banco do Agent
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SAVE_ERROR'], null, null, err);
        throw err;
    }));
  }
  
  /* Método de remoção das consultas do Agent */
  public static deleteQuery(q: Query): Observable<boolean> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.DELETE', [q.name]),
      new TranslationInput('QUERIES.MESSAGES.DELETE_ERROR', [q.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.DELETE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e remoção da consulta cadastrada
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.queries.findIndex((query: Query) => { return query.id === q.id; });
      _dbd.queries.splice(index, 1);
      
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.DELETE_ERROR'], null, null, err);
        throw err;
    }));
  }
}