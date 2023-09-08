/* Idioma padrão do Agent */
import { CNST_DEFAULT_LANGUAGE } from '../src-angular/app/services/translation/translation-constants';

/* Interface de ambientes do Agent */
import { Workspace } from '../src-angular/app/workspace/workspace-interface';

/* Interface de bancos de dados do Agent */
import { Database } from '../src-angular/app/database/database-interface';

/* Interface de agendamentos do Agent */
import { Schedule } from '../src-angular/app/schedule/schedule-interface';

/* Interface de consultas do Agent */
import { Query } from '../src-angular/app/query/query-interface';

/* Interface de rotinas do Agent */
import { Script } from '../src-angular/app/script/script-interface';

/* Interface de cofiguração do Agent */
import { Configuration } from '../src-angular/app/configuration/configuration-interface';

/* Interface de comunicação com o Java */
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
    this.configuration = new Configuration(10, true, 2048, '', CNST_DEFAULT_LANGUAGE, true);
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