/* Componentes padrões do Electron */
import { app, BrowserWindow } from 'electron';

/* Dependência do Node, para consulta de diretórios */
import * as path from 'path';

//Thread central de inicialização do Electron
import Main from './electron-main';

export class TOTVS_Agent_Analytics {
  
  /* Retorna se o Agent-Client será inicializado em modo espelho, ou não */
  private static mirrorMode: number = 0;
  public static getMirrorMode(): number {
    return TOTVS_Agent_Analytics.mirrorMode;
  }

  /* Define se o Agent-Client será inicializado em modo espelho, ou não */
  public static setMirrorMode(mirror: number): void {
    TOTVS_Agent_Analytics.mirrorMode = mirror;
  }

  /* Retorna o caminho relativo do diretório remoto do Agent-Client (MirrorMode) */
  private static mirrorPath: string = null;
  public static getMirrorPath(): string {
    return TOTVS_Agent_Analytics.mirrorPath;
  }

  /* Define o caminho relativo do diretório remoto do Agent-Client (MirrorMode) */
  private static setMirrorPath(mirrorPath: string): void {
    TOTVS_Agent_Analytics.mirrorPath = mirrorPath;
  }

  /* Exporta o modo de execução do Electron */
  public static isProduction(): boolean {
    if (app.isPackaged) return true;
    else return false;
  }
  
  /* Exporta o diretório de instalação do Electron */
  public static getRootPath(): string {
    let rootFolder: string = null;
    if (app.isPackaged) rootFolder = path.dirname(app.getPath('exe'));
    else rootFolder = process.env.INIT_CWD || process.env.PWD;
    
    if (TOTVS_Agent_Analytics.mirrorMode == 2) rootFolder = path.join(rootFolder, 'node_modules/TOTVS-Agent-Analytics');
    
    return rootFolder;
  }
  
  /* Função de disparo da inicialização do TOTVS-Agent-Analytics */
  public static init(mirror: number, mirrorPath: string): void {
    TOTVS_Agent_Analytics.setMirrorMode(mirror);
    if (!((mirror == 0) || (mirror == 1))) TOTVS_Agent_Analytics.setMirrorPath(mirrorPath);
    Main.main(app, TOTVS_Agent_Analytics.mirrorMode);
  }
}
