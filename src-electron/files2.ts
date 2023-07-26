//const log_manual = fs.createWriteStream( globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/manual.log', { flags: 'a', encoding: 'utf8' } );
//const log_export = fs.createWriteStream( globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/export.log', { flags: 'a', encoding: 'utf8' } );
//const log_stdout = process.stdout;

import * as path from 'path';

import { dialog } from 'electron';

import * as globals from './constants-electron';
import * as constants from '../src-angular/app/utilities/constants-angular';
import * as _utilities from '../src-angular/app/utilities/utilities';
import { Functions } from './functions';
import { Execute } from './execute';

import { WriteStream } from 'fs';
import * as fs from 'fs-extra';

import * as winston from 'winston';

import { DatabaseData, Workspace, Database, Schedule, Query, Script, Configuration, JavaInputBuffer } from '../src-angular/app/utilities/interfaces';

import { CNST_WORKSPACE_MESSAGES } from '../src-angular/app/workspace/workspace-messages';
import { CNST_DATABASE_MESSAGES } from '../src-angular/app/database/database-messages';
import { CNST_SCHEDULE_MESSAGES } from '../src-angular/app/schedule/schedule-messages';
import { CNST_QUERY_MESSAGES } from '../src-angular/app/query/query-messages';
import { CNST_SCRIPT_MESSAGES } from '../src-angular/app/script/script-messages';
import { CNST_CONFIGURATION_MESSAGES } from '../src-angular/app/configuration/configuration-messages';

import { Observable, from, switchMap, map, of, catchError, forkJoin } from 'rxjs';

const myFormat = winston.format.printf(({ level, message, label, timestamp }) => {
  return `{ "timestamp":"${timestamp}", "sys":"${label}", "level":"[${level}]", "message": "${message}"}`;
});

export class Files2 {
  public static CNST_MESSAGES: any = {
    FOLDER_SELECT: 'Selecione o diretório.'
   ,DATABASE_DEVELOPMENT: 'Utilizando banco de desenvolvimento.'
   ,DATABASE_PRODUCTION: 'Utilizando banco de produção.'
   ,DATABASE_CREATE: 'Nova instalação detectada. Criando novo banco vazio.'
   ,DATABASE_CREATE_OK: 'Banco criado com sucesso.'
   ,DELETE_OLD_LOGS: 'Apagando arquivos de logs antigos.'
   ,DELETE_OLD_LOGS_OK: 'Arquivos de log antigos apagados com sucesso.'
  };
  
  private static filepath: string = null;
  private static timestamp: string = Files2.formatDate(new Date());
  public static loggerJSON: any = null;
  public static loggerTEXT: any = null;
  
  private myFormat = winston.format.printf(({ message }) => {
    return `${message}`;
  });
  
  private static formatDate(inputDate: Date): string {
    let day: number = inputDate.getDate();
    let month: number = inputDate.getMonth() + 1;
    let year: number = inputDate.getFullYear();
    
    let str_day = day.toString().padStart(2, '0');
    let str_month = month.toString().padStart(2, '0');
    
    return `${year}-${str_month}-${str_day}`;
  }
  
  /*******************/
  /*    LOGFILES     */
  /*******************/
  public static deleteOldLogs() {
    this.getConfiguration().subscribe((conf: Configuration) => {
      let maxDate: Date = new Date();
      maxDate.setDate(new Date().getDate() - conf.logfilesToKeep);
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_CONFIGURATION_MESSAGES.CONFIG_LOADING_OK, null, null, null);
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Files2.CNST_MESSAGES.DELETE_OLD_LOGS, null, null, null);
      fs.readdir(globals.CNST_PROGRAM_PATH_LOGS, (err: any, files: any) => {
        files.forEach((file: any) => {
          let regexLogs = new RegExp(globals.CNST_REGEX_LOGS);
          if (regexLogs.test(file)) {
            let year: number = file.substring(file.length-14, file.length-10);
            let month: number = file.substring(file.length-9, file.length-7);
            let day: number = file.substring(file.length-6, file.length-4);
            let logDate: Date = new Date(year, month, day);
            if (logDate.getTime() < maxDate.getTime()) fs.remove(globals.CNST_PROGRAM_PATH_LOGS + '/' + file);
          }
        });
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Files2.CNST_MESSAGES.DELETE_OLD_LOGS_OK, null, null, null);
      });
    });
  }
  
  public static writeToLog(loglevel: any, system: string, message: string, execId: number, scheduleId: number, err: any): boolean {
    let obj = {
      timestamp: new Date(),
      loglevel: loglevel.tag,
      system: system,
      message: JSON.stringify(message).replaceAll('\"', '')
    };
    
    if (execId != null) obj['execId'] = execId;
    if (scheduleId != null) obj['scheduleId'] = scheduleId;
    
    if (message) {
      switch (loglevel.level) {
        case constants.CNST_LOGLEVEL.ERROR.level: Files2.loggerJSON.error(obj); break;
        case constants.CNST_LOGLEVEL.WARN.level: Files2.loggerJSON.warn(obj); break;
        case constants.CNST_LOGLEVEL.INFO.level: Files2.loggerJSON.info(obj); break;
        case constants.CNST_LOGLEVEL.DEBUG.level: Files2.loggerJSON.debug(obj); break;
      }
    } else if (err) Files2.loggerTEXT.error(err);
    
    return true;
  }
  
  public static readLogs(): Array<string> {
    let logs: Array<string> = [];
    
    let files = fs.readdirSync(globals.CNST_PROGRAM_PATH_LOGS);
    files.map((file: string) => {
      let regexLogs = new RegExp(globals.CNST_REGEX_LOGS);
      if (regexLogs.test(file)) {
        fs.readFileSync(globals.CNST_PROGRAM_PATH_LOGS + '/' + file).toString().split('\n').map((line: string) => {
          logs.push(line);
        });
      }
    });
    
    return logs;
  }
  
  public static openLogAgent(): any {
        let logAgentPath = ( globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/');
        //shell.openItem( path.join( logAgentPath, 'manual.log') );
    }
  
  private static findNextId(obj: any): number {
    let ids = obj.map((o: any) => {
      return o.id;
    }).sort((v1: number, v2: number) => {
      if (v1 < v2) return -1;
      if (v1 > v2) return 1;
      return 0;
    });
    
    let start: number = 0;
    let output: number = ids.find((id: number) => {
      start = start + 1;
      return (id != start);
    });
    
    if (output == undefined) start = start + 1;
    return start;
  }
  
  /*******************/
  /*    DB.JSON      */
  /*******************/
  public static initApplicationData(): void {
    Files2.loggerJSON = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ssZ' }),
        winston.format((info) => {
          const {
            timestamp, loglevel, system, message, level, ...rest
          } = info;
          return {
            timestamp, loglevel, system, message, level, ...rest,
          };
        })(),
        winston.format.json({ deterministic: false })
      ),
      transports: [new winston.transports.Console(), new winston.transports.File({ filename: globals.CNST_PROGRAM_PATH_LOGS + '/logfile-' + Files2.timestamp + '.log' })]
    });
    
    Files2.loggerTEXT = winston.createLogger({
      level: 'error',
      format: winston.format.printf(({ message }) => {
        return `${message}`;
      }),
      transports: [new winston.transports.Console(), new winston.transports.File({ filename: globals.CNST_PROGRAM_PATH_LOGS + '/logfile-' + Files2.timestamp + '.log' })]
    });
    
    if (fs.existsSync(globals.CNST_DATABASE_NAME_DEV)) {
      Files2.filepath = globals.CNST_DATABASE_NAME_DEV;
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Files2.CNST_MESSAGES.DATABASE_DEVELOPMENT, null, null, null);
    } else if (fs.existsSync(globals.CNST_DATABASE_NAME)) {
      Files2.filepath = globals.CNST_DATABASE_NAME;
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Files2.CNST_MESSAGES.DATABASE_PRODUCTION, null, null, null);
    } else {
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Files2.CNST_MESSAGES.DATABASE_CREATE, null, null, null);
      fs.createFileSync(globals.CNST_DATABASE_NAME);
      fs.writeJsonSync(globals.CNST_DATABASE_NAME, new DatabaseData(), { spaces: 2, 'EOL': '\n' });
      Files2.filepath = globals.CNST_DATABASE_NAME;
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Files2.CNST_MESSAGES.DATABASE_CREATE_OK, null, null, null);
    }
  }
  
  public static readApplicationData(): Observable<DatabaseData> {
    return from(fs.readJson(Files2.filepath));
  }
  
  public static writeApplicationData(db: DatabaseData): Observable<boolean> {
    return from(fs.writeJson(Files2.filepath, db, { spaces: 2, 'EOL': '\n' })).pipe(map((r: any) => {
      return true;
    }));
  }
  
  /*******************/
  /*   AMBIENTES     */
  /*******************/
  public static getWorkspaces(): Observable<Workspace[]> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING, null, null, null);
    return this.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.workspaces;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_ERROR, null, null, err);
      throw err;
    }));
  }
  
  public static getWorkspacesByDatabase(db: Database): Observable<Workspace[]> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_DATABASES(db.name), null, null, null);
    return this.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.workspaces.filter((w: Workspace) => {
        return (w.databaseIdRef === db.id)
      });
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_DATABASES_ERROR, null, null, err);
      throw err;
    }));
  }
  
  public static saveWorkspace(w: Workspace): Observable<boolean> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_SAVE(w.name), null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      if (w.id) {
        let index = _dbd.workspaces.findIndex((workspace: Workspace) => { return workspace.id === w.id; });
        _dbd.workspaces[index] = w;
      } else {
        //w.id = this.findNextId(_dbd.workspaces);
        _dbd.workspaces.push(w);
      }
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_SAVE_ERROR(w.name), null, null, err);
      throw err;
    }));
  }
  
  public static deleteWorkspace(w: Workspace): Observable<boolean> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_DELETE(w.name), null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.workspaces.findIndex((workspace: Workspace) => { return workspace.id === w.id; });
      _dbd.workspaces.splice(index, 1);
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_DELETE_ERROR(w.name), null, null, err);
      throw err;
    }));
  }
  
  /*******************/
  /* BANCOS DE DADOS */
  /*******************/
  public static getDatabases(): Observable<Database[]> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_DATABASE_MESSAGES.DATABASE_LOADING, null, null, null);
    return this.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.databases;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_DATABASE_MESSAGES.DATABASE_LOADING_ERROR, null, null, err);
      throw err;
    }));
  }
  
  public static saveDatabase(db: Database): Observable<boolean> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_DATABASE_MESSAGES.DATABASE_SAVE(db.name), null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      if (db.id) {
        let index = _dbd.databases.findIndex((database: Database) => { return database.id === db.id; });
        _dbd.databases[index] = db;
      } else {
        //db.id = this.findNextId(_dbd.databases);
        _dbd.databases.push(db);
      }
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_DATABASE_MESSAGES.DATABASE_SAVE_ERROR(db.name), null, null, err);
      throw err;
    }));
  }
  
  public static deleteDatabase(db: Database): Observable<boolean> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_DATABASE_MESSAGES.DATABASE_DELETE(db.name), null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.databases.findIndex((database: Database) => { return database.id === db.id; });
      _dbd.databases.splice(index, 1);
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_DATABASE_MESSAGES.DATABASE_DELETE_ERROR(db.name), null, null, err);
      throw err;
    }));
  }
  
  /*******************/
  /*  AGENDAMENTOS   */
  /*******************/
  public static getSchedules(showLogs: boolean): Observable<Schedule[]> {
    if (showLogs) Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.SCHEDULE_LOADING, null, null, null);
    return this.readApplicationData().pipe(map((db: DatabaseData) => {
      return db.schedules;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.SCHEDULE_LOADING_ERROR, null, null, err);
      throw err;
    }));
  }
  
  public static getSchedulesToExecute(): Observable<Schedule[]> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.TRIGGERSCHEDULES_LOADING(Functions.formatDate(new Date())), null, null, null);
    return Files2.getSchedules(false).pipe(
      map((schedules: Schedule[]) => {
        schedules = schedules.filter((s: Schedule) => {
          let now: Date = new Date();
          if (s.lastExecution == null)
          s.windows = s.windows.filter((w: string) => {
            let execute: boolean = false;
            
            let dateWindow = new Date();
            let hour: number = parseInt(w.substring(0, 2));
            let minute: number = parseInt(w.substring(3, 5));
            dateWindow.setHours(hour, minute, 0);
            if ((dateWindow <= now) && ((dateWindow > s.lastExecution) || (s.lastExecution == null))) {
              execute = true;
            }
            return execute;
          });
          
          return ((s.windows.length > 0) && (s.enabled));
        });
        
        return schedules;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC,CNST_SCHEDULE_MESSAGES.TRIGGERSCHEDULES_ERROR, null, null, err);
      throw err;
    }));
  }
  
  public static saveSchedule(sc: Schedule): Observable<boolean> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.SCHEDULE_SAVE(sc.name), null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      if (sc.id) {
        let index = _dbd.schedules.findIndex((schedule: Schedule) => { return schedule.id === sc.id; });
        _dbd.schedules[index] = sc;
      } else {
        sc.id = this.findNextId(_dbd.schedules);
        _dbd.schedules.push(sc);
      }
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.SCHEDULE_SAVE_ERROR(sc.name), null, null, err);
      throw err;
    }));
  }
  
  public static deleteSchedule(sc: Schedule): Observable<boolean> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.SCHEDULE_DELETE(sc.name), null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.schedules.findIndex((schedule: Schedule) => { return schedule.id === sc.id; });
      _dbd.schedules.splice(index, 1);
      _dbd.queries = _dbd.queries.filter((q: Query) => {
        return (q.scheduleId != sc.id);
      });
      _dbd.scripts = _dbd.scripts.filter((s: Script) => {
        return (s.scheduleId != sc.id);
      });
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.SCHEDULE_DELETE_ERROR(sc.name), null, null, err);
      throw err;
    }));
  }
  
  public static executeAndUpdateSchedule(s: Schedule): Observable<boolean> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.RUN_AGENT_PREPARE, null, null, null);
    return forkJoin([
      Files2.getWorkspaces(),
      Files2.getDatabases(),
      Files2.getQueriesBySchedule(s),
      Files2.getScriptsBySchedule(s)
    ]).pipe(switchMap(((results: [Workspace[], Database[], Query[], Script[]]) => {
      let w: Workspace = results[0].find((w: Workspace) => (w.id === s.workspaceId));
      let db: Database = results[1].find((db: Database) => (db.id === w.databaseIdRef));
      let q: Query[] = results[2];
      q.map((q: Query) => {
        q.query = Functions.decrypt(q.query);
      });
      
      let scr: Script[] = results[3];
      scr.map((s: Script) => {
        s.script = Functions.decrypt(s.script);
      });
      
      if (db) db.password = Functions.decrypt(db.password);
      w.GDPassword = Functions.decrypt(w.GDPassword);
      
      let javaInput: JavaInputBuffer = {
        workspace: w,
        database: db,
        schedule: s,
        queries: q,
        scripts: scr
      }
      
      let params = Functions.encrypt(JSON.stringify(javaInput));
      
      return of(Execute.runAgent(params, s.id)).pipe(switchMap((b: boolean) => {
        s.lastExecution = new Date();
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.RUN_AGENT_EXECUTIONDATE(s.lastExecution), null, null, null);
        return Files2.saveSchedule(s).pipe(map((b: boolean) => {
          return b;
        }), catchError((err: any) => {
          Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.RUN_AGENT_ERROR(s.name), null, null, err);
          throw err;
        }));
      }));
    })));
  }
  
  /*******************/
  /*    QUERIES      */
  /*******************/
  public static getQueries(): Observable<Query[]> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_QUERY_MESSAGES.QUERY_LOADING, null, null, null);
    return this.readApplicationData().pipe(map((db: DatabaseData) => {
      return db.queries;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_QUERY_MESSAGES.QUERY_LOADING_ERROR, null, null, err);
      throw err;
    }));
  }
  
  public static getQueriesBySchedule(sc: Schedule): Observable<Query[]> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_QUERY_MESSAGES.QUERY_SCHEDULE_LOADING(sc.name), null, null, null);
    return this.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.queries.filter((query: Query) => {
        return (query.scheduleId === sc.id)
      });
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_QUERY_MESSAGES.QUERY_SCHEDULE_LOADING_ERROR, null, null, err);
      throw err;
    }));
  }
  
  public static saveQuery(q: Query): Observable<boolean> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_QUERY_MESSAGES.QUERY_SAVE(q.name), null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      if (q.id) {
        let index = _dbd.queries.findIndex((query: Query) => { return query.id === q.id; });
        _dbd.queries[index] = q;
      } else {
        q.id = this.findNextId(_dbd.queries);
        _dbd.queries.push(q);
      }
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_QUERY_MESSAGES.QUERY_SAVE_ERROR(q.name), null, null, err);
        throw err;
    }));
  }
  
  public static deleteQuery(q: Query): Observable<boolean> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_QUERY_MESSAGES.QUERY_DELETE(q.name), null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.queries.findIndex((query: Query) => { return query.id === q.id; });
      _dbd.queries.splice(index, 1);
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_QUERY_MESSAGES.QUERY_DELETE_ERROR(q.name), null, null, err);
        throw err;
    }));
  }
  
  /*******************/
  /*    SCRIPTS      */
  /*******************/
  public static getScripts(): Observable<Script[]> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCRIPT_MESSAGES.SCRIPT_LOADING, null, null, null);
    return this.readApplicationData().pipe(map((db: DatabaseData) => {
      return db.scripts;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCRIPT_MESSAGES.SCRIPT_LOADING_ERROR, null, null, err);
      throw err;
    }));
  }
  
  public static getScriptsBySchedule(sc: Schedule): Observable<Script[]> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCRIPT_MESSAGES.SCRIPT_SCHEDULE_LOADING(sc.name), null, null, null);
    return this.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.scripts.filter((script: Script) => {
        return (script.scheduleId === sc.id)
      });
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCRIPT_MESSAGES.SCRIPT_SCHEDULE_LOADING_ERROR, null, null, err);
      throw err;
    }));
  }
  
  public static saveScript(s: Script): Observable<boolean> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCRIPT_MESSAGES.SCRIPT_SAVE(s.name), null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      if (s.id) {
        let index = _dbd.scripts.findIndex((script: Script) => { return script.id === s.id; });
        _dbd.scripts[index] = s;
      } else {
        s.id = this.findNextId(_dbd.scripts);
        _dbd.scripts.push(s);
      }
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCRIPT_MESSAGES.SCRIPT_SAVE_ERROR(s.name), null, null, err);
        throw err;
    }));
  }
  
  public static deleteScript(s: Script): Observable<boolean> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCRIPT_MESSAGES.SCRIPT_DELETE(s.name), null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.scripts.findIndex((script: Script) => { return script.id === s.id; });
      _dbd.scripts.splice(index, 1);
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCRIPT_MESSAGES.SCRIPT_DELETE_ERROR(s.name), null, null, err);
        throw err;
    }));
  }
  
  /*******************/
  /*  CONFIGURAÇÃO   */
  /*******************/
  public static getConfiguration(): Observable<Configuration> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_CONFIGURATION_MESSAGES.CONFIG_LOADING, null, null, null);
    return this.readApplicationData().pipe(map((db: DatabaseData) => {
      return db.configuration;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_CONFIGURATION_MESSAGES.CONFIG_LOADING_ERROR, null, null, err);
      throw err;
    }));
  }
  
  public static saveConfiguration(conf: Configuration): Observable<boolean> {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_CONFIGURATION_MESSAGES.CONFIG_SAVE, null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      _dbd.configuration = conf;
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, CNST_CONFIGURATION_MESSAGES.CONFIG_SAVE_ERROR, null, null, err);
      throw err;
    }));
  }
  
  /*******************/
  /*   DIRETÓRIOS    */
  /*******************/
  public static getFolder(b: any): Observable<string> {
    return from(dialog.showOpenDialog(b,{
        title: Files2.CNST_MESSAGES.FOLDER_SELECT,
        properties: ['openDirectory']
    })).pipe(map((r: any) => {
      console.log(JSON.stringify(r));
      if (r.canceled) {
        return null;
      } else {
        return '' + r.filePaths[0];
      }
    }));
  }
  
  
  /*
  this._electronService.remote.
  
  
  
  /*
  public saveProject(p: Project): Observable<boolean> {
    if (p.id) {
      return this._http.put(this.getDataUrl() + '/projects/' + p.id, p).pipe(map(() => {
        return true;
      }));
    } else {
      return this._http.post(this.getDataUrl() + '/projects', p).pipe(map(() => {
        return true;
      }));
    }
  }
  */
  //public teste() {
  //  console.log('cheguei aqui');
 // }
  /*
  readApplicationData(): DatabaseData {
    
    db.read
    
    //logAgent = this.db.readFileSync( logAgentPath );
  }*/
  
  
//logAgent = fs.readFileSync( logAgentPath );
//fs.writeFileSync( globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/manual-${fileDate}.log', manualContent );
}
