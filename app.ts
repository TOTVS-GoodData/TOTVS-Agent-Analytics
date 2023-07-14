import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let rootFolder: string = null;
if (app.isPackaged) {
  rootFolder = path.dirname(app.getPath('exe'));
} else {
  rootFolder = process.env.PWD;
}

export const CNST_APPLICATION_ROOTDIR: string = rootFolder;
import Main from './electron-main';

Main.main(app);