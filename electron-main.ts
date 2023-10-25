/* Componentes padrões do Electron */
import { BrowserWindow, ipcMain, App, IpcMainEvent, dialog, Tray, Menu, nativeImage } from 'electron';
import { autoUpdater } from 'electron-updater';

/* Dependência de inicialização automática do Agent */
import AutoLaunch from 'auto-launch';

/* Serviços do Electron */
import { Execute } from './src-electron/execute';
import { Functions } from './src-electron/functions';
import { Files } from './src-electron/files';

/* Serviço de comunicação com o Agent-Server */
import { ServerService } from './src-electron/services/server-service';
import {
  License,
  AvailableLicenses,
  QueryCommunication,
  ScriptCommunication,
  ETLParameterCommunication,
  SQLParameterCommunication
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
} from './src-electron/constants-electron';

/* Dependência de comunicação com o Registro do Windows */
import Winreg from 'winreg';
import Registry from 'winreg';

/* Interfaces da atualização automática do Agent */
import { DatabaseData, Updater, UpdaterProgress } from './src-electron/electron-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from './src-electron/services/workspace-service';
import { Workspace } from './src-angular/app/workspace/workspace-interface';

/* Serviço de bancos de dados do Agent */
import { DatabaseService } from './src-electron/services/database-service';
import { Database } from './src-angular/app/database/database-interface';

/* Serviço de agendametos do Agent */
import { ScheduleService } from './src-electron/services/schedule-service';
import { Schedule } from './src-angular/app/schedule/schedule-interface';

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
import { Observable, from, lastValueFrom, map, switchMap } from 'rxjs';

export default class Main {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Interface do Agent
  private static mainWindow: Electron.BrowserWindow = null;
  
  private static client: any = null;
  
  //Referência da aplicação como um todo, passada ao inicializar o Electron
  static application: Electron.App = null;
  
  //Referência do temporizador de atualizações automáticas do Agent
  private static autoUpdaterRefresh: any = null;
  
  //Menu minimizado do Agent (Interface fechada)
  private static trayMenu: Tray = null;
  
  /********* Parâmetros CMD *********/
  //Define se a interface do Agent deve ser renderizada em tela, ou não
  private static hidden: boolean = false;
  
  //Define se os agendamentos configurados no Agent devem ser automaticamente checados, e disparados
  private static triggerSchedules: boolean = true;
  
  /*********************************/
  /******* MÉTODOS DO MÓDULO  ******/
  /*********************************/
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
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.AUTOLAUNCH_ERROR'], null, null, null);
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
      Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.UPDATE_CHECK'], null, null, null);
    });
    
    //Evento de nova atualização encontrada
    autoUpdater.on('update-available', (info: any) => {
      
      //Consulta das traduções
      let translations: any = TranslationService.getTranslations([
        new TranslationInput('ELECTRON.UPDATE_AVAILABLE', [autoUpdater.currentVersion, info.version])
      ]);
      
      Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.UPDATE_AVAILABLE'], null, null, null);
    });
    
    //Evento de nenhuma atualização encontrada
    autoUpdater.on('update-not-available', (info: any) => {
      
      //Consulta das traduções
      let translations: any = TranslationService.getTranslations([
        new TranslationInput('ELECTRON.UPDATE_NOT_AVAILABLE', [info.version])
      ]);
      
      Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.UPDATE_NOT_AVAILABLE'], null, null, null);
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
      Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['ELECTRON.UPDATE_DOWNLOAD'], null, null, null);
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
      if (process.platform == 'win32') res = Main.setWindowsAutoUpdateRegistry(1);
      
      //Força a renderização da interface do Agent
      if (res) {
        Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.UPDATE_DOWNLOAD_OK'], null, null, null);
        Main.hidden = false;
        Main.createWindowObject();
        
        //Solicita ao Angular a renderização do modal de atualização
        Main.mainWindow.webContents.send('update-downloaded');
      }
    });
    
    //Evento disparado ao encontrar algum erro na atualização
    autoUpdater.on('error', (err: Error) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.UPDATE_ERROR'], null, null, err);
    });
  }
  
  /*********************************/
  /*** IPC (Comunic. c/ Angular  ***/
  /*********************************/
  /* Método que define os eventos de comunicação com o Angular (Interface) */
  private static setIpcListeners(): void {
    
    //Consulta do número de versão atual do Agent
    ipcMain.on('getAgentVersion', (event: IpcMainEvent) => {
      event.returnValue = autoUpdater.currentVersion;
      return autoUpdater.currentVersion;
    });
    
    /*****************************/
    /********* Ambientes *********/
    /*****************************/
    //Consulta de ambientes
    ipcMain.on('getWorkspaces', (event: IpcMainEvent, showLogs: boolean) => {
      WorkspaceService.getWorkspaces(showLogs).subscribe((workspaces: Workspace[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_OK'], null, null, null);
        event.returnValue = workspaces;
      });
    });
    
    //Consulta de ambientes pertencentes à um banco de dados
    ipcMain.on('getWorkspacesByDatabase', (event: IpcMainEvent, db: Database) => {
      WorkspaceService.getWorkspacesByDatabase(db).subscribe((workspaces: Workspace[]) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_DATABASES_OK'], null, null, null);
        event.returnValue = workspaces;
      });
    });
    
    //Gravação de ambiente
    ipcMain.on('saveWorkspace', (event: IpcMainEvent, w: Workspace) => {
      WorkspaceService.saveWorkspace(w).subscribe((b: boolean) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.SAVE_OK'], null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    //Remoção de um ambiente
    ipcMain.on('deleteWorkspace', (event: IpcMainEvent, w: Workspace) => {
      WorkspaceService.deleteWorkspace(w).subscribe((b: boolean) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.DELETE_OK'], null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    /*****************************/
    /****** Bancos de dados ******/
    /*****************************/
    //Consulta de bancos de dados
    ipcMain.on('getDatabases', (event: IpcMainEvent, showLogs: boolean) => {
      DatabaseService.getDatabases(showLogs).subscribe((db: Database[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['DATABASES.MESSAGES.LOADING_OK'], null, null, null);
        event.returnValue = db;
        return db;
      });
    });
    
    //Gravação de um banco de dados
    ipcMain.on('saveDatabase', (event: IpcMainEvent, db: Database) => {
      DatabaseService.saveDatabase(db).subscribe((b: boolean) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['DATABASES.MESSAGES.SAVE_OK'], null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    //Remoção de um banco de dados
    ipcMain.on('deleteDatabase', (event: IpcMainEvent, db: Database) => {
      DatabaseService.deleteDatabase(db).subscribe((b: boolean) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['DATABASES.MESSAGES.DELETE_OK'], null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    //Teste de conexão a um banco de dados
    ipcMain.handle('testDatabaseConnection', (event: IpcMainEvent, inputBuffer: string) => {
      return lastValueFrom(Execute.testDatabaseConnection(inputBuffer).pipe(map((res: any) => {
        return res;
      })));
    });
    
    /*****************************/
    /******* Agendamentos ********/
    /*****************************/
    //Consulta dos agendamentos
    ipcMain.on('getSchedules', (event: IpcMainEvent, showLogs: boolean) => {
      ScheduleService.getSchedules(showLogs).subscribe((s: Schedule[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING_OK'], null, null, null);
        event.returnValue = s;
        return s;
      });
    });
    
    //Gravação dos agendamentos
    ipcMain.on('saveSchedule', (event: IpcMainEvent, s: Schedule) => {
      ScheduleService.saveSchedule(s).subscribe((b: boolean) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.SAVE_OK'], null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    //Remoção dos agendamentos
    ipcMain.on('deleteSchedule', (event: IpcMainEvent, s: Schedule) => {
      ScheduleService.deleteSchedule(s).subscribe((b: boolean) => {
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.DELETE_OK'], null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    //Disparo da execução de um agendamento, e atualização da última data de execução do mesmo
    ipcMain.on('executeAndUpdateSchedule', (event: IpcMainEvent, schedule: Schedule) => {
      return ScheduleService.executeAndUpdateSchedule(schedule).subscribe((b: boolean) => {
        event.returnValue = b;
        return b;
      });
    });
    
    //Término forçado de um processo do Agent (Java)
    ipcMain.handle('killProcess', (event: IpcMainEvent, scheduleId: string, execId: string) => {
      return Execute.killProcess(scheduleId, execId);
    });
    
    /*****************************/
    /******* Configuração ********/
    /*****************************/
    //Consulta da configuração atual do Agent
    ipcMain.on('getConfiguration', (event: IpcMainEvent, showLogs: boolean) => {
      ConfigurationService.getConfiguration(showLogs).subscribe((conf: Configuration) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING_OK'], null, null, null);
        event.returnValue = conf;
        return conf;
      });
    });
    
    //Gravação da nova configuração do Agent
    ipcMain.handle('saveConfiguration', (event: IpcMainEvent, conf: Configuration) => {
      return lastValueFrom(ConfigurationService.saveConfiguration(conf).pipe(map((b: number) => {
        if (b == 1) {
          //Atualiza o menu do sistema operacional, pois o usuário pode ter alterado o idioma do Agent
          Main.updateTrayMenu();
          
          //Reinicia a consulta de atualizações do Agent, pois a mesma pode ter sido desligada
          Main.autoUpdaterCheck(conf.autoUpdate);
          
          Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE_OK'], null, null, null);
        }
        
        return b;
      })));
    });
    
    /*****************************/
    /******** Consultas **********/
    /*****************************/
    //Consulta das queries
    ipcMain.on('getQueries', (event: IpcMainEvent, showLogs: boolean) => {
      QueryService.getQueries(showLogs).subscribe((q: QueryClient[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.LOADING_OK'], null, null, null);
        event.returnValue = q;
        return q;
      });
    });
    
    //Consulta das queries pertencentes à um agendamento
    ipcMain.on('getQueriesBySchedule', (event: IpcMainEvent, sc: Schedule, showLogs: boolean) => {
      QueryService.getQueriesBySchedule(sc, showLogs).subscribe((q: QueryClient[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.SCHEDULE_LOADING_OK'], null, null, null);
        event.returnValue = q;
        return q;
      });
    });
    
    //Gravação da consulta
    ipcMain.on('saveQuery', (event: IpcMainEvent, q: QueryClient[]) => {
      QueryService.saveQuery(q).subscribe((res: number) => {
        event.returnValue = res;
        return res;
      });
    });
    
    //Remoção da consulta
    ipcMain.on('deleteQuery', (event: IpcMainEvent, q: QueryClient) => {
      QueryService.deleteQuery(q).subscribe((b: boolean) => {
        if (b) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['QUERIES.MESSAGES.DELETE_OK'], null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    //Exportação das consultas do repositório do Agent, ou tabela I01
    ipcMain.handle('exportQuery', (event: IpcMainEvent, inputBuffer: string) => {
      return lastValueFrom(Execute.exportQuery(inputBuffer).pipe(map((res: any) => {
        event.returnValue = res;
        return res;
      })));
    });
    
    /*****************************/
    /********* Rotinas ***********/
    /*****************************/
    //Consulta das rotinas
    ipcMain.on('getScripts', (event: IpcMainEvent, showLogs: boolean) => {
      ScriptService.getScripts(showLogs).subscribe((s: ScriptClient[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING_OK'], null, null, null);
        event.returnValue = s;
        return s;
      });
    });
    
    //Consulta das rotinas pertencentes à um agendamento
    ipcMain.on('getScriptsBySchedule', (event: IpcMainEvent, sc: Schedule, showLogs: boolean) => {
      ScriptService.getScriptsBySchedule(sc, showLogs).subscribe((s: ScriptClient[]) => {
        if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.SCHEDULE_LOADING_OK'], null, null, null);
        event.returnValue = s;
        return s;
      });
    });
    
    //Gravação da rotina
    ipcMain.on('saveScript', (event: IpcMainEvent, s: ScriptClient[]) => {
      ScriptService.saveScript(s).subscribe((res: number) => {
        event.returnValue = res;
        return res;
      });
    });
    
    //Remoção da rotina
    ipcMain.on('deleteScript', (event: IpcMainEvent, s: ScriptClient) => {
      ScriptService.deleteScript(s).subscribe((b: boolean) => {
        if (b) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.DELETE_OK'], null, null, null);
        event.returnValue = b;
        return b;
      });
    });
    
    /*****************************/
    /******* Criptografia ********/
    /*****************************/
    //Criptografia de um texto
    ipcMain.on('encrypt', (event: IpcMainEvent, text: string) => {
      event.returnValue = Functions.encrypt(text);
    });
    
    //Descriptografia de um texto
    ipcMain.on('decrypt', (event: IpcMainEvent, text: string) => {
      event.returnValue = Functions.decrypt(text);
    });
    
    /*****************************/
    /**** Sistema Operacional ****/
    /*****************************/
    //Seleção de um diretório
    ipcMain.on('getFolder', (event: IpcMainEvent) => {
      Files.getFolder(Main.mainWindow).subscribe((folder: string) => {
        event.returnValue = folder;
      });
    });
    
    //Seleção de um arquivo
    ipcMain.on('getFile', (event: IpcMainEvent) => {
      Files.getFile(Main.mainWindow).subscribe((folder: string) => {
        event.returnValue = folder;
      });
    });
    
    //Consulta do diretório temporário usado pelo Agent
    ipcMain.on('getTmpPath', (event: IpcMainEvent) => {
      event.returnValue = CNST_TMP_PATH;
      return CNST_TMP_PATH;
    });
    
    //Escrita no arquivo de log
    ipcMain.on('writeToLog', (event: IpcMainEvent, loglevel: any, system: string, message: string, err: any) => {
      event.returnValue = Files.writeToLog(loglevel, system, message, null, null, err);
    });
    
    //Consulta dos arquivos de logs atualmente existentes
    ipcMain.on('readLogs', (event: IpcMainEvent) => {
      event.returnValue = Files.readLogs();
      return;
    });
    
    /*****************************/
    /******* Desligamento ********/
    /*****************************/
    //Fechamento da interface do Agent (Angular)
    ipcMain.on('exit', (event: IpcMainEvent) => {
      Main.willClose();
    });
    
    //Desligamento do Agent, e disparo da atualização (Executado via pedido do usuário)
    ipcMain.on('updateAgentNow', (event: IpcMainEvent) => {
      if (Main.mainWindow != null) Main.willClose();
      Main.terminateApplication();
    });
    
    ipcMain.on('sendDataToServer', (event: IpcMainEvent) => {
      Main.client.write('Hello, server! Love, Client.');
    });
    
    /*****************************/
    /** Comunicação c/ Servidor **/
    /*****************************/
    //Ativação da instalação do Agent
    ipcMain.handle('requestSerialNumber', (event: IpcMainEvent, args: string[]) => {
      return lastValueFrom(ServerService.requestSerialNumber(args).pipe(map((res: number) => {
        return res;
      })));
    });
    
    //Consulta das licenças disponíveis para esta instalação do Agent
    ipcMain.handle('getAvailableLicenses', (event: IpcMainEvent, showLogs: boolean) => {
      return lastValueFrom(ServerService.getAvailableLicenses(showLogs).pipe(map((res: AvailableLicenses) => {
        return res;
      })));
    });
    
    //Gravação das consultas padrões para determinada licença vinculada à este Agent
    ipcMain.handle('saveLatestQueries', (event: IpcMainEvent, license: License, database: Database, scheduleId: string) => {
      return lastValueFrom(ServerService.saveLatestQueries(license, database, scheduleId).pipe(map((res: boolean) => {
        return res;
      })));
    });
    
    //Gravação das rotinas padrões para determinada licença vinculada à este Agent
    ipcMain.handle('saveLatestScripts', (event: IpcMainEvent, license: License, brand: string, scheduleId: string) => {
      return lastValueFrom(ServerService.saveLatestScripts(license, brand, scheduleId).pipe(map((res: boolean) => {
        return res;
      })));
    });
    
    //Consulta dos parâmetros de ETL padrões para determinada licença vinculada à este Agent
    ipcMain.handle('getLatestETLParameters', (event: IpcMainEvent, license: License) => {
      return lastValueFrom(ServerService.getLatestETLParameters(license).pipe(map((res: ETLParameterCommunication) => {
        return res;
      })));
    });
    
    //Consulta dos parâmetros de SQL padrões para determinada licença vinculada à este Agent
    ipcMain.handle('getLatestSQLParameters', (event: IpcMainEvent, license: License, brand: string) => {
      return lastValueFrom(ServerService.getLatestSQLParameters(license, brand).pipe(map((res: SQLParameterCommunication) => {
        return res;
      })));
    });
  }
  
  /*********************************/
  /*** Renderização da Interface ***/
  /*********************************/
  /* Método de inicialização da interface do Agent */
  private static createWindowObject(): void {
    
    //Caso a interface não tenha sido definida, cria-se um novo objeto
    if (Main.mainWindow == null) {
      Main.mainWindow = new BrowserWindow({
        icon: Main.getIconPath(),
        show: false,
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
    }
  }
  
  /* Método que retorna a localização do ícone a ser utilizado no Agent */
  private static getIconPath(): string {
    if (process.platform == 'linux') return CNST_ICON_LINUX;
    else if (process.platform == 'win32') return CNST_ICON_WINDOWS;
    else return CNST_ICON_WINDOWS;
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
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SYSTEM_WINDOW_CLOSE'], null, null, null);
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SYSTEM_SERVICE'], null, null, null);
  }
  
  /*********************************/
  /*** INICIALIZAÇÃO DO SISTEMA ****/
  /*********************************/
  /* Método de inicialização do Electron */
  static main(_app: App) {
    Main.application = _app;
    Main.application.disableHardwareAcceleration();
    
    //Inicialização do serviço de tradução
    TranslationService.init();
    TranslationService.updateStandardTranslations();
    
    //Solicita a trava de única instância do Agent. Caso não consiga, este Agent é encerrado
    //Este processo é utilizado para bloquear a abertura de 2 Agents ao mesmo tempo
    //Main.application.requestSingleInstanceLock();
    if (false) {
    //if (!Main.application.hasSingleInstanceLock()) {
      let translations: any = TranslationService.getTranslations([
        new TranslationInput('ELECTRON.THREAD_ERROR', [CNST_PROGRAM_NAME.DEFAULT])
      ]);
      
      console.log(translations['ELECTRON.THREAD_ERROR']);
      Main.application.quit();
    } else {
      //Inicialização do arquivo de banco do Agent (Leitura das configurações existentes)
      Files.initApplicationData(_app.getLocale());
      
      //Leitura dos parâmetros de linha de comando
      Main.hidden = (Main.application.commandLine.hasSwitch('hidden') ? true : false);
      
      //Configuração dos eventos a serem disparados após a inicialização do Electron
      Main.application.on('ready', Main.onReady);
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
      
      //Configuração do temporizador de execuções automática do Agent, a cada segundo
      if (Main.triggerSchedules) {
        let thisDay: number = 0;
        setInterval(() => {
          let date: Date = new Date();
          
          if (date.getSeconds() == 0) {
            ScheduleService.getSchedulesToExecute().subscribe((schedules: Schedule[]) => {
              schedules.map(async (s: Schedule) => {
                await ScheduleService.executeAndUpdateSchedule(s).subscribe((b: boolean) => {
                  return b;
                });
              });
            });
          }
          
          //Reinicialização dos arquivos de log, a cada dia (meia noite)
          if (date.getDate() != thisDay) {
            ConfigurationService.getConfiguration(false).subscribe((conf: Configuration) => {
              Files.deleteOldLogs();
              Files.initApplicationData(conf.locale);
              thisDay = date.getDate();
            });
          }
        }, 1000);
      }
    }
  }
  
  /* Método disparado após finalização da inicialização do Electron */
  private static onReady(): void {
    
    //Consulta da configuração atual do Agent
    ConfigurationService.getConfiguration(true).subscribe((configuration: Configuration) => {
      
      //Define a linguagem padrão a ser utilizada no Agent
      TranslationService.use((configuration.locale));
      
      Files.writeToLog(CNST_LOGLEVEL.INFO, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SYSTEM_START'], null, null, null);
      
      //Atualização do registro do Windows p/ atualização automática (false)
      if (process.platform == 'win32') Main.setWindowsAutoUpdateRegistry(0);
      
      //Configuração da atualização automática do Agent
      Main.setAutoUpdaterPreferences();
      
      //Disparo da atualização automática do Agent (Caso habilitado)
      Main.autoUpdaterCheck(configuration.autoUpdate);
      
      //Inicialização do servidor local do Agent, para receber comandos do servidor da TOTVS
      if (configuration.serialNumber != null) ServerService.startServer(configuration.clientPort).subscribe();
      
      //Configuração da comunicação c/ Angular (IPC)
      Main.setIpcListeners();
      
      //Configuração da inicialização automática do Agent, ao ligar o computador
      Main.setAutoLaunchOptions();
      
      //Configuração do menu minimizado do Agent (Tray)
      Main.updateTrayMenu();
      
      //Atualização das consultas / rotinas padrões do FAST (Caso necessário).
      ServerService.getUpdatesFromServer().subscribe((b: boolean) => {
        
      });
      
      //Configuração da interface do Agent (Angular)
      Main.createWindowObject();
      
      //Renderização da interface do Agent (Caso habilitado)
      Main.renderWindow();
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
        Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.WINDOWS_REGISTRY_ERROR'], null, null, err);
        return false;
      } else return true;
    });
  }
  
  /* Método de desligamento completo do Agent (Solicitado pelo Tray) */
  private static terminateApplication(): void {
    
    //Desliga todos os processos do Java atualmente em execução
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.PROCESS_KILL_ALL'], null, null, null);
    Execute.killAllProcesses();
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.PROCESS_KILL_ALL_OK'], null, null, null);
    
    //Encerra a aplicação completamente
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['ELECTRON.SYSTEM_FINISH'], null, null, null);
    if (process.platform !== 'darwin') Main.application.quit();
  }
}
