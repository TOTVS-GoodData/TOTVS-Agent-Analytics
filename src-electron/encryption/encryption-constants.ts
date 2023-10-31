/* Dependência do Node, usada para consultar o endereço dos arquivos da Máquina */
import * as path from 'path';

export const CNST_ENCRYPTION_PATH: string = './src-electron/encryption';
export const CNST_KEYS_PATH: string = path.join(CNST_ENCRYPTION_PATH, 'keys');

export const CNST_FILE_KEY_PUBLIC_AGENT: string = path.join(CNST_KEYS_PATH, 'agent.rsa.public');
export const CNST_FILE_KEY_PUBLIC_SERVER: string = path.join(CNST_KEYS_PATH, 'server.rsa.public');
export const CNST_FILE_KEY_PRIVATE_AGENT: string = path.join(CNST_KEYS_PATH, 'agent.rsa.private');

