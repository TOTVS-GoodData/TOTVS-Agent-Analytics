/* Interface de consultas do Agent */
import { Query } from '../query/query-interface';

/* Interface de rotinas do Agent */
import { Script } from '../script/script-interface';

/* Interface de consultas do Agent */
import { CNST_NEW_PARAMETER_VALUE } from './schedule-constants';

/* Interface de agendamentos do Agent */
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
    this.name = '';
    this.workspaceId = '';
    this.windows = [];
    this.enabled = false;
    this.GDZipFilename = '';
    this.GDZipExtension = '';
  }
}

/* Interface de parâmetros de ETL do Agent */
export class ETLParameter {
  name: string;
  value: string;
  
  constructor() {
    this.name = CNST_NEW_PARAMETER_VALUE;
    this.value = CNST_NEW_PARAMETER_VALUE;
  }
}

/* Interface de parâmetros de SQL do Agent */
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

/* Interface de combinação do agendamento, com suas consultas */
export class ScheduleQuery {
  schedule: Schedule;
  queries: Query[];
  erp: string;
  module: string;
  contractType: string;
  databaseType: string;
}

/* Interface de combinação do agendamento, com suas rotinas */
export class ScheduleScript {
  schedule: Schedule;
  scripts: Script[];
  erp: string;
  module: string;
  contractType: string;
  databaseType: string;
}