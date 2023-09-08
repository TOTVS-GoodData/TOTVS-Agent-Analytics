import { Version } from '../query/query-interface';

/* Interface de rotinas do Agent */
export class Script {
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
  
  public getMajorVersion(): number {
    return this.version.major;
  }
  
  public getMinorVersion(): number {
    return this.version.minor;
  }
  
  public getPatchVersion(): number {
    return this.version.patch;
  }
}