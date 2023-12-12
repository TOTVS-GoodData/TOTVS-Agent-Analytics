/* Serviço de logs / arquivos do Agent */
import { Files } from '../files';

/* Serviço de tradução do Electron */
import { TranslationService } from './translation-service';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../../src-angular/app/utilities/utilities-constants';

/* Interface do banco de dados do Agent */
import { ClientData } from '../electron-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from './workspace-service';
import { Workspace } from '../../src-angular/app/workspace/workspace-interface';

/* Serviço de bancos de dados do Agent */
import { DatabaseService } from './database-service';
import { Database } from '../../src-angular/app/database/database-interface';

/* Interface de agendamentos do Agent */
import { ScheduleService } from './schedule-service';
import { Schedule } from '../../src-angular/app/schedule/schedule-interface';

/* Interface de rotinas do Agent */
import { ScriptClient } from '../../src-angular/app/script/script-interface';

/* Interface de versionamento do Agent */
import { Version } from '../../src-angular/app/utilities/version-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, switchMap, map, of, catchError, forkJoin } from 'rxjs';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

export class ScriptService {
  
  /*******************/
  /*    ROTINAS      */
  /*******************/
  /* Método de consulta das rotinas salvas do Agent */
  public static getScripts(showLogs: boolean): Observable<ScriptClient[]> {
    
    //Escrita de logs (caso solicitado)
    if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno das rotinas cadastradas
    return Files.readApplicationData().pipe(map((db: ClientData) => {
      return db.scripts;
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de consulta das rotinas pertencentes a um agendamento do Agent */
  public static getScriptsBySchedule(sc: Schedule, showLogs: boolean): Observable<ScriptClient[]> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.SCHEDULE_LOADING', [sc.name])
    ]);
    
    //Escrita de logs (caso solicitado)
    if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SCHEDULE_LOADING'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno das rotinas válidas
    return Files.readApplicationData().pipe(map((_dbd: ClientData) => {
      return _dbd.scripts.filter((script: ScriptClient) => {
        return (script.scheduleId === sc.id)
      });
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.SCHEDULE_LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /*
    Método de gravação das rotinas do Agent
    
    Este método recebe múltiplas rotinas a serem gravadas ao mesmo tempo, e retorna um número,
    indicando o total de erros encontrados ao salvar as rotinas.
    Retorna 0 caso nenhum erro tenha sido encontrado.
    Retorna -1 caso ocorra um erro geral na gravação das rotinas (como permissão de gravação)
  */
  public static saveScript(s: ScriptClient[]): Observable<number> {
    
    //Objeto que detecta se já existe uma rotina cadastrada com o mesmo nome da que será gravada
    let script_name: ScriptClient = null;
    
    //Define se a rotina a ser cadastrada já possui um Id registrado, ou não
    let newId: boolean = false;
    
    //Contabiliza o total de erros gerados ao tentar salvar todas as consultas
    let errors: number = (s.length == 0 ? null : 0);
    
    //Leitura do banco de dados atual do Agent
    return Files.readApplicationData().pipe(switchMap((_dbd: ClientData) => {
      
      //Itera por todas as rotinas que devem ser gravadas
      let validate: any = s.map((ss: ScriptClient) => {
        
        //Consulta das traduções
        let translations: any = TranslationService.getTranslations([
          new TranslationInput('SCRIPTS.MESSAGES.SAVE', [ss.name]),
          new TranslationInput('SCRIPTS.MESSAGES.SAVE_OK', [ss.name]),
          new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME', [ss.name]),
          new TranslationInput('SCRIPTS.MESSAGES.SAVE_WARNING_ALREADY_EXISTS', [ss.name])
        ]);
        
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SAVE'], null, null, null);
        
        //Validação do campo de Id da consulta. Caso não preenchido, é gerado um novo Id
        newId = (ss.id == null);
        if (newId) ss.id = uuid();
        
        //Impede o cadastro de uma rotina com o mesmo nome, no mesmo agendamento
        script_name = _dbd.scripts.filter((script: ScriptClient) => (script.id != ss.id)).find((script: ScriptClient) => ((script.name == ss.name) && (script.scheduleId == ss.scheduleId)));
        if (script_name != undefined) {
          
          //Caso a rotina seja padrão (Recebida pelo Agent-Server), a mesma é ignorada. Caso contraŕio, é gerado um erro.
          if (!script_name.TOTVS) {
            errors = errors + 1;
            return { script: ss, level: CNST_LOGLEVEL.ERROR, message: translations['SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME'] };
          } else {
            return { script: ss, level: CNST_LOGLEVEL.WARN, message: translations['SCRIPTS.MESSAGES.SAVE_WARNING_ALREADY_EXISTS'] };
          }
        } else {
          
          //Inclusão da rotina no banco do Agent
          if (newId) {
            _dbd.scripts.push(ss);
          } else {
            let index = _dbd.scripts.findIndex((script: ScriptClient) => { return script.id === ss.id; });
            _dbd.scripts[index] = ss;
          }
          
          return { script: ss, level: CNST_LOGLEVEL.DEBUG, message: translations['SCRIPTS.MESSAGES.SAVE_OK'] };
        }
      });
      
      //Gravação da rotina no banco do Agent
      return Files.writeApplicationData(_dbd).pipe(map((res: boolean) => {
        
        //Caso a gravação funcione, é gerado o log de sucesso / erro / avisos para todas as rotinas consideradas
        if (res) {
          validate.map((obj: any) => {
            Files.writeToLog(obj.level, CNST_SYSTEMLEVEL.ELEC, obj.message, null, null, null);
          });
          
          return errors;
        
        //Caso contrário, é gerada uma mensagem de erro para cada rotina a ser gravada
        } else {
          validate.map((obj: any) => {
            
            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR', [obj.script.name]),
            ]);
            
            if (obj.level != CNST_LOGLEVEL.ERROR) Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SAVE_ERROR'], null, null, null);
            else Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, obj.message, null, null, null);
          });
          
          return -1;
        }
      }));
    }), catchError((err: any) => {
      throw err;
    }));
  }
  
  /* Método de remoção das rotinas do Agent */
  public static deleteScript(s: ScriptClient): Observable<boolean> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.DELETE', [s.name]),
      new TranslationInput('SCRIPTS.MESSAGES.DELETE_ERROR', [s.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.DELETE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e remoção da rotina cadastrada
    return Files.readApplicationData().pipe(switchMap((_dbd: ClientData) => {
      let index = _dbd.scripts.findIndex((script: ScriptClient) => { return script.id === s.id; });
      _dbd.scripts.splice(index, 1);
      
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.ERROR'], null, null, err);
        throw err;
    }));
  }
}
