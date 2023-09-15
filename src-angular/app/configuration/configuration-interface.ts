import { CNST_TIMEZONES_DEFAULT } from '../services/timezones';

/* Interface de configuração do Agent */
export class Configuration {
  debug: boolean;
  logfilesToKeep: number;
  javaXmx: number;
  javaTmpDir: string;
  javaJREDir: string;
  locale: string;
  autoUpdate: boolean;
  logPath?: string;
  timezone: string;
  
  constructor(logfilesToKeep: number, debug: boolean, javaXmx: number, javaTmpDir: string, locale: string, autoUpdate: boolean) {
    this.logfilesToKeep = logfilesToKeep;
    this.debug = debug;
    this.javaXmx = javaXmx;
    this.javaTmpDir = javaTmpDir;
    this.locale = locale;
    this.autoUpdate = autoUpdate;
    this.timezone = CNST_TIMEZONES_DEFAULT[locale];
  }
  
  public getLocaleLanguage(): string {
    return this.locale.substring(0, 2);
  }
  
  public getLocaleCountry(): string {
    return this.locale.substring(3, 5);
  }
}