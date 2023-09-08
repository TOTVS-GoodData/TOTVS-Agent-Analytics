/* Componentes padrões do Angular */
import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

/* Componentes visuais da biblioteca Portinari.UI */
import { PoSwitchLabelPosition } from '@po-ui/ng-components';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';
import { CNST_MANDATORY_FORM_FIELD } from '../utilities/constants-angular';
import { CNST_JAVA_XMX_MINIMUM } from '../utilities/java-constants';
import { CNST_DEFAULT_LANGUAGE } from '../services/translation/translation-constants';

/* Serviço de comunicação com o Electron */
import { ElectronService } from 'ngx-electronyzer';

/* Serviço de configuração do Agent */
import { ConfigurationService } from './configuration-service';
import { Configuration } from './configuration-interface';
import { CNST_LOGFILES_MINIMUM } from './configuration-constants';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';
import { CustomTranslationLoader } from '../services/translation/custom-translation-loader';

/* Componentes rxjs para controle de Promise / Observable */
import { map } from 'rxjs';

/* Constantes do Agent */
import { CNST_PROGRAM_NAME, CNST_PROGRAM_VERSION } from '../app-constants';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Variável de suporte, para mostrar ao usuário os campos obrigatórios não preenchidos.
  protected CNST_FIELD_NAMES: Array<any> = [];
  
  //Versões do Agent / Java
  protected AgentVersion: string = null;
  protected JavaVersion: string = null;
  
  //Objeto de configuração do formulário
  protected configuration: Configuration = new Configuration(3, true, 2048, '', CNST_DEFAULT_LANGUAGE, true);
  
  /****** Portinari.UI ******/
  //Posicionamento do texto do label do modo debug (Esquerda)
  protected poDebugModeLabelPosition: PoSwitchLabelPosition = PoSwitchLabelPosition.Left;
  
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  //Idiomas disponíveis no Agent
  protected CNST_LANGUAGES: Array<any> = [];
  
  //Variável de suporte, que armazena o valor mínimo aceitável d parâmetro Xmx do Java.
  protected _CNST_JAVA_XMX_MINIMUM: number = CNST_JAVA_XMX_MINIMUM;
  
  //Variável de suporte, que armazena o numero mínimo de arquivos de log a serem mantidos pelo Agent.
  protected _CNST_LOGFILES_MINIMUM: number = CNST_LOGFILES_MINIMUM;
  
  /****** Formulários *******/
  //Títulos
  protected lbl_title: string = null;
  protected lbl_application: string = null;
  protected lbl_version: string = null;
  protected lbl_java: string = null;
  
  //Campos
  protected lbl_logfilesToKeep: string = null;
  protected lbl_javaXmx: string = null;
  protected lbl_javaTmpDir: string = null;
  protected lbl_javaJREDir: string = null;
  protected lbl_debugModeOn: string = null;
  protected lbl_debugModeOff: string = null;
  protected lbl_autoUpdateOn: string = null;
  protected lbl_autoUpdateOff: string = null;
  protected lbl_save: string = null;
  protected lbl_locale: string = null;
  
  //Balões de ajuda
  protected ttp_debugMode: string = null;
  protected ttp_javaTmpDir: string = null;
  protected ttp_javaJREDir: string = null;
  protected ttp_javaXmx: string = null;
  protected ttp_logfilesToKeep: string = null;
  protected ttp_autoUpdate: string = null;
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _utilities: Utilities,
    private _electronService: ElectronService,
    private _configurationService: ConfigurationService,
    private _translateService: TranslationService,
    private _customTranslationLoader: CustomTranslationLoader,
    private _router: Router
  ) {}
  
  public ngOnInit(): void {
    
    //Consulta das traduções
    this._translateService.updateStandardTranslations().subscribe(() => {
      this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING'] };
      
      //Tradução dos títulos
      this.lbl_title = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TITLE'];
      this.lbl_debugModeOn = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.DEBUGMODE_ON'];
      this.lbl_debugModeOff = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.DEBUGMODE_OFF'];
      this.lbl_autoUpdateOn = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.AUTOUPDATE_ON'];
      this.lbl_autoUpdateOff = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.AUTOUPDATE_OFF'];
      
      //Tradução dos campos de formulário
      this.lbl_logfilesToKeep = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.LOGFILES_TO_KEEP'] + CNST_MANDATORY_FORM_FIELD;
      this.lbl_javaXmx = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.JAVA_XMX'] + CNST_MANDATORY_FORM_FIELD;
      this.lbl_javaTmpDir = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.JAVA_TMPDIR'] + CNST_MANDATORY_FORM_FIELD;
      this.lbl_javaJREDir = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.JAVA_JREDIR'];
      this.lbl_application = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.APPLICATION'];
      this.lbl_version = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.VERSION'];
      this.lbl_java = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.JAVA'];
      this.lbl_locale = this._translateService.CNST_TRANSLATIONS['LANGUAGES.TITLE'];
      this.lbl_save = this._translateService.CNST_TRANSLATIONS['BUTTONS.SAVE'];
      
      //Tradução dos balões de ajuda dos campos
      this.ttp_debugMode = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TOOLTIPS.DEBUGMODE'];
      this.ttp_javaTmpDir = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TOOLTIPS.JAVA_TMPDIR'];
      this.ttp_javaJREDir = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TOOLTIPS.JAVA_JREDIR'];
      this.ttp_logfilesToKeep = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TOOLTIPS.LOGFILES'];
      this.ttp_autoUpdate = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TOOLTIPS.AUTOUPDATE'];
      this._translateService.getTranslations([
        new TranslationInput('CONFIGURATION.TOOLTIPS.JAVA_XMX', [CNST_JAVA_XMX_MINIMUM + ''])
      ]).subscribe((translations: any) => {
        this.ttp_javaXmx = translations['CONFIGURATION.TOOLTIPS.JAVA_XMX'];
      });
      
      //Definição dos campos obrigatórios do formulário
      this.CNST_FIELD_NAMES = [
        { key: 'logfilesToKeep', minimum: CNST_LOGFILES_MINIMUM, value: this._translateService.CNST_TRANSLATIONS['CONFIGURATION.LOGFILES_TO_KEEP'] },
        { key: 'javaXmx', minimum: CNST_JAVA_XMX_MINIMUM, value: this._translateService.CNST_TRANSLATIONS['CONFIGURATION.JAVA_XMX'] },
        { key: 'javaTmpDir', value: this._translateService.CNST_TRANSLATIONS['CONFIGURATION.JAVA_TMPDIR'] }
      ];
      
      //Leitura da configuração atual do Agent
      return this._configurationService.getConfiguration(true).subscribe((conf: Configuration) => {
        
        //Caso exista uma configuração cadastrada, atualiza os campos do formulário
        if (conf != undefined) {
          
          this.configuration = conf;
          this.CNST_LANGUAGES = this._customTranslationLoader.getAvailableLanguages().map((locale: string) => ({
            label: this._translateService.CNST_TRANSLATIONS['LANGUAGES.' + locale],
            action: (locale: any) => this.configuration.locale = locale.value,
            icon: 'po-icon-user',
            selected: (this.configuration.locale == locale),
            value: locale
          }));
        }
        
        //Atualização do número de versão do Java / Agent
        if (this._electronService.isElectronApp) {
          this.AgentVersion = CNST_PROGRAM_VERSION.PRODUCTION + this._electronService.ipcRenderer.sendSync('getAgentVersion').version;
          this.JavaVersion = null;
        } else {
          this.AgentVersion = CNST_PROGRAM_VERSION.DEVELOPMENT;
          this.JavaVersion = null;
        }
        this.po_lo_text = { value: null };
        return null;
      }, (err: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING_ERROR'], err);
        this.po_lo_text = { value: null };
        throw err;
      });
    });
  }
  
  /* Método de gravação das configurações do Agent */
  protected saveConfiguration(): void {
    
    //Valida se os dados preenchidos no formulário são válidos
    if (this.validConfiguration()) {
      this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE'] };
      
      //Grava a nova configuração do Agent
      this._configurationService.saveConfiguration(this.configuration).subscribe((b: boolean) => {
        
        this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE_OK']);
        this.po_lo_text = { value: null };
        
        //Recarrega a página de configuração do Agent
        this.ngOnInit();
      }, (err: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE_ERROR']);
        this.po_lo_text = { value: null };
      });
    }
  }
  
  /* Método de validação dos dados de configuração preenchidos do Agent */
  private validConfiguration(): boolean {
    //Valor de retorno do método
    let validate: boolean = true;
    
    //Objeto de suporte para validação dos campos
    let configuration: Configuration = new Configuration(3, true, 2048, '', CNST_DEFAULT_LANGUAGE, true);
    
    this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.VALIDATE']);
    this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.VALIDATE'] };
    
    //Verifica se todos os campos da interface de configuração foram preenchidos
    let propertiesNotDefined: string[] = Object.getOwnPropertyNames.call(Object, configuration).map((p: string) => {
      if (this.configuration[p] == undefined) return p;
    }).filter((p: string) => { return p != null; });
    if (propertiesNotDefined.length > 0) {
      validate = false;
      let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
      this._translateService.getTranslations([
        new TranslationInput('FORM_ERRORS.FIELD_NOT_FILLED', [fieldName])
      ]).subscribe((translations: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_NOT_FILLED']);
      });
      this.po_lo_text = { value: null };
    } else {
      //Verifica se a tipagem esperada de todos os campos da interface estão corretas
      propertiesNotDefined = Object.getOwnPropertyNames.call(Object, configuration).map((p: string) => {
        if (typeof this.configuration[p] != typeof configuration[p]) return p;
      }).filter((p: string) => { return p != null; });
      if (propertiesNotDefined.length > 0) {
        validate = false;
        this.po_lo_text = { value: null };
        let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
        this._translateService.getTranslations([
          new TranslationInput('FORM_ERRORS.FIELD_TYPING_WRONG', [fieldName])
        ]).subscribe((translations: any) => {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_TYPING_WRONG']);
        });
      }
    }
    
    //Verifica se o valor mínimo da memória de alocação máxima do Java foi respeitado.
    let minimums: any[] = this.CNST_FIELD_NAMES.filter((p: any) => {
      if (p.minimum != undefined) return (this.configuration[p.key] < p.minimum);
      else return false;
    });
    if (minimums.length > 0) {
      validate = false;
      this.po_lo_text = { value: null };
      this._translateService.getTranslations([
        new TranslationInput('FORM_ERRORS.FIELD_MINIMUM_ERROR', [minimums[0].value, minimums[0].minimum])
      ]).subscribe((translations: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_MINIMUM_ERROR']);
      });
    }
    
    return validate;
  }
  
  /* Método de seleção do diretório temporário do Agent (Apenas disponível c/ Electron) */
  protected getTmpFolder(): void {
    if (this._electronService.isElectronApp) {
      this.configuration.javaTmpDir = this._electronService.ipcRenderer.sendSync('getFolder');
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['FORM_ERRORS.FOLDER_SELECT_WARNING']);
      this.po_lo_text = { value: null };
    }
  }
  
  /* Método de seleção do diretório onde se encontram os binários da JRE do Java (Apenas disponível c/ Electron) */
  protected getJREFolder(): void {
    if (this._electronService.isElectronApp) {
      this.configuration.javaJREDir = this._electronService.ipcRenderer.sendSync('getFolder');
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['FORM_ERRORS.FOLDER_SELECT_WARNING']);
      this.po_lo_text = { value: null };
    }
  }
}
