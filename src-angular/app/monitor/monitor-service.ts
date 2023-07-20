import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { AgentLog, AgentLogMessage, Schedule, Configuration } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';

import { ScheduleService } from '../schedule/schedule-service';
import { ConfigurationService } from '../configuration/configuration-service';

import { map, switchMap } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';

@Injectable()
export class MonitorService {
  constructor(
     private _electronService: ElectronService
    ,private _scheduleService: ScheduleService
    ,private _configurationService: ConfigurationService
  ) {}
  
  public getMonitorLog(): Observable<AgentLog[]> {
    let agentSets: Set<any> = new Set();
    let agentLogMessages: Array<AgentLogMessage> = [];
    let agentLog: Array<any> = [];
    let lastMessage: any = null;
    
    return forkJoin([
       this._scheduleService.getSchedules(true)
      ,this._configurationService.getConfiguration()
      ]).pipe(map((results: [Schedule[], Configuration]) => {
      this._electronService.ipcRenderer.sendSync('readLogs').map((log: string) => {
        try {
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
      }).map((message2: AgentLogMessage) => {
        let filteredMessages: Array<AgentLogMessage> = agentLogMessages
          .filter((message3: AgentLogMessage) => ((message2.scheduleId == message3.scheduleId) && (message2.execId == message3.execId)))
          .sort((a: AgentLogMessage, b: AgentLogMessage) => (a.timestamp.getTime() - b.timestamp.getTime()));
        
        let startDate: string = this.findRegex(filteredMessages, '===Início da execução do Agent: (.*)===');
        let endDate: string = this.findRegex(filteredMessages, '===Término da execução do Agent: (.*)===');
        let duration: string = this.findRegex(filteredMessages, '===Tempo total de execução do Agent: (.*)===');
        
        let hasErrors: boolean = (filteredMessages.find((message2: AgentLogMessage) => (message2.loglevel == _constants.CNST_LOGLEVEL.ERROR.tag)) != null ? true : false);
        filteredMessages = filteredMessages.filter((message2: AgentLogMessage) => (results[1].debug || (message2.loglevel != _constants.CNST_LOGLEVEL.DEBUG.tag)));
        return {
           scheduleId: message2.scheduleId
          ,scheduleName: results[0].filter((schedule: Schedule) => (schedule.id == message2.scheduleId))[0].name
          ,execId: message2.execId
          ,startDate: (startDate != null ? new Date(startDate) : null)
          ,str_startDate: startDate
          ,endDate: (endDate != null ? new Date(endDate) : null)
          ,str_endDate: endDate
          ,duration: (duration != null ? duration : null)
          ,messages: filteredMessages
          ,status: this.setExecutionStatus(hasErrors, endDate)
        };
      }).sort((a: AgentLog, b: AgentLog) => (b.startDate.getTime() - a.startDate.getTime()));
    }));
  }
  
  private setExecutionStatus(hasErrors: boolean, endDate: string): number {
    if (hasErrors) return _constants.CNST_LOGLEVEL.ERROR.level;
    else if (endDate == null) return _constants.CNST_LOGLEVEL.WARN.level;
    else return _constants.CNST_LOGLEVEL.INFO.level;
    return 0;
  }
  
  private findRegex(lines: Array<AgentLogMessage>, regex: string): string {
    let regExp = new RegExp(regex);
    let obj: AgentLogMessage = lines.find((line: AgentLogMessage) => {
      return regExp.test(line.message);
    });
    
    if (obj != null) {
      let match: any = obj.message.match(regExp);
      return match[1];
    } else {
      return null;
    }
  }
}