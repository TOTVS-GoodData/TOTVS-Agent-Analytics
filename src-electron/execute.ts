import * as os from 'os';
import * as globals from './constants-electron';
import * as constants from '../src-angular/app/utilities/constants-angular';
import { Query } from '../src-angular/app/utilities/interfaces';
import * as childProcess from 'child_process';

import { Files2 } from './files2';

export class JavaOutputBuffer {
  timestamp: string;
  level: number;
  message_string: string;
  message_json: any;
}

import { Observable, from, switchMap, map, of } from 'rxjs';

export class Execute {
  private static CNST_MESSAGES: any = {
     DATABASE_LOGIN_ELEC_START: 'Solicitando teste de conexão ao java...'
    ,DATABASE_LOGIN_ELEC_FINISH: (exec: string) => `Teste de conexão do java finalizado. Status de execução: ${exec}`
    ,EXPORT_QUERY_ELEC_START: 'Solicitando exportação de consultas da tabela I01 ao java...'
    ,EXPORT_QUERY_ELEC_FINISH: (exec: string) => `Exportação de consultas da tabela I01 finalizada. Status de execução: ${exec}`
    ,RUN_AGENT_ELEC_START: 'Solicitando extração de dados ao java...'
    ,RUN_AGENT_ELEC_FINISH: (exec: string) => `Extração dos dados finalizada. Status de execução: ${exec}`
  };
  
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

  public setService(call: string): boolean {
    switch (os.platform()) {
      case('win32'):
        return this.setServiceOnWindows(call);
        break;
      case('linux'):
        return this.setServiceOnLinux(call);
        break;
    }
  }
  
  public setServiceOnWindows(operation: string): boolean {
    let batFilePath = globals.CNST_PROGRAM_PATH + '\\schedule\\windows\\${operation}.bat';
    batFilePath = batFilePath.split(' ').join('^ ');
    
    const child = childProcess.spawnSync('cmd.exe', ['/c', batFilePath]);
    return (child.status === 0);
  }
  
  public setServiceOnLinux(operation: string): boolean {
    return true;
  }
  
  public getServiceStatus(): Observable<string> {
    let command: string = null;
    switch (os.platform()) {
      case('win32'):
        command = 'sc query ' + constants.CNST_SERVICE_NAME + '|' +
                  'find "' + constants.CNST_SERVICE_LINUX_EXECUTION_NAME + '"';
        break;
      case('linux'):
        command = 'systemctl status ' + constants.CNST_SERVICE_NAME + '|' +
                  'grep "' + constants.CNST_SERVICE_LINUX_EXECUTION_NAME + '"';
        break;
    }
    
    return new Observable<string>((subscriber) => {
      childProcess.exec(command, (err: Error, stdout: string, stderr: string) => {
        if ((err) || (stdout.length == 0)) {
          subscriber.next(constants.CNST_SERVICE_OFFLINE);
        } else {
          subscriber.next(constants.CNST_SERVICE_ONLINE);
        }
        subscriber.complete();
      });
    });
  }
  
  private static concatStdoutBuffer(buffer: string, execId: number, scheduleId: number, parseFunction: any): void {
    Execute.stdout_inputBuffer += buffer;
    Execute.stdout_start_index = Execute.stdout_inputBuffer.indexOf(Execute.CNST_BUFFER_BEGIN, Execute.stdout_position);
    Execute.stdout_final_index = Execute.stdout_inputBuffer.indexOf(Execute.CNST_BUFFER_END, Execute.stdout_position);
    
    if (Execute.stdout_final_index > Execute.stdout_position) {
      Execute.stdout_position = Execute.stdout_final_index + Execute.CNST_BUFFER_END_SIZE;
      Execute.parseJavaOutputBuffer(Execute.stdout_inputBuffer.substring(Execute.stdout_start_index + Execute.CNST_BUFFER_BEGIN_SIZE, Execute.stdout_final_index), execId, scheduleId, parseFunction);
    }
  }
  
  private static concatStderrBuffer(buffer: string, execId: number, scheduleId: number, parseFunction: any): void {
    Execute.stderr_inputBuffer += buffer;
    Execute.stderr_start_index = Execute.stderr_inputBuffer.indexOf(Execute.CNST_BUFFER_BEGIN, Execute.stderr_position);
    Execute.stderr_final_index = Execute.stderr_inputBuffer.indexOf(Execute.CNST_BUFFER_END, Execute.stderr_position);
    
    if (Execute.stderr_final_index > Execute.stderr_position) {
      Execute.stderr_position = Execute.stderr_final_index + Execute.CNST_BUFFER_END_SIZE;
      Execute.parseJavaOutputBuffer(Execute.stderr_inputBuffer.substring(Execute.stderr_start_index + Execute.CNST_BUFFER_BEGIN_SIZE, Execute.stderr_final_index), execId, scheduleId, parseFunction);
    }
  }
  
  private static parseJavaOutputBuffer(buffer: string, execId: number, scheduleId: number, parseFunction: any): void {
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
  
  public testDatabaseConnection(inputBuffer: string): Observable<any> {
    let err: string = null;
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Execute.CNST_MESSAGES.DATABASE_LOGIN_ELEC_START, null, null, null);
    let child = childProcess.spawn('java', ['-classpath', globals.CNST_PROGRAM_PATH_JAR_FAST, constants.CNST_PROGRAM_JDBC_CLASS, inputBuffer]);
    
    return new Observable<any>((subscriber) => {
      
      child.stdout.on('data', (stdOutputBuffer: string) => {
        Execute.concatStdoutBuffer(stdOutputBuffer, null, null, null);
      });
      
      child.stderr.on('data', (stdErrorBuffer: string) => {
        Execute.concatStderrBuffer(stdErrorBuffer, null, null, null);
        try {
          let obj: JavaOutputBuffer = JSON.parse(stdErrorBuffer);
          err = obj.message_string;
        }
        catch (ex) {}
      });
      
      child.on('close', (statusCode: number) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Execute.CNST_MESSAGES.DATABASE_LOGIN_ELEC_FINISH(statusCode), null, null, null);
        let res = {
          success: (statusCode == 0 ? true : false),
          err: err
        };
        
        Execute.stderr_inputBuffer = '';
        Execute.stderr_start_index = 0;
        Execute.stderr_final_index = 0;
        Execute.stderr_position = -1;
        
        Execute.stdout_inputBuffer = '';
        Execute.stdout_start_index = 0;
        Execute.stdout_final_index = 0;
        Execute.stdout_position = -1;
        
        subscriber.next(res);
        subscriber.complete();
      });
    });
  }
  
  public exportQuery(inputBuffer: string): Observable<any> {
    let err: string = null;
    
    Execute.exportQuerybuffer = [];
    Execute.stdout_inputBuffer = "";
    Execute.stdout_start_index = 0;
    Execute.stdout_final_index = 0;
    Execute.stdout_position = -1;
    
    Execute.stderr_inputBuffer = "";
    Execute.stderr_start_index = 0;
    Execute.stderr_final_index = 0;
    Execute.stderr_position = -1;
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Execute.CNST_MESSAGES.EXPORT_QUERY_ELEC_START, null, null, null);
    let child = childProcess.spawn('java', ['-classpath', globals.CNST_PROGRAM_PATH_JAR_FAST, constants.CNST_PROGRAM_EXPORT_CLASS, inputBuffer]);
    return new Observable<any>((subscriber) => {
      
      child.stdout.on('data', (stdOutputBuffer: string) => {
        Execute.concatStdoutBuffer(stdOutputBuffer, null, null, (obj: any) => {
          try {
            let q: Query = obj;
            Execute.exportQuerybuffer.push(q);
          } catch(ex) {
            console.log(ex);
          }
        });
      });
      
      child.stderr.on('data', (stdErrorBuffer: string) => {
        Execute.concatStderrBuffer(stdErrorBuffer, null, null, null);
        try {
          let obj: JavaOutputBuffer = JSON.parse(stdErrorBuffer);
          err = obj.message_string;
        }
        catch (ex) {}
      });
      
      child.on('close', (statusCode: number) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Execute.CNST_MESSAGES.EXPORT_QUERY_ELEC_FINISH(statusCode), null, null, null);
        let res = {
          success: (statusCode == 0 ? true : false),
          err: err,
          message: Execute.exportQuerybuffer
        };
        
        subscriber.next(res);
        subscriber.complete();
      });
    });
  }
  
  public static runAgent(inputBuffer: string, scheduleId: number): boolean {
    let err: string = null;
    let execId: number = Math.floor(Math.random() * 1000);
    
    console.log('<<AGENT>>>');
    console.log(inputBuffer);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Execute.CNST_MESSAGES.RUN_AGENT_ELEC_START, execId, scheduleId, null);
    let child = childProcess.spawn('java', ['-classpath', globals.CNST_PROGRAM_PATH_JAR_FAST, 'com.gooddata.agent.Main', inputBuffer]);
    
    child.stdout.on('data', (stdOutputBuffer: string) => {
      Execute.concatStdoutBuffer(stdOutputBuffer, execId, scheduleId, (obj: any) => {
        
      });
    });
    
    child.stderr.on('data', (stdErrorBuffer: string) => {
      Execute.concatStderrBuffer(stdErrorBuffer, execId, scheduleId, null);
      try {
        let obj: JavaOutputBuffer = JSON.parse(stdErrorBuffer);
        err = obj.message_string;
      }
      catch (ex) {}
    });
    
    child.on('close', (statusCode: number) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Execute.CNST_MESSAGES.RUN_AGENT_ELEC_FINISH(statusCode), execId, scheduleId, null);
    });
    
    return true;
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
}