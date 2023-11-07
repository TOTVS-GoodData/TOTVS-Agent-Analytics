/* Constantes de versionamento do Agent */
export const CNST_VERSION_STANDARD: string = '0.0.0';
export const CNST_VERSION_REGEX_PATTERN: string = '^[0-9]{1,2}[.][0-9]{1,2}[.][0-9]{1,2}$';

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
    if (
         (numbers.length != 3) 
      || (isNaN(Number(numbers[0])))
      || (isNaN(Number(numbers[1])))
      || (isNaN(Number(numbers[2])))
    ) throw new Error();
    else {
      this.major = parseInt(numbers[0]);
      this.minor = parseInt(numbers[1]);
      this.patch = parseInt(numbers[2]);
    }
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
