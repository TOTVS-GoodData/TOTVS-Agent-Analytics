/* Interface de versionamento do Agent */
import { Version } from '../../utilities/version-interface';

/* Interface de consultas do Agent */
import { QueryClient } from '../../query/query-interface';

/* Interface de rotinas do Agent */
import { ScriptClient } from '../../script/script-interface';

/* Interface de parâmetros de ETL do Agent */
import { ETLParameterClient } from '../../schedule/schedule-interface';

/* Interface de parâmetros de SQL do Agent */
import { SQLParameterClient } from '../../schedule/schedule-interface';

/* Interface de suporte, para preparação da palavra de resposta do Agent */
export class responseObj {
  response: any[];
  errorCode: number;
  
  constructor(response: any[], errorCode: number) {
    this.response = response;
    this.errorCode = errorCode;
  }
}

/* Interface de comunicação com o Agent-Server */
export class ServerCommunication {
  source: string;
  destination: string;
  word: string;
  errorCode: number;
  args: string[];
}

/* Interface de registro dos sockets de conexão */
export class SocketCommunication {
  socket: any;
  serialNumber: string;
}

/* Interface de licenças do Agent */
export class License {
  id: string;
  source: string;
  product: string;
  modules: string[];
}

/* Interface de resposta do Agent-Server, com as licenças disponíveis para esta instalação do Agent */
export class AvailableLicenses {
  contractType: string;
  TOTVSCode: string;
  licenses: License[];
  
  constructor(contractType: string, TOTVSCode: string, licenses: License[]) {
    this.contractType = contractType;
    this.TOTVSCode = TOTVSCode;
    this.licenses = licenses;
  }
}

/* Interface de resposta do Agent-Server, com as consultas padrões para esta licença do Agent */
export class QueryCommunication {
  License: License;
  Queries: QueryClient[];
}

/* Interface de resposta do Agent-Server, com as rotinas padrões para esta licença do Agent */
export class ScriptCommunication {
  License: License;
  Scripts: ScriptClient[];
}

/* Interface de resposta do Agent-Server, com os parâmetros de ETL padrões para esta licença do Agent */
export class ETLParameterCommunication {
  License: License;
  ETLParameters: ETLParameterClient[];
}

/* Interface de resposta do Agent-Server, com os parâmetros de SQL padrões para esta licença do Agent */
export class SQLParameterCommunication {
  License: License;
  SQLParameters: SQLParameterClient[];
}

/* Interface de parâmetros de ETL do Agent-Server */
export class ETLParameterServer {
  id: string;
  licenseId: string;
  name: string;
  module: string;
  command: string;
  version: Version;
  versionName?: string;
  
  /* Método de conversão do parâmetro de ETL (JSON => Objeto) */
  public toObject(data: ETLParameterServer): ETLParameterServer {
    this.id = data.id;
    this.licenseId = data.licenseId;
    this.name = data.name;
    this.module = data.module;
    this.command = data.command;
    this.version = new Version(data.version.major + '.' + data.version.minor + '.' + data.version.patch);
    this.versionName = this.version.getVersion();
    
    return this;
  }
  
  /* Método de conversão do parâmetro de ETL do Agent-Server, para o Agent */
  public toClient(): ETLParameterClient {
    
    let param: ETLParameterClient = new ETLParameterClient();
    
    param.name = this.name;
    param.module = this.module;
    param.command = this.command;
    param.version = this.version
    param.TOTVS = true;
    
    return param;
  }
  
  public getKey(): string {
    return this.licenseId + '|' + this.name + '|' + this.version.getVersion();
  }
  
  constructor() {
    this.id = null;
    this.licenseId = '';
    this.name = '';
    this.command = '';
    this.version = new Version(null);
    this.versionName = this.version.getVersion();
  }
}

/* Interface de parâmetros de ETL do Agent-Server */
export class SQLParameterServer {
  id: string;
  licenseId: string;
  name: string;
  module: string;
  brand: string;
  command: string;
  version: Version;
  versionName?: string;
  sql: boolean;
  
  /* Método de conversão do parâmetro de SQL (JSON => Objeto) */
  public toObject(data: SQLParameterServer): SQLParameterServer {
    this.id = data.id;
    this.licenseId = data.licenseId;
    this.name = data.name;
    this.module = data.module;
    this.brand = data.brand;
    this.command = data.command;
    this.version = new Version(data.version.major + '.' + data.version.minor + '.' + data.version.patch);
    this.versionName = this.version.getVersion();
    this.sql = data.sql;
    
    return this;
  }
  
  /* Método de conversão do parâmetro de SQL do Agent-Server, para o Agent */
  public toClient(): SQLParameterClient {
    
    let param: SQLParameterClient = new SQLParameterClient();
    
    param.name = this.name;
    param.module = this.module;
    param.command = this.command;
    param.sql = this.sql;
    param.version = this.version
    param.TOTVS = true;
    
    return param;
  }
  
  public getKey(): string {
    return this.licenseId + '|' + this.brand + '|' + this.name + '|' + this.version.getVersion();
  }
  
  constructor() {
    this.id = null;
    this.licenseId = '';
    this.name = '';
    this.module = '';
    this.brand = '';
    this.command = '';
    this.version = new Version(null);
    this.versionName = this.version.getVersion();
    this.sql = false;
  }
}

/* Interface de consultas do Agent-Server */
export class QueryServer {
  id: string;
  licenseId: string;
  name: string;
  module: string;
  command: string;
  executionMode: string;
  executionModeName?: string;
  brand: string;
  version: Version;
  versionName?: string;
  
  /* Método de conversão da consulta (JSON => Objeto) */
  public toObject(data: QueryServer): QueryServer {
    this.id = data.id;
    this.licenseId = data.licenseId;
    this.name = data.name;
    this.module = data.module;
    this.command = data.command;
    this.executionMode = data.executionMode;
    this.executionModeName = data.executionModeName;
    this.brand = data.brand;
    this.version = new Version(data.version.major + '.' + data.version.minor + '.' + data.version.patch);
    this.versionName = this.version.getVersion();
    
    return this;
  }
  
  /* Método de conversão da consulta do Agent-Server, para o Agent */
  public toClient(): QueryClient {
    
    let q: QueryClient = new QueryClient(this.version.getVersion());
    
    q.id = null;
    q.scheduleId = null;
    q.name = this.name;
    q.command = this.command;
    q.executionMode = this.executionMode;
    q.TOTVS = true;
    
    return q;
  }
  
  public getKey(): string {
    return this.licenseId + '|' + this.brand + '|' + this.name + '|' + this.version.getVersion();
  }
  
  constructor() {
    this.id = null;
    this.licenseId = '';
    this.name = '';
    this.module = '';
    this.command = '';
    this.executionMode = '';
    this.executionModeName = null;
    this.brand = '';
    this.version = new Version(null);
    this.versionName = this.version.getVersion();
  }
}

/* Interface de rotinas do Agent-Server */
export class ScriptServer {
  id: string;
  licenseId: string;
  name: string;
  module: string;
  command: string;
  brand: string;
  version: Version;
  versionName?: string;
  
  /* Método de conversão da rotina (JSON => Objeto) */
  public toObject(data: ScriptServer): ScriptServer {
    this.id = data.id;
    this.licenseId = data.licenseId;
    this.name = data.name;
    this.module = data.module;
    this.command = data.command;
    this.brand = data.brand;
    this.version = new Version(data.version.major + '.' + data.version.minor + '.' + data.version.patch);
    this.versionName = this.version.getVersion();
    
    return this;
  }
  
  /* Método de conversão da rotina do Agent-Server, para o Agent */
  public toClient(): ScriptClient {
    let s: ScriptClient = new ScriptClient(this.version.getVersion());
    
    s.id = null;
    s.scheduleId = null;
    s.name = this.name;
    s.command = this.command;
    s.TOTVS = true;
    
    return s;
  }
  
  public getKey(): string {
    return this.licenseId + '|' + this.brand + '|' + this.name + '|' + this.version.getVersion();
  }
  
  constructor() {
    this.id = null;
    this.licenseId = '';
    this.name = '';
    this.module = '';
    this.command = '';
    this.brand = '';
    this.version = new Version(null);
    this.versionName = this.version.getVersion();
  }
}

/* Interface de resposta do Agent-Server, com todos os objetos a serem atualizados */
export class DataUpdate {
  ETLParameters: ETLParameterServer[];
  SQLParameters: SQLParameterServer[];
  Queries: QueryServer[];
  Scripts: ScriptServer[];
  
  constructor(ETLParameters: ETLParameterServer[], SQLParameters: SQLParameterServer[], queries: QueryServer[], scripts: ScriptServer[]) {
    this.ETLParameters = ETLParameters;
    this.SQLParameters = SQLParameters;
    this.Queries = queries;
    this.Scripts = scripts;
  }
}
