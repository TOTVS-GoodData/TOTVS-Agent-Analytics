//Porta mínima aceitável p/ conexão ao banco de dados
import { CNST_PORT_MINIMUM } from '../app-constants';

//Tipo de banco de dados desconhecido (Outro)
export const CNST_DATABASE_OTHER = 'O';

/* Tipo de conexão ao banco de dados:
  DB: Conexão direta pelo nome do banco
  SERV: Serviço do Oracle
  SID: Conexão direta pelo nome do banco (Oracle)
*/
export const CNST_DATABASE_TYPE_DATABASE = 'DB';
export const CNST_DATABASE_TYPE_SERVICE = 'SERV';
export const CNST_DATABASE_TYPE_SID = 'SID';

//Marca do banco de dados
export const CNST_DATABASE_BRAND_SQLSERVER = 'SQL_Server';
export const CNST_DATABASE_BRAND_ORACLE = 'Oracle';
export const CNST_DATABASE_BRAND_PROGRESS = 'Progress';
export const CNST_DATABASE_BRAND_INFORMIX = 'Informix';

//Identificadores dos campos da string de conexão
//AVISO: Usar os mesmos valores no campo "driverConnectionString" da constante "CNST_DATABASE_TYPES" abaixo
export const CNST_DATABASE_CONNECTIONSTRING_IP = '<IP_ADDRESS>';
export const CNST_DATABASE_CONNECTIONSTRING_PORT = '<PORT>';
export const CNST_DATABASE_CONNECTIONSTRING_DATABASE = '<DATABASE>';
export const CNST_DATABASE_CONNECTIONSTRING_SERVICE = '<SERVICE>';
export const CNST_DATABASE_CONNECTIONSTRING_SID = '<SID>';
export const CNST_DATABASE_CONNECTIONSTRING_INSTANCE_1 = ';InstanceName=';
export const CNST_DATABASE_CONNECTIONSTRING_INSTANCE_2 = '<INSTANCE>';

//Validação do ip do banco de dados
export const CNST_DATABASE_IPTYPES: any = [
  { label: 'IPv4', value: 'IPV4', pattern: '^(\\b25[0-5]|\\b2[0-4][0-9]|\\b[01]?[0-9][0-9]?)(\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$' },
  { label: 'IPv6', value: 'IPV6', pattern: '^((([0-9A-Fa-f]{1,4}:){1,6}:)|(([0-9A-Fa-f]{1,4}:){7}))([0-9A-Fa-f]{1,4})$'},
  { label: 'Hostname', value: 'HOSTNAME', pattern: '^[0-9a-zA-Z\.\-\_]*$' }
];

//Tipos de bancos de dados disponíveis dentro do Agent
export const CNST_DATABASE_TYPES = [
  {
    label: 'SQL Server (2012)',
    value: 'SQL_Server_2012',
    brand: CNST_DATABASE_BRAND_SQLSERVER,
    connectionType: CNST_DATABASE_TYPE_DATABASE,
    driverClass: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
    driverPath: './java/files/jdbc/sqljdbc4.jar',
    driverConnectionString: 'jdbc:sqlserver://<IP_ADDRESS>:<PORT>;InstanceName=<INSTANCE>;DatabaseName=<DATABASE>',
    defaultPort: 1433
  },{
    label: 'Oracle Service (12.2 / 12cR2 / 18.3 / 19.x)',
    value: 'Oracle_ServiceName_8',
    brand: CNST_DATABASE_BRAND_ORACLE,
    connectionType: CNST_DATABASE_TYPE_SERVICE,
    driverClass: 'oracle.jdbc.driver.OracleDriver',
    driverPath: './java/files/jdbc/ojdbc8.jar',
    driverConnectionString: 'jdbc:oracle:thin:@//<IP_ADDRESS>:<PORT>/<SERVICE>',
    defaultPort: 1521
  },{
    label: 'Oracle SID (12.2 / 12cR2 / 18.3 / 19.x)',
    value: 'Oracle_SID_8',
    brand: CNST_DATABASE_BRAND_ORACLE,
    connectionType: CNST_DATABASE_TYPE_SID,
    driverClass: 'oracle.jdbc.driver.OracleDriver',
    driverPath: './java/files/jdbc/ojdbc8.jar',
    driverConnectionString: 'jdbc:oracle:thin:@<IP_ADDRESS>:<PORT>:<SID>',
    defaultPort: 1521
  },{
    label: 'Oracle Service (12.1 / 12cR1)',
    value: 'Oracle_ServiceName_7',
    brand: CNST_DATABASE_BRAND_ORACLE,
    connectionType: CNST_DATABASE_TYPE_SERVICE,
    driverClass: 'oracle.jdbc.driver.OracleDriver',
    driverPath: './java/files/jdbc/ojdbc7.jar',
    driverConnectionString: 'jdbc:oracle:thin:@//<IP_ADDRESS>:<PORT>/<SERVICE>',
    defaultPort: 1521
  },{
    label: 'Oracle SID (12.1 / 12cR1)',
    value: 'Oracle_SID_7',
    brand: CNST_DATABASE_BRAND_ORACLE,
    connectionType: CNST_DATABASE_TYPE_SID,
    driverClass: 'oracle.jdbc.driver.OracleDriver',
    driverPath: './java/files/jdbc/ojdbc7.jar',
    driverConnectionString: 'jdbc:oracle:thin:@<IP_ADDRESS>:<PORT>:<SID>',
    defaultPort: 1521
  },{
    label: 'Progress',
    value: 'Progress_11',
    brand: CNST_DATABASE_BRAND_PROGRESS,
    connectionType: CNST_DATABASE_TYPE_DATABASE,
    driverClass: 'com.ddtek.jdbc.openedge.OpenEdgeDriver',
    driverPath: './java/files/jdbc/openedge_v11.jar',
    driverConnectionString: 'jdbc:datadirect:openedge://<IP_ADDRESS>:<PORT>;DatabaseName=<DATABASE>',
    defaultPort: 1433
  },{
    label: 'Informix',
    value: 'Informix_ifx',
    brand: CNST_DATABASE_BRAND_INFORMIX,
    connectionType: CNST_DATABASE_TYPE_DATABASE,
    driverClass: 'com.informix.jdbc.IfxDriver',
    driverPath: './java/files/jdbc/ifxjdbc.jar',
    driverConnectionString: 'jdbc:informix-sqli://<IP_ADDRESS>:<PORT>/<DATABASE>',
    defaultPort: 1526
  },{
    label: null,
    value: CNST_DATABASE_OTHER,
    brand: CNST_DATABASE_OTHER,
    connectionType: CNST_DATABASE_TYPE_DATABASE,
    driverClass: '',
    driverPath: '',
    driverConnectionString: '',
    defaultPort: CNST_PORT_MINIMUM
  }
];
