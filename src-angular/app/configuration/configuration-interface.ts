import { CNST_TIMEZONES_DEFAULT } from '../services/timezones';
import { CNST_DEFAULT_CLIENT_PORT } from './configuration-constants';

/* Interface de configuração do Agent */
export class Configuration {
  logfilesToKeep: number;
  debug: boolean;
  javaXmx: number;
  javaTmpDir: string;
  locale: string;
  autoUpdate: boolean;
  javaJREDir: string;
  logPath?: string;
  timezone: string;
  clientPort: number;
  serialNumber: string;
  
  constructor(logfilesToKeep: number, debug: boolean, javaXmx: number, javaTmpDir: string, locale: string, autoUpdate: boolean) {
    this.logfilesToKeep = logfilesToKeep;
    this.debug = debug;
    this.javaXmx = javaXmx;
    this.javaTmpDir = javaTmpDir;
    this.locale = locale;
    this.autoUpdate = autoUpdate;
    this.timezone = CNST_TIMEZONES_DEFAULT[locale];
    this.clientPort = CNST_DEFAULT_CLIENT_PORT;
    this.serialNumber = null;
  }
  
  public getLocaleLanguage(): string {
    return this.locale.substring(0, 2);
  }
  
  public getLocaleCountry(): string {
    return this.locale.substring(3, 5);
  }
}