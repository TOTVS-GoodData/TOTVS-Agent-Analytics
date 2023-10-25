/* Constantes de versionamento do Agent */
export const CNST_VERSION_STANDARD: string = '0.0.0';

/* Interface de versionamento de consultas */
export class Version {
  major: number;
  minor: number;
  patch: number;
  
  constructor(version: string) {
    if (version == null) version = CNST_VERSION_STANDARD;
    this.setVersion(version);
  }
  
  public setVersion(v: string) {
    let numbers: Array<string> = v.split('.');
    
    this.major = parseInt(numbers[0]);
    this.minor = parseInt(numbers[1]);
    this.patch = parseInt(numbers[2]);
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
