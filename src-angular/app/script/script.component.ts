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

import { TranslateServiceExtended, TranslationInput } from '../service/translate-service-extended';

import { ScheduleService } from '../schedule/schedule-service';
import { Schedule, Script, ScheduleScript, Workspace, Database, JavaInputBuffer } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-script',
  templateUrl: './script.component.html',
  styleUrls: ['./script.component.css']
})
export class ScriptComponent implements OnInit {
  @ViewChild('modal_1') modal_1: PoModalComponent;
  @ViewChild('modal_2') modal_2: PoModalComponent;
  
  protected CNST_FIELD_NAMES: Array<any> = [];
  public CNST_MESSAGES: any = {};
  
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
  public projectExport: Workspace = null;
  
  /*************************************************/
  /* MAPEAMENTO DOS NOMES DOS CAMPOS DO FORMULÁRIO */
  /*************************************************/
  protected lbl_title: string;
  protected lbl_add: string;
  protected lbl_schedule: string;
  protected lbl_scriptName: string;
  protected lbl_scriptQuery: string;
  protected lbl_confirm: string;
  protected lbl_goBack: string;
  protected lbl_delete: string;
  protected lbl_deleteConfirmation: string;
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  
  public setTableRowActions: Array<PoTableAction> = [];
  public setListViewActions: Array<PoListViewAction> = [];
  public setcolumns: Array<PoTableColumn> = [];
  
  constructor(
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _scriptService: ScriptService,
    private _scheduleService: ScheduleService,
    private _electronService: ElectronService,
    private _translateService: TranslateServiceExtended,
    private _utilities: Utilities
  ) {
    this._translateService.getTranslations([
      new TranslationInput('SCRIPTS.TITLE', []),
      new TranslationInput('SCRIPTS.IMPORT_SCRIPTS', []),
      new TranslationInput('SCRIPTS.NEW_SCRIPT', []),
      new TranslationInput('SCRIPTS.EDIT_SCRIPT', []),
      new TranslationInput('SCRIPTS.DELETE_CONFIRMATION', []),
      new TranslationInput('SCRIPTS.TABLE.SCHEDULE_NAME', []),
      new TranslationInput('SCRIPTS.TABLE.SCRIPT_NAME', []),
      new TranslationInput('SCRIPTS.TABLE.SQL', []),
      new TranslationInput('BUTTONS.ADD', []),
      new TranslationInput('BUTTONS.EDIT', []),
      new TranslationInput('BUTTONS.DELETE', []),
      new TranslationInput('BUTTONS.CONFIRM', []),
      new TranslationInput('BUTTONS.GO_BACK', []),
      new TranslationInput('SCRIPTS.MESSAGES.LOADING', []),
      new TranslationInput('SCRIPTS.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('SCRIPTS.MESSAGES.VALIDATE', []),
      new TranslationInput('SCRIPTS.MESSAGES.SAVE_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.DELETE', []),
      new TranslationInput('SCRIPTS.MESSAGES.DELETE_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.DELETE_ERROR', []),
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT', []),
      new TranslationInput('SCRIPTS.MESSAGES.EXPORT_ERROR', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_ERROR', [])
    ]).subscribe((translations: any) => {
      this.CNST_FIELD_NAMES = [
        { key: 'scheduleId', value: translations['SCRIPTS.TABLE.SCHEDULE_NAME'] },
        { key: 'name', value: translations['SCRIPTS.TABLE.SCRIPT_NAME'] },
        { key: 'script', value: translations['SCRIPTS.TABLE.SQL'] }
      ];
      
      this.setTableRowActions = [
        { label: translations['BUTTONS.EDIT'],  action: this.editScript.bind(this), visible: (s: Script) => s.canDecrypt },
        { label: translations['BUTTONS.DELETE'], action: this.deleteScript.bind(this), visible: true }
      ];
      
      this.setListViewActions = [
        { label: translations['SCRIPTS.IMPORT_SCRIPTS'], action: this.exportScript.bind(this), visible: true }
      ];
      
      this.setcolumns = [
        { label: translations['SCRIPTS.TABLE.SCRIPT_NAME'], property: 'name', type: 'string', width: '20%', sortable: true },
        { label: translations['SCRIPTS.TABLE.SQL'], property: 'script', type: 'string', width: '80%', sortable: false }
      ];
      
      this.lbl_title = translations['SCRIPTS.TITLE'];
      this.lbl_schedule = translations['SCRIPTS.TABLE.SCHEDULE_NAME'];
      this.lbl_scriptName = translations['SCRIPTS.TABLE.SCRIPT_NAME'];
      this.lbl_scriptQuery = translations['SCRIPTS.TABLE.SQL'];
      this.lbl_deleteConfirmation = translations['SCRIPTS.DELETE_CONFIRMATION'];
      this.lbl_add = translations['BUTTONS.ADD'];
      this.lbl_confirm = translations['BUTTONS.CONFIRM'];
      this.lbl_goBack = translations['BUTTONS.GO_BACK'];
      this.lbl_delete = translations['BUTTONS.DELETE'];
      
      this.CNST_MESSAGES = {
        NEW_SCRIPT: translations['SCRIPTS.NEW_SCRIPT'],
        EDIT_SCRIPT: translations['SCRIPTS.EDIT_SCRIPT'],
        LOADING: translations['SCRIPTS.MESSAGES.LOADING'],
        LOADING_ERROR: translations['SCRIPTS.MESSAGES.LOADING_ERROR'],
        VALIDATE: translations['SCRIPTS.MESSAGES.VALIDATE'],
        SAVE_OK: translations['SCRIPTS.MESSAGES.SAVE_OK'],
        DELETE: translations['SCRIPTS.MESSAGES.DELETE'],
        DELETE_OK: translations['SCRIPTS.MESSAGES.DELETE_OK'],
        DELETE_ERROR: translations['SCRIPTS.MESSAGES.DELETE_ERROR'],
        EXPORT: translations['SCRIPTS.MESSAGES.EXPORT'],
        EXPORT_ERROR: translations['SCRIPTS.MESSAGES.EXPORT_ERROR'],
        LOADING_WORKSPACES: translations['WORKSPACES.MESSAGES.LOADING'],
        LOADING_WORKSPACES_ERROR: translations['WORKSPACES.MESSAGES.LOADING_ERROR']
      };
    });
  }
  
  public ngOnInit(): void {
    this.loadScripts();
    this.loadWorkspaces();
  }
  
  private loadScripts(): void {
    this.po_lo_text = { value: this.CNST_MESSAGES.LOADING };
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
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.LOADING_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  private loadWorkspaces(): void {
    this.po_lo_text = { value: this.CNST_MESSAGES.LOADING_WORKSPACES };
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
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.LOADING_WORKSPACES_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  protected newScript(): void {
    this.modal_1_title = this.CNST_MESSAGES.NEW_SCRIPT;
    this.script = new Script();
    this.script.canDecrypt = true;
    this.modal_1.open();
  }
  
  private editScript(script: Script): void {
    this.modal_1_title = this.CNST_MESSAGES.EDIT_SCRIPT;
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
      this._translateService.getTranslations([
        new TranslationInput('SCRIPTS.MESSAGES.SAVE', [this.script.name]),
        new TranslationInput('SCRIPTS.MESSAGES.ENCRYPT', [this.script.name]),
        new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR', [this.script.name])
      ]).subscribe((translations: any) => {
        this.po_lo_text = { value: translations['SCRIPTS.MESSAGES.SAVE'] };
        if (this._electronService.isElectronApp) {
          if (this.script.script != this.bkpScript) {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.ENCRYPT']);
            this.po_lo_text = { value: translations['SCRIPTS.MESSAGES.ENCRYPT'] };
            this.script.script = this._electronService.ipcRenderer.sendSync('encrypt', this.script.script);
          }
        }
        this._scriptService.saveScript(this.script).subscribe((res: boolean) => {
          this.loadScripts();
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.SAVE_OK);
          this.po_lo_text = { value: null };
        }, (err: any) => {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.SAVE_ERROR'], err);
          this.po_lo_text = { value: null };
        });
      });
    }
  }
  
  private validateScript(): boolean {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.VALIDATE);
    this.po_lo_text = { value: this.CNST_MESSAGES.VALIDATE };
    
    let script = new Script();
    let validate: boolean = true;
    
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, script).map((p: string) => {
      if ((this.script[p] == undefined) && (p != 'id')) return p;
    }).filter((p: string) => { return p != null; });
    
    // Validação dos campos de formulário //
    if (propertiesNotDefined.length > 0) {
      validate = false;
      this.po_lo_text = { value: null };
      let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
      this._translateService.getTranslations([
        new TranslationInput('FORM_ERRORS.FIELD_NOT_FILLED', [fieldName])
      ]).subscribe((translations: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_NOT_FILLED']);
      });
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
    this.po_lo_text = { value: this.CNST_MESSAGES.DELETE };
    this._scriptService.deleteScript(this.scriptToDelete).subscribe((b: boolean) => {
      this.loadScripts();
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.DELETE_OK);
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.DELETE_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  protected exportScript(ss: ScheduleScript): void {
    this.po_lo_text = { value: this.CNST_MESSAGES.EXPORT };
    this._scriptService.exportScript(ss).subscribe((res: boolean) => {
      if (res) this.loadScripts();
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.EXPORT_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
}