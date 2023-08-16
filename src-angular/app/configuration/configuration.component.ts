import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, Navigation } from '@angular/router';

import { ElectronService } from 'ngx-electronyzer';

import { PoSwitchLabelPosition } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation, PoButtonGroupItem } from '@po-ui/ng-components';

import { Configuration } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';
import { TranslationService, TranslationInput } from '../service/translation/translation-service';
import { CustomTranslationLoader } from '../service/translation/custom-translation-loader';
import { MenuService } from '../service/menu-service';

import { ConfigurationService } from './configuration-service';

import { Observable, map, switchMap, catchError } from 'rxjs';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  protected updateMenuLanguage: EventEmitter<void> = new EventEmitter<void>();
  public CNST_MESSAGES: any = {};
  protected CNST_FIELD_NAMES: Array<any> = [];
  
  public poDebugModeLabelPosition: PoSwitchLabelPosition = PoSwitchLabelPosition.Left;
  protected CNST_LANGUAGES: Array<any> = [];
  
  public AgentVersion: string = '';
  public JavaVersion: string = '';
  
  protected configuration: Configuration = new Configuration(10, true, 2048, '', _constants.CNST_DEFAULT_LANGUAGE);
  protected po_lo_text: any = { value: null };
  
  /*************************************************/
  /* MAPEAMENTO DOS NOMES DOS CAMPOS DO FORMULÁRIO */
  /*************************************************/
  protected lbl_title: string;
  protected lbl_logfilesToKeep: string;
  protected lbl_javaXmx: string;
  protected lbl_javaTmpDir: string;
  protected lbl_javaJREDir: string;
  protected lbl_debugModeOn: string;
  protected lbl_debugModeOff: string;
  protected lbl_save: string;
  protected lbl_locale: string;
  
  protected lbl_application: string;
  protected lbl_version: string;
  protected lbl_java: string;
  
  protected ttp_javaTmpDir: string;
  protected ttp_javaJREDir: string;
  protected ttp_javaXmx: string;
  protected ttp_logfilesToKeep: string;
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  constructor(
    private _configurationService: ConfigurationService,
    private _translateService: TranslationService,
    private _translationLoader: CustomTranslationLoader,
    private _utilities: Utilities,
    private _menuService: MenuService,
    private _router: Router,
    private _electronService: ElectronService
  ) {}
  
  public ngOnInit(): void {
    this._translateService.getTranslations([
      new TranslationInput('CONFIGURATION.TITLE', [_constants.CNST_PROGRAM_NAME.DEFAULT]),
      new TranslationInput('CONFIGURATION.APPLICATION', []),
      new TranslationInput('CONFIGURATION.VERSION', []),
      new TranslationInput('CONFIGURATION.JAVA', []),
      new TranslationInput('CONFIGURATION.DEBUGMODE_ON', []),
      new TranslationInput('CONFIGURATION.DEBUGMODE_OFF', []),
      new TranslationInput('CONFIGURATION.LOGFILES_TO_KEEP', []),
      new TranslationInput('CONFIGURATION.JAVA_XMX', []),
      new TranslationInput('CONFIGURATION.JAVA_TMPDIR', []),
      new TranslationInput('CONFIGURATION.JAVA_JREDIR', []),
      new TranslationInput('CONFIGURATION.MESSAGES.VALIDATE', []),
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING', []),
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('CONFIGURATION.MESSAGES.VALIDATE', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE_OK', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE_ERROR', []),
      new TranslationInput('CONFIGURATION.TOOLTIPS.LOGFILES', []),
      new TranslationInput('CONFIGURATION.TOOLTIPS.JAVA_XMX', []),
      new TranslationInput('CONFIGURATION.TOOLTIPS.JAVA_TMPDIR', []),
      new TranslationInput('CONFIGURATION.TOOLTIPS.JAVA_JREDIR', []),
      new TranslationInput('LANGUAGES.TITLE', []),
      new TranslationInput('LANGUAGES.en_US', []),
      new TranslationInput('LANGUAGES.pt_BR', []),
      new TranslationInput('LANGUAGES.es_ES', []),
      new TranslationInput('BUTTONS.SAVE', []),
      new TranslationInput('FORM_ERRORS.FOLDER_SELECT_WARNING', [])
    ]).subscribe((translations: any) => {
      this.po_lo_text = { value: translations['CONFIGURATION.MESSAGES.LOADING'] };
      
      this.lbl_title = translations['CONFIGURATION.TITLE'];
      this.lbl_debugModeOn = translations['CONFIGURATION.DEBUGMODE_ON'];
      this.lbl_debugModeOff = translations['CONFIGURATION.DEBUGMODE_OFF'];
      
      this.lbl_logfilesToKeep = translations['CONFIGURATION.LOGFILES_TO_KEEP'] + '*';
      this.lbl_javaXmx = translations['CONFIGURATION.JAVA_XMX'] + '*';
      this.lbl_javaTmpDir = translations['CONFIGURATION.JAVA_TMPDIR'] + '*';
      this.lbl_javaJREDir = translations['CONFIGURATION.JAVA_JREDIR'];
      this.lbl_application = translations['CONFIGURATION.APPLICATION'];
      this.lbl_version = translations['CONFIGURATION.VERSION'];
      this.lbl_java = translations['CONFIGURATION.JAVA'];
      this.lbl_locale = translations['LANGUAGES.TITLE'];
      
      this.ttp_javaTmpDir = translations['CONFIGURATION.TOOLTIPS.JAVA_TMPDIR'];
      this.ttp_javaJREDir = translations['CONFIGURATION.TOOLTIPS.JAVA_JREDIR'];
      this.ttp_javaXmx = translations['CONFIGURATION.TOOLTIPS.JAVA_XMX'];
      this.ttp_logfilesToKeep = translations['CONFIGURATION.TOOLTIPS.LOGFILES'];
      
      this.CNST_FIELD_NAMES = [
        { key: 'logfilesToKeep', value: translations['CONFIGURATION.LOGFILES_TO_KEEP'] },
        { key: 'javaXmx', value: translations['CONFIGURATION.JAVA_XMX'] },
        { key: 'javaTmpDir', value: translations['CONFIGURATION.JAVA_TMPDIR'] }
      ];
      
      this.CNST_MESSAGES = {
        LOADING: translations['CONFIGURATION.MESSAGES.LOADING'],
        LOADING_ERROR: translations['CONFIGURATION.MESSAGES.LOADING_ERROR'],
        VALIDATE: translations['CONFIGURATION.MESSAGES.VALIDATE'],
        SAVE: translations['CONFIGURATION.MESSAGES.SAVE'],
        SAVE_OK: translations['CONFIGURATION.MESSAGES.SAVE_OK'],
        SAVE_ERROR: translations['CONFIGURATION.MESSAGES.SAVE_ERROR'],
        FOLDER_SELECT_WARNING: translations['FORM_ERRORS.FOLDER_SELECT_WARNING']
      };
      
      this.lbl_save = translations['BUTTONS.SAVE'];
      
      return this._configurationService.getConfiguration(true).subscribe((conf: Configuration) => {
        if (conf != undefined) {
          this.configuration = conf;
          this.CNST_LANGUAGES = this._translationLoader.getAvailableLanguages().map((locale: string) => ({
            label: translations['LANGUAGES.' + locale.replaceAll('\-','\_')],
            action: this.setLanguage.bind(this),
            icon: 'po-icon-user',
            selected: (this.configuration.locale == locale),
            value: locale
          }));
        }
        if (this._electronService.isElectronApp) {
          this.AgentVersion = _constants.CNST_PROGRAM_VERSION.PRODUCTION + this._electronService.ipcRenderer.sendSync('getVersion').version;
          this.JavaVersion = '';
        } else {
          this.AgentVersion = _constants.CNST_PROGRAM_VERSION.DEVELOPMENT;
          this.JavaVersion = '';
        }
        this.po_lo_text = { value: null };
        return null;
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.LOADING_ERROR, err);
        this.po_lo_text = { value: null };
        throw err;
      });
    });
  }
  
  public setLanguage(locale: any): void {
    this.configuration.locale = locale.value;
  }
  
  public saveConfiguration(): void {
    if (this.validConfiguration()) {
      this.po_lo_text = { value: this.CNST_MESSAGES.SAVE };
      this._configurationService.saveConfiguration(this.configuration).subscribe((b: boolean) => {
        this._translateService.use(this.configuration.locale);
        this._menuService.updateMenu();
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.SAVE_OK);
        this.po_lo_text = { value: null };
        this.ngOnInit();
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.SAVE_ERROR);
        this.po_lo_text = { value: null };
      });
    }
  }
  
  private validConfiguration(): boolean {
    let validate: boolean = true;
    let configuration: Configuration = new Configuration(null, true, null, null, _constants.CNST_DEFAULT_LANGUAGE);
    
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.VALIDATE);
    this.po_lo_text = { value: this.CNST_MESSAGES.VALIDATE };
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, configuration).map((p: string) => {
      if (this.configuration[p] == undefined) return p;
    }).filter((p: string) => { return p != null; });
    
    // Validação dos campos de formulário //
    if (propertiesNotDefined.length > 0) {
      validate = false;
      let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
      this._translateService.getTranslations([
        new TranslationInput('FORM_ERRORS.FIELD_NOT_FILLED', [fieldName])
      ]).subscribe((translations: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_NOT_FILLED']);
      });
      this.po_lo_text = { value: null };
    }
    
    return validate;
  }
  
  public getTmpFolder(): void {
    if (this._electronService.isElectronApp) {
      this.configuration.javaTmpDir = this._electronService.ipcRenderer.sendSync('getFolder');
    } else {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, this.CNST_MESSAGES.FOLDER_SELECT_WARNING);
      this.po_lo_text = { value: null };
    }
  }
  
  public getJREFolder(): void {
    if (this._electronService.isElectronApp) {
      this.configuration.javaJREDir = this._electronService.ipcRenderer.sendSync('getFolder');
    } else {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, this.CNST_MESSAGES.FOLDER_SELECT_WARNING);
      this.po_lo_text = { value: null };
    }
  }
}
