/* Componentes de utilitários do Agent */
import { CNST_DEFAULT_LANGUAGE } from '../src-angular/app/services/translation/translation-constants';
import { CNST_TMP_PATH } from './electron-constants';

/* Interface de ambientes do Agent */
import { Workspace } from '../src-angular/app/workspace/workspace-interface';

/* Interface de bancos de dados do Agent */
import { Database } from '../src-angular/app/database/database-interface';

/* Interface de agendamentos do Agent */
import { Schedule } from '../src-angular/app/schedule/schedule-interface';

/* Interface de consultas do Agent */
import { QueryClient } from '../src-angular/app/query/query-interface';

/* Interface de rotinas do Agent */
import { ScriptClient } from '../src-angular/app/script/script-interface';

/* Interface de cofiguração do Agent */
import { Configuration } from '../src-angular/app/configuration/configuration-interface';

/* Interface de comunicação com o Java */
export class DatabaseData {
  workspaces: Workspace[];
  databases: Database[];
  schedules: Schedule[];
  queries: QueryClient[];
  scripts: ScriptClient[];
  configuration: Configuration;
  
  constructor() {
    this.workspaces = [];
    this.databases = [];
    this.schedules = [];
    this.queries = [];
    this.scripts = [];
    this.configuration = new Configuration(10, true, 2048, CNST_TMP_PATH, CNST_DEFAULT_LANGUAGE, true);
  }
}

/* Interface de atualização do Agent (geral) */
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

/* Interface de atualização do Agent (arquivos de atualização baixados) */
export class UpdaterFiles {
  url: string;
  sha512: string;
  size: string;
}

/* Interface de atualização do Agent (progresso da atualização) */
export class UpdaterProgress {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
}
