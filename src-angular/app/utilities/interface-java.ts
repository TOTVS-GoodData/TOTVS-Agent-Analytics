/* Interfaces do Agent */
import { Workspace } from '../workspace/workspace-interface';
import { Database } from '../database/database-interface';
import { Schedule } from '../schedule/schedule-interface';
import { Query } from '../query/query-interface';
import { Script } from '../script/script-interface';
import { Configuration } from '../configuration/configuration-interface';

/* Buffer de entrada do Java */
export class JavaInputBuffer {
  workspace: Workspace;
  database: Database;
  schedule: Schedule;
  queries: Query[];
  scripts: Script[];
  configuration: Configuration;
}

/* Buffer de saída do Java */
export class JavaOutputBuffer {
  timestamp: string;
  level: number;
  message: string;
}