/* Classe global do Agent */
import { TOTVS_Agent_Analytics } from '../app';

import { CNST_SERVER_IP_TYPES } from '../src-angular/app/services/server/server-constants';

/* Dependência do Node, usada para consultar o endereço dos arquivos da Máquina */
import * as path from 'path';

/* Periodicidade, em horas, que o Agent irá buscar atualizações */
export const CNST_AUTOUPDATE_CHECK_INTERVAL: number = 3;

/* Número máximo de falhas de comunicação com o Agent-Server permitidas, enquanto o acesso remoto estiver ativado. */
export const CNST_MIRRORMODE_PINGS_MAX: number = 5;

/* Hostname / Porta do Agent-Server da TOTVS */
export const CNST_SERVER_SOURCE: string = 'SERVER';
export const CNST_SERVER_PORT: number = 2000;
export const CNST_SERVER_HOSTNAME: any = {
  DEVELOPMENT: '::1',
  PRODUCTION: '10.171.70.55'
};

//Tipos de IP (IPv4 / IPv6)
export const CNST_SERVER_IP: any = {
  DEVELOPMENT: CNST_SERVER_IP_TYPES.IPV6,
  PRODUCTION: CNST_SERVER_IP_TYPES.IPV4
};

/* Caminho completo do diretório de recursos visuais do Agent (ícones) */
export const CNST_ICONS_PATH = (): string => path.join(TOTVS_Agent_Analytics.getRootDir(), 'icons');
export const CNST_ICONS_PATH_WINDOWS = (): string => path.join(CNST_ICONS_PATH(), 'windows');
export const CNST_ICONS_PATH_LINUX = (): string => path.join(CNST_ICONS_PATH(), 'linux');
export const CNST_ICON_WINDOWS = (): string => path.join(CNST_ICONS_PATH_WINDOWS(), 'analytics.ico');
export const CNST_ICON_LINUX = (): string => path.join(CNST_ICONS_PATH_LINUX(), 'analytics.png');

/* Tamanho, em pixels, do ícone do Agent p/ renderização no menu (Tray) */
export const CNST_ICON_SIZE: number = 16;

/* Caminho completo dos diretórios do Agent */
export const CNST_TMP_PATH = (): string => path.join(TOTVS_Agent_Analytics.getRootDir(), 'tmp');
export const CNST_I18N_PATH = (): string => path.join(TOTVS_Agent_Analytics.getRootDir(), 'i18n');
export const CNST_AGENT_CLIENT_DATABASE_PATH = (): string => path.join(TOTVS_Agent_Analytics.getRootDir(), 'assets');
export const CNST_LOGS_PATH = (): string => path.join(TOTVS_Agent_Analytics.getRootDir(), 'logs');
export const CNST_REMOTE_LOGS_PATH = (): string => path.join(TOTVS_Agent_Analytics.getRootDir(), 'remote');
export const CNST_JAVA_PATH = (): string => path.join(TOTVS_Agent_Analytics.getRootDir(), 'java');
export const CNST_JRE_PATH = (): string => path.join(TOTVS_Agent_Analytics.getRootDir(), 'java', 'jre', 'bin');

/* Caminho completo dos arquivos de cadastros do Agent (Produção / Desenv.) */
export const CNST_AGENT_CLIENT_DATABASE_NAME = (): string => path.join(CNST_AGENT_CLIENT_DATABASE_PATH(), 'db.json');
export const CNST_AGENT_CLIENT_DATABASE_NAME_DEV = (): string => path.join(CNST_AGENT_CLIENT_DATABASE_PATH(), 'dbDevelopment.json');
export const CNST_AGENT_CLIENT_DATABASE_NAME_MIRROR = (): string => path.join(CNST_AGENT_CLIENT_DATABASE_PATH(), 'dbMirror.json');

/* Nome das classes do Java, usadas para definir o ponto de entrada do Java */
export const CNST_JAVA_CLASS_TESTCONNECTION: string = 'com.gooddata.agent.util.TestDatabaseConnection';
export const CNST_JAVA_CLASS_EXPORTQUERY: string = 'com.gooddata.agent.jdbc.JdbcExport';
export const CNST_JAVA_CLASS_RUNAGENT: string = 'com.gooddata.agent.Main';

/* Caminho completo do arquivo .jar do Agent */
export const CNST_JAR_PATH_FAST = (): string => path.join(CNST_JAVA_PATH(), 'TOTVS-Agent-Analytics-Java-0.9.0.jar');

/* Nome do arquivo criptografado de comandos do Java, usado para comunicação */
export const CNST_COMMAND_FILE: string = '_jCommand';

/* RegEx usada para filtrar os arquivos de logs válidos do diretório do Agent */
export const CNST_LOGS_FILENAME: string = 'logfile';
export const CNST_LOGS_MIRROR_FILENAME: string = 'mirror';
export const CNST_LOGS_EXTENSION: string = 'log';
export const CNST_LOGS_SPACING: number = 2;
export const CNST_LOGS_REGEX: string = CNST_LOGS_FILENAME + '\-(' + CNST_LOGS_MIRROR_FILENAME + '\-)?[0-9]{4}\-[0-9]{2}\-[0-9]{2}\.log';
export const CNST_LOGS_TAGS_CLIENT: string = '[CLIENT]';
export const CNST_LOGS_TAGS_MIRROR: string = '[MIRROR]';

/* Função usada para retornar o comando de quebra de linha padrão do sistema operacional*/
export const CNST_OS_LINEBREAK = () => {
  if (process.platform == 'win32') {
    return CNST_LINEBREAK.WIN;
  } else if (process.platform == 'linux') {
    return CNST_LINEBREAK.LINUX;
  } else {
    return CNST_LINEBREAK.MAC;
  }
}

/* Função usada para retornar o comando de barra padrão do sistema operacional*/
export const CNST_OS_SLASH = () => {
  if (process.platform == 'win32') {
    return CNST_SLASH.WIN;
  } else if (process.platform == 'linux') {
    return CNST_SLASH.LINUX;
  } else {
    return CNST_SLASH.MAC;
  }
}

/* Cadastro das quebras de linha, por sistema operacional */
export const CNST_SLASH: any = {
  WIN: '\\',
  LINUX: '\/',
  MAC: '\/'
}

/* Cadastro das quebras de linha, por sistema operacional */
export const CNST_LINEBREAK: any = {
  WIN: '\r\n',
  LINUX: '\n',
  MAC: '\r'
}
