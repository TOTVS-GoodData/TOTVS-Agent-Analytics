import { Observable } from 'rxjs';
import { CNST_NEW_PARAMETER_VALUE, CNST_DEFAULT_LANGUAGE } from './constants-angular';

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
  schedule: Schedule;
  queries: Query[];
  scripts: Script[];
  configuration: Configuration;
}

export class DatabaseData {
  workspaces: Workspace[];
  databases: Database[];
  schedules: Schedule[];
  queries: Query[];
  scripts: Script[];
  configuration: Configuration;
  
  constructor() {
    this.workspaces = [];
    this.databases = [];
    this.schedules = [];
    this.queries = [];
    this.scripts = [];
    this.configuration = new Configuration(10, true, 2048, '', CNST_DEFAULT_LANGUAGE);
  }
}

export class Workspace {
  id: string;
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
  databaseIdRef: string;
  databaseName?: string;
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
    this.databaseIdRef = null;
  }
}

export class Database {
  id: string;
  name: string;
  type: string;
  brand: string;
  driverClass: string;
  driverPath: string;
  ipType: string;
  ip: string;
  port: string;
  instance: string;
  db_databaseName: string;
  connectionString: string;
  username: string;
  password: string;
  
  constructor() {
    this.id = null;
    this.name = null;
    this.type = null;
    this.brand = null;
    this.driverClass = null;
    this.driverPath = null;
    this.ip = null;
    this.ipType = null;
    this.port = null;
    this.db_databaseName = null;
    this.connectionString = null;
    this.username = null;
    this.password = null;
  }
}

export class Schedule {
  id: string;
  name: string;
  workspaceId: string;
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
    this.windows = null;
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
  id: string;
  scheduleId: string;
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
  id: string;
  scheduleId: string;
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
  javaXmx: number;
  javaTmpDir: string;
  javaJREDir: string;
  locale: string;
  constructor(logfilesToKeep: number, debug: boolean, javaXmx: number, javaTmpDir: string, locale: string) {
    this.logfilesToKeep = logfilesToKeep;
    this.debug = debug;
    this.javaXmx = javaXmx;
    this.javaTmpDir = javaTmpDir;
    this.locale = locale;
  }
  
  public getLocaleLanguage(): string {
    return this.locale.substring(0, 2);
  }
  
  public getLocaleCountry(): string {
    return this.locale.substring(3, 5);
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