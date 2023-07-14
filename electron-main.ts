import { BrowserWindow, ipcMain, App, IpcMainEvent, dialog, Tray, Menu, nativeImage } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as AutoLaunch from 'auto-launch';

import { Process } from './src-electron/process';
import { Execute } from './src-electron/execute';
import { Functions } from './src-electron/functions';
import { Files2 } from './src-electron/files2';

import * as globals from './src-electron/constants-electron';
import * as constants from './src-angular/app/utilities/constants-angular';

import { CNST_WORKSPACE_MESSAGES } from './src-angular/app/workspace/workspace-messages';
import { CNST_DATABASE_MESSAGES } from './src-angular/app/database/database-messages';
import { CNST_JAVA_MESSAGES } from './src-angular/app/java/java-messages';
import { CNST_SCHEDULE_MESSAGES } from './src-angular/app/schedule/schedule-messages';
import { CNST_QUERY_MESSAGES } from './src-angular/app/query/query-messages';
import { CNST_SCRIPT_MESSAGES } from './src-angular/app/script/script-messages';
import { CNST_CONFIGURATION_MESSAGES } from './src-angular/app/configuration/configuration-messages';

import { DatabaseData, Workspace, Database, Java, Schedule, Query, Script, Configuration, Updater, UpdaterProgress } from './src-angular/app/utilities/interfaces';

export default class Main {
  public static CNST_MESSAGES: any = {
     SYSTEM_START: '=== INICIALIZAÇÃO DO SISTEMA ==='
    ,SYSTEM_WINDOW_CLOSE: '=== Janela fechada ==='
    ,SYSTEM_FINISH: '=== DESLIGAMENTO DO SISTEMA ==='
    ,SYSTEM_SERVICE: '=== Executando aplicação pelo backend... ==='
    ,UPDATE_CHECK: 'Verificando atualizações...'
    ,UPDATE_AVAILABLE: (oldVersion: string, newVersion: string) => `Atualização disponível: ${oldVersion} --> ${newVersion}`
    ,UPDATE_NOT_AVAILABLE: (version: string) => `Nenhuma atualização do Agent disponível (${version})`
    ,UPDATE_ERROR: 'Falha no download do pacote de atualização.'
    ,AUTOLAUNCH_ERROR: 'Falha na configuração da inicialização automática do Agent.'
    ,THREAD_ERROR: 'ERRO - Agent já está em execução. Esta instância será encerrada.'
    ,UPDATE_DOWNLOAD: (total: string, perc: string, speed: string) => `Baixando atualização: ${total} (${perc}) -- vel: ${speed}`
    ,UPDATE_DOWNLOAD_OK: (version: string) => `Atualização ${version} baixada com sucesso. A instalação automática ocorrerá após desligamento do Agent.`
  };
  
  public static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static process: Process = new Process();
  static execute: Execute = new Execute();
  static functions: Functions = new Functions();
  
  static hidden: boolean = false;
  static triggerSchedules: boolean = true;
  static terminate: boolean = false;
  
  private static setAutoLaunchOptions(): void {
    let autoLaunch: AutoLaunch = new AutoLaunch({
	    name: constants.CNST_PROGRAM_NAME.DEFAULT,
	    path: process.execPath,
      isHidden: true
    });
    
    autoLaunch.enable();
    autoLaunch.isEnabled().then((isEnabled: boolean) => {
	    if(isEnabled) {
        return;
	    } else {
	      autoLaunch.enable();
      }
    }).catch((err: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, Main.CNST_MESSAGES.AUTOLAUNCH_ERROR, null, null, null);
    });
  }
  
  private static setAutoUpdaterPreferences(): void {
    autoUpdater.checkForUpdatesAndNotify();
    
    autoUpdater.on('checking-for-update', () => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.ELEC, Main.CNST_MESSAGES.UPDATE_CHECK, null, null, null);
    });
    
    autoUpdater.on('update-available', (info: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.ELEC, Main.CNST_MESSAGES.UPDATE_AVAILABLE(autoUpdater.currentVersion, info.version), null, null, null);
    });
    
    autoUpdater.on('update-not-available', (info: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.ELEC, Main.CNST_MESSAGES.UPDATE_NOT_AVAILABLE(info.version), null, null, null);
    });
    
    autoUpdater.on('error', (err: Error) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, Main.CNST_MESSAGES.UPDATE_ERROR, null, null, err);
    });
    
    autoUpdater.on('download-progress', (info: UpdaterProgress) => {
      let str_total: string = '';
      let str_perc: string = '';
      let offset: string = '';
      let speed: string = (Math.round((info.bytesPerSecond / 1000000 + Number.EPSILON) * 100) / 100) + 'MBps';
      
      if (Main.functions.between(info.transferred, 0, 9999999)) {
        offset = '   ';
      } else if (Main.functions.between(info.transferred, 10000000, 99999999)) {
        offset = '  ';
      } else if (Main.functions.between(info.transferred, 100000000, 999999999)) {
        offset = ' ';
      } else {
        offset = '';
      }
      
      str_total = offset + Math.trunc(info.transferred / 1000000) + 'MB';
      
      if (Main.functions.between(info.percent, 0, 9)) {
        offset = '  ';
      } else if (Main.functions.between(info.percent, 10, 99.99)) {
        offset = ' ';
      } else {
        offset = '';
      }
      str_perc = offset + Math.trunc(info.percent) + '%';
      
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Main.CNST_MESSAGES.UPDATE_DOWNLOAD(str_total, str_perc, speed), null, null, null);
    });
    
    autoUpdater.on('update-downloaded', (info: any) => {
      Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.ELEC, Main.CNST_MESSAGES.UPDATE_DOWNLOAD_OK(info.version), null, null, null);
    });
  }
  
  private static setIpcListeners(): void {
    ipcMain.on('startServer', (event: IpcMainEvent) => {
      event.returnValue = true;
      return true;
    });
    
    /*******************/
    /*   AMBIENTES     */
    /*******************/
    ipcMain.on('getWorkspaces', (event: IpcMainEvent) => {
      Files2.getWorkspaces().subscribe((workspaces: Workspace[]) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_OK, null, null, null);
        event.returnValue = workspaces;
      });
    });
    
    ipcMain.on('getWorkspacesByJavaConfiguration', (event: IpcMainEvent, j: Java) => {
      Files2.getWorkspacesByJavaConfiguration(j).subscribe((workspaces: Workspace[]) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_OK, null, null, null);
        event.returnValue = workspaces;
      });
    });
    
    ipcMain.on('getWorkspacesByDatabase', (event: IpcMainEvent, db: Database) => {
      Files2.getWorkspacesByDatabase(db).subscribe((workspaces: Workspace[]) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_DATABASES_OK, null, null, null);
        event.returnValue = workspaces;
      });
    });
    
    ipcMain.on('saveWorkspace', (event: IpcMainEvent, w: Workspace) => {
      Files2.saveWorkspace(w).subscribe((b: boolean) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_SAVE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('deleteWorkspace', (event: IpcMainEvent, w: Workspace) => {
      Files2.deleteWorkspace(w).subscribe((b: boolean) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_WORKSPACE_MESSAGES.WORKSPACE_DELETE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    /*
    /*******************/
    /* BANCOS DE DADOS */
    /*******************/
    ipcMain.on('getDatabases', (event: IpcMainEvent) => {
      Files2.getDatabases().subscribe((db: Database[]) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_DATABASE_MESSAGES.DATABASE_LOADING_OK, null, null, null);
        event.returnValue = db;
        return db;
      });
    });
    
    ipcMain.on('saveDatabase', (event: IpcMainEvent, db: Database) => {
      Files2.saveDatabase(db).subscribe((b: boolean) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_DATABASE_MESSAGES.DATABASE_SAVE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('deleteDatabase', (event: IpcMainEvent, db: Database) => {
      Files2.deleteDatabase(db).subscribe((b: boolean) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_DATABASE_MESSAGES.DATABASE_DELETE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('testDatabaseConnection', (event: IpcMainEvent, inputBuffer: string) => {
      this.execute.testDatabaseConnection(inputBuffer).subscribe((res: any) => {
        event.returnValue = res;
        return res;
      });
    });
    
    /*******************/
    /*      JAVA       */
    /*******************/
    ipcMain.on('getJavaConfigurations', (event: IpcMainEvent) => {
      Files2.getJavaConfigurations().subscribe((j: Java[]) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_JAVA_MESSAGES.JAVA_LOADING_OK, null, null, null);
        event.returnValue = j;
        return j;
      });
    });
    
    ipcMain.on('saveJavaConfiguration', (event: IpcMainEvent, j: Java) => {
      Files2.saveJavaConfiguration(j).subscribe((b: boolean) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_JAVA_MESSAGES.JAVA_SAVE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('deleteJavaConfiguration', (event: IpcMainEvent, j: Java) => {
      Files2.deleteJavaConfiguration(j).subscribe((b: boolean) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_JAVA_MESSAGES.JAVA_DELETE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    /*******************/
    /*  AGENDAMENTOS   */
    /*******************/
    ipcMain.on('getSchedules', (event: IpcMainEvent, showLogs: boolean) => {
      Files2.getSchedules(showLogs).subscribe((s: Schedule[]) => {
        if (showLogs) Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.SCHEDULE_LOADING_OK, null, null, null);
        event.returnValue = s;
        return s;
      });
    });
    
    ipcMain.on('saveSchedule', (event: IpcMainEvent, s: Schedule) => {
      Files2.saveSchedule(s).subscribe((b: boolean) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.SCHEDULE_SAVE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('deleteSchedule', (event: IpcMainEvent, s: Schedule) => {
      Files2.deleteSchedule(s).subscribe((b: boolean) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCHEDULE_MESSAGES.SCHEDULE_DELETE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('executeAndUpdateSchedule', (event: IpcMainEvent, schedule: Schedule) => {
      return Files2.executeAndUpdateSchedule(schedule).subscribe((b: boolean) => {
        event.returnValue = b;
        return b;
      });
    });
    
    /*******************/
    /*  CONFIGURAÇÃO   */
    /*******************/
    ipcMain.on('getConfiguration', (event: IpcMainEvent) => {
      Files2.getConfiguration().subscribe((conf: Configuration) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_CONFIGURATION_MESSAGES.CONFIG_LOADING_OK, null, null, null);
        event.returnValue = conf;
        return conf;
      });
    });
    
    ipcMain.on('saveConfiguration', (event: IpcMainEvent, conf: Configuration) => {
      Files2.saveConfiguration(conf).subscribe((b: boolean) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_CONFIGURATION_MESSAGES.CONFIG_SAVE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('getVersion', (event: IpcMainEvent) => {
      event.returnValue = autoUpdater.currentVersion;
      return autoUpdater.currentVersion;
    });
    
    /*******************/
    /*    QUERIES      */
    /*******************/
    ipcMain.on('getQueries', (event: IpcMainEvent) => {
      Files2.getQueries().subscribe((q: Query[]) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_QUERY_MESSAGES.QUERY_LOADING_OK, null, null, null);
        event.returnValue = q;
        return q;
      });
    });
    
    ipcMain.on('getQueriesBySchedule', (event: IpcMainEvent, sc: Schedule) => {
      Files2.getQueriesBySchedule(sc).subscribe((q: Query[]) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_QUERY_MESSAGES.QUERY_SCHEDULE_LOADING_OK, null, null, null);
        event.returnValue = q;
        return q;
      });
    });
    
    ipcMain.on('saveQuery', (event: IpcMainEvent, q: Query) => {
      Files2.saveQuery(q).subscribe((b: boolean) => {
        if (b) Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_QUERY_MESSAGES.QUERY_SAVE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('deleteQuery', (event: IpcMainEvent, q: Query) => {
      Files2.deleteQuery(q).subscribe((b: boolean) => {
        if (b) Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_QUERY_MESSAGES.QUERY_DELETE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('exportQuery', (event: IpcMainEvent, inputBuffer: string) => {
      this.execute.exportQuery(inputBuffer).subscribe((res: any) => {
        event.returnValue = res;
        return res;
      });
    });
    
    /*******************/
    /*    SCRIPTS      */
    /*******************/
    ipcMain.on('getScripts', (event: IpcMainEvent) => {
      Files2.getScripts().subscribe((s: Script[]) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCRIPT_MESSAGES.SCRIPT_LOADING_OK, null, null, null);
        event.returnValue = s;
        return s;
      });
    });
    
    ipcMain.on('getScriptsBySchedule', (event: IpcMainEvent, sc: Schedule) => {
      Files2.getScriptsBySchedule(sc).subscribe((s: Script[]) => {
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCRIPT_MESSAGES.SCRIPT_SCHEDULE_LOADING_OK, null, null, null);
        event.returnValue = s;
        return s;
      });
    });
    
    ipcMain.on('saveScript', (event: IpcMainEvent, s: Script) => {
      Files2.saveScript(s).subscribe((b: boolean) => {
        if (b) Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCRIPT_MESSAGES.SCRIPT_SAVE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('deleteScript', (event: IpcMainEvent, s: Script) => {
      Files2.deleteScript(s).subscribe((b: boolean) => {
        if (b) Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, CNST_SCRIPT_MESSAGES.SCRIPT_DELETE_OK, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    /*******************/
    /*  CRIPTOGRAFIA   */
    /*******************/
    ipcMain.on('encrypt', (event: IpcMainEvent, text: string) => {
      event.returnValue = Functions.encrypt(text);
    });
    
    ipcMain.on('decrypt', (event: IpcMainEvent, text: string) => {
      event.returnValue = Functions.decrypt(text);
    });
    
    /*******************/
    /*   DIRETÓRIOS    */
    /*******************/
    ipcMain.on('getFolder', (event: IpcMainEvent) => {
      Files2.getFolder(this.mainWindow).subscribe((folder: string) => {
        event.returnValue = folder;
      });
    });
    
    /*******************/
    /*    LOGFILES     */
    /*******************/
    ipcMain.on('writeToLog', (event: IpcMainEvent, loglevel: any, system: string, message: string, err: any) => {
      event.returnValue = Files2.writeToLog(loglevel, system, message, null, null, err);
    });
    
    ipcMain.on('readLogs', (event: IpcMainEvent) => {
      event.returnValue = Files2.readLogs();
    });
    
    ipcMain.on('openLogAgent', (event: IpcMainEvent) => {
      event.returnValue = Files2.openLogAgent();
      event.returnValue = true;
    });
    
    ipcMain.on('deleteOldLogs', (event: IpcMainEvent) => {
      event.returnValue = Files2.deleteOldLogs();
    });
    
    /*******************/
    /*  DESLIGAMENTO   */
    /*******************/
    ipcMain.on('exit', (event: IpcMainEvent) => {
      Main.willClose(false);
    });
    
    
    
    
    
    
    ipcMain.on('checkToken', (event: IpcMainEvent, token: string) => {
      this.execute.checkToken(token).subscribe((res: any) => {
        event.returnValue = res;
        return res;
      });
    });
    
    
    
    
    
    
    
    
    
    /*ipcMain.on('getServerPort', (event: IpcMainEvent) => {
      event.returnValue = this.server.getServerPort();
    });
    
    ipcMain.on('saveServerPort', (event: IpcMainEvent, port) => {
      this.server.saveServerPort(port).then(() => {
        event.returnValue = true;
      }, () => {
        event.returnValue =  false
      });
    });*/
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    ipcMain.on('setStatusExecution', (event: IpcMainEvent, idExecutionCancel, status) => {
      event.returnValue = this.process.setStatusExecution(idExecutionCancel, status);
    });
  }
  
  private static renderWindow(): void {
    if (Main.mainWindow == null) {
      Main.mainWindow = new BrowserWindow({
        icon: __dirname + 'icon.ico',
        show: false,
        webPreferences: {
          contextIsolation: false,
          nodeIntegration: true
        }
      });
      
      Main.mainWindow.loadURL('file://' + __dirname + '/index.html' );
      Main.mainWindow.once('ready-to-show', () => {
        if (!Main.hidden) {
          Main.mainWindow.maximize();
          Main.mainWindow.show();
          Main.mainWindow.focus();
        }
      });
      
      // Evento acionado ao fechar a janela
      Main.mainWindow.on('closed', function () {
        Main.onClose();
      });
      
      // Bloqueia a navegação em links externos
      Main.mainWindow.webContents.on('will-navigate', event => {
        event.preventDefault();
      });
    } else {
      Main.mainWindow.focus();
    }
  }
  
  private static onReady(): void {
    let iconPath: string = null;
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.ELEC, Main.CNST_MESSAGES.SYSTEM_START, null, null, null);
    Main.setAutoUpdaterPreferences();
    Main.setIpcListeners();
    Main.setAutoLaunchOptions();
    
    if (process.platform == 'linux') {
      iconPath = globals.CNST_PROGRAM_PATH + '/icons/linux/analytics.png';
    } else if (process.platform == 'win32') {
      iconPath = globals.CNST_PROGRAM_PATH + '/icons/windows/analytics.ico';
    } else {
      iconPath = globals.CNST_PROGRAM_PATH + '/icons/linux/analytics.ico';
    }
    
    let tray: Tray = new Tray(nativeImage.createFromPath(iconPath));
    const contextMenu: Menu = Menu.buildFromTemplate([
       { label: 'Abrir interface', type: 'normal', click: () => { Main.hidden = false; Main.renderWindow(); }}
      ,{ label: 'Encerrar processo', type: 'normal', click: () => { Main.willClose(true); }}
    ]);
    tray.setToolTip(constants.CNST_PROGRAM_NAME.DEFAULT);
    tray.setContextMenu(contextMenu);
    Main.renderWindow();
  }
  
  private static willClose(terminate?: boolean): void {
    Main.terminate = terminate;
    if (Main.mainWindow != null) Main.mainWindow.close();
    else Main.terminateApplication();
  }
  
  private static onClose(): void {
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Main.CNST_MESSAGES.SYSTEM_WINDOW_CLOSE, null, null, null);
    Main.mainWindow = null;
  }
  
  private static onActivate(): void {
    if (Main.mainWindow === null) {
//      createWindow();
    }
  }
  
  static main(_app: App) {
    Main.application = _app;
    Main.application.disableHardwareAcceleration();
    Main.application.requestSingleInstanceLock();
    
    if (!Main.application.hasSingleInstanceLock()) {
      console.log(Main.CNST_MESSAGES.THREAD_ERROR);
      Main.application.quit();
    } else {
      Files2.initApplicationData();
      this.hidden = (Main.application.commandLine.hasSwitch('hidden') ? true : false);
      this.triggerSchedules = (Main.application.commandLine.hasSwitch('triggerSchedules') ? true : false);
      
      Main.application.on('activate', Main.onActivate);
      Main.application.on('ready', Main.onReady);
      Main.application.on('window-all-closed', Main.terminateApplication);
      Main.application.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
        if (Main.mainWindow != null) {
          if (Main.mainWindow.isMinimized()) Main.mainWindow.restore();
          Main.mainWindow.focus();
        } else {
          Main.renderWindow();
        }
      });
      
      if (Main.triggerSchedules) {
        setInterval(() => {
          if (new Date().getSeconds() == 0) {
            Files2.getSchedulesToExecute().subscribe((schedules: Schedule[]) => {
              schedules.map(async (s: Schedule) => {
                await Files2.executeAndUpdateSchedule(s).subscribe((b: boolean) => {
                  return b;
                });
              });
            });
          }
        }, 1000);
      }
    }
  }
  
  public static terminateApplication(): void {
    if (Main.terminate) {
      if (process.platform !== 'darwin') {
        Main.application.quit();
      }
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Main.CNST_MESSAGES.SYSTEM_FINISH, null, null, null);
    } else {
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, Main.CNST_MESSAGES.SYSTEM_SERVICE, null, null, null);
    }
  }
}