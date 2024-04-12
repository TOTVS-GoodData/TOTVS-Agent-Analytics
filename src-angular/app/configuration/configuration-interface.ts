/* Constante de fuso horário padrão do Agent */
import { CNST_TIMEZONES_DEFAULT } from '../services/timezones';

/* Constante de porta de entrada padrão do Agent */
import {
  CNST_DEFAULT_CLIENT_PORT,
  CNST_DEFAULT_INSTANCE_NAME,
  CNST_CONTRACT_TYPES
} from './configuration-constants';

/* Interface de configuração do Agent */
export class Configuration {
  logfilesToKeep: number;
  instanceName: string;
  debug: boolean;
  javaXmx: number;
  javaTmpDir: string;
  locale: string;
  autoUpdate: boolean;
  javaJREDir: string;
  logPath?: string;
  timezone: string;
  serialNumber: string;
  contractType: string;
  constructor(logfilesToKeep: number, debug: boolean, javaXmx: number, javaTmpDir: string, locale: string, autoUpdate: boolean) {
    this.logfilesToKeep = logfilesToKeep;
    this.instanceName = CNST_DEFAULT_INSTANCE_NAME;
    this.debug = debug;
    this.javaXmx = javaXmx;
    this.javaTmpDir = javaTmpDir;
    this.locale = locale;
    this.autoUpdate = autoUpdate;
    this.timezone = CNST_TIMEZONES_DEFAULT[locale];
    this.serialNumber = null;
    this.contractType = CNST_CONTRACT_TYPES.FAST;
  }
  
  /* Método que retorna o idioma configurado no Agent (Ex: pt) */
  public getLocaleLanguage(): string {
    return this.locale.substring(0, 2);
  }
  
  /* Método que retorna o país configurado no Agent (Ex: BR) */
  public getLocaleCountry(): string {
    return this.locale.substring(3, 5);
  }
}
