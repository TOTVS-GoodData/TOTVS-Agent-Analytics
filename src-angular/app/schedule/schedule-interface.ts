/* Interface de consultas do Agent */
import { QueryClient, Version } from '../query/query-interface';
import { CNST_QUERY_VERSION_STANDARD } from '../query/query-constants';

/* Interface de rotinas do Agent */
import { ScriptClient } from '../script/script-interface';

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
}

/* Interface de parâmetros de ETL do Agent */
export class ETLParameterClient {
  name: string;
  value: string;
  version: Version;
  
  constructor() {
    this.name = CNST_NEW_PARAMETER_VALUE;
    this.value = CNST_NEW_PARAMETER_VALUE;
    this.version = new Version(CNST_QUERY_VERSION_STANDARD);
  }
}

/* Interface de parâmetros de SQL do Agent */
export class SQLParameterClient {
  name: string;
  value: string;
  sql: boolean | string;
  version: Version;
  
  constructor() {
    this.name = CNST_NEW_PARAMETER_VALUE;
    this.value = CNST_NEW_PARAMETER_VALUE;
    this.sql = false;
    this.version = new Version(CNST_QUERY_VERSION_STANDARD);
  }
}

/* Interface de combinação do agendamento, com suas consultas */
export class ScheduleQuery {
  schedule: Schedule;
  queries: QueryClient[];
  erp: string;
  module: string;
  contractType: string;
  databaseType: string;
}

/* Interface de combinação do agendamento, com suas rotinas */
export class ScheduleScript {
  schedule: Schedule;
  scripts: ScriptClient[];
  erp: string;
  module: string;
  contractType: string;
  databaseType: string;
}
