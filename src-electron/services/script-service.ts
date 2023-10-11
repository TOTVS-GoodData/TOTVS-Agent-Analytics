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
import { CNST_ERP } from '../../src-angular/app/workspace/workspace-constants';

/* Serviço de bancos de dados do Agent */
import { DatabaseService } from './database-service';
import { Database } from '../../src-angular/app/database/database-interface';

/* Interface de agendamentos do Agent */
import { ScheduleService } from './schedule-service';
import { Schedule } from '../../src-angular/app/schedule/schedule-interface';

/* Interface de rotinas do Agent */
import { ScriptClient } from '../../src-angular/app/script/script-interface';
import { Version } from '../../src-angular/app/query/query-interface';
import { CNST_QUERY_VERSION_STANDARD } from '../../src-angular/app/query/query-constants';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, switchMap, map, of, catchError, forkJoin } from 'rxjs';

export class ScriptService {
  
  /*******************/
  /*    ROTINAS      */
  /*******************/
  /* Método de consulta das rotinas salvas do Agent */
  public static getScripts(showLogs: boolean): Observable<ScriptClient[]> {
    
    //Escrita de logs (caso solicitado)
    if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno das rotinas cadastradas
    return Files.readApplicationData().pipe(map((db: DatabaseData) => {
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
    return Files.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.scripts.filter((script: ScriptClient) => {
        return (script.scheduleId === sc.id)
      });
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.SCHEDULE_LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de gravação das rotinas do Agent */
  public static saveScript(s: ScriptClient): Observable<boolean> {
    
    //Objeto que detecta se já existe uma rotina cadastrada com o mesmo nome da que será gravada
    let script_name: ScriptClient = null;
    
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
      script_name = _dbd.scripts.filter((script: ScriptClient) => (script.id != s.id)).find((script: ScriptClient) => (script.name == s.name));
      if (script_name != undefined) {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME'], null, null, null);
        return of(false);
      } else {
        
        //Inclusão da rotina no banco do Agent
        if (newId) {
          _dbd.scripts.push(s);
        } else {
          let index = _dbd.scripts.findIndex((script: ScriptClient) => { return script.id === s.id; });
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
  public static deleteScript(s: ScriptClient): Observable<boolean> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.DELETE', [s.name]),
      new TranslationInput('SCRIPTS.MESSAGES.DELETE_ERROR', [s.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.DELETE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e remoção da rotina cadastrada
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.scripts.findIndex((script: ScriptClient) => { return script.id === s.id; });
      _dbd.scripts.splice(index, 1);
      
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.ERROR'], null, null, err);
        throw err;
    }));
  }
  
  /* Método de atualização das rotinas padrões */
  public static updateAllScripts(): Observable<boolean> {
    
    //Variável de suporte, que armazena a versão atualizada disponível de cada rotina do Agent
    let updatedScripts: ScriptClient[] = [];
    
    //Variável de suporte, que armazena todas as requisições de gravação das rotinas
    let obs_scripts: Observable<boolean>[] = [];
    
    //Consulta das informações cadastradas no Agent
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SCRIPT_UPDATER'], null, null, null);
    return forkJoin([
      ScriptService.getScripts(false),
      ScheduleService.getSchedules(false),
      WorkspaceService.getWorkspaces(false),
      DatabaseService.getDatabases(false)
    ]).pipe(switchMap((results: [ScriptClient[], Schedule[], Workspace[], Database[]]) => {
      
      /*
        Itera por todas as rotinas cadastradas pelo usuário,
        procurando uma versão mais atualizada de cada.
        
        Rotinas customizadas, ou criadas pelo usuário são ignoradas.
        Apenas a rotina mais recente para cada versão Major/Minor é retornada.
      */
      updatedScripts = results[0].map((script: ScriptClient) => {
        
        //Extrai o ERP e o banco de dados de cada consulta cadastrada
        let s: Schedule = results[1].find((s: Schedule) => (script.scheduleId == s.id));
        let w: Workspace = results[2].find((w: Workspace) => (s.workspaceId == w.id));
        let db: Database = results[3].find((db: Database) => (w.databaseIdRef == db.id));
        
        //Filtra apenas as consultas padrões, e que não foram customizadas pelo usuário
        let isStandardScript: boolean = ((CNST_ERP.find((erp: any) => (erp.ERP == w.license.source)).Scripts[db.brand].find((s_erp: any) => {
          let version: Version = new Version(s_erp.version);
          return (
               (s_erp.name == script.name)
            && (s_erp.script == script.script)
            && (version.major == script.version.major)
            && (version.minor == script.version.minor)
            && (version.patch == script.version.patch)
          );
        })) != undefined);
        
        //Caso a rotina seja válida, procura por atualizações da mesma
        if (isStandardScript) {
          
          //Retorna todas as atualizações válidas da consulta padrão, e ordena a partir da mais recente
          let updates: any[] = CNST_ERP.find((erp: any) => (erp.ERP == w.license.source)).Scripts[db.brand].filter((s_erp: any) => {
            let version: Version = new Version(s_erp.version);
            return (
                 (s_erp.name == script.name)
              && (version.major == script.version.major)
              && (version.minor == script.version.minor)
              && (version.patch > script.version.patch)
            );
          }).sort((a: any, b: any) => {
            let aVersion: Version = new Version(a.version);
            let bVersion: Version = new Version(b.version);
            
            return (bVersion.patch - aVersion.patch);
          });
          
          //Retorna apenas a rotina mais recente (Se houver)
          if (updates[0] != undefined) {
            
            //Conversão de JSON -> Objeto (Para uso dos métodos da interface "Version")
            let v1 = new Version(CNST_QUERY_VERSION_STANDARD);
            let v2 = new Version(updates[0].version);
            v1.jsonToObject(script.version);
            
            //Consulta das traduções
            let translations: any = TranslationService.getTranslations([
              new TranslationInput('ELECTRON.SCRIPT_UPDATER_AVAILABLE', [script.name, v1.getVersion(), v2.getVersion()])
            ]);
            
            Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SCRIPT_UPDATER_AVAILABLE'], null, null, null);
            script.version = v2;
            script.script = updates[0].script;
            return script;
          } else {
            return undefined;
          }
        } else {
          
          //Consulta das traduções
          let translations: any = TranslationService.getTranslations([
            new TranslationInput('ELECTRON.SCRIPT_UPDATER_NOT_STANDARD', [script.name])
          ]);
          Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SCRIPT_UPDATER_NOT_STANDARD'], null, null, null);
          
          return undefined;
        }
      }).filter((script: ScriptClient) => (script != undefined));
      
      //Prepara as requisições de atualização a serem disparadas
      if (updatedScripts.length > 0) {
        obs_scripts = updatedScripts.map((script: ScriptClient) => {
          return this.saveScript(script).pipe(map((res: boolean) => {
            return res;
          }));
        });
        
        //Dispara todas as gravações de consultas, simultaneamente
        return forkJoin(obs_scripts).pipe(map(() => {
          Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SCRIPT_UPDATER_OK'], null, null, null);
          return true;
        }), catchError((err: any) => {
          Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SCRIPT_UPDATER_ERROR'], null, null, null);
          throw err;
        }));
      } else {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SCRIPT_UPDATER_NO_UPDATES'], null, null, null);
        return of(true);
      }
    }));
  }
}
