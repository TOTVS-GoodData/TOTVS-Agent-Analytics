import { BrowserWindow, ipcMain, App, IpcMainEvent, dialog, Tray, Menu, nativeImage } from 'electron';
import { autoUpdater } from 'electron-updater';
import AutoLaunch from 'auto-launch';

import { Execute } from './src-electron/execute';
import { Functions } from './src-electron/functions';
import { Files2 } from './src-electron/files2';
import { Translations, TranslationInput } from './src-electron/translations';

import * as globals from './src-electron/constants-electron';
import * as constants from './src-angular/app/utilities/constants-angular';

import { DatabaseData, Workspace, Database, Schedule, Query, Script, Configuration, Updater, UpdaterProgress } from './src-angular/app/utilities/interfaces';

import { lastValueFrom, map } from 'rxjs';

export default class Main {
  public static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static execute: Execute = new Execute();
  
  static hidden: boolean = false;
  static triggerSchedules: boolean = true;
  static terminate: boolean = false;
  static trayMenu: Tray = null;
  
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
      let translations: any = Translations.getTranslations([
        new TranslationInput('ELECTRON.AUTOLAUNCH_ERROR', [])
      ]);
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.AUTOLAUNCH_ERROR'], null, null, null);
    });
  }
  
  private static setAutoUpdaterPreferences(): void {
    autoUpdater.checkForUpdatesAndNotify();
    
    autoUpdater.on('checking-for-update', () => {
      let translations: any = Translations.getTranslations([
        new TranslationInput('ELECTRON.UPDATE_CHECK', [])
      ]);
      
      Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.UPDATE_CHECK'], null, null, null);
    });
    
    autoUpdater.on('update-available', (info: any) => {
      let translations: any = Translations.getTranslations([
        new TranslationInput('ELECTRON.UPDATE_AVAILABLE', [autoUpdater.currentVersion, info.version])
      ]);
      
      Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.UPDATE_AVAILABLE'], null, null, null);
    });
    
    autoUpdater.on('update-not-available', (info: any) => {
      let translations: any = Translations.getTranslations([
        new TranslationInput('ELECTRON.UPDATE_NOT_AVAILABLE', [info.version])
      ]);
      
      Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.UPDATE_NOT_AVAILABLE'], null, null, null);
    });
    
    autoUpdater.on('error', (err: Error) => {
      let translations: any = Translations.getTranslations([
        new TranslationInput('ELECTRON.UPDATE_ERROR', [])
      ]);
      
      Files2.writeToLog(constants.CNST_LOGLEVEL.ERROR, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.UPDATE_ERROR'], null, null, err);
    });
    
    autoUpdater.on('download-progress', (info: UpdaterProgress) => {
      let str_total: string = '';
      let str_perc: string = '';
      let offset: string = '';
      let speed: string = (Math.round((info.bytesPerSecond / 1000000 + Number.EPSILON) * 100) / 100) + 'MBps';
      
      if (Functions.between(info.transferred, 0, 9999999)) {
        offset = '   ';
      } else if (Functions.between(info.transferred, 10000000, 99999999)) {
        offset = '  ';
      } else if (Functions.between(info.transferred, 100000000, 999999999)) {
        offset = ' ';
      } else {
        offset = '';
      }
      
      str_total = offset + Math.trunc(info.transferred / 1000000) + 'MB';
      
      if (Functions.between(info.percent, 0, 9)) {
        offset = '  ';
      } else if (Functions.between(info.percent, 10, 99.99)) {
        offset = ' ';
      } else {
        offset = '';
      }
      str_perc = offset + Math.trunc(info.percent) + '%';
      
      let translations: any = Translations.getTranslations([
        new TranslationInput('ELECTRON.UPDATE_DOWNLOAD', [str_total, str_perc, speed])
      ]);
      
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.UPDATE_DOWNLOAD'], null, null, null);
    });
    
    autoUpdater.on('update-downloaded', (info: any) => {
      let translations: any = Translations.getTranslations([
        new TranslationInput('ELECTRON.UPDATE_DOWNLOAD_OK', [info.version])
      ]);
      
      Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.UPDATE_DOWNLOAD_OK'], null, null, null);
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
        let translations: any = Translations.getTranslations([
          new TranslationInput('WORKSPACES.MESSAGES.LOADING_OK', [])
        ]);
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.LOADING_OK'], null, null, null);
        event.returnValue = workspaces;
      });
    });
    
    ipcMain.on('getWorkspacesByDatabase', (event: IpcMainEvent, db: Database) => {
      Files2.getWorkspacesByDatabase(db).subscribe((workspaces: Workspace[]) => {
        let translations: any = Translations.getTranslations([
          new TranslationInput('WORKSPACES.MESSAGES.LOADING_DATABASES_OK', [])
        ]);
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.LOADING_DATABASES_OK'], null, null, null);
        event.returnValue = workspaces;
      });
    });
    
    ipcMain.on('saveWorkspace', (event: IpcMainEvent, w: Workspace) => {
      Files2.saveWorkspace(w).subscribe((b: boolean) => {
        let translations: any = Translations.getTranslations([
          new TranslationInput('WORKSPACES.MESSAGES.SAVE_OK', [])
        ]);
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.SAVE_OK'], null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('deleteWorkspace', (event: IpcMainEvent, w: Workspace) => {
      Files2.deleteWorkspace(w).subscribe((b: boolean) => {
        let translations: any = Translations.getTranslations([
          new TranslationInput('WORKSPACES.MESSAGES.DELETE_OK', [])
        ]);
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.DELETE_OK'], null, null, null);
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
        let translations: any = Translations.getTranslations([
          new TranslationInput('DATABASES.MESSAGES.LOADING_OK', [])
        ]);
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.LOADING_OK'], null, null, null);
        event.returnValue = db;
        return db;
      });
    });
    
    ipcMain.on('saveDatabase', (event: IpcMainEvent, db: Database) => {
      Files2.saveDatabase(db).subscribe((b: boolean) => {
        let translations: any = Translations.getTranslations([
          new TranslationInput('DATABASES.MESSAGES.SAVE_OK', [])
        ]);
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.SAVE_OK'], null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('deleteDatabase', (event: IpcMainEvent, db: Database) => {
      Files2.deleteDatabase(db).subscribe((b: boolean) => {
        let translations: any = Translations.getTranslations([
          new TranslationInput('DATABASES.MESSAGES.DELETE_OK', [])
        ]);
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['DATABASES.MESSAGES.DELETE_OK'], null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.handle('testDatabaseConnection', (event: IpcMainEvent, inputBuffer: string) => {
      return lastValueFrom(this.execute.testDatabaseConnection(inputBuffer).pipe(map((res: any) => {
        return res;
      })));
    });
    
    /*******************/
    /*  AGENDAMENTOS   */
    /*******************/
    ipcMain.on('getSchedules', (event: IpcMainEvent, showLogs: boolean) => {
      Files2.getSchedules(showLogs).subscribe((s: Schedule[]) => {
        if (showLogs) {
          let translations: any = Translations.getTranslations([
            new TranslationInput('SCHEDULES.MESSAGES.LOADING_OK', [])
          ]);
          
          Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.LOADING_OK'], null, null, null);
        }
        
        event.returnValue = s;
        return s;
      });
    });
    
    ipcMain.on('saveSchedule', (event: IpcMainEvent, s: Schedule) => {
      Files2.saveSchedule(s).subscribe((b: boolean) => {
        let translations: any = Translations.getTranslations([
          new TranslationInput('SCHEDULES.MESSAGES.SAVE_OK', [])
        ]);
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.SAVE_OK'], null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('deleteSchedule', (event: IpcMainEvent, s: Schedule) => {
      Files2.deleteSchedule(s).subscribe((b: boolean) => {
        let translations: any = Translations.getTranslations([
          new TranslationInput('SCHEDULES.MESSAGES.DELETE_OK', [])
        ]);
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCHEDULES.MESSAGES.DELETE_OK'], null, null, null);
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
    
    ipcMain.handle('killProcess', (event: IpcMainEvent, scheduleId: string, execId: string) => {
      return this.execute.killProcess(scheduleId, execId);
    });
    
    /*******************/
    /*  CONFIGURAÇÃO   */
    /*******************/
    ipcMain.on('getConfiguration', (event: IpcMainEvent, showLogs: boolean) => {
      Files2.getConfiguration(showLogs).subscribe((conf: Configuration) => {
        if (showLogs) {
          let translations: any = Translations.getTranslations([
            new TranslationInput('CONFIGURATION.MESSAGES.LOADING_OK', [])
          ]);
          
          Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['CONFIGURATION.MESSAGES.LOADING_OK'], null, null, null);
        }
        
        event.returnValue = conf;
        return conf;
      });
    });
    
    ipcMain.on('saveConfiguration', (event: IpcMainEvent, conf: Configuration) => {
      Files2.saveConfiguration(conf).subscribe((b: boolean) => {
        let translations: any = Translations.getTranslations([
          new TranslationInput('CONFIGURATION.MESSAGES.SAVE_OK', [])
        ]);
        
        Main.updateTrayMenu();
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['CONFIGURATION.MESSAGES.SAVE_OK'], null, null, null);
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
        let translations: any = Translations.getTranslations([
          new TranslationInput('QUERIES.MESSAGES.LOADING_OK', [])
        ]);
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.LOADING_OK'], null, null, null);
        event.returnValue = q;
        return q;
      });
    });
    
    ipcMain.on('getQueriesBySchedule', (event: IpcMainEvent, sc: Schedule) => {
      Files2.getQueriesBySchedule(sc).subscribe((q: Query[]) => {
        let translations: any = Translations.getTranslations([
          new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING_OK', [])
        ]);
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SCHEDULE_LOADING_OK'], null, null, null);
        event.returnValue = q;
        return q;
      });
    });
    
    ipcMain.on('saveQuery', (event: IpcMainEvent, q: Query) => {
      Files2.saveQuery(q).subscribe((b: boolean) => {
        if (b) {
          let translations: any = Translations.getTranslations([
            new TranslationInput('QUERIES.MESSAGES.SAVE_OK', [])
          ]);
          
          Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.SAVE_OK'], null, null, null);
        }
        
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('deleteQuery', (event: IpcMainEvent, q: Query) => {
      Files2.deleteQuery(q).subscribe((b: boolean) => {
        if (b) {
          let translations: any = Translations.getTranslations([
            new TranslationInput('QUERIES.MESSAGES.DELETE_OK', [])
          ]);
          
          Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['QUERIES.MESSAGES.DELETE_OK'], null, null, null);
        }
        
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.handle('exportQuery', (event: IpcMainEvent, inputBuffer: string) => {
      return lastValueFrom(this.execute.exportQuery(inputBuffer).pipe(map((res: any) => {
        event.returnValue = res;
        return res;
      })));
    });
    
    /*******************/
    /*    SCRIPTS      */
    /*******************/
    ipcMain.on('getScripts', (event: IpcMainEvent) => {
      Files2.getScripts().subscribe((s: Script[]) => {
        let translations: any = Translations.getTranslations([
          new TranslationInput('SCRIPTS.MESSAGES.LOADING_OK', [])
        ]);
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.LOADING_OK'], null, null, null);
        event.returnValue = s;
        return s;
      });
    });
    
    ipcMain.on('getScriptsBySchedule', (event: IpcMainEvent, sc: Schedule) => {
      Files2.getScriptsBySchedule(sc).subscribe((s: Script[]) => {
        let translations: any = Translations.getTranslations([
          new TranslationInput('SCRIPTS.MESSAGES.SCHEDULE_LOADING_OK', [])
        ]);
        
        Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SCHEDULE_LOADING_OK'], null, null, null);
        event.returnValue = s;
        return s;
      });
    });
    
    ipcMain.on('saveScript', (event: IpcMainEvent, s: Script) => {
      Files2.saveScript(s).subscribe((b: boolean) => {
        if (b) {
          let translations: any = Translations.getTranslations([
            new TranslationInput('SCRIPTS.MESSAGES.SAVE_OK', [])
          ]);
          
          Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.SAVE_OK'], null, null, null);
        }
        
        event.returnValue = b;
        return b;
      });
    });
    
    ipcMain.on('deleteScript', (event: IpcMainEvent, s: Script) => {
      Files2.deleteScript(s).subscribe((b: boolean) => {
        if (b) {
          let translations: any = Translations.getTranslations([
            new TranslationInput('SCRIPTS.MESSAGES.DELETE_OK', [])
          ]);
          
          Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['SCRIPTS.MESSAGES.DELETE_OK'], null, null, null);
        }
        
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
    
    ipcMain.on('getTmpPath', (event: IpcMainEvent) => {
      event.returnValue = globals.CNST_TMP_PATH;
      return globals.CNST_TMP_PATH;
    });
    
    /*******************/
    /*    LOGFILES     */
    /*******************/
    ipcMain.on('writeToLog', (event: IpcMainEvent, loglevel: any, system: string, message: string, err: any) => {
      event.returnValue = Files2.writeToLog(loglevel, system, message, null, null, err);
    });
    
    ipcMain.on('readLogs', (event: IpcMainEvent) => {
      event.returnValue = Files2.readLogs();
      return;
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
    
    
    /*
    ipcMain.on('setStatusExecution', (event: IpcMainEvent, idExecutionCancel, status) => {
      event.returnValue = this.process.setStatusExecution(idExecutionCancel, status);
    });*/
  }
  
  private static renderWindow(): void {
    if (Main.mainWindow == null) {
      Main.mainWindow = new BrowserWindow({
        icon: Main.getIconPath(),
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
    Files2.getConfiguration(true).subscribe((configuration: Configuration) => {
      Translations.use((configuration.locale));
      let translations: any = Translations.getTranslations([
        new TranslationInput('ELECTRON.SYSTEM_START', [])
      ]);
      
      Files2.writeToLog(constants.CNST_LOGLEVEL.INFO, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SYSTEM_START'], null, null, null);
      Main.setAutoUpdaterPreferences();
      Main.setIpcListeners();
      Main.setAutoLaunchOptions();
      Main.updateTrayMenu();
      Main.renderWindow();
    });
  }
  
  private static getIconPath(): string {
    if (process.platform == 'linux') return globals.CNST_ICON_LINUX;
    else if (process.platform == 'win32') return globals.CNST_ICON_WINDOWS;
    else return globals.CNST_ICON_WINDOWS;
  }
  
  private static updateTrayMenu(): void {
    let iconPath: string = null;
    let translations: any = Translations.getTranslations([
      new TranslationInput('ELECTRON.TRAY_OPEN_INTERFACE', []),
      new TranslationInput('ELECTRON.TRAY_FINISH_PROCESS', [])
    ]);
    console.log(Main.getIconPath());
    if (Main.trayMenu == null) Main.trayMenu = new Tray(
      nativeImage.createFromPath(
        Main.getIconPath()
      ).resize({ width: 16, height: 16 })
    );
    const contextMenu: Menu = Menu.buildFromTemplate([
       { label: translations['ELECTRON.TRAY_OPEN_INTERFACE'], type: 'normal', click: () => { Main.hidden = false; Main.renderWindow(); }}
      ,{ label: translations['ELECTRON.TRAY_FINISH_PROCESS'], type: 'normal', click: () => { Main.willClose(true); }}
    ]);
    Main.trayMenu.setToolTip(constants.CNST_PROGRAM_NAME.DEFAULT);
    Main.trayMenu.setContextMenu(contextMenu);
  }
  
  private static willClose(terminate?: boolean): void {
    Main.terminate = terminate;
    if (Main.mainWindow != null) Main.mainWindow.close();
    else Main.terminateApplication();
  }
  
  private static onClose(): void {
    let translations: any = Translations.getTranslations([
      new TranslationInput('ELECTRON.SYSTEM_WINDOW_CLOSE', [])
    ]);
    
    Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SYSTEM_WINDOW_CLOSE'], null, null, null);
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
    Translations.setDefaultLanguage(constants.CNST_DEFAULT_LANGUAGE);
    
    if (!Main.application.hasSingleInstanceLock()) {
      let translations: any = Translations.getTranslations([
        new TranslationInput('ELECTRON.THREAD_ERROR', [])
      ]);
      
      console.log(translations['ELECTRON.THREAD_ERROR']);
      Main.application.quit();
    } else {
      Files2.initApplicationData(_app.getLocale());
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
    let translations: any = Translations.getTranslations([
      new TranslationInput('ELECTRON.SYSTEM_FINISH', []),
      new TranslationInput('ELECTRON.SYSTEM_SERVICE', [])
    ]);
    
    if (Main.terminate) {
      if (process.platform !== 'darwin') {
        Main.application.quit();
      }
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SYSTEM_FINISH'], null, null, null);
    } else {
      Files2.writeToLog(constants.CNST_LOGLEVEL.DEBUG, constants.CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.SYSTEM_SERVICE'], null, null, null);
    }
  }
}