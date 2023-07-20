import { Component, OnInit } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { PoSwitchLabelPosition } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';

import { ConfigurationService } from './configuration-service';
import { Configuration } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';
import { TranslationService, TranslationInput } from '../service/translation/translation-service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  public CNST_MESSAGES: any = {};
  protected CNST_FIELD_NAMES: Array<any> = [];
  
  public poDebugModeLabelPosition: PoSwitchLabelPosition = PoSwitchLabelPosition.Left;
  
  public AgentVersion: string = '';
  public JavaVersion: string = '';
  
  protected configuration: Configuration = new Configuration();
  protected po_lo_text: any = { value: null };
  
  /*************************************************/
  /* MAPEAMENTO DOS NOMES DOS CAMPOS DO FORMULÁRIO */
  /*************************************************/
  protected lbl_title: string;
  protected lbl_logfilesToKeep: string;
  protected lbl_javaXms: string;
  protected lbl_javaXmx: string;
  protected lbl_javaTmpDir: string;
  protected lbl_debugModeOn: string;
  protected lbl_debugModeOff: string;
  protected lbl_save: string;
  
  
  
  
  
  protected lbl_javaXmsHelp: string = 'Testezinho de label';
  /*************************************************/
  /*************************************************/
  /*************************************************/
  constructor(
    private _configurationService: ConfigurationService,
    private _translateService: TranslationService,
    private _utilities: Utilities,
    private _electronService: ElectronService
  ) {
    this._translateService.getTranslations([
      new TranslationInput('CONFIGURATION.TITLE', [_constants.CNST_PROGRAM_NAME.DEFAULT]),
      new TranslationInput('CONFIGURATION.DEBUGMODE_ON', []),
      new TranslationInput('CONFIGURATION.DEBUGMODE_OFF', []),
      new TranslationInput('CONFIGURATION.LOGFILES_TO_KEEP', []),
      new TranslationInput('CONFIGURATION.JAVA_XMS', []),
      new TranslationInput('CONFIGURATION.JAVA_XMX', []),
      new TranslationInput('CONFIGURATION.JAVA_TMPDIR', []),
      new TranslationInput('CONFIGURATION.MESSAGES.VALIDATE', []),
      new TranslationInput('BUTTONS.SAVE', []),
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING', []),
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('CONFIGURATION.MESSAGES.VALIDATE', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE_OK', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE_ERROR', []),
      new TranslationInput('FORM_ERRORS.FOLDER_SELECT_WARNING', [])
    ]).subscribe((translations: any) => {
      this.CNST_FIELD_NAMES = [
        { key: 'logfilesToKeep', value: translations['CONFIGURATION.LOGFILES_TO_KEEP'] },
        { key: 'javaXms', value: translations['CONFIGURATION.JAVA_XMS'] },
        { key: 'javaXmx', value: translations['CONFIGURATION.JAVA_XMX'] },
        { key: 'javaTmpDir', value: translations['CONFIGURATION.JAVA_TMPDIR'] }
      ];
      
      this.lbl_title = translations['CONFIGURATION.TITLE'];
      this.lbl_debugModeOn = translations['CONFIGURATION.DEBUGMODE_ON'];
      this.lbl_debugModeOff = translations['CONFIGURATION.DEBUGMODE_OFF'];
      
      this.lbl_logfilesToKeep = translations['CONFIGURATION.LOGFILES_TO_KEEP'] + '*';
      this.lbl_javaXms = translations['CONFIGURATION.JAVA_XMS'] + '*';
      this.lbl_javaXmx = translations['CONFIGURATION.JAVA_XMX'] + '*';
      this.lbl_javaTmpDir = translations['CONFIGURATION.JAVA_TMPDIR'] + '*';
      
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
    });
  }
  
  public ngOnInit(): void {
    this.po_lo_text = { value: this.CNST_MESSAGES.LOADING };
    this._configurationService.getConfiguration().subscribe((conf: Configuration) => {
      if (conf != undefined) {
        this.configuration = conf;
      }
      
      if (this._electronService.isElectronApp) {
        this.AgentVersion = _constants.CNST_PROGRAM_VERSION.PRODUCTION + this._electronService.ipcRenderer.sendSync('getVersion').version;
        this.JavaVersion = '';
      } else {
        this.AgentVersion = _constants.CNST_PROGRAM_VERSION.DEVELOPMENT;
        this.JavaVersion = '';
      }
      
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.LOADING_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }

  public saveConfiguration(): void {
    if (this.validConfiguration()) {
      this.po_lo_text = { value: this.CNST_MESSAGES.SAVE };
      this._configurationService.saveConfiguration(this.configuration).subscribe((b: boolean) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.SAVE_OK);
        this.po_lo_text = { value: null };
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.SAVE_ERROR);
        this.po_lo_text = { value: null };
      });
    }
  }
  
  private validConfiguration(): boolean {
    let validate: boolean = true;
    let configuration: Configuration = new Configuration();
    
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
  
  public getFolder(): void {
    if (this._electronService.isElectronApp) {
      this.configuration.javaTmpDir = this._electronService.ipcRenderer.sendSync('getFolder');
    } else {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, this.CNST_MESSAGES.FOLDER_SELECT_WARNING);
      this.po_lo_text = { value: null };
    }
  }
}
