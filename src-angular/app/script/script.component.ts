import { Component, OnInit, ViewChild } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import {
   PoModalComponent
  ,PoTableAction
  ,PoListViewAction
  ,PoTableColumn
  ,PoSelectOption
} from '@po-ui/ng-components';

import { WorkspaceService } from '../workspace/workspace-service';
import { DatabaseService } from '../database/database-service';
import { ScriptService } from './script-service';
import { CNST_SCRIPT_MESSAGES } from './script-messages';

import { ScheduleService } from '../schedule/schedule-service';
import { Schedule, Script, ScheduleScript, Workspace, Database, JavaInputBuffer } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { forkJoin } from 'rxjs';

const CNST_FIELD_NAMES: Array<any> = [
   { key: 'scheduleId', value: 'Nome do agendamento*' }
  ,{ key: 'name', value: 'Nome da rotina*' }
  ,{ key: 'script', value: 'Comando SQL*' }
];

@Component({
  selector: 'app-script',
  templateUrl: './script.component.html',
  styleUrls: ['./script.component.css']
})
export class ScriptComponent implements OnInit {
  @ViewChild('modal_1') modal_1: PoModalComponent;
  @ViewChild('modal_2') modal_2: PoModalComponent;
  
  public script = new Script();
  public bkpScript: string = null;
  public modal_1_title: string = null;
  public scriptToDelete: Script;
  public listProjectExport: Array<PoSelectOption> = null;
  public listSchedule: Array<PoSelectOption> = null;
  protected po_lo_text: any = { value: null };
  public schedulesScriptTotal: ScheduleScript[] = [];
  public schedulesScript: any[] = [];
  public schedulesScriptProtheus: any[] = [];
  protected _CNST_FIELD_NAMES: any;
  public projectExport: Workspace = null;
  
  /*************************************************/
  /* MAPEAMENTO DOS NOMES DOS CAMPOS DO FORMULÁRIO */
  /*************************************************/
  protected lbl_schedule: string;
  protected lbl_scriptName: string;
  protected lbl_scriptQuery: string;
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  
  readonly setTableRowActions: Array<PoTableAction> = [
     { label: 'Editar',  action: this.editScript.bind(this), visible: (s: Script) => s.canDecrypt }
    ,{ label: 'Excluir', action: this.deleteScript.bind(this), visible: true }
  ];
  
  readonly setListViewActions: Array<PoListViewAction> = [
    { label: 'Importar rotinas FAST', action: this.exportScript.bind(this), visible: true }
  ];
  
  readonly setcolumns: Array<PoTableColumn> = [
       { property: "name", label: 'Nome da rotina', type: 'string', width: '20%', sortable: true }
      ,{ property: "script", label: 'Comando SQL', type: 'string', width: '80%', sortable: false }
    ];
  
  constructor(
     private _workspaceService: WorkspaceService
    ,private _databaseService: DatabaseService
    ,private _scriptService: ScriptService
    ,private _scheduleService: ScheduleService
    ,private _electronService: ElectronService
    ,private _utilities: Utilities
  ) {
    this._CNST_FIELD_NAMES = CNST_FIELD_NAMES;
    this.lbl_schedule = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'scheduleId'; }).value;
    this.lbl_scriptName = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'name'; }).value;
    this.lbl_scriptQuery = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'script'; }).value;
  }
  
  public ngOnInit(): void {
    this.loadScripts();
    this.loadWorkspaces();
  }
  
  private loadScripts(): void {
    this.po_lo_text = { value: CNST_SCRIPT_MESSAGES.SCRIPT_LOADING };
    forkJoin([
       this._scheduleService.getSchedules(true)
      ,this._scriptService.getScripts()
      ,this._workspaceService.getWorkspaces()
      ,this._databaseService.getDatabases()
    ]).subscribe((results: [Schedule[], Script[], Workspace[], Database[]]) => {
      this.schedulesScriptTotal = results[0].map((s: any) => {
        s.schedule = s;
        s.scripts = results[1].filter((script: Script) => (s.id === script.scheduleId));
        s.scripts.map((script: Script) => {
          if ((this._electronService.isElectronApp) && (script.canDecrypt)) {
            script.script = this._electronService.ipcRenderer.sendSync('decrypt', script.script);
          }
        });
        
        let w: Workspace = results[2].find((w: Workspace) => (w.id == s.workspaceId));
        s.erp = w.erp;
        s.contractType = w.contractType;
        s.module = w.module;
        s.databaseType = results[3].find((db: Database) => (db.id == w.databaseId)).type;
        if (s.databaseType.indexOf(_constants.CNST_DATABASE_ORACLE) > -1) s.databaseType = _constants.CNST_DATABASE_ORACLE;
        return s;
      });
      
      this.schedulesScript = this.schedulesScriptTotal.filter((ss: any) => !((ss.erp ==  _constants.CNST_ERP_PROTHEUS) && (ss.contractType == _constants.CNST_MODALIDADE_CONTRATACAO_PLATAFORMA)));
      this.schedulesScriptProtheus = this.schedulesScriptTotal.filter((ss: any) => ((ss.erp ==  _constants.CNST_ERP_PROTHEUS) && (ss.contractType == _constants.CNST_MODALIDADE_CONTRATACAO_PLATAFORMA)));
      this.listSchedule = results[0].map((s: any) => {
        return { label: s.name, value: s.id };
      });
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_SCRIPT_MESSAGES.SCRIPT_LOADING_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  private loadWorkspaces(): void {
    this.po_lo_text = { value: CNST_SCRIPT_MESSAGES.SCRIPT_LOADING_PROJECTS };
    this._workspaceService.getWorkspaces().subscribe((workspaces: Workspace[]) => {
      this.listProjectExport = workspaces.filter((w: Workspace) => {
        return (w.erp === _constants.CNST_ERP_PROTHEUS);
      }).map((w: Workspace) => {
        return {
          label: w.name,
          value: w.id
        }
      });
      
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_SCRIPT_MESSAGES.SCRIPT_LOADING_PROJECTS_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  protected newScript(): void {
    this.modal_1_title = 'Nova rotina';
    this.script = new Script();
    this.script.canDecrypt = true;
    this.modal_1.open();
  }
  
  private editScript(script: Script): void {
    this.modal_1_title = 'Editar rotina';
    this.script = script;
    this.bkpScript = script.script;
    this.modal_1.open();
  }
  
  protected modal_1_close(): void {
    this.bkpScript = null;
    this.modal_1.close();
  }
  
  protected modal_1_confirm(): void {
    if (this.validateScript()) {
      this.modal_1.close();
      this.po_lo_text = { value: CNST_SCRIPT_MESSAGES.SCRIPT_SAVE(this.script.name) };
      if (this._electronService.isElectronApp) {
        if (this.script.script != this.bkpScript) {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_ENCRYPT(this.script.name));
          this.po_lo_text = { value: CNST_SCRIPT_MESSAGES.SCRIPT_ENCRYPT(this.script.name) };
          this.script.script = this._electronService.ipcRenderer.sendSync('encrypt', this.script.script);
        }
      }
      this._scriptService.saveScript(this.script).subscribe((res: boolean) => {
        this.loadScripts();
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, CNST_SCRIPT_MESSAGES.SCRIPT_SAVE_OK);
        this.po_lo_text = { value: null };
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_SCRIPT_MESSAGES.SCRIPT_SAVE_ERROR(this.script.name), err);
        this.po_lo_text = { value: null };
      });
    }
  }
  
  private validateScript(): boolean {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_SCRIPT_MESSAGES.SCRIPT_VALIDATE);
    this.po_lo_text = { value: CNST_SCRIPT_MESSAGES.SCRIPT_VALIDATE };
    
    let script = new Script();
    let validate: boolean = true;
    
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, script).map((p: string) => {
      if ((this.script[p] == undefined) && (p != 'id')) return p;
    }).filter((p: string) => { return p != null; });
    
    // Validação dos campos de formulário //
    if (propertiesNotDefined.length > 0) {
      this.po_lo_text = { value: null };
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, 'Campo obrigatório "' + this._CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value + '" não preenchido.');
      validate = false;
    }
    
    return validate;
  }
  
  private deleteScript(script: Script): void {
    this.scriptToDelete = script;
    this.modal_2.open();
  }
  
  protected modal_2_close(): void {
    this.scriptToDelete = null;
    this.modal_2.close();
  }
  
  protected modal_2_confirm(): void {
    this.modal_2.close();
    this.po_lo_text = { value: CNST_SCRIPT_MESSAGES.SCRIPT_DELETE };
    this._scriptService.deleteScript(this.scriptToDelete).subscribe((b: boolean) => {
      this.loadScripts();
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, CNST_SCRIPT_MESSAGES.SCRIPT_DELETE_OK);
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_SCRIPT_MESSAGES.SCRIPT_DELETE_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  protected exportScript(ss: ScheduleScript): void {
    this.po_lo_text = { value: CNST_SCRIPT_MESSAGES.SCRIPT_EXPORT };
    this._scriptService.exportScript(ss).subscribe((res: boolean) => {
      if (res) this.loadScripts();
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_SCRIPT_MESSAGES.SCRIPT_EXPORT_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
}