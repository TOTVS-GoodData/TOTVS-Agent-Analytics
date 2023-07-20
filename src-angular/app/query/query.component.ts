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
import { QueryService } from './query-service';

import { ScheduleService } from '../schedule/schedule-service';
import { Schedule, Query, ScheduleQuery, Workspace, Database, JavaInputBuffer } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';
import { TranslateServiceExtended, TranslationInput } from '../service/translate-service-extended';

import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit {
  @ViewChild('modal_1') modal_1: PoModalComponent;
  @ViewChild('modal_2') modal_2: PoModalComponent;
  
  protected CNST_FIELD_NAMES: Array<any> = [];
  public CNST_MESSAGES: any = {};
  
  public query = new Query();
  public bkpQuery: string = null;
  public modal_1_title: string = null;
  public queryToDelete: Query;
  public listProjectExport: Array<PoSelectOption> = null;
  public listSchedule: Array<PoSelectOption> = null;
  protected _CNST_QUERY_EXECUTION_MODES: Array<PoSelectOption> = _constants.CNST_QUERY_EXECUTION_MODES;
  protected po_lo_text: any = { value: null };
  public schedulesQueryTotal: ScheduleQuery[] = [];
  public schedulesQuery: any[] = [];
  public schedulesQueryProtheus: any[] = [];
  protected _CNST_FIELD_NAMES: any;
  public projectExport: Workspace = null;
  
  /*************************************************/
  /* MAPEAMENTO DOS NOMES DOS CAMPOS DO FORMULÁRIO */
  /*************************************************/
  protected lbl_schedule: string;
  protected lbl_queryName: string;
  protected lbl_queryExecutionMode: string;
  protected lbl_queryQuery: string;
  protected lbl_delete: string;
  protected lbl_goBack: string;
  protected lbl_confirm: string;
  protected lbl_add: string;
  protected lbl_title: string;
  protected lbl_deleteConfirmation: string;
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  
  public setTableRowActions: Array<PoTableAction> = [];
  public setListViewActions: Array<PoListViewAction> = [];
  public setColumns: Array<PoTableColumn> = [];
  
  constructor(
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _queryService: QueryService,
    private _scheduleService: ScheduleService,
    private _electronService: ElectronService,
    private _translateService: TranslateServiceExtended,
    private _utilities: Utilities
  ) {
    this._translateService.getTranslations([
      new TranslationInput('QUERIES.TITLE', []),
      new TranslationInput('QUERIES.IMPORT_QUERIES', []),
      new TranslationInput('QUERIES.NEW_QUERY', []),
      new TranslationInput('QUERIES.EDIT_QUERY', []),
      new TranslationInput('QUERIES.DELETE_CONFIRMATION', []),
      new TranslationInput('QUERIES.TABLE.SCHEDULE_NAME', []),
      new TranslationInput('QUERIES.TABLE.QUERY_NAME', []),
      new TranslationInput('QUERIES.TABLE.MODE', []),
      new TranslationInput('QUERIES.TABLE.SQL', []),
      new TranslationInput('BUTTONS.ADD', []),
      new TranslationInput('BUTTONS.EDIT', []),
      new TranslationInput('BUTTONS.DELETE', []),
      new TranslationInput('BUTTONS.CONFIRM', []),
      new TranslationInput('BUTTONS.GO_BACK', []),
      new TranslationInput('QUERIES.MESSAGES.LOADING', []),
      new TranslationInput('QUERIES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('QUERIES.MESSAGES.VALIDATE', []),
      new TranslationInput('QUERIES.MESSAGES.SAVE_OK', []),
      new TranslationInput('QUERIES.MESSAGES.DELETE', []),
      new TranslationInput('QUERIES.MESSAGES.DELETE_OK', []),
      new TranslationInput('QUERIES.MESSAGES.DELETE_ERROR', []),
      new TranslationInput('QUERIES.MESSAGES.EXPORT', []),
      new TranslationInput('QUERIES.MESSAGES.EXPORT_ERROR', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_ERROR', [])
    ]).subscribe((translations: any) => {
      this.CNST_FIELD_NAMES = [
        { key: 'scheduleId', value: translations['QUERIES.TABLE.SCHEDULE_NAME'] },
        { key: 'name', value: translations['QUERIES.TABLE.QUERY_NAME'] },
        { key: 'executionMode', value: translations['QUERIES.TABLE.MODE'] },
        { key: 'query', value: translations['QUERIES.TABLE.SQL'] }
      ];
      
      this.setTableRowActions = [
        { label: translations['BUTTONS.EDIT'],  action: this.editQuery.bind(this), visible: (q: Query) => q.canDecrypt },
        { label: translations['BUTTONS.DELETE'], action: this.deleteQuery.bind(this), visible: true }
      ];
      
      this.setListViewActions = [
        { label: translations['QUERIES.IMPORT_QUERIES'], action: this.exportQuery.bind(this), visible: true }
      ];
      
      this.setColumns = [
        { property: "name", label: translations['QUERIES.TABLE.QUERY_NAME'], type: 'string', width: '20%', sortable: true },
        { property: "executionMode", label: translations['QUERIES.TABLE.MODE'], type: 'string', width: '20%', sortable: true },
        { property: "query", label: translations['QUERIES.TABLE.SQL'], type: 'string', width: '60%', sortable: false }
      ];
      
      this.lbl_title = translations['QUERIES.TITLE'];
      this.lbl_schedule = translations['QUERIES.TABLE.SCHEDULE_NAME'];
      this.lbl_queryName = translations['QUERIES.TABLE.QUERY_NAME'];
      this.lbl_queryExecutionMode = translations['QUERIES.TABLE.MODE'];
      this.lbl_queryQuery = translations['QUERIES.TABLE.SQL'];
      this.lbl_deleteConfirmation = translations['QUERIES.DELETE_CONFIRMATION'];
      this.lbl_add = translations['BUTTONS.ADD'];
      this.lbl_confirm = translations['BUTTONS.CONFIRM'];
      this.lbl_goBack = translations['BUTTONS.GO_BACK'];
      this.lbl_delete = translations['BUTTONS.DELETE'];
      
      this.CNST_MESSAGES = {
        NEW_QUERY: translations['QUERIES.NEW_QUERY'],
        EDIT_QUERY: translations['QUERIES.EDIT_QUERY'],
        LOADING: translations['QUERIES.MESSAGES.LOADING'],
        LOADING_ERROR: translations['QUERIES.MESSAGES.LOADING_ERROR'],
        VALIDATE: translations['QUERIES.MESSAGES.VALIDATE'],
        SAVE_OK: translations['QUERIES.MESSAGES.SAVE_OK'],
        DELETE: translations['QUERIES.MESSAGES.DELETE'],
        DELETE_OK: translations['QUERIES.MESSAGES.DELETE_OK'],
        DELETE_ERROR: translations['QUERIES.MESSAGES.DELETE_ERROR'],
        EXPORT: translations['QUERIES.MESSAGES.EXPORT'],
        EXPORT_ERROR: translations['QUERIES.MESSAGES.EXPORT_ERROR'],
        LOADING_WORKSPACES: translations['WORKSPACES.MESSAGES.LOADING'],
        LOADING_WORKSPACES_ERROR: translations['WORKSPACES.MESSAGES.LOADING_ERROR']
      };
    });
  }
  
  public ngOnInit(): void {
    this.loadQueries();
    this.loadWorkspaces();
  }
  
  private loadQueries(): void {
    this.po_lo_text = { value: this.CNST_MESSAGES.LOADING };
    forkJoin([
       this._scheduleService.getSchedules(true)
      ,this._queryService.getQueries()
      ,this._workspaceService.getWorkspaces()
      ,this._databaseService.getDatabases()
    ]).subscribe((results: [Schedule[], Query[], Workspace[], Database[]]) => {
      this.schedulesQueryTotal = results[0].map((s: any) => {
        s.schedule = s;
        s.queries = results[1].filter((q: Query) => (q.scheduleId === s.id));
        s.queries.map((q: Query) => {
          if ((this._electronService.isElectronApp) && (q.canDecrypt)) {
            q.query = this._electronService.ipcRenderer.sendSync('decrypt', q.query);
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
      
      this.schedulesQuery = this.schedulesQueryTotal.filter((sc: any) => !((sc.erp ==  _constants.CNST_ERP_PROTHEUS) && (sc.contractType == _constants.CNST_MODALIDADE_CONTRATACAO_PLATAFORMA)));
      this.schedulesQueryProtheus = this.schedulesQueryTotal.filter((sc: any) => ((sc.erp ==  _constants.CNST_ERP_PROTHEUS) && (sc.contractType == _constants.CNST_MODALIDADE_CONTRATACAO_PLATAFORMA)));
      
      this.listSchedule = results[0].map((sq: any) => {
        return { label: sq.name, value: sq.id };
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
  
  protected newQuery(): void {
    this.modal_1_title = this.CNST_MESSAGES.NEW_QUERY;
    this.query = new Query();
    this.query.canDecrypt = true;
    this.modal_1.open();
  }
  
  private editQuery(query: Query): void {
    this.modal_1_title = this.CNST_MESSAGES.EDIT_QUERY;
    this.query = query;
    this.bkpQuery = query.query;
    this.modal_1.open();
  }
  
  protected modal_1_close(): void {
    this.bkpQuery = null;
    this.modal_1.close();
  }
  
  protected modal_1_confirm(): void {
    if (this.validateQuery()) {
      this.modal_1.close();
      this._translateService.getTranslations([
        new TranslationInput('QUERIES.MESSAGES.SAVE', [this.query.name]),
        new TranslationInput('QUERIES.MESSAGES.ENCRYPT', [this.query.name]),
        new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR', [this.query.name])
      ]).subscribe((translations: any) => {
        this.po_lo_text = { value: translations['QUERIES.MESSAGES.SAVE'] };
        if (this._electronService.isElectronApp) {
          if (this.query.query != this.bkpQuery) {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.ENCRYPT']);
            this.po_lo_text = { value: translations['QUERIES.MESSAGES.ENCRYPT'] };
            this.query.query = this._electronService.ipcRenderer.sendSync('encrypt', this.query.query);
          }
        }
        this._queryService.saveQuery(this.query).subscribe((res: boolean) => {
          this.loadQueries();
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.SAVE_OK);
          this.po_lo_text = { value: null };
        }, (err: any) => {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['QUERIES.MESSAGES.SAVE_ERROR'], err);
          this.po_lo_text = { value: null };
        });
      });
    }
  }
  
  private validateQuery(): boolean {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.VALIDATE);
    this.po_lo_text = { value: this.CNST_MESSAGES.VALIDATE };
    
    let query = new Query();
    let validate: boolean = true;
    
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, query).map((p: string) => {
      if ((this.query[p] == undefined) && (p != 'id')) return p;
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
  
  private deleteQuery(query: Query): void {
    this.queryToDelete = query;
    this.modal_2.open();
  }
  
  protected modal_2_close(): void {
    this.queryToDelete = null;
    this.modal_2.close();
  }
  
  protected modal_2_confirm(): void {
    this.modal_2.close();
    this.po_lo_text = { value: this.CNST_MESSAGES.DELETE };
    this._queryService.deleteQuery(this.queryToDelete).subscribe((b: boolean) => {
      this.loadQueries();
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.DELETE_OK);
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.DELETE_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  protected exportQuery(sc: ScheduleQuery): void {
    this.po_lo_text = { value: this.CNST_MESSAGES.EXPORT };
    this._queryService.exportQuery(sc).subscribe((res: boolean) => {
      if (res) this.loadQueries();
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.EXPORT_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
}