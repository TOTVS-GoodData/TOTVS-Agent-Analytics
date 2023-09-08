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

/* Interface de rotinas do Agent */
import { Script } from '../../src-angular/app/script/script-interface';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, switchMap, map, of, catchError } from 'rxjs';

export class ScriptService {
  
  /*******************/
  /*    ROTINAS      */
  /*******************/
  /* Método de consulta das rotinas salvas do Agent */
  public static getScripts(): Observable<Script[]> {
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno das rotinas cadastradas
    return Files.readApplicationData().pipe(map((db: DatabaseData) => {
      return db.scripts;
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de consulta das rotinas pertencentes a um agendamento do Agent */
  public static getScriptsBySchedule(sc: Schedule): Observable<Script[]> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.SCHEDULE_LOADING', [sc.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SCHEDULE_LOADING'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno das rotinas válidas
    return Files.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.scripts.filter((script: Script) => {
        return (script.scheduleId === sc.id)
      });
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.SCHEDULE_LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de gravação das rotinas do Agent */
  public static saveScript(s: Script): Observable<boolean> {
    
    //Objeto que detecta se já existe uma rotina cadastrada com o mesmo nome da que será gravada
    let script_name: Script = null;
    
    //Define se a rotina a ser cadastrada já possui um Id registrado, ou não
    let newId: boolean = (s.id == null);
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.SAVE', [s.name]),
      new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME', [s.name]),
      new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME', [s.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SAVE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      
      //Validação do campo de Id da consulta. Caso não preenchido, é gerado um novo Id
      if (newId) s.id = uuid();
      
      //Impede o cadastro de uma rotina com o mesmo nome
      script_name = _dbd.scripts.filter((script: Script) => (script.id != s.id)).find((script: Script) => (script.name == s.name));
      if (script_name != undefined) {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME'], null, null, null);
        return of(false);
      } else {
        
        //Inclusão da rotina no banco do Agent
        if (newId) {
          _dbd.scripts.push(s);
        } else {
          let index = _dbd.scripts.findIndex((script: Script) => { return script.id === s.id; });
          _dbd.scripts[index] = s;
        }
      }
      
      //Gravação da rotina no banco do Agent
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SAVE_ERROR'], null, null, err);
        throw err;
    }));
  }
  
  /* Método de remoção das rotinas do Agent */
  public static deleteScript(s: Script): Observable<boolean> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.DELETE', [s.name]),
      new TranslationInput('SCRIPTS.MESSAGES.DELETE_ERROR', [s.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.DELETE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e remoção da rotina cadastrada
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.scripts.findIndex((script: Script) => { return script.id === s.id; });
      _dbd.scripts.splice(index, 1);
      
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.ERROR'], null, null, err);
        throw err;
    }));
  }
}