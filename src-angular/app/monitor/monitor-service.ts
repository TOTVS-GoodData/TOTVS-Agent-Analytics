import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { AgentLog, AgentLogMessage, Schedule, Configuration } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';

import { ScheduleService } from '../schedule/schedule-service';
import { ConfigurationService } from '../configuration/configuration-service';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

import { map, switchMap } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';

@Injectable()
export class MonitorService {
  constructor(
     private _electronService: ElectronService
    ,private _scheduleService: ScheduleService
    ,private _configurationService: ConfigurationService
    ,private _translateService: TranslationService
  ) {}
  
  public getMonitorLog(): Observable<AgentLog[]> {
    let agentSets: Set<any> = new Set();
    let agentLogMessages: Array<AgentLogMessage> = [];
    let agentLog: Array<any> = [];
    let lastMessage: any = null;
    
    return forkJoin([
      this._scheduleService.getSchedules(false),
      this._configurationService.getConfiguration(false),
      this._translateService.getTranslations([
        new TranslationInput('ELECTRON.JAVA_EXECUTION_START', []),
        new TranslationInput('ELECTRON.JAVA_EXECUTION_END', []),
        new TranslationInput('ELECTRON.JAVA_EXECUTION_DURATION', []),
        new TranslationInput('ELECTRON.JAVA_EXECUTION_CANCELLED', []),
      ])
    ]).pipe(map((results: [Schedule[], Configuration, any]) => {
      this._electronService.ipcRenderer.sendSync('readLogs').map((log: string) => {
        try {console.log(log);
          let messages: any = JSON.parse(log);
          if ((messages.execId != null) && (messages.scheduleId != null)) {
            messages.str_timestamp = messages.timestamp;
            messages.timestamp = new Date('' + messages.timestamp);
            agentLogMessages.push(messages);
            lastMessage = messages;
          }
        } catch (ex) {
          agentLogMessages.push(new AgentLogMessage(lastMessage.timestamp, lastMessage.str_timestamp, _constants.CNST_LOGLEVEL.ERROR.tag, lastMessage.system, log, lastMessage.level, lastMessage.execId, lastMessage.scheduleId));
        }
      });
      
      return agentLogMessages.filter((message1: AgentLogMessage) => {
        let check: boolean = agentSets.has(message1.scheduleId + '|' + message1.execId);
        agentSets.add(message1.scheduleId + '|' + message1.execId);
        return !check;
      }).map((message2: AgentLogMessage)=> {
        let filteredMessages: Array<AgentLogMessage> = agentLogMessages
          .filter((message3: AgentLogMessage) => ((message2.scheduleId == message3.scheduleId) && (message2.execId == message3.execId)))
          .sort((a: AgentLogMessage, b: AgentLogMessage) => (a.timestamp.getTime() - b.timestamp.getTime()));
        
        let startDateJava: string = this.findRegex(filteredMessages, results[2]['ELECTRON.JAVA_EXECUTION_START'], 1);
        let endDateJava: string = this.findRegex(filteredMessages, results[2]['ELECTRON.JAVA_EXECUTION_END'], 1);
        let durationJava: string = this.findRegex(filteredMessages, results[2]['ELECTRON.JAVA_EXECUTION_DURATION'], 1);
        let stopped: string = this.findRegex(filteredMessages, results[2]['ELECTRON.JAVA_EXECUTION_CANCELLED']);
        
        let hasErrors: boolean = (filteredMessages.find((message2: AgentLogMessage) => (message2.loglevel == _constants.CNST_LOGLEVEL.ERROR.tag)) != null ? true : false);
        filteredMessages = filteredMessages.filter((message2: AgentLogMessage) => (results[1].debug || (message2.loglevel != _constants.CNST_LOGLEVEL.DEBUG.tag)));
        let status: number = this.setExecutionStatus(stopped, hasErrors, endDateJava);
        
        return {
           scheduleId: message2.scheduleId
          ,scheduleName: results[0].filter((schedule: Schedule) => (schedule.id == message2.scheduleId))[0].name
          ,scheduleLines: filteredMessages.length
          ,execId: message2.execId
          ,startDate: (startDateJava != null ? new Date(startDateJava) : filteredMessages[0].timestamp)
          ,str_startDate: startDateJava
          ,endDate: (endDateJava != null ? new Date(endDateJava) : null)
          ,str_endDate: endDateJava
          ,duration: (durationJava != null ? durationJava : null)
          ,messages: filteredMessages
          ,status: status
          ,terminate: (((stopped != null) || (endDateJava != null)) ? null : 'po-icon po-icon-close')
        };
        
      }).sort((a: AgentLog, b: AgentLog) => (b.startDate.getTime() - a.startDate.getTime()));
    }));
  }
  
  private setExecutionStatus(stopped: string, hasErrors: boolean, endDate: string): number {
    if (stopped) return _constants.CNST_LOGLEVEL.DEBUG.level;
    else if (hasErrors) return _constants.CNST_LOGLEVEL.ERROR.level;
    else if (endDate == null) return _constants.CNST_LOGLEVEL.WARN.level;
    else return _constants.CNST_LOGLEVEL.INFO.level;
    return 0;
  }
  
  private findRegex(lines: Array<AgentLogMessage>, regex: string, match?: number): string {
    let regExp = new RegExp(regex);
    let obj: AgentLogMessage = lines.find((line: AgentLogMessage) => {
      return regExp.test(line.message);
    });
    
    if (obj != null) {
      if (match != undefined) {
        let resultSets: any = obj.message.match(regExp);
        return resultSets[match];
      } else {
        return obj.message;
      }
    } else {
      return null;
    }
  }
}