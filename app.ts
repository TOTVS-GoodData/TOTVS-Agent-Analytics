/* Componentes padrões do Electron */
import { app, BrowserWindow } from 'electron';

/* Dependência do Node, para consulta de diretórios */
import * as path from 'path';

//Define o diretório de instalação do Agent
let rootFolder: string = null;
let isProduction: boolean = null;
if (app.isPackaged) {
  rootFolder = path.dirname(app.getPath('exe'));
  isProduction = true;
} else {
  rootFolder = process.env.PWD;
  isProduction = false;
}

//Exporta o diretório de instalação para uso do Electron
export const CNST_APPLICATION_ROOTDIR: string = rootFolder;
export const CNST_APPLICATION_PRODUCTION: boolean = isProduction;

//Dispara a inicialização do Electron
import Main from './electron-main';
Main.main(app);
