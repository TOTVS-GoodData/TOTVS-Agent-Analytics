/* Componentes padrões do Angular */
import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

/* Componentes visuais da biblioteca Portinari.UI */
import { PoSwitchLabelPosition } from '@po-ui/ng-components';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';
import { CNST_MANDATORY_FORM_FIELD } from '../utilities/angular-constants';
import { CNST_JAVA_XMX_MINIMUM } from '../utilities/java-constants';
import { CNST_DEFAULT_LANGUAGE } from '../services/translation/translation-constants';
import { CNST_TIMEZONES } from '../services/timezones';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Serviço de consulta do acesso remoto (MirrorMode) */
import { MirrorService } from '../services/mirror-service';

/* Serviço de configuração do Agent */
import { ConfigurationService } from './configuration-service';
import { Configuration } from './configuration-interface';
import { CNST_LOGFILES_MINIMUM, CNST_LOGFILES_MAXIMUM, CNST_DEFAULT_CLIENT_PORT } from './configuration-constants';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';
import { CustomTranslationLoader } from '../services/translation/custom-translation-loader';

/* Componentes rxjs para controle de Promise / Observable */
import { map, from } from 'rxjs';

/* Constantes do Agent */
import {
  CNST_PROGRAM_NAME,
  CNST_PROGRAM_VERSION,
  CNST_PORT_MINIMUM,
  CNST_PORT_MAXIMUM
} from '../app-constants';

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
  
  //Variável de suporte, para mostrar ao usuário os fusos horários disponíveis.
  protected _CNST_TIMEZONES: Array<any> = [];
  
  //Versões do Agent / Java
  protected AgentVersion: string = null;
  protected JavaVersionTitle: string = null;
  protected JavaVersionDetails: string = null;
  
  //Objeto de configuração do formulário
  protected configuration: Configuration = new Configuration(3, true, 2048, '', CNST_DEFAULT_LANGUAGE, true);
  
  //Valores mínimo / máximo permitidos para a porta de comunicação com o servidor da TOTVS
  protected _CNST_PORT_MINIMUM: number = CNST_PORT_MINIMUM;
  protected _CNST_PORT_MAXIMUM: number = CNST_PORT_MAXIMUM;
  
  //Define se o Agent está sendo executado via acesso remoto (MirrorMode)
  protected mirrorMode: number = 0;
  
  /****** Portinari.UI ******/
  //Posicionamento do texto do label do modo debug (Esquerda)
  protected poDebugModeLabelPosition: PoSwitchLabelPosition = PoSwitchLabelPosition.Left;
  
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  //Idiomas disponíveis no Agent
  protected CNST_LANGUAGES: Array<any> = [];
  
  //Variável de suporte, que armazena o valor mínimo aceitável do parâmetro Xmx do Java.
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
  protected lbl_instance: string = null;
  protected lbl_debugMode: string = null;
  protected lbl_autoUpdate: string = null;
  protected lbl_activated_1: string = null;
  protected lbl_activated_2: string = null;
  protected lbl_deactivated_1: string = null;
  protected lbl_deactivated_2: string = null;
  protected lbl_save: string = null;
  protected lbl_locale: string = null;
  protected lbl_timezone: string = null;
  
  //Balões de ajuda
  protected ttp_instance: string = null;
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
    private _electronService: ElectronService,
    private _mirrorService: MirrorService,
    private _configurationService: ConfigurationService,
    private _translateService: TranslationService,
    private _customTranslationLoader: CustomTranslationLoader,
    private _utilities: Utilities,
    private _router: Router
  ) {}
  
  /* Método de inicialização do componente */
  public ngOnInit(): void {
    
    /*
      Definição dos fusos horários disponíveis
      
      Isso tem que rodar só 1x, no init do Angular,
      porque o PO.UI é louco.
    */
    this._CNST_TIMEZONES = CNST_TIMEZONES.sort().map((timezone: string) => {
      return { label: timezone, value: timezone };
    });
    
    this.reloadConfiguration();
  }
  
  /* Método de recarga do componente de Configuração do Agent */
  protected reloadConfiguration(): void {
    
    //Consulta das traduções
    this._translateService.updateStandardTranslations().subscribe(() => {
      
      //Configuração da mensagem de acesso remoto (MirrorMode)
      this.mirrorMode = this._mirrorService.getMirrorMode();
      this._translateService.getTranslations([
        new TranslationInput('CONFIGURATION.TOOLTIPS.JAVA_XMX', [CNST_JAVA_XMX_MINIMUM + ''])
      ]).subscribe((translations: any) => {
        this.ttp_javaXmx = translations['CONFIGURATION.TOOLTIPS.JAVA_XMX'];
      });
      
      if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING'] };
      
      //Tradução dos títulos
      this.lbl_title = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TITLE'];
      this.lbl_instance = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.INSTANCE'];
      this.lbl_debugMode = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.DEBUGMODE'];
      this.lbl_autoUpdate = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.AUTOUPDATE'];
      this.lbl_activated_1 = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.ACTIVATED_1'];
      this.lbl_activated_2 = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.ACTIVATED_2'];
      this.lbl_deactivated_1 = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.DEACTIVATED_1'];
      this.lbl_deactivated_2 = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.DEACTIVATED_2'];
      
      //Tradução dos campos de formulário
      this.lbl_logfilesToKeep = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.LOGFILES_TO_KEEP'] + CNST_MANDATORY_FORM_FIELD;
      this.lbl_javaXmx = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.JAVA_XMX'] + CNST_MANDATORY_FORM_FIELD;
      this.lbl_javaTmpDir = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.JAVA_TMPDIR'] + CNST_MANDATORY_FORM_FIELD;
      this.lbl_javaJREDir = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.JAVA_JREDIR'];
      this.lbl_application = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.APPLICATION'];
      this.lbl_version = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.VERSION'];
      this.lbl_java = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.JAVA'];
      this.lbl_locale = this._translateService.CNST_TRANSLATIONS['LANGUAGES.TITLE'];
      this.lbl_timezone = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TIMEZONE'];
      this.lbl_save = this._translateService.CNST_TRANSLATIONS['BUTTONS.SAVE'];
      
      //Tradução dos balões de ajuda dos campos
      this.ttp_instance = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TOOLTIPS.INSTANCE'];
      this.ttp_debugMode = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TOOLTIPS.DEBUGMODE'];
      this.ttp_javaTmpDir = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TOOLTIPS.JAVA_TMPDIR'];
      this.ttp_javaJREDir = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TOOLTIPS.JAVA_JREDIR'];
      this.ttp_logfilesToKeep = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TOOLTIPS.LOGFILES'];
      this.ttp_autoUpdate = this._translateService.CNST_TRANSLATIONS['CONFIGURATION.TOOLTIPS.AUTOUPDATE'];
      
      //Definição dos campos obrigatórios do formulário
      this.CNST_FIELD_NAMES = [
        { key: 'logfilesToKeep', minimum: CNST_LOGFILES_MINIMUM, maximum: CNST_LOGFILES_MAXIMUM, value: this._translateService.CNST_TRANSLATIONS['CONFIGURATION.LOGFILES_TO_KEEP'] },
        { key: 'javaXmx', minimum: CNST_JAVA_XMX_MINIMUM, value: this._translateService.CNST_TRANSLATIONS['CONFIGURATION.JAVA_XMX'] },
        { key: 'javaTmpDir', value: this._translateService.CNST_TRANSLATIONS['CONFIGURATION.JAVA_TMPDIR'] }
      ];
      
      //Atualização do número de versão do Java / Agent
      if (this._electronService.isElectronApp) {
        this.AgentVersion = CNST_PROGRAM_VERSION.PRODUCTION + this._electronService.ipcRenderer.sendSync('AC_getAgentVersion').version;
        from(this._electronService.ipcRenderer.invoke('AC_getJavaVersion')).pipe(map((res: string[]) => {
          
          //Formata as informações recebidas do Java, para visualização em tela.
          let comma1: number = res[0].indexOf('"');
          let comma2: number = res[0].indexOf('"', comma1 + 1);
          this.JavaVersionTitle = CNST_PROGRAM_VERSION.PRODUCTION + res[0].slice(comma1 + 1, comma2);
          
          delete res[0];
          this.JavaVersionDetails = res.reduce((acc: string, s: string) => (acc += '\n' + s));
        })).subscribe();
      } else {
        this.AgentVersion = CNST_PROGRAM_VERSION.DEVELOPMENT;
        this.JavaVersionTitle = CNST_PROGRAM_VERSION.DEVELOPMENT;
        this.JavaVersionDetails = 'Java(TM) SE Runtime Environment (build 1.8.0_381-b09)\nJava HotSpot(TM) 64-Bit Server VM (build 25.381-b09, mixed mode)';
      }
      
      this._configurationService.getConfiguration(true).subscribe((conf: Configuration) => {
        this.configuration = conf;
        
        //Aualização dos idiomas disponíveis no Agent
        this.CNST_LANGUAGES = this._customTranslationLoader.getAvailableLanguages().map((locale: string) => ({
          label: this._translateService.CNST_TRANSLATIONS['LANGUAGES.' + locale],
          action: (locale: any) => this.configuration.locale = locale.value,
          icon: 'po-icon-user',
          selected: (this.configuration.locale == locale),
          value: locale
        }));
        
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      });
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING_ERROR'], err);
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      throw err;
    });
  }
  
  /* Método de gravação das configurações do Agent */
  protected saveConfiguration(): void {
    
    //Valida se os dados preenchidos no formulário são válidos
    if (this.validConfiguration()) {
      if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE'] };
      
      //Grava a nova configuração do Agent
      this._configurationService.saveConfiguration(this.configuration).subscribe((b: number) => {
        switch (b) {
          case (1): this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE_OK']); break;
          case (-1): this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE_ERROR_CONFIG']); break;
        }
        
        //Recarrega a página de configuração do Agent
        this.reloadConfiguration();
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      }, (err: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE_ERROR']);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
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
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.VALIDATE'] };
    
    //Verifica se todos os campos da interface de configuração foram preenchidos
    let propertiesNotDefined: string[] = Object.getOwnPropertyNames.call(Object, configuration).map((p: string) => {
      if ((this.configuration[p] == undefined) && (p != 'serialNumber')) return p;
    }).filter((p: string) => { return p != null; });
    if (propertiesNotDefined.length > 0) {
      validate = false;
      let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
      this._translateService.getTranslations([
        new TranslationInput('FORM_ERRORS.FIELD_NOT_FILLED', [fieldName])
      ]).subscribe((translations: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_NOT_FILLED']);
      });
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    } else {
      
      //Verifica se a tipagem esperada de todos os campos da interface estão corretas
      propertiesNotDefined = Object.getOwnPropertyNames.call(Object, configuration).map((p: string) => {
        if ((typeof this.configuration[p] != typeof configuration[p]) && (p != 'serialNumber')) return p;
      }).filter((p: string) => { return p != null; });
      if (propertiesNotDefined.length > 0) {
        validate = false;
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
        this._translateService.getTranslations([
          new TranslationInput('FORM_ERRORS.FIELD_TYPING_WRONG', [fieldName])
        ]).subscribe((translations: any) => {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_TYPING_WRONG']);
        });
      }
    }
    
    //Verifica se os valores mínimos do formulário foram respeitados.
    let range: any[] = this.CNST_FIELD_NAMES.filter((p: any) => {
      if (p.minimum != undefined) return ((this.configuration[p.key] < p.minimum) || (this.configuration[p.key] > p.maximum));
      else return false;
    });
    if (range.length > 0) {
      validate = false;
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      this._translateService.getTranslations([
        new TranslationInput('FORM_ERRORS.FIELD_RANGE_ERROR', [range[0].value, range[0].minimum, range[0].maximum])
      ]).subscribe((translations: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_RANGE_ERROR']);
      });
    }
    
    return validate;
  }
  
  /* Método de seleção do diretório temporário do Agent (Apenas disponível c/ Electron) */
  protected getTmpFolder(): void {
    if (this._electronService.isElectronApp) {
      this.configuration.javaTmpDir = this._electronService.ipcRenderer.sendSync('AC_getFolder');
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['FORM_ERRORS.FOLDER_SELECT_WARNING']);
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    }
  }
  
  /* Método de seleção do diretório onde se encontram os binários da JRE do Java (Apenas disponível c/ Electron) */
  protected getJREFolder(): void {
    if (this._electronService.isElectronApp) {
      this.configuration.javaJREDir = this._electronService.ipcRenderer.sendSync('AC_getFolder');
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['FORM_ERRORS.FOLDER_SELECT_WARNING']);
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    }
  }
}
