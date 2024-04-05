/* Classe global do Agent */
import { TOTVS_Agent_Analytics } from './app';

/* Componentes padrões do Electron */
import { BrowserWindow, ipcMain, App, IpcMainEvent, dialog, Tray, Menu, nativeImage, screen } from 'electron';
import { autoUpdater } from 'electron-updater';

/* Dependência de inicialização automática do Agent */
import AutoLaunch from 'auto-launch';

/* Serviços do Electron */
import { Execute } from './src-electron/execute';
import { Functions } from './src-electron/functions';

/* Serviços de arquivos */
import { Files } from './src-electron/files';
import { FileValidation } from './src-electron/files-interface';

/* Serviço de criptografia do Agent */
import { EncryptionService } from './src-electron/encryption/encryption-service';

/* Serviço de comunicação com o Agent-Server */
import { ServerService } from './src-electron/services/server-service';
import {
  License,
  AvailableLicenses,
  QueryCommunication,
  ScriptCommunication,
  ETLParameterCommunication,
  SQLParameterCommunication,
  ServerCommunication
} from './src-angular/app/services/server/server-interface';

/* Serviço de tradução do Electron */
import { TranslationService } from './src-electron/services/translation-service';
import { TranslationInput } from './src-angular/app/services/translation/translation-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from './src-angular/app/utilities/utilities-constants';
import { CNST_PROGRAM_NAME } from './src-angular/app/app-constants';
import {
  CNST_AUTOUPDATE_CHECK_INTERVAL,
  CNST_ICON_SIZE,
  CNST_ICON_WINDOWS,
  CNST_ICON_LINUX,
  CNST_TMP_PATH,
  CNST_MIRRORMODE_PINGS_MAX,
  CNST_REMOTE_PATH
} from './src-electron/electron-constants';

/* Dependência de comunicação com o Registro do Windows */
import Winreg from 'winreg';
import Registry from 'winreg';

/* Interfaces da atualização automática do Agent */
import { ClientData, Updater, UpdaterProgress } from './src-electron/electron-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from './src-electron/services/workspace-service';
import { Workspace } from './src-angular/app/workspace/workspace-interface';

/* Serviço de bancos de dados do Agent */
import { DatabaseService } from './src-electron/services/database-service';
import { Database } from './src-angular/app/database/database-interface';

/* Serviço de agendametos do Agent */
import { ScheduleService } from './src-electron/services/schedule-service';
import { Schedule } from './src-angular/app/schedule/schedule-interface';

/* Interfaces de logs do Agent-Client */
import { AgentLogMessage } from './src-angular/app/monitor/monitor-interface';

/* Serviço de consultas do Agent */
import { QueryService } from './src-electron/services/query-service';
import { QueryClient } from './src-angular/app/query/query-interface';

/* Serviço de rotinas do Agent */
import { ScriptService } from './src-electron/services/script-service';
import { ScriptClient } from './src-angular/app/script/script-interface';

/* Serviço de configuração do Agent */
import { ConfigurationService } from './src-electron/services/configuration-service';
import { Configuration } from './src-angular/app/configuration/configuration-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, from, lastValueFrom, map, switchMap, of } from 'rxjs';

export class ElectronMessage {
  level: any;
  message: string;

  constructor(level: any, message: string) {
    this.level = level;
    this.message = message;
  }
}
export default class Main {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Interface do Agent
  private static mainWindow: Electron.BrowserWindow = null;
  private static x: number = null;
  private static y: number = null;
  
  //Referência da aplicação como um todo, passada ao inicializar o Electron
  static application: Electron.App = null;

  //Referência do idioma do sistema operacional
  private static localeLanguage: string = null;

  //Referência do temporizador de atualizações automáticas do Agent
  private static autoUpdaterRefresh: any = null;
  
  //Menu minimizado do Agent (Interface fechada)
  private static trayMenu: Tray = null;
  
  //Referência da função de temporização do Agent
  private static timerRefId: any = null;
  private static mirrorPing: any = null;

  //Sistema de envio de mensagens do Electron, para a interface do Agent (Angular)
  private static electronMessages: ElectronMessage[] = [];

  /********* Parâmetros CMD *********/
  //Define se a interface do Agent deve ser renderizada em tela, ou não
  private static hidden: boolean = false;
  
  //Define se os agendamentos configurados no Agent devem ser automaticamente checados, e disparados
  private static triggerSchedules: boolean = true;
  
  /*
  Define se esta instância do Agent está sendo executada pelo MirrorMode
    
    0 = Acesso normal (Usuário)
    1 = Acesso bloqueado por comando remoto
    2 = Instância espelhada, disparada pelo Agent-Server
    3 = Instância espelhada, dispara pelo Agent-Client
  */
  private static mirrorMode: number = 0;

  //Define se esta instância do Agent está controlando outro Agent-Client
  private static remoteAccess: boolean = false;

  /*********************************/
  /******* MÉTODOS DO MÓDULO  ******/
  /*********************************/
  public static getLocaleLanguage(): string {
    return Main.localeLanguage;
  }

  public static setLocaleLanguage(localeLanguage: string): void {
    Main.localeLanguage = localeLanguage;
  }

  /* Método de atualização das preferências vinculadas ao acesso remoto (MirrorMode) */
  public static updateDeactivationPreferrences(): void {
    if (Main.mainWindow != null) Main.mainWindow.webContents.send('AC_deactivateAgent', null);
    return;
  }
  
  /* Método de atualização das preferências vinculadas ao acesso remoto (MirrorMode) */
  public static updateMirrorModePreferences(): Observable<boolean> {
    return ConfigurationService.getConfiguration(false).pipe(map((conf: Configuration) => {
      if (Main.mainWindow != null) Main.mainWindow.webContents.send('AC_setMirrorMode', TOTVS_Agent_Analytics.getMirrorMode());
      if (TOTVS_Agent_Analytics.getMirrorMode() == 1) {
        if (Main.trayMenu) {
          Main.trayMenu.destroy();
          Main.trayMenu = null;
          
          //Ativa a verificação de conexão com o Agent-Server
          let i: number = 0;
          let errors: number = 0;
          Main.mirrorPing = setInterval(() => {
            if (i == 60) {
              i = 0;
              ServerService.pingServer().subscribe((b: boolean) => {
                if (!b) {
                  errors = errors + 1;
                  if (errors == CNST_MIRRORMODE_PINGS_MAX) {
                    Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['MIRROR_MODE.SERVER_PING_ERROR'], null, null, null, null, null);
                    let comm: ServerCommunication = new ServerCommunication();
                    comm.args = ['0'];
                    ServerService.setMirrorMode(comm).subscribe();
                  }
                  
                  if (errors < CNST_MIRRORMODE_PINGS_MAX) {
                    let translations: any = TranslationService.getTranslations([
                      new TranslationInput('MIRROR_MODE.SERVER_PING_WARNING', ['' + errors, '' + CNST_MIRRORMODE_PINGS_MAX])
                    ]);
                    Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['MIRROR_MODE.SERVER_PING_WARNING'], null, null, null, null, null);
                  }
                }
              });
            }
            i = i + 1;
          }, 1000);
        }
        return true;
      } else if (TOTVS_Agent_Analytics.getMirrorMode() == 0) {
        clearInterval(Main.mirrorPing);
        TranslationService.use(conf.locale);
        Main.updateTrayMenu();
      }
    }));
  }
  /*********************************/
  /*** Inicialização Automática  ***/
  /*********************************/
  /* Método que define as configurações de inicialização automática do Agent */
  private static setAutoLaunchOptions(): void {
    let autoLaunch: AutoLaunch = new AutoLaunch({
      name: CNST_PROGRAM_NAME.DEFAULT,
      path: process.execPath,
      isHidden: true
    });
    
    //Ativa a inicialização automática do Agent
    autoLaunch.enable();
    autoLaunch.isEnabled().then((isEnabled: boolean) => {
      if (isEnabled) {
        return;
      } else {
        autoLaunch.enable();
      }
    }).catch((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.AUTOLAUNCH_ERROR'], null, null, null, null, null);
    });
  }
  
  /*********************************/
  /***        Atualização        ***/
  /*********************************/
  /* Método de consulta por novas versões do Agent (Periódica) */
  private static autoUpdaterCheck(active: boolean): void {
    
    //Reinicia o temporizador de consulta das atualizações.
    if (Main.autoUpdaterRefresh != null) clearInterval(Main.autoUpdaterRefresh);
    
    //Caso a atualização automática esteja ativada, inicializa o temporizador
    if (active) {
      autoUpdater.checkForUpdates();
      Main.autoUpdaterRefresh = setInterval(() => 
        autoUpdater.checkForUpdates(),
        1000 * 60 * 60 * CNST_AUTOUPDATE_CHECK_INTERVAL
      );
    }
  }
  
  /* Método que configura os eventos de atualização do Agent */
  private static setAutoUpdaterPreferences(): void {
    
    //Evento de início da consulta por novas atualizações
    autoUpdater.on('checking-for-update', () => {
      Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.UPDATE_CHECK'], null, null, null, null, null);
    });
    
    //Evento de nova atualização encontrada
    autoUpdater.on('update-available', (info: any) => {
      
      //Consulta das traduções
      let translations: any = TranslationService.getTranslations([
        new TranslationInput('ELECTRON.UPDATE_AVAILABLE', [autoUpdater.currentVersion, info.version])
      ]);
      
      Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.UPDATE_AVAILABLE'], null, null, null, null, null);
    });
    
    //Evento de nenhuma atualização encontrada
    autoUpdater.on('update-not-available', (info: any) => {
      
      //Consulta das traduções
      let translations: any = TranslationService.getTranslations([
        new TranslationInput('ELECTRON.UPDATE_NOT_AVAILABLE', [info.version])
      ]);
      
      Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.UPDATE_NOT_AVAILABLE'], null, null, null, null, null);
    });
    
    //Evento de progresso do download da atualização do Agent (Emitido a cada segundo)
    autoUpdater.on('download-progress', (info: UpdaterProgress) => {
      
      //Variável que calcula a velocidade de download da conexão
      let speed: string = (Math.round((info.bytesPerSecond / 1000000 + Number.EPSILON) * 100) / 100) + 'MBps';
      
      //Formata o total de bytes transferidos até o momento, para escrita no arquivo de log
      let str_total: string = '';
      if (Functions.between(info.transferred, 0, 9999999)) {
        str_total = '   ' + Math.trunc(info.transferred / 1000000) + 'MB';
      } else if (Functions.between(info.transferred, 10000000, 99999999)) {
        str_total = '  ' + Math.trunc(info.transferred / 1000000) + 'MB';
      } else if (Functions.between(info.transferred, 100000000, 999999999)) {
        str_total = ' ' + Math.trunc(info.transferred / 1000000) + 'MB';
      }
      
      //Formata o percentual de bytes transferidos, para escrita no arquivo de log
      let str_perc: string = '';
      if (Functions.between(info.percent, 0, 9)) {
        str_perc = '  ' + Math.trunc(info.percent) + '%';
      } else if (Functions.between(info.percent, 10, 99.99)) {
        str_perc = ' ' + Math.trunc(info.percent) + '%';
      }
      
      //Consulta das traduções
      let translations: any = TranslationService.getTranslations([
        new TranslationInput('ELECTRON.UPDATE_DOWNLOAD', [str_total, str_perc, speed])
      ]);
      
      //Escrita da mensagem final no arquivo de log
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.UPDATE_DOWNLOAD'], null, null, null, null, null);
    });
    
    //Evento de atualização baixada com sucesso
    autoUpdater.on('update-downloaded', (info: any) => {
      
      //Define se a atualização do registro do Windows foi bem sucedida (Caso necessário)
      let res: boolean = true;
      
      //Consulta das traduções
      let translations: any = TranslationService.getTranslations([
        new TranslationInput('ELECTRON.UPDATE_DOWNLOAD_OK', [info.version])
      ]);
      
      //Atualiza o registro do Windows com a chave de atualização pendente
      if ((process.platform == 'win32') && (TOTVS_Agent_Analytics.isProduction())) res = Main.setWindowsAutoUpdateRegistry(1);
      
      //Força a renderização da interface do Agent
      if (res) {
        Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.UPDATE_DOWNLOAD_OK'], null, null, null, null, null);
        Main.hidden = false;
        Main.createWindowObject();
        
        //Solicita ao Angular a renderização do modal de atualização
        Main.mainWindow.webContents.send('update-downloaded');
      }
    });
    
    //Evento disparado ao encontrar algum erro na atualização
    autoUpdater.on('error', (err: Error) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.UPDATE_ERROR'], null, null, err, null, null);
    });
  }
  
  /*********************************/
  /*** IPC (Comunic. c/ Angular  ***/
  /*********************************/
  /* Método de remoção dos eventos de comunicação do Electron */
  private static removeIpcListeners(): void {
    ipcMain.removeAllListeners('AC_getWorkspaces');
    ipcMain.removeAllListeners('AC_getWorkspacesByDatabase');
    ipcMain.removeAllListeners('AC_saveWorkspace');
    ipcMain.removeAllListeners('AC_deleteWorkspace');
    ipcMain.removeAllListeners('AC_getDatabases');
    ipcMain.removeAllListeners('AC_saveDatabase');
    ipcMain.removeAllListeners('AC_deleteDatabase');
    ipcMain.removeHandler('AC_testDatabaseConnectionLocally');
    ipcMain.removeHandler('AC_testAndSyncDatabaseConnection');
    ipcMain.removeAllListeners('AC_getSchedules');
    ipcMain.removeAllListeners('AC_saveSchedule');
    ipcMain.removeAllListeners('AC_deleteSchedule');
    ipcMain.removeHandler('AC_requestScheduleExecutionLocally');
    ipcMain.removeHandler('AC_requestScheduleExecutionRemotelly');
    ipcMain.removeHandler('AC_getAvailableExecutionWindows');
    ipcMain.removeHandler('AC_killProcess');
    ipcMain.removeAllListeners('AC_getConfiguration');
    ipcMain.removeHandler('AC_getJavaVersion');
    ipcMain.removeHandler('AC_saveConfiguration');
    ipcMain.removeAllListeners('AC_getQueries');
    ipcMain.removeAllListeners('AC_getQueriesBySchedule');
    ipcMain.removeAllListeners('AC_saveQuery');
    ipcMain.removeAllListeners('AC_deleteQuery');
    ipcMain.removeHandler('AC_exportQuery');
    ipcMain.removeAllListeners('AC_getScripts');
    ipcMain.removeAllListeners('AC_getScriptsBySchedule');
    ipcMain.removeAllListeners('AC_saveScript');
    ipcMain.removeAllListeners('AC_deleteScript');
    ipcMain.removeAllListeners('AC_encrypt');
    ipcMain.removeAllListeners('AC_decrypt');
    ipcMain.removeAllListeners('AC_getFolder');
    ipcMain.removeAllListeners('AC_getFile');
    ipcMain.removeAllListeners('AC_getTmpPath');
    ipcMain.removeAllListeners('AC_writeToLog');
    ipcMain.removeAllListeners('AC_getAgentVersion');
    ipcMain.removeAllListeners('AC_readLogs');
    ipcMain.removeAllListeners('AC_exit');
    ipcMain.removeAllListeners('AC_updateAgentNow');
    ipcMain.removeHandler('AC_requestSerialNumber');
    ipcMain.removeHandler('AC_getAvailableLicenses');
    ipcMain.removeHandler('AC_saveLatestQueries');
    ipcMain.removeHandler('AC_saveLatestScripts');
    ipcMain.removeHandler('AC_getLatestETLParameters');
    ipcMain.removeHandler('AC_getLatestSQLParameters');
    ipcMain.removeAllListeners('AC_getMirrorMode');
    ipcMain.removeHandler('AC_requestRemoteAccessFromClient');
  }
  
  /* Método que define os eventos de comunicação com o Angular (Interface) */
  private static setIpcListeners(): void {
    
    /*****************************/
    /********* Ambientes *********/
    /*****************************/
    //Consulta de ambientes
    ipcMain.on('AC_getWorkspaces', (event: IpcMainEvent, showLogs: boolean) => {
      WorkspaceService.getWorkspaces(showLogs).subscribe((workspaces: Workspace[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_OK'], null, null, null, null, null);
        event.returnValue = workspaces;
      });
    });
    
    //Consulta de ambientes pertencentes à um banco de dados
    ipcMain.on('AC_getWorkspacesByDatabase', (event: IpcMainEvent, db: Database) => {
      WorkspaceService.getWorkspacesByDatabase(db).subscribe((workspaces: Workspace[]) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_DATABASES_OK'], null, null, null, null, null);
        event.returnValue = workspaces;
      });
    });
    
    //Gravação de ambiente
    ipcMain.on('AC_saveWorkspace', (event: IpcMainEvent, w: Workspace) => {
      WorkspaceService.saveWorkspace(w).subscribe((b: boolean) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.SAVE_OK'], null, null, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    //Remoção de um ambiente
    ipcMain.on('AC_deleteWorkspace', (event: IpcMainEvent, w: Workspace) => {
      WorkspaceService.deleteWorkspace(w).subscribe((b: boolean) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.DELETE_OK'], null, null, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    /*****************************/
    /****** Bancos de dados ******/
    /*****************************/
    //Consulta de bancos de dados
    ipcMain.on('AC_getDatabases', (event: IpcMainEvent, showLogs: boolean) => {
      DatabaseService.getDatabases(showLogs).subscribe((db: Database[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['DATABASES.MESSAGES.LOADING_OK'], null, null, null, null, null);
        event.returnValue = db;
        return db;
      });
    });
    
    //Gravação de um banco de dados
    ipcMain.on('AC_saveDatabase', (event: IpcMainEvent, db: Database) => {
      DatabaseService.saveDatabase(db).subscribe((b: boolean) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['DATABASES.MESSAGES.SAVE_OK'], null, null, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    //Remoção de um banco de dados
    ipcMain.on('AC_deleteDatabase', (event: IpcMainEvent, db: Database) => {
      DatabaseService.deleteDatabase(db).subscribe((b: boolean) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['DATABASES.MESSAGES.DELETE_OK'], null, null, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    //Teste de conexão a um banco de dados (Disparo Local)
    ipcMain.handle('AC_testDatabaseConnectionLocally', (event: IpcMainEvent, buffer: string) => {
      return DatabaseService.testDatabaseConnectionLocally(buffer);
    });
    
    /*
      Teste de conexão a um banco de dados (Disparo Remoto)
      Este método é sempre disparado pela instância espelhada do Agent
    */
    ipcMain.handle('AC_testAndSyncDatabaseConnection', (event: IpcMainEvent, buffer: string) => {
      return lastValueFrom(ServerService.testDatabaseConnectionRemotelly(buffer).pipe(switchMap((b: number) => {
        return ServerService.requestAgentLogsSinceRemoteStart().pipe(map((res2: boolean) => {
          return b;
        }));
      })));
    });
    
    /*****************************/
    /******* Agendamentos ********/
    /*****************************/
    //Consulta dos agendamentos
    ipcMain.on('AC_getSchedules', (event: IpcMainEvent, showLogs: boolean) => {
      ScheduleService.getSchedules(showLogs).subscribe((s: Schedule[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING_OK'], null, null, null, null, null);
        event.returnValue = s;
        return s;
      });
    });
    
    //Gravação dos agendamentos
    ipcMain.on('AC_saveSchedule', (event: IpcMainEvent, s: Schedule[]) => {
      ScheduleService.saveSchedule(s).subscribe((res: number) => {
        event.returnValue = res;
        return res;
      });
    });
    
    //Remoção dos agendamentos
    ipcMain.on('AC_deleteSchedule', (event: IpcMainEvent, s: Schedule) => {
      ScheduleService.deleteSchedule(s).subscribe((b: boolean) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.DELETE_OK'], null, null, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    //Disparo da execução de um agendamento, e atualização da última data de execução do mesmo
    ipcMain.handle('AC_requestScheduleExecutionLocally', (event: IpcMainEvent, s: Schedule) => {
      return lastValueFrom(Files.checkFileIntegrityLocally(s.fileFolder).pipe(switchMap((res1: FileValidation[]) => {
        
        let errors: number = 0;
        res1.map((file: FileValidation) => errors += file.errors);
        
        if ((errors == 0) || (res1.length == 0)) {
          return ScheduleService.prepareScheduleToExecute(s).pipe(switchMap((inputBuffer: string) => {
            return ScheduleService.executeAndUpdateScheduleLocally(inputBuffer, s.id).pipe(switchMap((res2: number) => {
              if (res2 == 1) {
                return ScheduleService.updateScheduleLastExecution(s).pipe(map((res3: number) => {
                  return res3;
                }));
              } else {
                return of(res2);
              }
            }));
          }));
        } else {
          //Mostra todas as mensagens de erro para o usuário
          res1.map((file: FileValidation) => {
            if (file.errors > 0) {
              
              //Consulta das traduções
              let translations3: any = TranslationService.getTranslations([
                new TranslationInput('SCHEDULES.MESSAGES.FILE_VALIDATION_ERROR', [file.errors + '', file.type])
              ]);
              
              Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations3['SCHEDULES.MESSAGES.FILE_VALIDATION_ERROR'], null, null, null, null, null);
              Main.electronMessage(CNST_LOGLEVEL.ERROR, translations3['SCHEDULES.MESSAGES.FILE_VALIDATION_ERROR']);
            }
          });
          
          return of(-2);
        }
      })));
    });
    
    //Disparo da execução de um agendamento, e atualização da última data de execução do mesmo
    ipcMain.handle('AC_requestScheduleExecutionRemotelly', (event: IpcMainEvent, s: Schedule) => {
      return lastValueFrom(ServerService.requestFileIntegrityRemotelly(s.id).pipe(switchMap((res1: FileValidation[]) => {
        let errors: number = 0;
        res1.map((file: FileValidation) => errors += file.errors);
        if ((errors == 0) || (res1.length == 0)) {
          return ScheduleService.prepareScheduleToExecute(s).pipe(switchMap((inputBuffer: string) => {
            return ServerService.requestScheduleExecutionRemotelly(inputBuffer, s.id).pipe(switchMap((res1: number) => {
              if (res1 == 1) {
                return ScheduleService.updateScheduleLastExecution(s).pipe(map((res2: number) => {
                  return res2;
                }));
              } else {
                return of(res1);
              }
            }));
          }));
        } else {
          //Mostra todas as mensagens de erro para o usuário
          res1.map((file: FileValidation) => {
            if (file.errors > 0) {
              
              //Consulta das traduções
              let translations3: any = TranslationService.getTranslations([
                new TranslationInput('SCHEDULES.MESSAGES.FILE_VALIDATION_ERROR', [file.errors + '', file.type])
              ]);
              
              Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations3['SCHEDULES.MESSAGES.FILE_VALIDATION_ERROR'], null, null, null, null, null);
              Main.electronMessage(CNST_LOGLEVEL.ERROR, translations3['SCHEDULES.MESSAGES.FILE_VALIDATION_ERROR']);
            }
          });
          
          return of(-2);
        }
      })));
    });
    
    //Término forçado de um processo do Agent (Java)
    ipcMain.handle('AC_killProcess', (event: IpcMainEvent, scheduleId: string, execId: string) => {
      return Execute.killProcess(scheduleId, execId);
    });
    
    /*****************************/
    /******* Configuração ********/
    /*****************************/
    //Consulta da configuração atual do Agent
    ipcMain.on('AC_getConfiguration', (event: IpcMainEvent, showLogs: boolean) => {
      ConfigurationService.getConfiguration(showLogs).subscribe((conf: Configuration) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING_OK'], null, null, null, null, null);
        event.returnValue = conf;
        return conf;
      });
    });
    
    //Gravação da nova configuração do Agent
    ipcMain.handle('AC_saveConfiguration', (event: IpcMainEvent, conf: Configuration) => {
      return lastValueFrom(ConfigurationService.saveConfiguration(conf).pipe(map((b: number) => {
        if (b == 1) {
          
          //Atualiza o menu do sistema operacional, pois o usuário pode ter alterado o idioma do Agent
          if ((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1)) Main.updateTrayMenu();
          
          //Reinicia a consulta de atualizações do Agent, pois a mesma pode ter sido desligada
          if ((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1)) Main.autoUpdaterCheck(conf.autoUpdate);
          
          Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE_OK'], null, null, null, null, null);
        }
        
        return b;
      })));
    });
    
    //Consulta da versão atual do Java usado pelo Agent
    ipcMain.handle('AC_getJavaVersion', (event: IpcMainEvent) => {
      return lastValueFrom(Execute.getJavaVersion().pipe(map((res: string[]) => {
        return res;
      })));
    });
    
    /*****************************/
    /******** Consultas **********/
    /*****************************/
    //Consulta das queries
    ipcMain.on('AC_getQueries', (event: IpcMainEvent, showLogs: boolean) => {
      QueryService.getQueries(showLogs).subscribe((q: QueryClient[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.LOADING_OK'], null, null, null, null, null);
        event.returnValue = q;
        return q;
      });
    });
    
    //Consulta das queries pertencentes à um agendamento
    ipcMain.on('AC_getQueriesBySchedule', (event: IpcMainEvent, sc: Schedule, showLogs: boolean) => {
      QueryService.getQueriesBySchedule(sc, showLogs).subscribe((q: QueryClient[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.SCHEDULE_LOADING_OK'], null, null, null, null, null);
        event.returnValue = q;
        return q;
      });
    });
    
    //Gravação da consulta
    ipcMain.on('AC_saveQuery', (event: IpcMainEvent, q: QueryClient[]) => {
      QueryService.saveQuery(q).subscribe((res: number) => {
        event.returnValue = res;
        return res;
      });
    });
    
    //Remoção da consulta
    ipcMain.on('AC_deleteQuery', (event: IpcMainEvent, q: QueryClient) => {
      QueryService.deleteQuery(q).subscribe((b: boolean) => {
        if (b) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.DELETE_OK'], null, null, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    //Exportação das consultas do repositório do Agent, ou tabela I01
    ipcMain.handle('AC_exportQuery', (event: IpcMainEvent, inputBuffer: string) => {
      return lastValueFrom(Execute.exportQuery(inputBuffer).pipe(map((res: any) => {
        event.returnValue = res;
        return res;
      })));
    });
    
    /*****************************/
    /********* Rotinas ***********/
    /*****************************/
    //Consulta das rotinas
    ipcMain.on('AC_getScripts', (event: IpcMainEvent, showLogs: boolean) => {
      ScriptService.getScripts(showLogs).subscribe((s: ScriptClient[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING_OK'], null, null, null, null, null);
        event.returnValue = s;
        return s;
      });
    });
    
    //Consulta das rotinas pertencentes à um agendamento
    ipcMain.on('AC_getScriptsBySchedule', (event: IpcMainEvent, sc: Schedule, showLogs: boolean) => {
      ScriptService.getScriptsBySchedule(sc, showLogs).subscribe((s: ScriptClient[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.SCHEDULE_LOADING_OK'], null, null, null, null, null);
        event.returnValue = s;
        return s;
      });
    });
    
    //Gravação da rotina
    ipcMain.on('AC_saveScript', (event: IpcMainEvent, s: ScriptClient[]) => {
      ScriptService.saveScript(s).subscribe((res: number) => {
        event.returnValue = res;
        return res;
      });
    });
    
    //Remoção da rotina
    ipcMain.on('AC_deleteScript', (event: IpcMainEvent, s: ScriptClient) => {
      ScriptService.deleteScript(s).subscribe((b: boolean) => {
        if (b) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.DELETE_OK'], null, null, null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    /*****************************/
    /******* Criptografia ********/
    /*****************************/
    //Criptografia de um texto
    ipcMain.on('AC_encrypt', (event: IpcMainEvent, text: string) => {
      event.returnValue = EncryptionService.encrypt(text);
    });
    
    //Descriptografia de um texto
    ipcMain.on('AC_decrypt', (event: IpcMainEvent, text: string) => {
      event.returnValue = EncryptionService.decrypt(text);
    });
    
    /*****************************/
    /**** Sistema Operacional ****/
    /*****************************/
    //Seleção de um diretório
    ipcMain.on('AC_getFolder', (event: IpcMainEvent) => {
      Files.getFolder(Main.mainWindow).subscribe((folder: string) => {
        event.returnValue = folder;
      });
    });
    
    //Seleção de um arquivo
    ipcMain.on('AC_getFile', (event: IpcMainEvent) => {
      Files.getFile(Main.mainWindow).subscribe((folder: string) => {
        event.returnValue = folder;
      });
    });
    
    //Consulta do diretório temporário usado pelo Agent
    ipcMain.on('AC_getTmpPath', (event: IpcMainEvent) => {
      event.returnValue = CNST_TMP_PATH;
      return CNST_TMP_PATH;
    });
    
    //Escrita no arquivo de log
    ipcMain.on('AC_writeToLog', (event: IpcMainEvent, loglevel: any, system: string, message: string, err: any) => {
      event.returnValue = Files.writeToLog(loglevel, system, message, null, null, err, null, null);
    });
    
    //Consulta do número de versão atual do Agent
    ipcMain.on('AC_getAgentVersion', (event: IpcMainEvent) => {
      event.returnValue = autoUpdater.currentVersion;
      return autoUpdater.currentVersion;
    });
    
    //Consulta dos arquivos de logs atualmente existentes
    ipcMain.on('AC_readLogs', (event: IpcMainEvent) => {
      event.returnValue = Files.readLogs();
      return;
    });
    
    /*****************************/
    /******* Desligamento ********/
    /*****************************/
    //Fechamento da interface do Agent (Angular)
    ipcMain.on('AC_exit', (event: IpcMainEvent) => {
      Main.willClose();
    });
    
    //Desligamento do Agent, e disparo da atualização (Executado via pedido do usuário)
    ipcMain.on('AC_updateAgentNow', (event: IpcMainEvent) => {
      if (Main.mainWindow != null) Main.willClose();
      Main.terminateApplication();
    });
    
    /*****************************/
    /** Comunicação c/ Servidor **/
    /*****************************/
    //Ativação da instalação do Agent
    ipcMain.handle('AC_requestSerialNumber', (event: IpcMainEvent, args: string[]) => {
      return lastValueFrom(ServerService.requestSerialNumber(args).pipe(map((res: number) => {
        return res;
      })));
    });
    
    //Consulta das licenças disponíveis para esta instalação do Agent
    ipcMain.handle('AC_getAvailableLicenses', (event: IpcMainEvent, showLogs: boolean) => {
      return lastValueFrom(ServerService.getAvailableLicenses(showLogs).pipe(map((res: AvailableLicenses) => {
        return res;
      })));
    });
    
    //Gravação das consultas padrões para determinada licença vinculada à este Agent
    ipcMain.handle('AC_saveLatestQueries', (event: IpcMainEvent, license: License, database: Database, scheduleId: string) => {
      return lastValueFrom(ServerService.saveLatestQueries(license, database, scheduleId).pipe(map((res: number) => {
        return res;
      })));
    });
    
    //Gravação das rotinas padrões para determinada licença vinculada à este Agent
    ipcMain.handle('AC_saveLatestScripts', (event: IpcMainEvent, license: License, brand: string, scheduleId: string) => {
      return lastValueFrom(ServerService.saveLatestScripts(license, brand, scheduleId).pipe(map((res: number) => {
        return res;
      })));
    });
    
    //Consulta dos parâmetros de ETL padrões para determinada licença vinculada à este Agent
    ipcMain.handle('AC_getLatestETLParameters', (event: IpcMainEvent, license: License) => {
      return lastValueFrom(ServerService.getLatestETLParameters(license).pipe(map((res: ETLParameterCommunication) => {
        return res;
      })));
    });
    
    //Consulta dos parâmetros de SQL padrões para determinada licença vinculada à este Agent
    ipcMain.handle('AC_getLatestSQLParameters', (event: IpcMainEvent, license: License, brand: string) => {
      return lastValueFrom(ServerService.getLatestSQLParameters(license, brand).pipe(map((res: SQLParameterCommunication) => {
        return res;
      })));
    });
    
    //Consulta dos parâmetros de SQL padrões para determinada licença vinculada à este Agent
    ipcMain.handle('AC_getAvailableExecutionWindows', (event: IpcMainEvent) => {
      return lastValueFrom(ServerService.getAvailableExecutionWindows().pipe(map((res: string[]) => {
        return res;
      })));
    });
    
    /*****************************/
    /*** Acesso Remoto (Mirror) **/
    /*****************************/
    //Consulta do modo de execução do acesso remoto (Mirror Mode)
    ipcMain.on('AC_getMirrorMode', (event: IpcMainEvent) => {
      event.returnValue = TOTVS_Agent_Analytics.getMirrorMode();
      return TOTVS_Agent_Analytics.getMirrorMode();
    });

    //Acesso remoto do Agent client p/ outro client
    ipcMain.handle('AC_requestRemoteAccessFromClient', (event: IpcMainEvent, agentCode: string) => {
      return lastValueFrom(ServerService.requestRemoteAccessFromClient(agentCode).pipe(map((res: number) => {
        if (res == 1) {
            Main.willClose();

            //Espera 1 segundo para os eventos de fechamento da interface sejam encerrados
          setTimeout(() => {
            TOTVS_Agent_Analytics.setMirrorMode(3);
            Files.initApplicationData(true, Main.getLocaleLanguage());
              Main.createWindowObject();
            }, 1000);
        }

        return res;
      })));
    });
  }
  
  /* Método de envio de mensagens ao usuário */
  public static electronMessage(level: any, message: string): boolean {
    Main.electronMessages.push(new ElectronMessage(level, message));
    return true;
  }
  
  /*********************************/
  /*** Renderização da Interface ***/
  /*********************************/
  /* Método de inicialização da interface do Agent */
  private static createWindowObject(): void {
    const {width, height} = screen.getPrimaryDisplay().workAreaSize;
    
    //Caso a interface não tenha sido definida, cria-se um novo objeto
    if (Main.mainWindow == null) {
      Main.mainWindow = new BrowserWindow({
        icon: Main.getIconPath(),
        show: false,
        width: width,
        height: height - 35,
        frame: true,
        autoHideMenuBar: false,
        resizable: true,
        webPreferences: {
          contextIsolation: false,
          nodeIntegration: true
        }
      });
      
      //Define o endereço a ser visualizado na interface (Aplicação Agent)
      Main.mainWindow.loadURL('file://' + __dirname + '/index.html' );
      
      //Caso a interface deva ser mostrada, mostra o Agent em tela cheia p/ o usuário
      Main.mainWindow.once('ready-to-show', () => {
        Main.renderWindow();
      });
      
      //Bloqueia a navegação p/ links externos
      Main.mainWindow.webContents.on('will-navigate', event => {
        event.preventDefault();
      });
      
      //Configuração do evento de fechamento da interface
      Main.mainWindow.on('closed', function () {
        Main.onClose();
      });
    }
  }
  
  /* Método de renderização da interface do Agent (Caso habilitado) */
  private static renderWindow(): void {
    if (!Main.hidden) {
      Main.mainWindow.maximize();
      Main.mainWindow.show();
      Main.mainWindow.focus();
      
      //Ajuste de posicionamento da interface, devido á barra de tarefas do OS
      if (Main.x == null) {
        let [x, y]: any =  Main.mainWindow.getPosition();
        Main.x = x;
        Main.y = y;
      }
      
      Main.mainWindow.setResizable(false);
      Main.mainWindow.setPosition(Main.x, Main.y - 35);
    }
  }
  
  /* Método que retorna a localização do ícone a ser utilizado no Agent */
  private static getIconPath(): string {
    if (process.platform == 'linux') return CNST_ICON_LINUX();
    else if (process.platform == 'win32') return CNST_ICON_WINDOWS();
    else return CNST_ICON_WINDOWS();
  }
  
  //Método de configuração do menu minimizado do Agent (Interface fechada)
  private static updateTrayMenu(): void {
    
    //Caso o menu não tenha sido definido, cria-se um novo objeto
    if (Main.trayMenu == null) {
      Main.trayMenu = new Tray(
        nativeImage.createFromPath(Main.getIconPath()).resize({ width: CNST_ICON_SIZE, height: CNST_ICON_SIZE })
      );
      Main.trayMenu.setToolTip(CNST_PROGRAM_NAME.DEFAULT);
    };
    
    //Atualiza as opções do Menu
    Main.trayMenu.setContextMenu(Menu.buildFromTemplate([
      {
        label: TranslationService.CNST_TRANSLATIONS['ELECTRON.TRAY_OPEN_INTERFACE'],
        type: 'normal',
        click: () => {
          Main.hidden = false;
          Main.createWindowObject();
          Main.renderWindow();
        }
      },{
        label: TranslationService.CNST_TRANSLATIONS['ELECTRON.TRAY_FINISH_PROCESS'],
        type: 'normal',
        click: () => {
          if (Main.mainWindow != null) Main.willClose();
          Main.terminateApplication();
        }
      }
    ]));
  }
  
  /* Método disparado antes de se fechar a interface do Agent (Angular) */
  private static willClose(): void {
    Main.mainWindow.close();
  }
  
  /* Método disparado após fechar a interface do Agent (Angular) */
  private static onClose(): void {
    Main.mainWindow = null;

    //Desligamento forçado do Agent, caso esta instância seja invocada pelo Agent-Server (MirrorMode)
    if ((TOTVS_Agent_Analytics.getMirrorMode() == 2) || (TOTVS_Agent_Analytics.getMirrorMode() == 3)) Main.terminateApplication();
    else {
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SYSTEM_WINDOW_CLOSE'], null, null, null, null, null);
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SYSTEM_SERVICE'], null, null, null, null, null);
    }
  }
  
  /*********************************/
  /*** INICIALIZAÇÃO DO SISTEMA ****/
  /*********************************/
  /* Método de inicialização do Electron */
  static main(_app: App) {
    Main.application = _app;
    Main.setLocaleLanguage(_app.getLocale());

    if ((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1)) Main.application.disableHardwareAcceleration();

    //Inicialização do serviço de tradução
    TranslationService.init();
    TranslationService.updateStandardTranslations();
    
    //Inicialização do serviço de criptografia
    EncryptionService.init();
    
    //Solicita a trava de única instância do Agent. Caso não consiga, este Agent é encerrado
    //Este processo é utilizado para bloquear a abertura de 2 Agents ao mesmo tempo
    if ((TOTVS_Agent_Analytics.isProduction()) && ((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1))) {
      Main.application.requestSingleInstanceLock();
      if (!Main.application.hasSingleInstanceLock()) {
        let translations: any = TranslationService.getTranslations([
          new TranslationInput('ELECTRON.THREAD_ERROR', [CNST_PROGRAM_NAME.DEFAULT])
        ]);
        
        console.log(translations['ELECTRON.THREAD_ERROR']);
        Main.application.quit();
      }
    }
    
    //Inicialização do arquivo de banco do Agent (Leitura das configurações existentes)
    Files.initApplicationData(true, Main.getLocaleLanguage());
    
    //Leitura dos parâmetros de linha de comando
    Main.hidden = (Main.application.commandLine.hasSwitch('hidden') ? true : false);
    
    //Configuração dos eventos a serem disparados após a inicialização do Electron
    if ((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1)) Main.application.on('ready', Main.onReady);
    else Main.onReady();
    
    Main.application.on('window-all-closed', () => {});
    
    /*
      Configuração do evento de segunda instância do Agent.
      
      Caso uma nova instância tenha tentado ser inicializada,
      esta instância terá prioridade, e sua interface será 
      renderizada em tela.
    */
    Main.application.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
      if (Main.mainWindow != null) {
        if (Main.mainWindow.isMinimized()) Main.mainWindow.restore();
        Main.mainWindow.focus();
      } else {
        Main.createWindowObject();
        Main.renderWindow();
      }
    });
  }
  
  /* Método disparado após finalização da inicialização do Electron */
  private static onReady(): void {
    
    //Consulta da configuração atual do Agent
    ConfigurationService.getConfiguration(true).subscribe((configuration: Configuration) => {
      Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SYSTEM_START'], null, null, null, null, null);
      
      //Define a linguagem padrão a ser utilizada no Agent
      TranslationService.use((configuration.locale));
      
      //Atualização do registro do Windows p/ atualização automática (false)
      if ((process.platform == 'win32') && ((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1)) && (TOTVS_Agent_Analytics.isProduction())) Main.setWindowsAutoUpdateRegistry(0);
      
      //Configuração da atualização automática do Agent
      if ((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1)) Main.setAutoUpdaterPreferences();
      
      //Disparo da atualização automática do Agent (Caso habilitado)
      if ((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1)) Main.autoUpdaterCheck(configuration.autoUpdate);
      
      //Inicialização do servidor de comunicação do Agent, para receber comandos do Agent-Server
      ServerService.startWebSocketConnection().pipe(switchMap((b: boolean) => {
        if (b) return ServerService.pingServer()
        else return of(false)
      })).subscribe((b: boolean) => {
        
        //Configuração da comunicação c/ Angular (IPC)
        Main.setIpcListeners();
        
        //Configuração da inicialização automática do Agent, ao ligar o computador
        if (((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1)) && (TOTVS_Agent_Analytics.isProduction())) Main.setAutoLaunchOptions();
        
        //Configuração do menu minimizado do Agent (Tray)
        if ((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1)) Main.updateTrayMenu();
        
        //Configuração da interface do Agent (Angular)
        Main.createWindowObject();
        
        //Renderização da interface do Agent (Caso habilitado)
        Main.renderWindow();
        
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING_OK'], null, null, null, null, null);
        
        //Configuração do temporizador de execuções automática do Agent, a cada segundo
        let thisDay: number = 0;
        let i: number = 0;
        if ((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1)) {
          Main.timerRefId = setInterval(() => {
            let date: Date = new Date();
            
            //Atualização das consultas / rotinas padrões do FAST, a cada 24h de execução do Agent
            if ((configuration.serialNumber != null) && (i == 86400)) {
              i = 0;
              ServerService.getUpdates().subscribe((b: number) => {
                switch (b) {
                  case (0):
                    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.UPDATES_OK'], null, null, null, null, null);
                    break;
                  case (null):
                    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.UPDATES_NOT_FOUND'], null, null, null, null, null);
                    break;
                  default:
                    Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.UPDATES_ERROR'], null, null, null, null, null);
                    Main.electronMessage(CNST_LOGLEVEL.ERROR, TranslationService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.UPDATES_ERROR']);
                    break;
                  }
              });
            }
            
            //Disparo dos agendamentos automaticamente, a cada minuto
            if ((configuration.serialNumber != null) && (date.getSeconds() == 0)) {
              ScheduleService.getSchedulesToExecute().subscribe((schedules: Schedule[]) => {
                schedules.map(async (s: Schedule) => {
                  await ScheduleService.prepareScheduleToExecute(s).pipe(switchMap((inputBuffer: string) => {
                    return ScheduleService.executeAndUpdateScheduleLocally(inputBuffer, s.id).pipe(switchMap((res1: number) => {
                      if (res1 == 1) {
                        return ScheduleService.updateScheduleLastExecution(s).pipe(map((res2: number) => {
                          return res2;
                        }));
                      } else {
                        return of(res1);
                      }
                    }));
                  })).subscribe();
                });
              });
            }
            
            //Reinicialização dos arquivos de log, a cada dia (meia noite)
            if ((configuration.serialNumber != null) && (date.getDate() != thisDay)) {
              ConfigurationService.getConfiguration(false).subscribe((conf: Configuration) => {
                Files.deleteOldLogs();
                Files.initApplicationData(false, conf.locale);
                thisDay = date.getDate();
              });
            }

            //Envio de mensagens do Electron, ao usuário
            if ((Main.electronMessages.length > 0) && (Main.mainWindow != null) && (!Main.hidden)) {
              Main.mainWindow.webContents.send('AC_electronMessage',
                Main.electronMessages[Main.electronMessages.length - 1].level,
                Main.electronMessages[Main.electronMessages.length - 1].message
              );
              Main.electronMessages.pop();
            }
            
            i = i + 1;
          }, 1000);
        }

        //Caso a comunicação com o Agent-Server tenha falhado, é gerada uma mensagem de aviso ao usuário
        if (!b) Main.electronMessage(CNST_LOGLEVEL.WARN, TranslationService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.WARN']);
      });
    });
  }
  
  /* Método de configuração da chave de registro das atualizações do Agent */
  private static setWindowsAutoUpdateRegistry(value: number): boolean {
    let regKey: any = new Winreg({
      hive: Registry.HKLM,
      key: '\\Software\\' + CNST_PROGRAM_NAME.DEFAULT
    });
    
    return regKey.set('autoUpdate', Winreg.REG_SZ, value, (err: any) => {
      if (err != null) {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.WINDOWS_REGISTRY_ERROR'], null, null, err, null, null);
        return false;
      } else return true;
    });
  }
  
  /* Método de desligamento completo do Agent (Solicitado pelo Tray) */
  private static terminateApplication(): void {

    //Variável que armazena o nível de acesso que disparou esta função.
    let mirror: number = TOTVS_Agent_Analytics.getMirrorMode();

    ConfigurationService.getConfiguration(false).subscribe((conf: Configuration) => {

      //Verifica se este instância espelhada foi ativada pelo próprio Agent-Client
      if (mirror != 3) {

        //Remove todos os eventos de comunicação do Electron criados por esta instância do Agent
        Main.removeIpcListeners();

        //Interrompe o temporizador do Agent
        clearInterval(Main.timerRefId);
        
        //Desliga todos os processos do Java atualmente em execução
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.PROCESS_KILL_ALL'], null, null, null, null, null);
        Execute.killAllProcesses();
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.PROCESS_KILL_ALL_OK'], null, null, null, null, null);
      }
      
      //Envia as alterações feitas na instância espelhada, para o Agent-Server
      if ((mirror == 2) || (mirror == 3)) {
        let translations: any = TranslationService.getTranslations([
          new TranslationInput('MIRROR_MODE.MESSAGES.SERVER_SYNC', [conf.instanceName]),
          new TranslationInput('MIRROR_MODE.MESSAGES.SERVER_SYNC_ERROR', [conf.instanceName])
        ]);
        Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, translations['MIRROR_MODE.MESSAGES.SERVER_SYNC'], null, null, null, null, null);
        
        //Leitura do arquivo de configuração da instância espelhada do Agent
        Files.readApplicationData().subscribe((db: ClientData) => {

          //Leitura das mensagens de log que precisam ser sincronizadas com a instância espelhada do Agent
          let agentLogMessages: string = JSON.stringify(Files.getLogDataToSync());

          //Realiza a sincronização do agent remoto
          ServerService.deactivateMirrorMode(db, agentLogMessages).subscribe((b: boolean) => {
            if (b) Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['MIRROR_MODE.MESSAGES.SERVER_SYNC_OK'], null, null, null, null, null);
            else Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['MIRROR_MODE.MESSAGES.SERVER_SYNC_ERROR'], null, null, null, null, null);
            if (mirror == 3) {
              TOTVS_Agent_Analytics.setMirrorMode(0);
              Files.initApplicationData(true, Main.getLocaleLanguage());
              Main.createWindowObject();
            } else {
              Files.terminateLogStreams();
            }
          });
        });
      } else {
        Main.terminateElectron();
      }
    });
  }
  
  /* Método de desligamento do Electron */
  private static terminateElectron(): void {

    //Encerramento dos canais de log
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SYSTEM_FINISH'], null, null, null, null, null);
    Files.terminateLogStreams();

    if (process.platform !== 'darwin') Main.application.quit();
  }
}