import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, Navigation } from '@angular/router';

import { ElectronService } from 'ngx-electronyzer';

import { PoSelectOption, PoGridRowActions } from '@po-ui/ng-components';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

import { WorkspaceService } from '../workspace/workspace-service';
import { ScheduleService } from '../schedule/schedule-service';
import { CNST_SCHEDULE_MESSAGES as scheduleMessage } from '../schedule/schedule-messages';
import { DatabaseService } from '../database/database-service';
import { Workspace, Database, Schedule, ETLParameter, SQLParameter } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-schedule-add',
  templateUrl: './schedule-add.component.html',
  styleUrls: ['./schedule-add.component.css']
})

export class ScheduleAddComponent {
  public CNST_MESSAGES: any = {};
  
  private _CNST_NEW_PARAMETER_VALUE: string;
  private _CNST_ERP: Array<any>;
  protected _CNST_EXTENSION: Array<any>;
  
  protected CNST_FIELD_NAMES: Array<any> = [];
  protected _CNST_EXECUTION_WINDOWS: Array<PoSelectOption>;
  
  protected po_lo_text: any = { value: null };
  protected schedule: Schedule = new Schedule();
  
  private projects: Workspace[];
  private databases: Database[];
  protected listProjects: Array<PoSelectOption> = [{ label: undefined, value: undefined }];
  
  protected po_grid_config_sql: Array<any> = [];
  protected po_grid_config_etl: Array<any> = [];
  protected isPlatform: boolean = false;
  
  protected po_gridActionsETL: PoGridRowActions = {
    beforeRemove: this.onBeforeRemoveETL.bind(this),
    beforeInsert: this.onBeforeInsertETL.bind(this)
  };
  
  protected po_gridActionsSQL: PoGridRowActions = {
    beforeRemove: this.onBeforeRemoveSQL.bind(this),
    beforeInsert: this.onBeforeInsertSQL.bind(this)
  };
  
  /*************************************************/
  /* MAPEAMENTO DOS NOMES DOS CAMPOS DO FORMULÁRIO */
  /*************************************************/
  protected lbl_title: string;
  protected lbl_newParameter: string;
  protected lbl_goBack: string;
  protected lbl_save: string;
  protected lbl_name: string;
  protected lbl_workspaceId: string;
  protected lbl_windows: string;
  protected lbl_enabled: string;
  protected lbl_fileFolder: string;
  protected lbl_fileFolderWildcard: string;
  protected lbl_GDZipFilename: string;
  protected lbl_GDZipExtension: string;
  
  protected ttp_windows: string;
  protected ttp_zipFilename: string;
  protected ttp_fileFolder: string;
  protected ttp_fileWildcard: string;
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  constructor(
    private _workspaceService: WorkspaceService,
    private _scheduleService: ScheduleService,
    private _databaseService: DatabaseService,
    private _translateService: TranslationService,
    private _electronService: ElectronService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    this._CNST_EXTENSION = _constants.CNST_EXTENSION;
    this._CNST_NEW_PARAMETER_VALUE = _constants.CNST_NEW_PARAMETER_VALUE;
    this._CNST_ERP = _constants.CNST_ERP;
    this._CNST_EXECUTION_WINDOWS = _constants.CNST_EXECUTION_WINDOWS.map((v: string) => {
      return { label: v, value: v };
    });
    
    this._translateService.getTranslations([
      new TranslationInput('BUTTONS.YES_SIMPLIFIED', []),
      new TranslationInput('BUTTONS.NO_SIMPLIFIED', []),
      new TranslationInput('BUTTONS.NEW_PARAMETER', []),
      new TranslationInput('BUTTONS.GO_BACK', []),
      new TranslationInput('BUTTONS.SAVE', []),
      new TranslationInput('SCHEDULES.NEW_SCHEDULE', []),
      new TranslationInput('SCHEDULES.EDIT_SCHEDULE', []),
      new TranslationInput('SCHEDULES.TABLE.NAME', []),
      new TranslationInput('SCHEDULES.TABLE.WORKSPACE', []),
      new TranslationInput('SCHEDULES.TABLE.WINDOWS', []),
      new TranslationInput('SCHEDULES.TABLE.ENABLED', []),
      new TranslationInput('SCHEDULES.TABLE.ZIP_FILENAME', []),
      new TranslationInput('SCHEDULES.TABLE.ZIP_EXTENSION', []),
      new TranslationInput('SCHEDULES.TABLE.FILE_FOLDER', []),
      new TranslationInput('SCHEDULES.TABLE.FILE_WILDCARD', []),
      new TranslationInput('SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.NAME', []),
      new TranslationInput('SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.VALUE', []),
      new TranslationInput('SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.SQL', []),
      new TranslationInput('SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.NAME', []),
      new TranslationInput('SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.VALUE', []),
      new TranslationInput('SCHEDULES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('SCHEDULES.MESSAGES.SAVE_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.VALIDATE', []),
      new TranslationInput('SCHEDULES.TOOLTIPS.WINDOWS', []),
      new TranslationInput('SCHEDULES.TOOLTIPS.ZIP_FILENAME', []),
      new TranslationInput('SCHEDULES.TOOLTIPS.FILE_FOLDER', []),
      new TranslationInput('SCHEDULES.TOOLTIPS.FILE_WILDCARD', []),
      new TranslationInput('FORM_ERRORS.FOLDER_SELECT_WARNING', []),
    ]).subscribe((translations: any) => {
      this.po_grid_config_sql = [
        { property: 'name', label: translations['SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.NAME'], width: 30, required: true, editable: true  },
        { property: 'value', label: translations['SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.VALUE'], width: 59, required: true, editable: true },
        { property: 'sql', label: translations['SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.SQL'], width: 11, required: true, editable: true }
      ];
      
      this.po_grid_config_etl = [
        { property: 'name', label: translations['SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.NAME'], width: 30, required: true, editable: true },
        { property: 'value', label: translations['SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.VALUE'], width: 70, required: true, editable: true }
      ];
      
      this.lbl_newParameter = translations['BUTTONS.NEW_PARAMETER'];
      this.lbl_goBack = translations['BUTTONS.GO_BACK'];
      this.lbl_save = translations['BUTTONS.SAVE'];
      this.lbl_name = translations['SCHEDULES.TABLE.NAME'] + '*';
      this.lbl_workspaceId = translations['SCHEDULES.TABLE.WORKSPACE'] + '*';
      this.lbl_windows = translations['SCHEDULES.TABLE.WINDOWS'] + '*';
      this.lbl_enabled = translations['SCHEDULES.TABLE.ENABLED'];
      this.lbl_GDZipFilename = translations['SCHEDULES.TABLE.ZIP_FILENAME'] + '*';
      this.lbl_GDZipExtension = translations['SCHEDULES.TABLE.ZIP_EXTENSION'] + '*';
      this.lbl_fileFolder = translations['SCHEDULES.TABLE.FILE_FOLDER'];
      this.lbl_fileFolderWildcard = translations['SCHEDULES.TABLE.FILE_WILDCARD'];
      
      this.ttp_windows = translations['SCHEDULES.TOOLTIPS.WINDOWS'];
      this.ttp_zipFilename = translations['SCHEDULES.TOOLTIPS.ZIP_FILENAME'];
      this.ttp_fileFolder = translations['SCHEDULES.TOOLTIPS.FILE_FOLDER'];
      this.ttp_fileWildcard = translations['SCHEDULES.TOOLTIPS.FILE_WILDCARD'];
      
      this.CNST_FIELD_NAMES= [
        { key: 'name', value: translations['SCHEDULES.TABLE.NAME'] },
        { key: 'workspaceId', value: translations['SCHEDULES.TABLE.WORKSPACE'] },
        { key: 'windows', value: translations['SCHEDULES.TABLE.WINDOWS'] },
        { key: 'enabled', value: translations['SCHEDULES.TABLE.ENABLED'] },
        { key: 'GDZipFilename', value: translations['SCHEDULES.TABLE.ZIP_FILENAME'] },
        { key: 'GDZipExtension', value: translations['SCHEDULES.TABLE.ZIP_EXTENSION'] },
        { key: 'fileFolder', value: translations['SCHEDULES.TABLE.FILE_FOLDER'] },
        { key: 'fileFolderWildcard', value: translations['SCHEDULES.TABLE.FILE_WILDCARD'] }
      ];
      
      this.CNST_MESSAGES = {
        LOADING_ERROR: translations['SCHEDULES.MESSAGES.LOADING_ERROR'],
        SAVE_OK: translations['SCHEDULES.MESSAGES.SAVE_OK'],
        VALIDATE: translations['SCHEDULES.MESSAGES.VALIDATE'],
        FOLDER_SELECT_WARNING: translations['FORM_ERRORS.FOLDER_SELECT_WARNING']
      };
      
      forkJoin([
        this._workspaceService.getWorkspaces(),
        this._databaseService.getDatabases()
      ]).subscribe((results: [Workspace[], Database[]]) => {
        this.projects = results[0];
        this.databases = results[1];
        this.listProjects = this.projects.map((w: Workspace) => {
          return { label: w.name, value: w.id }
        });
      }, (err: any) => {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.LOADING_ERROR, err);
      });
      
      let nav: Navigation = this._router.getCurrentNavigation();
      if ((nav != undefined) && (nav.extras.state)) {
        this.lbl_title = translations['SCHEDULES.EDIT_SCHEDULE'];
        Object.getOwnPropertyNames.call(Object, nav.extras.state).map((p: string) => {
          this.schedule[p] = nav.extras.state[p];
        });
        this.schedule.SQLParameters = this.schedule.SQLParameters.map((p: SQLParameter) => {
          return {
            name: p.name,
            value: p.value,
            sql: (p.sql == true ? translations['BUTTONS.YES_SIMPLIFIED'] : translations['BUTTONS.NO_SIMPLIFIED'])
          };
        });
      } else {
        this.lbl_title = translations['SCHEDULES.NEW_SCHEDULE'];
        this.schedule.ETLParameters = [];
        this.schedule.SQLParameters = [];
      }
    });
  }
  
  protected onChangeWorkspace(w: string): void {
    this.isPlatform = (this.projects.find((workspace: Workspace) => (workspace.id == w)).contractType == _constants.CNST_MODALIDADE_CONTRATACAO_PLATAFORMA);
    this.updateStandardParameters();
  }
  
  protected goToSchedules(): void {
    this._router.navigate(['/schedule']);
  }
  
  protected onBeforeInsertETL(): boolean {
    let valid: boolean = false;
    let new_parameter: ETLParameter = this.schedule.ETLParameters.filter((p: ETLParameter) => {
      return (p.value === this._CNST_NEW_PARAMETER_VALUE);
    })[0];
    if (new_parameter === undefined) {
      this.schedule.ETLParameters.push(new ETLParameter());
      valid = true;
    }
    return valid;
  }
  
  protected onBeforeInsertSQL(): boolean {
    let valid: boolean = false;
    let new_parameter: ETLParameter = this.schedule.SQLParameters.filter((p: SQLParameter) => {
      return (p.value === this._CNST_NEW_PARAMETER_VALUE);
    })[0];
    if (new_parameter === undefined) {
      this.schedule.SQLParameters.push(new SQLParameter());
      valid = true;
    }
    return valid;
  }
  
  protected onBeforeRemoveETL() {
    this.clearUnusedParametersETL();
  }
  
  protected onBeforeRemoveSQL() {
    this.clearUnusedParametersSQL();
  }
  
  protected updateStandardParameters(): void {
    this._translateService.getTranslations([
      new TranslationInput('BUTTONS.YES_SIMPLIFIED', []),
      new TranslationInput('BUTTONS.NO_SIMPLIFIED', [])
    ]).subscribe((translations: any) => {
      let workspace: Workspace = this.projects.find((w: Workspace) => (w.id === this.schedule.workspaceId));
      let database: Database = this.databases.find((db: Database) => (db.id === workspace.databaseIdRef));
      this.schedule.workspaceName = workspace.name;
      this.schedule.ETLParameters = this._CNST_ERP.find((e: any) => (e.ERP === workspace.erp)).Parametros.ETL;
      if (database != undefined) {
        if (database.brand != _constants.CNST_DATABASE_OTHER) {
          this.schedule.SQLParameters = this._CNST_ERP.find((e: any) => (e.ERP === workspace.erp))
            .Parametros[database.brand].filter((p2: any) => {
            return (p2.Modulos.includes(workspace.module) || (p2.Modulos.length == 0))
          }).map((p3: SQLParameter) => {
            return { name: p3.name, value: p3.value, sql: (p3.sql ? translations['BUTTONS.YES_SIMPLIFIED']: translations['BUTTONS.NO_SIMPLIFIED']) }
          });
        }
      }
    });
  }
  
  protected saveSchedule(): void {
    if (this.validateSchedule()) {
      this._translateService.getTranslations([
        new TranslationInput('SCHEDULES.MESSAGES.SAVE', [this.schedule.name]),
        new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR', [this.schedule.name]),
        new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME', [this.schedule.name]),
        new TranslationInput('BUTTONS.YES_SIMPLIFIED', [])
      ]).subscribe((translations: any) => {
        this.po_lo_text = { value: translations['SCHEDULES.MESSAGES.SAVE'] };
        this.schedule.SQLParameters = this.schedule.SQLParameters.map((p: any) => {
          return { name: p.name, value: p.value, sql: (p.sql == translations['BUTTONS.YES_SIMPLIFIED'] ? true : false)};
        });
        this._scheduleService.saveSchedule({...this.schedule}).subscribe((res: boolean) => {
          if (res) {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.SAVE_OK);
            this._router.navigate(['/schedule']);
          } else {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME']);
          }
          this.po_lo_text = { value: null };
        }, (err: any) => {
          this.po_lo_text = { value: null };
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.SAVE_ERROR']);
        });
      });
    }
  }
  
  private clearUnusedParametersETL(): void {
    this.schedule.ETLParameters = this.schedule.ETLParameters.filter((p: ETLParameter) => { 
      p.value = p.value.replace(/\s+/g, '');
      return ((p.value != null) && (p.value != '') && (p.value != this._CNST_NEW_PARAMETER_VALUE));
    });
  }
  
  private clearUnusedParametersSQL(): void {
    this.schedule.SQLParameters = this.schedule.SQLParameters.filter((p: SQLParameter) => { 
      p.value = p.value.replace(/\s+/g, '');
      return ((p.value != null) && (p.value != '') && (p.value != this._CNST_NEW_PARAMETER_VALUE));
    });
  }
  
  private validateSchedule(): boolean {
    let validate: boolean = true;
    let schedule: Schedule = new Schedule();
    
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.VALIDATE);
    this.po_lo_text = { value: this.CNST_MESSAGES.VALIDATE };
    
    // Todo processo de ETL precisa ter um graph preenchido. //
    if (this.schedule.fileFolder != undefined) {
      schedule.fileFolderWildcard = this.schedule.fileFolderWildcard;
    }
    
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, schedule).map((p: string) => {
      if ((this.schedule[p] == undefined) && (p != 'id')) return p;
    }).filter((p: string) => { return (p != null); });
    
    // Validação dos campos de formulário //
    if (propertiesNotDefined.length > 0) {
      validate = false;console.log(propertiesNotDefined[0]);
      this.po_lo_text = { value: null };
      let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
      this._translateService.getTranslations([
        new TranslationInput('FORM_ERRORS.FIELD_NOT_FILLED', [fieldName])
      ]).subscribe((translations: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_NOT_FILLED']);
      });
    } else {
      // Validação dos parâmetros SQL //
      this._translateService.getTranslations([
        new TranslationInput('BUTTONS.YES_SIMPLIFIED', []),
        new TranslationInput('BUTTONS.NO_SIMPLIFIED', []),
        new TranslationInput('FORM_ERRORS.ONLY_YES_OR_NO', [])
      ]).subscribe((translations: any) => {
        this.schedule.SQLParameters.map((p: any) => {
          if ((p.sql.toUpperCase() != translations['BUTTONS.YES_SIMPLIFIED']) && (p.sql.toUpperCase() != translations['BUTTONS.NO_SIMPLIFIED'])) { 
            validate = false;
          }
        });
        
        if (!validate) {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.ONLY_YES_OR_NO']);
          this.po_lo_text = { value: null };
        }
      });
    }
    
    return validate;
  }
  
  public getFolder(): void {
    if (this._electronService.isElectronApp) {
      this.schedule.fileFolder = this._electronService.ipcRenderer.sendSync('getFolder');
    } else {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, this.CNST_MESSAGES.FOLDER_SELECT_WARNING);
      this.po_lo_text = { value: null };
    }
  }
}
