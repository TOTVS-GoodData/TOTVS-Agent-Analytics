/* Constantes do banco de dados */
import { CNST_PORT_MINIMUM } from '../app-constants';

/* Interface de bancos de dados do Agent */
export class Database {
  id: string;
  name: string;
  type: string;
  brand: string;
  connectionType: string;
  driverClass: string;
  driverPath: string;
  ipType: string;
  ip: string;
  port: number;
  instance: string;
  db_databaseName: string;
  connectionString: string;
  username: string;
  password: string;
  
  constructor() {
    this.id = null;
    this.name = '';
    this.type = '';
    this.brand = '';
    this.driverClass = '';
    this.driverPath = '';
    this.connectionType = '';
    this.ip = '';
    this.ipType = '';
    this.port = CNST_PORT_MINIMUM;
    this.instance = '';
    this.db_databaseName = '';
    this.connectionString = '';
    this.username = '';
    this.password = '';
  }
  
  /* Método de conversão do banco de dados (JSON => Objeto) */
  public toObject(data: Database): Database {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.brand = data.brand;
    this.connectionType = data.connectionType;
    this.driverClass = data.driverClass;
    this.driverPath = data.driverPath;
    this.ipType = data.ipType;
    this.ip = data.ip;
    this.port = data.port;
    this.instance = data.instance;
    this.db_databaseName = data.db_databaseName;
    this.connectionString = data.connectionString;
    this.username = data.username;
    this.password = data.password;
    
    return this;
  }
}
