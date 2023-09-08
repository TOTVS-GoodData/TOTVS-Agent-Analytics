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
import { ElectronService } from 'ngx-electronyzer';

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
  selector: 'app-root',
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
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _electronService: ElectronService,
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
    
    //Carrega as configurações atuais do Agent, caso existam
    this._configurationService.getConfiguration(true).subscribe((conf: Configuration) => {
      this._translateService.use(conf.locale).subscribe((b: boolean) => {
        if (this._electronService.isElectronApp) {
          
          //Evento de abertura do modal de atualização do Agent (Disparado pelo Electron)
          this._electronService.ipcRenderer.on('update-downloaded', () => {
            this.modal_updateAgent.open();
            this._changeDetectorService.detectChanges();
          });
          
          //Solicita ao Electron a versão atual do Agent
          this.version = CNST_PROGRAM_VERSION.PRODUCTION + this._electronService.ipcRenderer.sendSync('getAgentVersion').version;
          
          //Solicita ao Electron apagar os arquivos de log antigos
          this._electronService.ipcRenderer.send('deleteOldLogs');
          
          //Define o valor padrão do diretório temporário do Java
          if (conf.javaTmpDir == null) {
            conf.javaTmpDir = this._electronService.ipcRenderer.sendSync('getTmpPath');
            this._configurationService.saveConfiguration(conf).subscribe();
          }
        } else {
          this.version = CNST_PROGRAM_VERSION.DEVELOPMENT;
        }
        
        //Traduz os textos do menu principal do Agent, e vincula o serviço de comunicação do menu
        this.setMenuTranslations();
        this._menuService.menuRefObs$.subscribe(() => {
          this.setMenuTranslations();
        });
      });
    });
  }
  
  /* Método de tradução dos textos do menu principal do Agent */
  public setMenuTranslations(): void {
    
    //Tradução do menu principal
    this.menus = [
        { label: this._translateService.CNST_TRANSLATIONS['MENU.WORKSPACES'], icon: 'po-icon-chart-columns', link: './workspace'
      },{ label: this._translateService.CNST_TRANSLATIONS['MENU.DATABASES'], icon: 'po-icon-database', link: './database'
      },{ label: this._translateService.CNST_TRANSLATIONS['MENU.SCHEDULES'], icon: 'po-icon-clock', link: './schedule'
      },{ label: this._translateService.CNST_TRANSLATIONS['MENU.QUERIES'], icon: 'po-icon-filter', link: './query'
      },{ label: this._translateService.CNST_TRANSLATIONS['MENU.SCRIPTS'], icon: 'po-icon-filter', link: './script'
      },{ label: this._translateService.CNST_TRANSLATIONS['MENU.MONITOR'], icon: 'po-icon-device-desktop', link: './monitor'
      },{ label: this._translateService.CNST_TRANSLATIONS['MENU.CONFIGURATION'], icon: 'po-icon-settings', link: './configuration'
      },{ label: this._translateService.CNST_TRANSLATIONS['MENU.EXIT'],
        icon: 'po-icon-exit',
        action: () => {
          this.modal_closeAgentInterface.open();
        }
      }
    ];
    
    //Tradução dos modais do menu (Título / botões)
    this.lbl_closeAgentInterfaceTitle = this._translateService.CNST_TRANSLATIONS['ANGULAR.SYSTEM_EXIT'];
    this.lbl_confirm = this._translateService.CNST_TRANSLATIONS['BUTTONS.CONFIRM'];
    this.lbl_goBack = this._translateService.CNST_TRANSLATIONS['BUTTONS.GO_BACK'];
    
    //Tradução do modal de atualização
    this.lbl_updateAgentTitle = this._translateService.CNST_TRANSLATIONS['ELECTRON.UPDATE_READY_TITLE'];
    this.lbl_updateAgentDescription = this._translateService.CNST_TRANSLATIONS['ELECTRON.UPDATE_READY_DESCRIPTION'];
    this.lbl_updateNow = this._translateService.CNST_TRANSLATIONS['BUTTONS.UPDATE_NOW'];
    this.lbl_updateLater = this._translateService.CNST_TRANSLATIONS['BUTTONS.UPDATE_LATER'];
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
      this._electronService.ipcRenderer.send('exit');
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['ANGULAR.SYSTEM_FINISH_USER_WARNING']);
    }
    
    this.modal_closeAgentInterface.close();
  }
  
  /* Modal de atualização do Agent (AGORA) */
  protected updateAgent_NOW(): void {
    this.modal_updateAgent.close();
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('updateAgentNow');
    }
  }
  
  /* Modal de atualização do Agent (DEPOIS) */
  protected updateAgent_LATER(): void {
    this.modal_updateAgent.close();
  }
}