import { Component, OnInit } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { PoSwitchLabelPosition } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';

import { ConfigurationService } from './configuration-service';
import { CNST_CONFIGURATION_MESSAGES } from './configuration-messages';
import { Configuration } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

const CNST_FIELD_NAMES: Array<any> = [
  { key: 'logfilesToKeep', value: 'Número mínimo, em dias, de arquivos de log para serem mantidos' }
];

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  public CNST_MESSAGES: any = {
     CONFIG_VALIDATE: 'Validando configuração...'
  };
  
  public version: string = '';
  public programName: string = '';
  
  public showQueriesPosition: PoSwitchLabelPosition = PoSwitchLabelPosition.Left;
  protected configuration: Configuration = new Configuration();
  protected po_lo_text: any = { value: null };
  
  protected _CNST_FIELD_NAMES: any;
  
  /*************************************************/
  /* MAPEAMENTO DOS NOMES DOS CAMPOS DO FORMULÁRIO */
  /*************************************************/
  protected lbl_logfilesToKeep: string;
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  constructor(
               private _configurationService: ConfigurationService,
               private _utilities: Utilities,
               private _electronService: ElectronService
  ) {
    this.programName = _constants.CNST_PROGRAM_NAME.DEFAULT;
    this._CNST_FIELD_NAMES = CNST_FIELD_NAMES;
    this.lbl_logfilesToKeep = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'logfilesToKeep'; }).value;
  }
  
  public ngOnInit(): void {
    this.po_lo_text = { value: CNST_CONFIGURATION_MESSAGES.CONFIG_LOADING };
    this._configurationService.getConfiguration().subscribe((conf: Configuration) => {
      if (conf != undefined) {
        this.configuration = conf;
      }
      
      if (this._electronService.isElectronApp) {
        this.version = _constants.CNST_PROGRAM_VERSION.PRODUCTION + this._electronService.ipcRenderer.sendSync('getVersion').version;
      } else {
        this.version = _constants.CNST_PROGRAM_VERSION.DEVELOPMENT;
      }
      
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_CONFIGURATION_MESSAGES.CONFIG_LOADING_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }

  public saveConfiguration(): void {
    if (this.validConfiguration()) {
      this.po_lo_text = { value: CNST_CONFIGURATION_MESSAGES.CONFIG_SAVE };
      this._configurationService.saveConfiguration(this.configuration).subscribe((b: boolean) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, CNST_CONFIGURATION_MESSAGES.CONFIG_SAVE_OK);
        this.po_lo_text = { value: null };
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_CONFIGURATION_MESSAGES.CONFIG_SAVE_ERROR);
        this.po_lo_text = { value: null };
      });
    }
  }
  
  
  private validConfiguration(): boolean {
    let valid: boolean = true;
    let configuration: Configuration = new Configuration();
    
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.CONFIG_VALIDATE);
    this.po_lo_text = { value: this.CNST_MESSAGES.CONFIG_VALIDATE };
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, configuration).map((p: string) => {
      if ((this.configuration[p] == undefined) && (p != 'id')) return p;
    }).filter((p: string) => { return p != null; });
    
    // Validação dos campos de formulário //
    if (propertiesNotDefined.length > 0) {
      valid = false;
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, 'Campo obrigatório "' + this._CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value + '" não preenchido.');
      this.po_lo_text = { value: null };
    }
    
    return valid;
  }
}
