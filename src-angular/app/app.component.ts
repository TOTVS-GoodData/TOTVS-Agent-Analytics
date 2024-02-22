/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* Componentes padrões do Angular */
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

/* Componentes visuais da biblioteca Portinari.UI */
import {
  PoMenuItem,
  PoModalComponent
} from '@po-ui/ng-components';

/* Componentes de utilitários do Agent */
import { Utilities } from './utilities/utilities';
import { CNST_LOGLEVEL } from './utilities/utilities-constants';

/* Serviço de comunicação com o Electron */
import { ElectronService } from './core/services';

/* Serviço de consulta do acesso remoto (MirrorMode) */
import { MirrorService } from './services/mirror-service';

/* Serviço de configuração do Agent */
import { ConfigurationService } from './configuration/configuration-service';
import { Configuration } from './configuration/configuration-interface';

/* Serviço de tradução do Agent */
import { TranslationService } from './services/translation/translation-service';
import { TranslationInput } from './services/translation/translation-interface';

/* Serviço compartilhado de comunicação com o menu principal do Agent */
import { MenuService } from './services/menu-service';

/* Componentes rxjs para controle de Promise / Observable */
import { switchMap } from 'rxjs/operators';

/* Constantes do Agent */
import { CNST_PROGRAM_NAME, CNST_PROGRAM_VERSION } from './app-constants';

@Component({
  selector: 'totvs-agent-analytics',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  private version: string = null;
  private programName: string = null;
  protected menus: PoMenuItem[] = [];
  
  /********* Modal **********/
  @ViewChild('modal_closeAgentInterface') modal_closeAgentInterface: PoModalComponent = null;
  protected lbl_closeAgentInterfaceTitle: string = null;
  protected lbl_confirm: string = null;
  protected lbl_goBack: string = null;
  
  @ViewChild('modal_updateAgent') modal_updateAgent: PoModalComponent = null;
  protected lbl_updateAgentTitle: string = null;
  protected lbl_updateAgentDescription: string = null;
  protected lbl_updateNow: string = null;
  protected lbl_updateLater: string = null;
  
  @ViewChild('modal_registerAgent') modal_registerAgent: PoModalComponent = null;
  protected lbl_registerAgentTitle: string = null;
  protected lbl_registerAgentDescription: string = null;
  protected lbl_registerAgentField: string = null;
  protected registerAgent: string = null;

  @ViewChild('modal_mirrorMode') modal_mirrorMode: PoModalComponent = null;
  protected lbl_mirrorModeTitle: string = null;
  protected lbl_mirrorModeDescription1: string = null;
  protected lbl_mirrorModeDescription2: string = null;
  protected lbl_mirrorModeField: string = null;
  protected lbl_mirrorModeProceed: string = null;
  protected lbl_mirrorModeCancel: string = null;
  protected mirrorModeAgentCode: string = null;
  
  protected lbl_supportHelp: string = null;
  protected lbl_supportGroup1: string = null;
  protected lbl_supportGroup2: string = null;
  protected lbl_supportGroup3: string = null;
  protected lbl_supportLink: string = null;

  //Define se o Agent está sendo executado via acesso remoto (MirrorMode)
  protected mirrorMode: number = 0;
  protected lbl_mirror: string = null;
  
  /****** Portinari.UI ******/
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _electronService: ElectronService,
    private _mirrorService: MirrorService,
    private _translateService: TranslationService,
    private _configurationService: ConfigurationService,
    private _menuService: MenuService,
    private _utilities: Utilities,
    private _changeDetectorService: ChangeDetectorRef,
    private _router: Router
  ) {
    
    //Configurações padrões do Agent
    this.programName = CNST_PROGRAM_NAME.SIMPLE;
    this._translateService.init().subscribe();
    
    //Configuração do canal de mensagens do Electron
    this.messageFromElectron();
    
    //Carrega as configurações atuais do Agent, caso existam
    this._configurationService.getConfiguration(false).subscribe((conf: Configuration) => {
      this._translateService.use(conf.locale).subscribe((b: boolean) => {
        if (this._electronService.isElectronApp) {
          
          //Evento de abertura do modal de atualização do Agent (Disparado pelo Electron)
          this._electronService.ipcRenderer.on('AC_deactivateAgent', () => {
            this._configurationService.getConfiguration(false).subscribe((conf: Configuration) => {
              this.setMenuTranslations(conf.serialNumber);
              this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['ELECTRON.SERVER_COMMUNICATION.MESSAGES.DEACTIVATED']);
              this._changeDetectorService.detectChanges();
              this._router.navigate(['/configuration']);
            });
          });
          
          //Evento de abertura do modal de atualização do Agent (Disparado pelo Electron)
          this._electronService.ipcRenderer.on('AC_update-downloaded', () => {
            this.modal_updateAgent.open();
            this._changeDetectorService.detectChanges();
          });
          
          //Configuração da mensagem de acesso remoto (MirrorMode)
          this.mirrorMode = this._mirrorService.getMirrorMode();
          this._translateService.getTranslations([
            new TranslationInput('MIRROR_MODE.MESSAGES.TITLE', [conf.instanceName])
          ]).subscribe((translations: any) => {
            this.lbl_mirror = translations['MIRROR_MODE.MESSAGES.TITLE'];
          });
          
          //Evento de alteração do acesso remoto (MirrorMode)
          this._electronService.ipcRenderer.on('AC_setMirrorMode', (event: any, ...args: any[]) => {
            this.mirrorMode = args[0];
            
            //Acesso remoto ativado
            if (args[0] == 1) {
              this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['MIRROR_MODE.MESSAGES.ONLINE']);
              this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['MIRROR_MODE.MESSAGES.RUNNING'] };
              
            //Acesso remoto desativado
            } else {
              this._translateService.use(conf.locale).subscribe((b: boolean) => {
                this._menuService.updateMenu();
                this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['MIRROR_MODE.MESSAGES.OFFLINE']);
                this.po_lo_text = { value: null };
                this._router.navigate(['/workspace']);
              });
            }
            
            this._changeDetectorService.detectChanges();
            return;
          });
          
          //Solicita ao Electron a versão atual do Agent
          this.version = CNST_PROGRAM_VERSION.PRODUCTION + this._electronService.ipcRenderer.sendSync('AC_getAgentVersion').version;
          
          //Define o valor padrão do diretório temporário do Java
          if (conf.javaTmpDir == null) {
            conf.javaTmpDir = this._electronService.ipcRenderer.sendSync('AC_getTmpPath');
            this._configurationService.saveConfiguration(conf).subscribe();
          }
        } else {
          this.version = CNST_PROGRAM_VERSION.DEVELOPMENT;
        }
        
        //Traduz os textos do menu principal do Agent, e vincula o serviço de comunicação do menu
        this.setMenuTranslations(conf.serialNumber);
        this._menuService.menuRefObs$.subscribe(() => {
          this.setMenuTranslations(conf.serialNumber);
        });
      });
    });
  }
  
  /* Método de tradução dos textos do menu principal do Agent */
  public setMenuTranslations(serialNumber: string): void {
    
    //Tradução das opções do menu principal do Agent, caso a instalação já tenha sido validada
    if (serialNumber != null) {
      this.menus = [
        {
          label: this._translateService.CNST_TRANSLATIONS['MENU.WORKSPACES'], icon: 'po-icon-chart-columns', link: './workspace'
        }, {
          label: this._translateService.CNST_TRANSLATIONS['MENU.DATABASES'], icon: 'po-icon-database', link: './database'
        }, {
          label: this._translateService.CNST_TRANSLATIONS['MENU.SCHEDULES'], icon: 'po-icon-clock', link: './schedule'
        }, {
          label: this._translateService.CNST_TRANSLATIONS['MENU.QUERIES'], icon: 'po-icon-filter', link: './query'
        }, {
          label: this._translateService.CNST_TRANSLATIONS['MENU.SCRIPTS'], icon: 'po-icon-filter', link: './script'
        }, {
          label: this._translateService.CNST_TRANSLATIONS['MENU.MONITOR'], icon: 'po-icon-device-desktop', link: './monitor'
        }, {
          label: this._translateService.CNST_TRANSLATIONS['MENU.CONFIGURATION'],
          icon: 'po-icon-settings',
          link: './configuration'
        }
      ];

      //Caso o agent esteja na instância espelhada, não pode existir um segundo acesso remoto.
      if (this.mirrorMode != 2) this.menus.push({
        label: this._translateService.CNST_TRANSLATIONS['MENU.REMOTE'],
        icon: 'po-icon-link',
        action: () => { this.modal_mirrorMode.open(); }
      });

      //Opção de fechamento do Agent no menu.
      this.menus.push({
        label: this._translateService.CNST_TRANSLATIONS['MENU.EXIT'],
        icon: 'po-icon-exit',
        action: () => {
          this.modal_closeAgentInterface.open();
        }
      });
      
    //Tradução do menu do Agent, caso a instalação não tenha sido validada
    } else {
      this.menus = [
        {
          label: this._translateService.CNST_TRANSLATIONS['MENU.CONFIGURATION'],
          icon: 'po-icon-settings',
          link: './configuration'
        },{
          label: this._translateService.CNST_TRANSLATIONS['MENU.ACTIVATION'],
          icon: 'po-icon-handshake',
          action: () => {
            this.modal_registerAgent.open();
          }
        }
      ];

      //Caso o agent esteja na instância espelhada, não pode existir um segundo acesso remoto.
      if (this.mirrorMode != 2) this.menus.push({
        label: this._translateService.CNST_TRANSLATIONS['MENU.REMOTE'],
        icon: 'po-icon-link',
        action: () => { this.modal_mirrorMode.open(); }
      });

      //Opção de fechamento do Agent no menu.
      this.menus.push({
        label: this._translateService.CNST_TRANSLATIONS['MENU.EXIT'],
        icon: 'po-icon-exit',
        action: () => {
          this.modal_closeAgentInterface.open();
        }
      });
    }
    
    //Tradução dos modais do menu (Título / botões)
    this.lbl_closeAgentInterfaceTitle = this._translateService.CNST_TRANSLATIONS['ANGULAR.SYSTEM_EXIT'];
    this.lbl_confirm = this._translateService.CNST_TRANSLATIONS['BUTTONS.CONFIRM'];
    this.lbl_goBack = this._translateService.CNST_TRANSLATIONS['BUTTONS.GO_BACK'];

    //Tradução das mensagens do canal de suporte da TOTVS
    this.lbl_supportHelp = this._translateService.CNST_TRANSLATIONS['SUPPORT_TICKET.HELP'];
    this.lbl_supportGroup1 = this._translateService.CNST_TRANSLATIONS['SUPPORT_TICKET.GROUP_1'];
    this.lbl_supportGroup2 = this._translateService.CNST_TRANSLATIONS['SUPPORT_TICKET.GROUP_2'];
    this.lbl_supportGroup3 = this._translateService.CNST_TRANSLATIONS['SUPPORT_TICKET.GROUP_3'];
    this.lbl_supportLink = this._translateService.CNST_TRANSLATIONS['SUPPORT_TICKET.LINK'];

    //Tradução do modal de ativação da instalação do Agent
    this.lbl_registerAgentTitle = this._translateService.CNST_TRANSLATIONS['ANGULAR.REGISTER_AGENT_TITLE'];
    this.lbl_registerAgentDescription = this._translateService.CNST_TRANSLATIONS['ANGULAR.REGISTER_AGENT_DESCRIPTION'];
    this.lbl_registerAgentField = this._translateService.CNST_TRANSLATIONS['ANGULAR.REGISTER_AGENT_FIELD'];

    //Tradução do modal de acesso remoto do Agent
    this.lbl_mirrorModeTitle = this._translateService.CNST_TRANSLATIONS['MIRROR_MODE.MODAL.TITLE'];
    this.lbl_mirrorModeDescription1 = this._translateService.CNST_TRANSLATIONS['MIRROR_MODE.MODAL.DESCRIPTION_1'];
    this.lbl_mirrorModeDescription2 = this._translateService.CNST_TRANSLATIONS['MIRROR_MODE.MODAL.DESCRIPTION_2'];
    this.lbl_mirrorModeField = this._translateService.CNST_TRANSLATIONS['MIRROR_MODE.MODAL.FIELD'];
    this.lbl_mirrorModeProceed = this._translateService.CNST_TRANSLATIONS['MIRROR_MODE.MODAL.BUTTONS.PROCEED'];
    this.lbl_mirrorModeCancel = this._translateService.CNST_TRANSLATIONS['MIRROR_MODE.MODAL.BUTTONS.CANCEL'];

    //Tradução do modal de atualização
    this.lbl_updateAgentTitle = this._translateService.CNST_TRANSLATIONS['ELECTRON.UPDATE_READY_TITLE'];
    this.lbl_updateAgentDescription = this._translateService.CNST_TRANSLATIONS['ELECTRON.UPDATE_READY_DESCRIPTION'];
    this.lbl_updateNow = this._translateService.CNST_TRANSLATIONS['BUTTONS.UPDATE_NOW'];
    this.lbl_updateLater = this._translateService.CNST_TRANSLATIONS['BUTTONS.UPDATE_LATER'];
  }
  
  /* Método para mostrar mensagens ao usuário, utilizado pelo Electron */
  protected messageFromElectron(): void {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.on('AC_electronMessage', (event: any, level: any, message: string) => {
        this._utilities.createNotification(level, message);
      });
    }
  }
  
  /* Método usado para ler o comando de "Enter" no campo de registro da instalação do Agent */
  protected enterPassword(event: any): void {
    event.preventDefault();
    this.registerAgent_YES();
  }
  
  /**************************/
  /*** MÉTODOS DOS MODAIS ***/
  /**************************/
  /* Modal de fechamento da interface do Agent (NAO) */
  protected closeAgentInterface_NO(): void {
    this.modal_closeAgentInterface.close();
  }
  
  /* Modal de fechamento da interface do Agent (SIM) */
  protected closeAgentInterface_YES(): void {
    if (this._electronService.isElectronApp) {
      this._utilities.writeToLog(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['ANGULAR.SYSTEM_FINISH_USER']);
      this._electronService.ipcRenderer.send('AC_exit');
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['ANGULAR.SYSTEM_FINISH_USER_WARNING']);
    }
    
    this.modal_closeAgentInterface.close();
  }
  
  /* Modal de atualização do Agent (AGORA) */
  protected updateAgent_NOW(): void {
    this.modal_updateAgent.close();
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('AC_updateAgentNow');
    }
  }
  
  /* Modal de atualização do Agent (DEPOIS) */
  protected updateAgent_LATER(): void {
    this.modal_updateAgent.close();
  }
  
  /* Modal de verificação da instalação do Agent (NAO) */
  protected registerAgent_NO(): void {
    this.modal_registerAgent.close();
    this.registerAgent = null;
  }
  
  /* Modal de verificação da instalação do Agent (SIM) */
  protected registerAgent_YES(): void {
    if (this._electronService.isElectronApp) {
      if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['ANGULAR.REGISTER_AGENT'] };
      this.modal_registerAgent.close();
      this._electronService.ipcRenderer.invoke('AC_requestSerialNumber', [this.registerAgent]).then((registerAgent: number) => {
        if (registerAgent == 1) {
          this._configurationService.getConfiguration(false).subscribe((conf: Configuration) => {
            this.setMenuTranslations(conf.serialNumber);
            this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['ANGULAR.REGISTER_AGENT_OK'], null);
            if (this.mirrorMode != 1) this.po_lo_text = { value: null };
          });
        } else {
          if (registerAgent == -1) this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_ERROR_INVALID'], null);
          else if (registerAgent == -2) this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_ERROR_COMMUNICATION'], null);
          else this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_ERROR'], null);
          
          this.modal_registerAgent.open();
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        }
      });
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['ANGULAR.REGISTER_AGENT_WARNING'], null);
    }
  }

  /* Modal de ativação do acesso remoto do Agent (NAO) */
  protected mirrorMode_NO(): void {
    this.modal_mirrorMode.close();
    this.mirrorModeAgentCode = null;
  }

  /* Modal de ativação do acesso remoto do Agent (SIM) */
  protected mirrorMode_YES(): void {
    if (this._electronService.isElectronApp) {
      this._configurationService.getConfiguration(false).subscribe((conf: Configuration) => {
        if (conf.serialNumber == this.mirrorModeAgentCode) {
          if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['MIRROR_MODE.MESSAGES.WAIT'] };
          this.modal_mirrorMode.close();
          this._electronService.ipcRenderer.invoke('AC_requestRemoteAccess', [this.mirrorModeAgentCode]).then((res: number) => {
            if (res != 1) {
              this._translateService.getTranslations([
                new TranslationInput('MIRROR_MODE.MESSAGES.LOADING_ERROR', [this.mirrorModeAgentCode])
              ]).subscribe((translations: any) => {
                this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['MIRROR_MODE.MESSAGES.LOADING_ERROR'], null);
                if (this.mirrorMode != 1) this.po_lo_text = { value: null };
              });
            }
          });
        } else {
          this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['MIRROR_MODE.MESSAGES.WARNING_SAME_AGENT'], null);
        }
      });
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['ANGULAR.REGISTER_AGENT_WARNING'], null);
    }
  }
}