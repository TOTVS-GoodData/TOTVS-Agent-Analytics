
import { Translations, TranslationInput } from './translations';

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

import uuid from 'uuid-v4';

import { DatabaseData, Workspace, Database, Schedule, Query, Script, Configuration, JavaInputBuffer } from '../src-angular/app/utilities/interfaces';

import { Observable, from, switchMap, map, of, catchError, forkJoin } from 'rxjs';

const myFormat = winston.format.printf(({ level, message, label, timestamp }) => {
  return `{ "timestamp":"${timestamp}", "sys":"${label}", "level":"[${level}]", "message": "${message}"}`;
});

export class Files2 {
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
    let translations: any = Translations.getTranslations([
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING_OK', []),
      new TranslationInput('ELECTRON.DELETE_OLD_LOGS', []),
      new TranslationInput('ELECTRON.DELETE_OLD_LOGS_OK', [])
    ]);
    
    this.getConfiguration(true).subscribe((conf: Configuration) => {
      let maxDate: Date = new Date();
      maxDate.setDate(new Date().getDate() - conf.logfilesToKeep);
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['CONFIGURATION.MESSAGES.LOADING_OK'], null, null, null);
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.DELETE_OLD_LOGS'], null, null, null);
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
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.DELETE_OLD_LOGS_OK'], null, null, null);
      });
    });
  }
  
  public static writeToLog(loglevel: any, system: string, message: string, execId: string, scheduleId: string, err: any): boolean {
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
        logs.pop();
      }
    });
    
    return logs;
  }
  
  /*******************/
  /*    DB.JSON      */
  /*******************/
  public static initApplicationData(language: string): void {
    let translations: any = Translations.getTranslations([
      new TranslationInput('ELECTRON.DATABASE_DEVELOPMENT', []),
      new TranslationInput('ELECTRON.DATABASE_PRODUCTION', []),
      new TranslationInput('ELECTRON.DATABASE_CREATE', []),
      new TranslationInput('ELECTRON.DATABASE_CREATE_OK', [])
    ]);
    
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
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.DATABASE_DEVELOPMENT'], null, null, null);
    } else if (fs.existsSync(globals.CNST_DATABASE_NAME)) {
      Files2.filepath = globals.CNST_DATABASE_NAME;
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.DATABASE_PRODUCTION'], null, null, null);
    } else {
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.DATABASE_CREATE'], null, null, null);
      fs.createFileSync(globals.CNST_DATABASE_NAME);
      fs.writeJsonSync(globals.CNST_DATABASE_NAME, new DatabaseData(), { spaces: 2, 'EOL': '\n' });
      Files2.filepath = globals.CNST_DATABASE_NAME;
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.DATABASE_CREATE_OK'], null, null, null);
    }
    
    if (!fs.existsSync(globals.CNST_TMP_PATH)) {
      fs.mkdirSync(globals.CNST_TMP_PATH);
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
    let translations: any = Translations.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.LOADING', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_ERROR', [])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.LOADING'], null, null, null);
    return this.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.workspaces;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static getWorkspacesByDatabase(db: Database): Observable<Workspace[]> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_DATABASES', [db.name]),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_DATABASES_ERROR', [])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.LOADING_DATABASES'], null, null, null);
    return this.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.workspaces.filter((w: Workspace) => {
        return (w.databaseIdRef === db.id)
      });
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.LOADING_DATABASES_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static saveWorkspace(w: Workspace): Observable<boolean> {
    let workspace_name: Workspace = null;
    let newId: boolean = false;
    let translations: any = Translations.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.SAVE', [w.name]),
      new TranslationInput('WORKSPACES.MESSAGES.SAVE_ERROR', [w.name]),
      new TranslationInput('WORKSPACES.MESSAGES.SAVE_ERROR_SAME_NAME', [w.name])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.SAVE'], null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      newId = (w.id == null);
      if (newId) w.id = uuid();
      workspace_name = _dbd.workspaces.filter((workspace: Workspace) => (workspace.id != w.id)).find((workspace: Workspace) => (workspace.name == w.name));
      if (workspace_name != undefined) {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.SAVE_ERROR_SAME_NAME'], null, null, null);
        return of(false);
      } else {
        if (newId) {
          _dbd.workspaces.push(w);
        } else {
          let index = _dbd.workspaces.findIndex((workspace: Workspace) => { return workspace.id === w.id; });
          _dbd.workspaces[index] = w;
        }
        
        return this.writeApplicationData(_dbd);
      }
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.SAVE_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static deleteWorkspace(w: Workspace): Observable<boolean> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.DELETE', [w.name]),
      new TranslationInput('WORKSPACES.MESSAGES.DELETE_ERROR', [w.name]),
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.DELETE'], null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.workspaces.findIndex((workspace: Workspace) => { return workspace.id === w.id; });
      _dbd.workspaces.splice(index, 1);
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.DELETE_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /*******************/
  /* BANCOS DE DADOS */
  /*******************/
  public static getDatabases(): Observable<Database[]> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.LOADING', []),
      new TranslationInput('DATABASES.MESSAGES.LOADING_ERROR', []),
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.LOADING'], null, null, null);
    return this.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.databases;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static saveDatabase(db: Database): Observable<boolean> {
    let db_name: Database = null;
    let newId: boolean = false;
    let translations: any = Translations.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.SAVE', [db.name]),
      new TranslationInput('DATABASES.MESSAGES.SAVE_ERROR', [db.name]),
      new TranslationInput('DATABASES.MESSAGES.SAVE_ERROR_SAME_NAME', [db.name]),
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.SAVE'], null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      newId = (db.id == null);
      if (newId) db.id = uuid();
      db_name = _dbd.databases.filter((database: Database) => (database.id != db.id)).find((database: Database) => (database.name == db.name));
      if (db_name != undefined) {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.SAVE_ERROR_SAME_NAME'], null, null, null);
        return of(false);
      } else {
        if (newId) {
          _dbd.databases.push(db);
        } else {
          let index = _dbd.databases.findIndex((database: Database) => { return database.id === db.id; });
          _dbd.databases[index] = db;
        }
      }
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.SAVE_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static deleteDatabase(db: Database): Observable<boolean> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.DELETE', [db.name]),
      new TranslationInput('DATABASES.MESSAGES.DELETE_ERROR', [db.name])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.DELETE'], null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.databases.findIndex((database: Database) => { return database.id === db.id; });
      _dbd.databases.splice(index, 1);
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.DELETE_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /*******************/
  /*  AGENDAMENTOS   */
  /*******************/
  public static getSchedules(showLogs: boolean): Observable<Schedule[]> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.LOADING', []),
      new TranslationInput('SCHEDULES.MESSAGES.LOADING_ERROR', [])
    ]);
    
    if (showLogs) Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.LOADING'], null, null, null);
    return this.readApplicationData().pipe(map((db: DatabaseData) => {
      return db.schedules;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static getSchedulesToExecute(): Observable<Schedule[]> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.TRIGGERSCHEDULES_LOADING', [Functions.formatDate(new Date())]),
      new TranslationInput('SCHEDULES.MESSAGES.TRIGGERSCHEDULES_ERROR', [])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.TRIGGERSCHEDULES_LOADING'], null, null, null);
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
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.TRIGGERSCHEDULES_LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static saveSchedule(sc: Schedule): Observable<boolean> {
    let schedule_name: Schedule = null;
    let newId: boolean = false;
    let translations: any = Translations.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.SAVE', [sc.name]),
      new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR', [sc.name]),
      new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME', [sc.name])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.SAVE'], null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      newId = (sc.id == null);
      if (newId) sc.id = uuid();
      schedule_name = _dbd.schedules.filter((schedule: Schedule) => (schedule.id != sc.id)).find((schedule: Schedule) => (schedule.name == sc.name));
      if (schedule_name != undefined) {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME'], null, null, null);
        return of(false);
      } else {
        if (newId) {
          _dbd.schedules.push(sc);
        } else {
          let index = _dbd.schedules.findIndex((schedule: Schedule) => { return schedule.id === sc.id; });
          _dbd.schedules[index] = sc;
        }
      }
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.SAVE_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static deleteSchedule(sc: Schedule): Observable<boolean> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.DELETE', [sc.name]),
      new TranslationInput('SCHEDULES.MESSAGES.DELETE_ERROR', [sc.name])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.DELETE'], null, null, null);
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
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.DELETE_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static executeAndUpdateSchedule(s: Schedule): Observable<boolean> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.RUN_PREPARE', [])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.RUN_PREPARE'], null, null, null);
    return forkJoin([
      Files2.getWorkspaces(),
      Files2.getDatabases(),
      Files2.getQueriesBySchedule(s),
      Files2.getScriptsBySchedule(s),
      Files2.getConfiguration(false)
    ]).pipe(switchMap(((results: [Workspace[], Database[], Query[], Script[], Configuration]) => {
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
        scripts: scr,
        configuration: results[4]
      }
      
      let params = Functions.encrypt(JSON.stringify(javaInput));
      
      return Execute.runAgent(params, s.id).pipe(switchMap((b: boolean) => {
        let translations2: any = Translations.getTranslations([
          new TranslationInput('SCHEDULES.MESSAGES.RUN_EXECUTIONDATE', [s.lastExecution + '']),
          new TranslationInput('SCHEDULES.MESSAGES.RUN_ERROR', [s.name])
        ]);
        
        s.lastExecution = new Date();
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations2['SCHEDULES.MESSAGES.RUN_EXECUTIONDATE'], null, null, null);
        return Files2.saveSchedule(s).pipe(map((b: boolean) => {
          return b;
        }), catchError((err: any) => {
          Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations2['SCHEDULES.MESSAGES.RUN_ERROR'], null, null, err);
          throw err;
        }));
      }));
    })));
  }
  
  /*******************/
  /*    QUERIES      */
  /*******************/
  public static getQueries(): Observable<Query[]> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.LOADING', []),
      new TranslationInput('QUERIES.MESSAGES.LOADING_ERROR', [])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.LOADING'], null, null, null);
    return this.readApplicationData().pipe(map((db: DatabaseData) => {
      return db.queries;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static getQueriesBySchedule(sc: Schedule): Observable<Query[]> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING', [sc.name]),
      new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING_ERROR', [])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SCHEDULE_LOADING'], null, null, null);
    return this.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.queries.filter((query: Query) => {
        return (query.scheduleId === sc.id)
      });
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SCHEDULE_LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static saveQuery(q: Query): Observable<boolean> {
    let query_name: Query = null;
    let newId: boolean = false;
    let translations: any = Translations.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.SAVE', [q.name]),
      new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR', [q.name]),
      new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR_SAME_NAME', [q.name])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SAVE'], null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      newId = (q.id == null);
      if (newId) q.id = uuid();
      query_name = _dbd.queries.filter((query: Query) => (query.id != q.id)).find((query: Query) => (query.name == q.name));
      if (query_name != undefined) {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SAVE_ERROR_SAME_NAME'], null, null, null);
        return of(false);
      } else {
        if (newId) {
          _dbd.queries.push(q);
        } else {
          let index = _dbd.queries.findIndex((query: Query) => { return query.id === q.id; });
          _dbd.queries[index] = q;
        }
      }
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SAVE_ERROR'], null, null, err);
        throw err;
    }));
  }
  
  public static deleteQuery(q: Query): Observable<boolean> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('QUERIES.MESSAGES.DELETE', [q.name]),
      new TranslationInput('QUERIES.MESSAGES.DELETE_ERROR', [q.name])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.DELETE'], null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.queries.findIndex((query: Query) => { return query.id === q.id; });
      _dbd.queries.splice(index, 1);
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.DELETE_ERROR'], null, null, err);
        throw err;
    }));
  }
  
  /*******************/
  /*    SCRIPTS      */
  /*******************/
  public static getScripts(): Observable<Script[]> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.LOADING', []),
      new TranslationInput('SCRIPTS.MESSAGES.LOADING_ERROR', [])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.LOADING'], null, null, null);
    return this.readApplicationData().pipe(map((db: DatabaseData) => {
      return db.scripts;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static getScriptsBySchedule(sc: Schedule): Observable<Script[]> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.SCHEDULE_LOADING', [sc.name]),
      new TranslationInput('SCRIPTS.MESSAGES.SCHEDULE_LOADING_ERROR', [])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SCHEDULE_LOADING'], null, null, null);
    return this.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.scripts.filter((script: Script) => {
        return (script.scheduleId === sc.id)
      });
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SCHEDULE_LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static saveScript(s: Script): Observable<boolean> {
    let script_name: Script = null;
    let newId: boolean = false;
    let translations: any = Translations.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.SAVE', [s.name]),
      new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME', [s.name]),
      new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME', [s.name])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SAVE'], null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      newId = (s.id == null);
      if (newId) s.id = uuid();
      script_name = _dbd.scripts.filter((script: Script) => (script.id != s.id)).find((script: Script) => (script.name == s.name));
      if (script_name != undefined) {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME'], null, null, null);
        return of(false);
      } else {
        if (newId) {
          _dbd.scripts.push(s);
        } else {
          let index = _dbd.scripts.findIndex((script: Script) => { return script.id === s.id; });
          _dbd.scripts[index] = s;
        }
      }
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SAVE_ERROR'], null, null, err);
        throw err;
    }));
  }
  
  public static deleteScript(s: Script): Observable<boolean> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('SCRIPTS.MESSAGES.DELETE', [s.name]),
      new TranslationInput('SCRIPTS.MESSAGES.DELETE_ERROR', [s.name])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.DELETE'], null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.scripts.findIndex((script: Script) => { return script.id === s.id; });
      _dbd.scripts.splice(index, 1);
      
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.ERROR'], null, null, err);
        throw err;
    }));
  }
  
  /*******************/
  /*  CONFIGURAÇÃO   */
  /*******************/
  public static getConfiguration(showLogs): Observable<Configuration> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING', []),
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING_ERROR', [])
    ]);
    if (showLogs) Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['CONFIGURATION.MESSAGES.LOADING'], null, null, null);
    
    return this.readApplicationData().pipe(map((db: DatabaseData) => {
      let conf: Configuration = new Configuration(
        db.configuration.logfilesToKeep,
        db.configuration.debug,
        db.configuration.javaXmx,
        db.configuration.javaTmpDir,
        db.configuration.locale
      );
      conf.javaJREDir = db.configuration.javaJREDir;
      return conf;
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['CONFIGURATION.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  public static saveConfiguration(conf: Configuration): Observable<boolean> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE_ERROR', [])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['CONFIGURATION.MESSAGES.SAVE'], null, null, null);
    return this.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      _dbd.configuration = conf;
      Translations.use(conf.locale);
      return this.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['CONFIGURATION.MESSAGES.SAVE_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /*******************/
  /*   DIRETÓRIOS    */
  /*******************/
  public static getFolder(b: any): Observable<string> {
    let translations: any = Translations.getTranslations([
      new TranslationInput('ELECTRON.FOLDER_SELECT', [])
    ]);
    
    return from(dialog.showOpenDialog(b,{
        title: translations['ELECTRON.FOLDER_SELECT'],
        properties: ['openDirectory']
    })).pipe(map((r: any) => {
      if (r.canceled) {
        return null;
      } else {
        return '' + r.filePaths[0];
      }
    }));
  }
}
