/* Componentes padrões do Angular */
import { Injectable } from '@angular/core';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Serviço de consulta do acesso remoto (MirrorMode) */
import { MirrorService } from '../services/mirror-service';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';

/* Serviço de tradução do Agent */
import { CustomTranslationLoader } from '../services/translation/custom-translation-loader';
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';
import { CNST_TRANSLATIONS, CNST_DEFAULT_LANGUAGE } from '../services/translation/translation-constants';

/* Serviço de agendamento do Agent */
import { ScheduleService } from '../schedule/schedule-service';
import { Schedule } from '../schedule/schedule-interface';

/* Serviço de configuração do Agent */
import { ConfigurationService } from '../configuration/configuration-service';
import { Configuration } from '../configuration/configuration-interface';

/* Interfaces de execuções de agendamentos, e logs do Agent */
import { AgentLog, AgentLogMessage } from './monitor-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { timer, Observable, map, switchMap, forkJoin, of, from } from 'rxjs';

@Injectable()
export class MonitorService {
  
  /**************************/
  /*** MÉTODOS DO SERVIÇO ***/
  /**************************/
  constructor(
    private _electronService: ElectronService,
    private _mirrorService: MirrorService,
    private _translateService: TranslationService,
    private _scheduleService: ScheduleService,
    private _configurationService: ConfigurationService,
    private _customTranslationLoader: CustomTranslationLoader
  ) {}
  
  /* Método de temporização logs de execução do Agent (a cada <1> segundos) */
  public emitMonitorLog(refreshTimer: number): Observable<AgentLog[]> {
    let refresh: number = 1;
    return timer(0, 1000).pipe(switchMap(() => {
      refresh = refresh - 1;
      if (refresh == 0) {
        refresh = refreshTimer;
        return this.getMonitorLog().pipe(map((logs: AgentLog[]) => {
          return logs;
        }));
      } else {
        return of([]);
      }
    }));
  }
  
  /* Método de consulta dos logs de execução do Agent */
  public getMonitorLog(): Observable<AgentLog[]> {
    let agentSets: Set<any> = new Set();
    let agentLogMessages: Array<AgentLogMessage> = [];
    let agentLog: Array<any> = [];
    let lastMessage: any = null;
    let javaLog: boolean = false;

    //Consulta todos os agendamentos cadastrados atualmente no Agent
    return forkJoin([
      this._scheduleService.getSchedules(false),
      this._configurationService.getConfiguration(false)
    ]).pipe(switchMap((results: [Schedule[], Configuration]) => {

      //Solicita ao Electron as mensagens de todos os arquivos de log existentes
      return from(this._electronService.ipcRenderer.invoke('AC_readLogs')).pipe(map((logs: string[]) => {
        logs.map((log: string) => {
          
          //Converte o texto do log de volta para o objeto de mensagem
          try {
            let messages: any = JSON.parse(log);

            if ((messages.execId != null) && (messages.scheduleId != null)) {
              javaLog = true;
              messages.str_logDate = messages.logDate;
              messages.logDate = new Date('' + messages.logDate);
              agentLogMessages.push(messages);
              lastMessage = messages;
            } else javaLog = false;

          //Conversão dos textos de log de erro
          } catch (ex) {
            if ((lastMessage) && (javaLog)) agentLogMessages.push(new AgentLogMessage(lastMessage.mirror, lastMessage.logDate, lastMessage.str_logDate, CNST_LOGLEVEL.ERROR.tag, lastMessage.system, log, lastMessage.level, lastMessage.execId, lastMessage.scheduleId));
          }
        });
        
        //Extrai todas as execuções distintas encontradas nos logs
        return agentLogMessages.filter((message1: AgentLogMessage) => {
          let check: boolean = agentSets.has(message1.scheduleId + '|' + message1.execId);
          agentSets.add(message1.scheduleId + '|' + message1.execId);
          return !check;
        }).map((message2: AgentLogMessage) => {

          //Filtra todas as mensagens de log de cada execução
          let filteredMessages: Array<AgentLogMessage> = agentLogMessages
            .filter((message3: AgentLogMessage) => ((message2.scheduleId == message3.scheduleId) && (message2.execId == message3.execId)))
            .sort((a: AgentLogMessage, b: AgentLogMessage) => (a.logDate.getTime() - b.logDate.getTime()));

          //Detecta o idioma usado em cada execução
          let languages: string[] = this._customTranslationLoader.getAvailableLanguages();
          let logLanguage: string = CNST_DEFAULT_LANGUAGE;
          for (let i: number = 0; i < languages.length; i++) {
            if (this.findRegex(filteredMessages, CNST_TRANSLATIONS[languages[i]].ELECTRON.RUN_AGENT_ELEC_START) != null) {
              logLanguage = languages[i];
              break;
            }
          }

          //Utiliza o idioma da execução encontrado para buscar pelas mensagens específicas do Agent
          let startDateJava: string = this.findRegex(filteredMessages, CNST_TRANSLATIONS[logLanguage].ELECTRON.JAVA_EXECUTION_START, 1);
          startDateJava = startDateJava.substring(0, startDateJava.length - 5);
          
          let endDateJava: string = this.findRegex(filteredMessages, CNST_TRANSLATIONS[logLanguage].ELECTRON.JAVA_EXECUTION_END, 1);
          endDateJava = endDateJava.substring(0, endDateJava.length - 5);

          let durationJava: string = this.findRegex(filteredMessages, CNST_TRANSLATIONS[logLanguage].ELECTRON.JAVA_EXECUTION_DURATION, 1);
          let stopped: string = this.findRegex(filteredMessages, CNST_TRANSLATIONS[logLanguage].ELECTRON.JAVA_EXECUTION_CANCELLED);

          //Detecta se houveram erros na execução do agendamento
          let hasErrors: boolean = (filteredMessages.find((message2: AgentLogMessage) => (message2.loglevel == CNST_LOGLEVEL.ERROR.tag)) != null ? true : false);
          
          //Remove as mensagens de debug do log, caso configurado no Agent
          filteredMessages = filteredMessages.filter((message2: AgentLogMessage) => (results[1].debug || (message2.loglevel != CNST_LOGLEVEL.DEBUG.tag)));
          
          //Define o status final da execução
          let status: number = this.setExecutionStatus(stopped, hasErrors, endDateJava);

          //Procura o agendamento executado no cadastro atual (para mostrar o nome do mesmo, caso encontrado)
          let schedule: Schedule = results[0].find((schedule: Schedule) => (schedule.id == message2.scheduleId));

          let x: any = {
            scheduleId: message2.scheduleId
            , scheduleName: (schedule != null ? schedule.name : this._translateService.CNST_TRANSLATIONS['MONITOR.MESSAGES.SCHEDULE_NOT_FOUND'])
            , scheduleLines: filteredMessages.length
            , execId: message2.execId
            , startDate: (startDateJava != null ? new Date(startDateJava) : filteredMessages[0].logDate)
            , str_startDate: startDateJava
            , endDate: (endDateJava != null ? new Date(endDateJava) : null)
            , str_endDate: endDateJava
            , duration: (durationJava != null ? durationJava : null)
            , messages: filteredMessages
            , status: status
            , terminate: (((stopped != null) || (endDateJava != null)) ? null : 'po-icon po-icon-close')
          };
          
          //Retorna o objeto de execução, com as mensagens de log dentro do mesmo
          return x;

        //Ordena as execuções, da mais recente para a mais antiga
        }).sort((a: AgentLog, b: AgentLog) => (b.startDate.getTime() - a.startDate.getTime()));
      }));
    }));
  }
  
  /* Método que define o status de execução atual do log do agendamento */
  private setExecutionStatus(stopped: string, hasErrors: boolean, endDate: string): number {
    let exec: number = null;
    
    if (stopped) exec = CNST_LOGLEVEL.DEBUG.level;
    else if (hasErrors) exec = CNST_LOGLEVEL.ERROR.level;
    else if (endDate == null) exec = CNST_LOGLEVEL.WARN.level;
    else exec = CNST_LOGLEVEL.INFO.level;
    
    return exec;
  }
  
  /* Método que busca a ocorrência de uma RegEx dentro do log de um agendamento */
  private findRegex(lines: Array<AgentLogMessage>, regex: string, match?: number): string {
    let regExp = new RegExp(regex);
    
    //Procura uma ocorrência verdadeira da RegEx
    let obj: AgentLogMessage = lines.find((line: AgentLogMessage) => {
      return regExp.test(line.message);
    });
    
    //Caso tenha encontrado, retorna a mensagem. Em caso de ocorrências múltiplas, retorna a posição solicitada
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
