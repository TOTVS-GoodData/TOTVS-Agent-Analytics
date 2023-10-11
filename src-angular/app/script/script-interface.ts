import { Version } from '../query/query-interface';

/* Interface de rotinas do Agent */
export class ScriptClient {
  id: string;
  scheduleId: string;
  name: string;
  script: string;
  canDecrypt: boolean;
  version: Version;
  
  constructor(version: string) {
    this.id = null;
    this.scheduleId = '';
    this.name = '';
    this.script = '';
    this.version = new Version(version);
  }
}
