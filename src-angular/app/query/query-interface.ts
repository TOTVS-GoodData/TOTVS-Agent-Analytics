/* Interface de versionamento de consultas */
export class Version {
  major: number;
  minor: number;
  patch: number;
  
  constructor(version: string) {
    let numbers: Array<string> = version.split('.');
    
    this.major = parseInt(numbers[0]);
    this.minor = parseInt(numbers[1]);
    this.patch = parseInt(numbers[2]);
  }
}

/* Interface de consultas do Agent */
export class Query {
  id: string;
  scheduleId: string;
  name: string;
  query: string;
  executionMode: string;
  executionModeName?: string;
  canDecrypt: boolean;
  version: Version;
  
  constructor(version: string) {
    this.id = null;
    this.scheduleId = '';
    this.name = '';
    this.executionMode = '';
    this.query = '';
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