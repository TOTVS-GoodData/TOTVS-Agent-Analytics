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
}