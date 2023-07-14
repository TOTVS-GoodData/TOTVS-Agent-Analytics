import { Observable } from 'rxjs';
import { CNST_NEW_PARAMETER_VALUE } from './constants-angular';

export class AgentLog {
  scheduleId: number;
  scheduleName: string;
  execId: number;
  startDate: Date;
  str_startDate: string;
  endDate: Date;
  str_endDate: string;
  duration: string;
  messages: Array<AgentLogMessage>;
  status: number;
  
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
  }
}

export class AgentLogMessage {
  timestamp: Date;
  str_timestamp: string;
  loglevel: string;
  system: string;
  message: string;
  level: string;
  execId?: number;
  scheduleId?: number;
  
  constructor(timestamp: Date, str_timestamp: string, loglevel: string, system: string, message: string, level: string, execId: number, scheduleId: number) {
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

export class UpdaterProgress {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
}

export class UpdaterFiles {
  url: string;
  sha512: string;
  size: string;
}

export class Updater {
  tag: string;
  version: string;
  files: UpdaterFiles[];
  path: string;
  sha512: string;
  releaseDate: Date;
  releaseName: string;
  releaseNotes: string;
}

export class ScheduleQuery {
  schedule: Schedule;
  queries: Query[];
  erp: string;
  module: string;
  contractType: string;
  databaseType: string;
}

export class ScheduleScript {
  schedule: Schedule;
  scripts: Script[];
  erp: string;
  module: string;
  contractType: string;
  databaseType: string;
}

export class JavaOutputBuffer {
  timestamp: string;
  level: number;
  message: string;
}

export class JavaInputBuffer {
  workspace: Workspace;
  database: Database;
  java: Java;
  schedule: Schedule;
  queries: Query[];
  scripts: Script[];
}

export class DatabaseData {
  workspaces: Workspace[];
  databases: Database[];
  javas: Java[];
  schedules: Schedule[];
  queries: Query[];
  scripts: Script[];
  configuration: Configuration;
  
  constructor() {
    this.workspaces = [];
    this.databases = [];
    this.javas = [];
    this.schedules = [];
    this.queries = [];
    this.scripts = [];
    this.configuration = new Configuration();
  }
}

export class Workspace {
  id: number;
  name: string;
  contractType: string;
  contractCode: string;
  erp: string;
  module: string;
  source: string;
  GDEnvironment: string;
  GDUsername: string;
  GDPassword: string;
  GDWorkspaceId: string;
  GDWorkspaceUploadURL: string;
  GDProcessId: string;
  GDProcessGraph: string;
  databaseId: number;
  databaseName?: string;
  javaId: number;
  pathMyProperties: string;
  
  constructor() {
    this.id = null;
    this.contractType = null;
    this.contractCode = null;
    this.erp = null;
    this.module = null;
    this.source = null;
    this.GDEnvironment = null;
    this.GDUsername = null;
    this.GDPassword = null;
    this.GDWorkspaceId = null;
    this.GDWorkspaceUploadURL = null;
    this.javaId = null;
    this.databaseId = null;
  }
}

export class Database {
  id: number;
  name: string;
  type: string
  driverClass: string;
  driverPath: string;
  ipType: string;
  ip: string;
  port: string;
  schema: string;
  instance: string;
  sid: string;
  connectionString: string;
  username: string;
  password: string;
  
  constructor() {
    this.id = null;
    this.name = null;
    this.type = null;
    this.driverClass = null;
    this.driverPath = null;
    this.ip = null;
    this.port = null;
    this.schema = null;
    this.sid = null;
    this.connectionString = null;
    this.username = null;
    this.password = null;
  }
}

export class Java {
  id: number;
  name: string;
  parameters: Parameter[];
  
  constructor() {
    this.id = null;
    this.name = null;
    this.parameters = [];
  }
}

export class Parameter {
  value: string;
}

export class Schedule {
  id: number;
  name: string;
  workspaceId: number;
  workspaceName: string;
  windows: string[];
  SQLParameters: SQLParameter[];
  ETLParameters: ETLParameter[];
  enabled: boolean;
  lastExecution: Date;
  GDZipFilename: string;
  GDZipExtension: string;
  fileFolder?: string;
  fileFolderWildcard?: string;
  
  constructor() {
    this.id = null;
    this.name = null;
    this.workspaceId = null;
    this.workspaceName = null;
    this.windows = [];
    this.SQLParameters = [];
    this.ETLParameters = [];
    this.enabled = false;
    this.GDZipFilename = null;
    this.GDZipExtension = null;
  }
}

export class ETLParameter {
  name: string;
  value: string;
  
  constructor() {
    this.name = CNST_NEW_PARAMETER_VALUE;
    this.value = CNST_NEW_PARAMETER_VALUE;
  }
}

export class SQLParameter {
  name: string;
  value: string;
  sql: boolean | string;
  
  constructor() {
    this.name = CNST_NEW_PARAMETER_VALUE;
    this.value = CNST_NEW_PARAMETER_VALUE;
    this.sql = false;
  }
}

export class Query {
  id: number;
  scheduleId: number;
  name: string;
  query: string;
  executionMode: string;
  canDecrypt: boolean;
  constructor() {
    this.scheduleId = null;
    this.name = null;
    this.query = null;
    this.executionMode = null;
  }
}

export class Script {
  id: number;
  scheduleId: number;
  name: string;
  script: string;
  canDecrypt: boolean;
  constructor() {
    this.scheduleId = null;
    this.name = null;
    this.script = null;
  }
}

export class Configuration {
  debug: boolean;
  logfilesToKeep: number;
  constructor() {
    this.logfilesToKeep = 10;
    this.debug = false;
  }
}

export class GDWorkspace {
  id: string;
  name: string;
  description: string;
  ob_processes: Observable<GDProcess[]>;
  processes: GDProcess[];
}

export class GDProcess {
  id: string;
  url: string;
  name: string;
  graphs: string[];
  type: string;
}