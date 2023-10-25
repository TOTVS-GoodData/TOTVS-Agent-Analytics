/* Interface de versionamento do Agent */
import { Version } from '../utilities/version-interface';

/* Interface de consultas do Agent */
import { QueryClient } from '../query/query-interface';

/* Interface de rotinas do Agent */
import { ScriptClient } from '../script/script-interface';

/* Interface de parâmetros de ETL / SQL do Agent-Server */
import {
  ETLParameterServer,
  SQLParameterServer
} from '../services/server/server-interface';

/* Interface de consultas do Agent */
import { CNST_NEW_PARAMETER_VALUE } from './schedule-constants';

/* Interface de agendamentos do Agent */
export class Schedule {
  id: string;
  name: string;
  workspaceId: string;
  workspaceName: string;
  windows: string[];
  SQLParameters: SQLParameterClient[];
  ETLParameters: ETLParameterClient[];
  enabled: boolean;
  lastExecution: Date;
  lastExecutionString?: string;
  GDZipFilename: string;
  GDZipExtension: string;
  fileFolder?: string;
  fileFolderWildcard?: string;
  
  constructor() {
    this.id = null;
    this.name = '';
    this.workspaceId = '';
    this.windows = [];
    this.enabled = false;
    this.GDZipFilename = '';
    this.GDZipExtension = '';
    this.ETLParameters = [];
    this.SQLParameters = [];
  }
  
  /* Método de conversão do agendamento (JSON => Objeto) */
  public toObject(data: Schedule): Schedule {
    this.id = data.id;
    this.name = data.name;
    this.workspaceId = data.workspaceId;
    this.workspaceName = data.workspaceName;
    this.windows = data.windows;
    this.SQLParameters = data.SQLParameters.map((param: SQLParameterClient) => {
      return new SQLParameterClient().toObject(param);
    });
    this.ETLParameters = data.ETLParameters.map((param: ETLParameterClient) => {
      return new ETLParameterClient().toObject(param);
    });
    this.enabled = data.enabled;
    this.lastExecution = data.lastExecution;
    this.GDZipFilename = data.GDZipFilename;
    this.GDZipExtension = data.GDZipExtension;
    this.fileFolder = data.fileFolder;
    this.fileFolderWildcard = data.fileFolderWildcard;
    
    return this;
  }
}

/* Interface de parâmetros de ETL do Agent */
export class ETLParameterClient {
  id: string;
  name: string;
  command: string;
  version: Version;
  TOTVS: boolean;
  
  constructor() {
    this.id = null;
    this.name = CNST_NEW_PARAMETER_VALUE;
    this.command = CNST_NEW_PARAMETER_VALUE;
    this.version = new Version(null);
    this.TOTVS = false;
  }
  
  /* Método de conversão do parâmetro de ETL (JSON => Objeto) */
  public toObject(param: ETLParameterClient): ETLParameterClient {
    this.id = param.id;
    this.name = param.name;
    this.command = param.command;
    this.version = new Version(param.version.major + '.' + param.version.minor + '.' + param.version.patch);
    this.TOTVS = param.TOTVS;
    
    return this;
  }
  
  /* Método de conversão do parâmetro de ETL, para transferência ao Agent-Server */
  public toServer(licenseId: string): ETLParameterServer {
    let param: ETLParameterServer = new ETLParameterServer();
    
    param.id = this.id;
    param.licenseId = licenseId;
    param.name = this.name;
    param.command = null;
    param.version = this.version;
    
    return param;
  }
}

/* Interface de parâmetros de SQL do Agent */
export class SQLParameterClient {
  id: string;
  name: string;
  command: string;
  sql: boolean | string;
  version: Version;
  TOTVS: boolean;
  
  constructor() {
    this.id = null;
    this.name = CNST_NEW_PARAMETER_VALUE;
    this.command = CNST_NEW_PARAMETER_VALUE;
    this.sql = false;
    this.version = new Version(null);
    this.TOTVS = false;
  }
  
  /* Método de conversão do parâmetro de SQL, para transferência ao Agent-Server */
  public toServer(licenseId: string, brand: string): SQLParameterServer {
    let param: SQLParameterServer = new SQLParameterServer();
    
    param.id = this.id;
    param.licenseId = licenseId;
    param.brand = brand;
    param.name = this.name;
    param.command = null;
    param.sql = null;
    param.version = this.version;
    
    return param;
  }
  
  /* Método de conversão do parâmetro de SQL (JSON => Objeto) */
  public toObject(param: SQLParameterClient): SQLParameterClient {
    this.id = param.id;
    this.name = param.name;
    this.command = param.command;
    this.sql = param.sql;
    this.version = new Version(param.version.major + '.' + param.version.minor + '.' + param.version.patch);
    this.TOTVS = param.TOTVS;
    
    return this;
  }
}

/* Interface de combinação do agendamento, com suas consultas */
export class ScheduleQuery {
  name: string;
  schedule: Schedule;
  queries: QueryClient[];
  erp: string;
  module: string;
  contractType: string;
  databaseType: string;
}

/* Interface de combinação do agendamento, com suas rotinas */
export class ScheduleScript {
  name: string;
  schedule: Schedule;
  scripts: ScriptClient[];
  erp: string;
  module: string;
  databaseType: string;
}
