import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, Navigation } from '@angular/router';

import { ElectronService } from 'ngx-electronyzer';

import { PoSelectOption, PoGridRowActions } from '@po-ui/ng-components';

import { WorkspaceService } from '../workspace/workspace-service';
import { ScheduleService } from '../schedule/schedule-service';
import { CNST_SCHEDULE_MESSAGES as scheduleMessage } from '../schedule/schedule-messages';
import { DatabaseService } from '../database/database-service';
import { Workspace, Database, Schedule, ETLParameter, SQLParameter } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { forkJoin } from 'rxjs';

const CNST_FIELD_NAMES: Array<any> = [
   { key: 'name', value: 'Nome do agendamento*' }
  ,{ key: 'workspaceId', value: 'Ambiente*' }
  ,{ key: 'windows', value: 'Janelas de execução*' }
  ,{ key: 'enabled', value: 'Habilitado?' }
  ,{ key: 'GDZipFilename', value: 'Nome do arquivo*' }
  ,{ key: 'GDZipExtension', value: 'Extensão do arquivo*' }
  ,{ key: 'fileFolder', value: 'Pasta p/ upload' }
  ,{ key: 'fileFolderWildcard', value: 'Formato válido' }
];

@Component({
  selector: 'app-schedule-add',
  templateUrl: './schedule-add.component.html',
  styleUrls: ['./schedule-add.component.css']
})

export class ScheduleAddComponent {
  public CNST_MESSAGES: any = {
     SCHEDULE_VALIDATE: 'Validando informações do agendamento...'
    ,FOLDER_SELECT_WARNING: 'Aviso - Seleção de arquivos / diretórios não podem ser testadas sem o electron.'
  };
  
  private _CNST_NEW_PARAMETER_VALUE: string;
  private _CNST_ERP: Array<any>;
  protected _CNST_EXTENSION: Array<any>;
  protected operation: string;
  protected _CNST_FIELD_NAMES: any;
  protected _CNST_EXECUTION_WINDOWS: Array<PoSelectOption>;
  
  protected po_lo_text: any = { value: null };
  protected schedule: Schedule = new Schedule();
  
  private projects: Workspace[];
  private databases: Database[];
  protected listProjects: Array<PoSelectOption> = [{ label: undefined, value: undefined }];
  
  protected po_grid_config_sql: Array<any> = [
     { property: 'name', label: 'Nome', width: 30, required: true, editable: true  }
    ,{ property: 'value', label: 'Valor', width: 60, required: true, editable: true }
    ,{ property: 'sql', label: 'SQL (S/N)?', width: 10, required: true, editable: true }
  ];
  
  protected po_grid_config_etl: Array<any> = [
     { property: 'name', label: 'Nome', width: 30, required: true, editable: true }
    ,{ property: 'value', label: 'Valor', width: 70, required: true, editable: true }
  ];
  
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
  protected lbl_name: string;
  protected lbl_workspaceId: string;
  protected lbl_windows: string;
  protected lbl_enabled: string;
  protected lbl_fileFolder: string;
  protected lbl_fileFolderWildcard: string;
  protected lbl_GDZipFilename: string;
  protected lbl_GDZipExtension: string;
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  constructor(
     private _workspaceService: WorkspaceService
    ,private _scheduleService: ScheduleService
    ,private _databaseService: DatabaseService
    ,private _electronService: ElectronService
    ,private _utilities: Utilities
    ,private _router: Router
  ) {
    this._CNST_EXTENSION = _constants.CNST_EXTENSION;
    this._CNST_NEW_PARAMETER_VALUE = _constants.CNST_NEW_PARAMETER_VALUE;
    this._CNST_FIELD_NAMES = CNST_FIELD_NAMES;
    this.lbl_name = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'name'; }).value;
    this.lbl_workspaceId = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'workspaceId'; }).value;
    this.lbl_windows = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'windows'; }).value;
    this.lbl_enabled = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'enabled'; }).value;
    this.lbl_fileFolder = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'fileFolder'; }).value;
    this.lbl_fileFolderWildcard = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'fileFolderWildcard'; }).value;
    this.lbl_GDZipFilename = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'GDZipFilename'; }).value;
    this.lbl_GDZipExtension = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'GDZipExtension'; }).value;
    
    forkJoin([
       this._workspaceService.getWorkspaces()
      ,this._databaseService.getDatabases()
    ]).subscribe((results: [Workspace[], Database[]]) => {
      this.projects = results[0];
      this.databases = results[1];
      this.listProjects = this.projects.map((w: Workspace) => {
        return { label: w.name, value: w.id }
      });
    }, (err: any) => {
      this.po_lo_text = { value: null };
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, scheduleMessage.SCHEDULE_LOADING_ERROR, err);
    });
    
    this._CNST_ERP = _constants.CNST_ERP;
    this._CNST_EXECUTION_WINDOWS = _constants.CNST_EXECUTION_WINDOWS.map((v: string) => {
      return { label: v, value: v };
    });
    
    let nav: Navigation = this._router.getCurrentNavigation();
    if ((nav != undefined) && (nav.extras.state)) {
      this.operation = 'Alterar Agendamento';
      Object.getOwnPropertyNames.call(Object, nav.extras.state).map((p: string) => {
        this.schedule[p] = nav.extras.state[p];
      });
      this.schedule.SQLParameters = this.schedule.SQLParameters.map((p: SQLParameter) => {
        return {
          name: p.name,
          value: p.value,
          sql: (p.sql == true ? 'S' : 'N')
        };
      });
    } else {
      this.operation = 'Cadastrar Agendamento';
      this.schedule.ETLParameters = [];
      this.schedule.SQLParameters = [];
    }
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
    let workspace: Workspace = this.projects.find((w: Workspace) => (w.id === this.schedule.workspaceId));
    let database: Database = this.databases.find((db: Database) => (db.id === workspace.databaseId));
    this.schedule.workspaceName = workspace.name;
    this.schedule.ETLParameters = this._CNST_ERP.find((e: any) => (e.ERP === workspace.erp)).Parametros.ETL;
    if (database) {
      this.schedule.SQLParameters = this._CNST_ERP.find((e: any) => (e.ERP === workspace.erp))
        .Parametros[database.type].filter((p2: any) => {
        return (p2.Modulos.includes(workspace.module) || (p2.Modulos.length == 0))
      }).map((p3: SQLParameter) => {
        return { name: p3.name, value: p3.value, sql: (p3.sql ? 'S': 'N')}
      });
    }
  }
  
  protected saveSchedule(): void {
    if (this.validateSchedule()) {
      this.po_lo_text = { value: scheduleMessage.SCHEDULE_SAVE };
      this.schedule.SQLParameters = this.schedule.SQLParameters.map((p: any) => {
        return { name: p.name, value: p.value, sql: (p.sql == 'S' ? true : false)};
      });
      this._scheduleService.saveSchedule(this.schedule).subscribe((b: boolean) => {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, scheduleMessage.SCHEDULE_SAVE_OK);
        this._router.navigate(['/schedule']);
      }, (err: any) => {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, scheduleMessage.SCHEDULE_SAVE_ERROR);
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
    let valid: boolean = true;
    let schedule: Schedule = new Schedule();
    
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.SCHEDULE_VALIDATE);
    this.po_lo_text = { value: this.CNST_MESSAGES.SCHEDULE_VALIDATE };
    
    // Todo processo de ETL precisa ter um graph preenchido. //
    if (this.schedule.fileFolder != undefined) {
      schedule.fileFolderWildcard = this.schedule.fileFolderWildcard;
    }
    
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, schedule).map((p: string) => {
      if ((this.schedule[p] == undefined) && (p != 'id')) return p;
    }).filter((p: string) => { return p != null; });
    
    // Validação dos campos de formulário //
    if (propertiesNotDefined.length > 0) {
      valid = false;
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, 'Campo obrigatório "' + this._CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value + '" não preenchido.');
      this.po_lo_text = { value: null };
    } else {
      // Validação dos parâmetros SQL //
      this.schedule.SQLParameters.map((p: any) => {
        if ((p.sql.toUpperCase() != 'S') && (p.sql.toUpperCase() != 'N')) { 
          valid = false;
        }
      });
      if (!valid) {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, 'Os parâmetros SQL só podem ser do tipo "S" ou "N". Por favor, verifique o preenchimento dos mesmos.');
        this.po_lo_text = { value: null };
      }
    }
    
    return valid;
  }
  
  public getFolder(): void {
    if (this._electronService.isElectronApp) {
      this.schedule.fileFolder = this._electronService.ipcRenderer.sendSync('getFolder');
    } else {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, scheduleMessage.FOLDER_SELECT_WARNING);
      this.po_lo_text = { value: null };
    }
  }
}
