import * as os from 'os';
import * as path from 'path';
import * as globals from './constants-electron';
import * as constants from '../src-angular/app/utilities/constants-angular';
import { Query, Configuration } from '../src-angular/app/utilities/interfaces';
import * as childProcess from 'child_process';
import { Translations, TranslationInput } from './translations';

import { Files2 } from './files2';
import * as fs from 'fs-extra';

export class JavaProcess {
  childRef: any;
  scheduleId: string;
  execId: string;
  
  constructor(child: any, scheduleId: string, execId: string) {
    this.childRef = child;
    this.scheduleId = scheduleId;
    this.execId = execId;
  }
}

export class JavaOutputBuffer {
  timestamp: string;
  level: number;
  message_string: string;
  message_json: any;
}

import { Observable, from, switchMap, map, of } from 'rxjs';

export class Execute {
  private static exportQuerybuffer: Array<Query> = [];
  private static stdout_inputBuffer: string = '';
  private static stdout_start_index: number = 0;
  private static stdout_final_index: number = 0;
  private static stdout_position: number = -1;
  private static stderr_inputBuffer: string = '';
  private static stderr_start_index: number = 0;
  private static stderr_final_index: number = 0;
  private static stderr_position: number = -1;
  private static CNST_BUFFER_BEGIN: string = '<buffer>';
  private static CNST_BUFFER_BEGIN_SIZE: number = 8;
  private static CNST_BUFFER_END: string = '</buffer>';
  private static CNST_BUFFER_END_SIZE: number = 9;
  private static processes: JavaProcess[] = [];
  
  private static parseJavaOutputBuffer(buffer: string, execId: string, scheduleId: string, parseFunction: any): void {
    buffer = buffer.toString();
    if (buffer.endsWith(globals.CNST_OS_LINEBREAK())) buffer = buffer.substring(0, buffer.toString().length - 1);
    if (buffer.startsWith(globals.CNST_OS_LINEBREAK())) buffer = buffer.substring(1, buffer.toString().length);
    try {
      let obj: JavaOutputBuffer = JSON.parse(buffer);
      let loglevel = Object.getOwnPropertyNames.call(Object, constants.CNST_LOGLEVEL).map((p: string) => {
        return constants.CNST_LOGLEVEL[p];
      }).find((loglevel: any) => { return (loglevel.level == obj.level); });
      if (obj.message_json) {
        Files2.writeToLog(loglevel, constants.CNST_SYSTEMLEVEL.JAVA, JSON.stringify(obj.message_json), execId, scheduleId, null);
        parseFunction(obj.message_json);
      } else Files2.writeToLog(loglevel, constants.CNST_SYSTEMLEVEL.JAVA, obj.message_string, execId, scheduleId, null);
    } catch (ex) {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.JAVA, null, execId, scheduleId, buffer);
    }
  }
  
  public static parseJavaBuffer(child: any, message: string, execId: string, scheduleId: string, parseFunction: any) {
    let obs_stdOutputBuffer: string = null;
    let obs_stdOutputStartIndex: number = 0;
    let obs_stdOutputFinalIndex: number = 0;
    let obs_stdOutputPosition: number = 0;
    
    let obs_stdErrorBuffer: string = null;
    let obs_stdErrorStartIndex: number = 0;
    let obs_stdErrorFinalIndex: number = 0;
    let obs_stdErrorPosition: number = 0;
    
    child.stdout.on('data', (stdOutputBuffer: string) => {
      obs_stdOutputBuffer += stdOutputBuffer;
      obs_stdOutputStartIndex = obs_stdOutputBuffer.indexOf(Execute.CNST_BUFFER_BEGIN, obs_stdOutputPosition);
      obs_stdOutputFinalIndex = obs_stdOutputBuffer.indexOf(Execute.CNST_BUFFER_END, obs_stdOutputPosition);
      if (obs_stdOutputFinalIndex > obs_stdOutputPosition) {
        obs_stdOutputPosition = obs_stdOutputFinalIndex + Execute.CNST_BUFFER_END_SIZE;
        Execute.parseJavaOutputBuffer(
          obs_stdOutputBuffer.substring(obs_stdOutputStartIndex + Execute.CNST_BUFFER_BEGIN_SIZE, obs_stdOutputFinalIndex),
          execId,
          scheduleId,
          parseFunction
        );
      }
    });
    
    child.stderr.on('data', (stdErrorBuffer: string) => {
      obs_stdErrorBuffer += stdErrorBuffer;
      obs_stdErrorStartIndex = obs_stdErrorBuffer.indexOf(Execute.CNST_BUFFER_BEGIN, obs_stdErrorPosition);
      obs_stdErrorFinalIndex = obs_stdErrorBuffer.indexOf(Execute.CNST_BUFFER_END, obs_stdErrorPosition);
      if (obs_stdErrorFinalIndex > obs_stdErrorPosition) {
        obs_stdErrorPosition = obs_stdErrorFinalIndex + Execute.CNST_BUFFER_END_SIZE;
        Execute.parseJavaOutputBuffer(
          obs_stdErrorBuffer.substring(obs_stdErrorStartIndex + Execute.CNST_BUFFER_BEGIN_SIZE, obs_stdErrorFinalIndex),
          execId,
          scheduleId,
          null
        );
      }
    });
    
    child.on('close', (statusCode: number) => {
      let translations: any = Translations.getTranslations([
        new TranslationInput(message, [statusCode + ''])
      ]);
      
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations[message], null, null, null);
    });
  }
  
  public testDatabaseConnection(inputBuffer: string): Observable<any> {
    let err: string = null;
    let translations: any = Translations.getTranslations([
      new TranslationInput('ELECTRON.DATABASE_LOGIN_ELEC_START', [])
    ]);
    
    console.log('<<AGENT>>>');
    console.log(inputBuffer);
    
    return Files2.getConfiguration(true).pipe(switchMap((conf: Configuration) => {
      let commandPath: string = path.join(conf.javaTmpDir, globals.CNST_COMMAND_FILE);
      let language: string = conf.getLocaleLanguage();
      let country: string = conf.getLocaleCountry();
      fs.writeFile(commandPath, inputBuffer);
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.DATABASE_LOGIN_ELEC_START'], null, null, null);
      let child = childProcess.spawn((conf.javaJREDir == null ? 'java' : path.join(conf.javaJREDir, 'java.exe')), ['-Duser.language=' + language, '-Duser.country=' + country, '-Xmx'+ conf.javaXmx + 'm', '-Djava.io.tmpdir=' + conf.javaTmpDir, '-classpath', globals.CNST_PROGRAM_PATH_JAR_FAST, constants.CNST_PROGRAM_JDBC_CLASS, commandPath]);
      return new Observable<any>((subscriber) => {
        Execute.parseJavaBuffer(child, 'ELECTRON.DATABASE_LOGIN_ELEC_FINISH', null, null, null);
        child.stderr.on('data', (stdErrorBuffer: string) => {
          try {
            let obj: JavaOutputBuffer = JSON.parse(stdErrorBuffer);
            err = obj.message_string;
          }
          catch (ex) {}
        });
        
        child.on('close', (statusCode: number) => {
          let res = {
            success: (statusCode == 0 ? true : false),
            err: err
          };
          
          subscriber.next(res);
          subscriber.complete();
        });
      });
    }));
  }
  
  public exportQuery(inputBuffer: string): Observable<any> {
    let err: string = null;
    let translations: any = Translations.getTranslations([
      new TranslationInput('ELECTRON.EXPORT_QUERY_ELEC_START', [])
    ]);
    
    console.log('<<AGENT>>>');
    console.log(inputBuffer);
    
    return Files2.getConfiguration(true).pipe(switchMap((conf: Configuration) => {
      let commandPath: string = path.join(conf.javaTmpDir, globals.CNST_COMMAND_FILE);
      let language: string = conf.getLocaleLanguage();
      let country: string = conf.getLocaleCountry();
      fs.writeFile(commandPath, inputBuffer);
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.EXPORT_QUERY_ELEC_START'], null, null, null);
      let child = childProcess.spawn((conf.javaJREDir == null ? 'java' : path.join(conf.javaJREDir, 'java.exe')), ['-Duser.language=' + language, '-Duser.country=' + country, '-Xmx'+ conf.javaXmx + 'm', '-Djava.io.tmpdir=' + conf.javaTmpDir, '-classpath', globals.CNST_PROGRAM_PATH_JAR_FAST, constants.CNST_PROGRAM_EXPORT_CLASS, commandPath]);
      return new Observable<any>((subscriber) => {
        Execute.parseJavaBuffer(child, 'ELECTRON.EXPORT_QUERY_ELEC_FINISH', null, null, (obj: any) => {
          try {
            let q: Query = obj;
            Execute.exportQuerybuffer.push(q);
          } catch(ex) {
            console.log(ex);
          }
        });
        
        
        child.stderr.on('data', (stdErrorBuffer: string) => {
          try {
            let obj: JavaOutputBuffer = JSON.parse(stdErrorBuffer);
            err = obj.message_string;
          }
          catch (ex) {
            console.log(ex);
          }
        });
        
        child.on('close', (statusCode: number) => {
          let res = {
            success: (statusCode == 0 ? true : false),
            err: err,
            message: Execute.exportQuerybuffer
          };
          
          subscriber.next(res);
          subscriber.complete();
        });
      });
    }));
  }
  
  public static runAgent(inputBuffer: string, scheduleId: string): Observable<boolean> {
    let err: string = null;
    let execId: string = Math.floor(Math.random() * 1000) + '';
    let translations: any = Translations.getTranslations([
      new TranslationInput('ELECTRON.RUN_AGENT_ELEC_START', [])
    ]);
    
    console.log('<<AGENT>>>');
    console.log(inputBuffer);
    
    return Files2.getConfiguration(true).pipe(switchMap((conf: Configuration) => {
      let commandPath: string = path.join(conf.javaTmpDir, globals.CNST_COMMAND_FILE);
      let language: string = conf.getLocaleLanguage();
      let country: string = conf.getLocaleCountry();
      fs.writeFile(commandPath, inputBuffer);
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.RUN_AGENT_ELEC_START'], execId, scheduleId, null);
      let child = childProcess.spawn((conf.javaJREDir == null ? 'java' : path.join(conf.javaJREDir, 'java.exe')), ['-Duser.language=' + language, '-Duser.country=' + country, '-Xmx' + conf.javaXmx + 'm', '-Djava.io.tmpdir=' + conf.javaTmpDir, '-classpath', globals.CNST_PROGRAM_PATH_JAR_FAST, 'com.gooddata.agent.Main', commandPath]);
      Execute.processes.push(new JavaProcess(child, scheduleId, execId));
      return new Observable<any>((subscriber) => {
        Execute.parseJavaBuffer(child, 'ELECTRON.RUN_AGENT_ELEC_FINISH', execId, scheduleId, null);
        
        child.stderr.on('data', (stdErrorBuffer: string) => {
          try {
            let obj: JavaOutputBuffer = JSON.parse(stdErrorBuffer);
            err = obj.message_string;
          }
          catch (ex) {}
        });
        
        child.on('close', (statusCode: number) => {
          Execute.processes = Execute.processes.filter((jp: JavaProcess) => ((jp.scheduleId == scheduleId) && (jp.execId == execId)));
        });
        
        subscriber.next(true);
        subscriber.complete();
      });
    }));
  }
  
  public checkToken(token: string): Observable<any> {
    return new Observable<any>((subscriber) => {
      let child = childProcess.spawnSync('java', ['-classpath', globals.CNST_PROGRAM_PATH_JAR_FAST, constants.CNST_PROGRAM_TOKEN_CLASS, token]);
      let res = {
        success: (child.status === 0),
        err: child.stderr.toString()
      };
      subscriber.next(res);
      subscriber.complete();
    });
  }
  
  public killProcess(scheduleId: string, execId: string): number {
    let translations: any = Translations.getTranslations([
      new TranslationInput('ELECTRON.PROCESS_KILL', [scheduleId, execId]),
      new TranslationInput('ELECTRON.PROCESS_KILL_OK', [scheduleId, execId]),
      new TranslationInput('ELECTRON.JAVA_EXECUTION_CANCELLED', []),
      new TranslationInput('ELECTRON.PROCESS_KILL_WARN', [scheduleId, execId]),
      new TranslationInput('ELECTRON.PROCESS_KILL_ERROR', [scheduleId, execId])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.PROCESS_KILL'], null, null, null);
    let process: JavaProcess = Execute.processes.find((jp: JavaProcess) => ((jp.scheduleId == scheduleId) && (jp.execId == execId)));
    
    if (process) {
      if (process.childRef.kill('SIGTERM')) {
        Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.JAVA, translations['ELECTRON.JAVA_EXECUTION_CANCELLED'], execId, scheduleId, null);
        Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.PROCESS_KILL_OK'], null, null, null);
        Execute.processes = Execute.processes.filter((jp: JavaProcess) => ((jp.scheduleId = scheduleId) && (jp.execId = execId)));
        return 1;
      } else {
        Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.PROCESS_KILL_ERROR'], null, null, null);
        return 0;
      }
    } else {
      Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.JAVA, translations['ELECTRON.JAVA_EXECUTION_CANCELLED'], execId, scheduleId, null);
      Files2.writeToLog(constants.CNST_LOGLEVEL.WARN, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.PROCESS_KILL_WARN'], null, null, null);
      Execute.processes = Execute.processes.filter((jp: JavaProcess) => ((jp.scheduleId = scheduleId) && (jp.execId = execId)));
      return 2;
    }
  }
}