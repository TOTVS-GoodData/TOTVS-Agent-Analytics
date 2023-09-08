/* Componentes padrões do Electron */
import { app, BrowserWindow } from 'electron';

/* Dependência do Node, para consulta de diretórios */
import * as path from 'path';

//Define o diretório de instalação do Agent
let rootFolder: string = null;
if (app.isPackaged) {
  rootFolder = path.dirname(app.getPath('exe'));
} else {
  rootFolder = process.env.PWD;
}

//Exporta o diretório de instalação para uso do Electron
export const CNST_APPLICATION_ROOTDIR: string = rootFolder;

//Dispara a inicialização do Electron
import Main from './electron-main';
Main.main(app);