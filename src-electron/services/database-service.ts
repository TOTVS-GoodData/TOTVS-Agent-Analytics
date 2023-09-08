/* Serviço de logs / arquivos do Agent */
import { Files } from '../files';

/* Serviço de tradução do Electron */
import { TranslationService } from './translation-service';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../../src-angular/app/utilities/utilities-constants';

/* Interface do banco de dados do Agent */
import { DatabaseData } from '../electron-interface';

/* Interface de bancos de dados do Agent */
import { Database } from '../../src-angular/app/database/database-interface';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, from, switchMap, map, of, catchError, forkJoin } from 'rxjs';

export class DatabaseService {
  
  /**************************/
  /*** MÉTODOS DO SERVIÇO ***/
  /**************************/
  /* Método de consulta dos bancos de dados salvos do Agent */
  public static getDatabases(): Observable<Database[]> {
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['DATABASES.MESSAGES.LOADING'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno dos bancos de dados cadastrados
    return Files.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.databases;
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['DATABASES.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de gravação dos bancos de dados do Agent */
  public static saveDatabase(db: Database): Observable<boolean> {
    
    //Objeto que detecta se já existe um banco de dados cadastrado com o mesmo nome do que será gravado
    let db_name: Database = null;
    
    //Define se o banco de dados a ser cadastrado já possui um Id registrado, ou não
    let newId: boolean = (db.id == null);
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.SAVE', [db.name]),
      new TranslationInput('DATABASES.MESSAGES.SAVE_ERROR', [db.name]),
      new TranslationInput('DATABASES.MESSAGES.SAVE_ERROR_SAME_NAME', [db.name]),
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.SAVE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      
      //Validação do campo de Id do banco de dados. Caso não preenchido, é gerado um novo Id
      if (newId) db.id = uuid();
      
      //Impede o cadastro de um banco de dados com o mesmo nome
      db_name = _dbd.databases.filter((database: Database) => (database.id != db.id)).find((database: Database) => (database.name == db.name));
      if (db_name != undefined) {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.SAVE_ERROR_SAME_NAME'], null, null, null);
        return of(false);
      } else {
        
        //Inclusão do banco de dados no banco do Agent
        if (newId) {
          _dbd.databases.push(db);
        } else {
          let index = _dbd.databases.findIndex((database: Database) => { return database.id === db.id; });
          _dbd.databases[index] = db;
        }
      }
      
      //Gravação do banco de dados no banco do Agent
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.SAVE_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de remoção dos bancos de dados do Agent */
  public static deleteDatabase(db: Database): Observable<boolean> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.DELETE', [db.name]),
      new TranslationInput('DATABASES.MESSAGES.DELETE_ERROR', [db.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.DELETE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e remoção do banco de dados cadastrado
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.databases.findIndex((database: Database) => { return database.id === db.id; });
      _dbd.databases.splice(index, 1);
      
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.DELETE_ERROR'], null, null, err);
      throw err;
    }));
  }
}