/* Interface de execuções de agendamentos do Agent */
export class AgentLog {
  scheduleId: string;
  scheduleName: string;
  scheduleLines: number;
  execId: string;
  startDate: Date;
  str_startDate: string;
  endDate: Date;
  str_endDate: string;
  duration: string;
  messages: Array<AgentLogMessage>;
  status: number;
  terminate: string;
  
  constructor() {
    this.scheduleId = null;
    this.scheduleName = null;
    this.execId = null;
    this.startDate = null;
    this.str_startDate = null;
    this.endDate = null;
    this.str_endDate = null;
    this.duration = null;
    this.messages = [];
    this.status = null;
    this.terminate = null;
  }
}

/* Interface de linhas de log do Agent (Implementada também no Java) */
export class AgentLogMessage {
  timestamp: Date;
  str_timestamp: string;
  loglevel: string;
  system: string;
  message: string;
  level: string;
  execId?: string;
  scheduleId?: string;
  
  constructor(timestamp: Date, str_timestamp: string, loglevel: string, system: string, message: string, level: string, execId: string, scheduleId: string) {
    this.timestamp = timestamp;
    this.str_timestamp = str_timestamp;
    this.loglevel = loglevel;
    this.system = system;
    this.message = message;
    this.level = level;
    this.execId = execId;
    this.scheduleId = scheduleId;
  }
}