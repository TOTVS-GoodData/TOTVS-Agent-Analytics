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
  
  public jsonToObject(v: Version): void {
    this.major = v.major;
    this.minor = v.minor;
    this.patch = v.patch;    
  }
  
  public getVersion(): string {
    return this.major + '.' + this.minor + '.' + this.patch;
  }
  
  public getMajorVersion(): number {
    return this.major;
  }
  
  public getMinorVersion(): number {
    return this.minor;
  }
  
  public getPatchVersion(): number {
    return this.patch;
  }
}

/* Interface de consultas do Agent */
export class QueryClient {
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
}
