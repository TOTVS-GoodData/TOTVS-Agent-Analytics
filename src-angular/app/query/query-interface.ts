/* Constante do módulo 'Customizado' */
import { CNST_MODULE_CUSTOM } from '../utilities/module-constants';

/* Interface de versionamento do Agent */
import { Version } from '../utilities/version-interface';

/* Interface de consultas do Agent-Server */
import { QueryServer } from '../services/server/server-interface';

/* Interface de consultas do Agent */
export class QueryClient {
  id: string;
  scheduleId: string;
  name: string;
  module: string;
  moduleName?: string;
  command: string;
  executionMode: string;
  executionModeName?: string;
  version: Version;
  TOTVS: boolean;
  TOTVSName?: string;
  
  constructor(version: string) {
    this.id = null;
    this.scheduleId = '';
    this.name = '';
    this.module = CNST_MODULE_CUSTOM;
    this.executionMode = '';
    this.command = '';
    this.version = new Version(version);
    this.TOTVS = false;
  }
  
  /* Método de conversão da consulta (JSON => Objeto) */
  public toObject(data: QueryClient): QueryClient {
    this.id = data.id;
    this.scheduleId = data.scheduleId;
    this.name = data.name;
    this.module = data.module;
    this.module = data.module;
    this.command = data.command;
    this.executionMode = data.executionMode;
    this.version = new Version(data.version.major + '.' + data.version.minor + '.' + data.version.patch);
    this.TOTVS = data.TOTVS;
    
    return this;
  }
  
  /* Método de conversão da consulta, para transferência ao Agent-Server */
  public toServer(id: string, licenseId: string, brand: string): QueryServer {
    let q: QueryServer = new QueryServer();
    
    q.id = id;
    q.licenseId = licenseId;
    q.name = this.name;
    q.module = this.module;
    q.module = this.module;
    q.command = null;
    q.executionMode = this.executionMode;
    q.brand = brand;
    q.version = this.version;
    
    return q;
  }
}
