/* Interface de versionamento do Agent */
import { Version } from '../utilities/version-interface';

/* Interface de rotinas do Agent-Server */
import { ScriptServer } from '../services/server/server-interface';

/* Interface de rotinas do Agent */
export class ScriptClient {
  id: string;
  scheduleId: string;
  name: string;
  command: string;
  version: Version;
  TOTVS: boolean;
  
  constructor(version: string) {
    this.id = null;
    this.scheduleId = '';
    this.name = '';
    this.command = '';
    this.version = new Version(null);
    this.TOTVS = false;
  }
  
  /* Método de conversão da rotina (JSON => Objeto) */
  public toObject(data: ScriptClient): ScriptClient {
    this.id = data.id;
    this.scheduleId = data.scheduleId;
    this.name = data.name;
    this.command = data.command;
    this.version = new Version(data.version.major + '.' + data.version.minor + '.' + data.version.patch);
    this.TOTVS = data.TOTVS;
    
    return this;
  }
  
  /* Método de conversão da rotina, para transferência ao Agent-Server */
  public toServer(id: string, licenseId: string, brand: string): ScriptServer {
    let s: ScriptServer = new ScriptServer();
    
    s.id = id;
    s.licenseId = licenseId;
    s.name = this.name;
    s.command = null;
    s.brand = brand;
    s.version = this.version;
    
    return s;
  }
}
