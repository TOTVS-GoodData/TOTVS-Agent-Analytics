/* Componentes padrões do Electron */
import { app, BrowserWindow } from 'electron';

/* Dependência do Node, para consulta de diretórios */
import * as path from 'path';

//Thread central de inicialização do Electron
import Main from './electron-main';

export class TOTVS_Agent_Analytics {
  
  //Define se o Agent será inicializado em modo espelho, ou não
  private static mirrorMode: number = 0;
  private static setMirrorMode(mirror: number): void {
    TOTVS_Agent_Analytics.mirrorMode = mirror;
  }
  
  //Exporta o modo de execução do Electron
  public static isProduction(): boolean {
    if (app.isPackaged) return true;
    else return false;
  }
  
  //Exporta o diretório de instalação do Electron
  public static getRootDir(): string {
    let rootFolder: string = null;
    if (app.isPackaged) rootFolder = path.dirname(app.getPath('exe'));
    else rootFolder = process.env.INIT_CWD || process.env.PWD;
    
    if (TOTVS_Agent_Analytics.mirrorMode == 2) rootFolder = path.join(rootFolder, 'node_modules/TOTVS-Agent-Analytics');
    
    return rootFolder;
  }
  
  //Função de disparo da inicialização do TOTVS-Agent-Analytics
  public static init(mirror: number): void {
    TOTVS_Agent_Analytics.setMirrorMode(mirror);
    Main.main(app, TOTVS_Agent_Analytics.mirrorMode);
  }
}
