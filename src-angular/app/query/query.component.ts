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
import { CNST_QUERY_MESSAGES } from './query-messages';

import { ScheduleService } from '../schedule/schedule-service';
import { Schedule, Query, ScheduleQuery, Workspace, Database, JavaInputBuffer } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { forkJoin } from 'rxjs';

const CNST_FIELD_NAMES: Array<any> = [
   { key: 'scheduleId', value: 'Nome do agendamento*' }
  ,{ key: 'name', value: 'Nome da consulta*' }
  ,{ key: 'executionMode', value: 'Modo de execução*' }
  ,{ key: 'query', value: 'Consulta SQL*' }
];

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit {
  @ViewChild('modal_1') modal_1: PoModalComponent;
  @ViewChild('modal_2') modal_2: PoModalComponent;
  
  public query = new Query();
  public bkpQuery: string = null;
  public modal_1_title: string = null;
  public queryToDelete: Query;
  public listProjectExport: Array<PoSelectOption> = null;
  public listSchedule: Array<PoSelectOption> = null;
  protected _CNST_QUERY_EXECUTION_MODES: Array<PoSelectOption>;
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
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  
  readonly setTableRowActions: Array<PoTableAction> = [
     { label: 'Editar',  action: this.editQuery.bind(this), visible: (q: Query) => q.canDecrypt }
    ,{ label: 'Excluir', action: this.deleteQuery.bind(this), visible: true }
  ];
  
  readonly setListViewActions: Array<PoListViewAction> = [
    { label: 'Importar consultas FAST', action: this.exportQuery.bind(this), visible: true }
  ];
  
  readonly setColumns: Array<PoTableColumn> = [
     { property: "name", label: 'Nome da consulta', type: 'string', width: '20%', sortable: true }
    ,{ property: "executionMode", label: 'Tipo de execução', type: 'string', width: '20%', sortable: true }
    ,{ property: "query", label: 'Consulta SQL', type: 'string', width: '60%', sortable: false }
  ];
  
  constructor(
     private _workspaceService: WorkspaceService
    ,private _databaseService: DatabaseService
    ,private _queryService: QueryService
    ,private _scheduleService: ScheduleService
    ,private _electronService: ElectronService
    ,private _utilities: Utilities
  ) {
    this._CNST_QUERY_EXECUTION_MODES = _constants.CNST_QUERY_EXECUTION_MODES;
    this._CNST_FIELD_NAMES = CNST_FIELD_NAMES;
    this.lbl_schedule = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'scheduleId'; }).value;
    this.lbl_queryName = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'name'; }).value;
    this.lbl_queryExecutionMode = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'executionMode'; }).value;
    this.lbl_queryQuery = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'query'; }).value;
  }
  
  public ngOnInit(): void {
    this.loadQueries();
    this.loadWorkspaces();
  }
  
  private loadQueries(): void {
    this.po_lo_text = { value: CNST_QUERY_MESSAGES.QUERY_LOADING };
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
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_QUERY_MESSAGES.QUERY_LOADING_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  private loadWorkspaces(): void {
    this.po_lo_text = { value: CNST_QUERY_MESSAGES.QUERY_LOADING_PROJECTS };
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
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_QUERY_MESSAGES.QUERY_LOADING_PROJECTS_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  protected newQuery(): void {
    this.modal_1_title = 'Nova consulta';
    this.query = new Query();
    this.query.canDecrypt = true;
    this.modal_1.open();
  }
  
  private editQuery(query: Query): void {
    this.modal_1_title = 'Editar consulta';
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
      this.po_lo_text = { value: CNST_QUERY_MESSAGES.QUERY_SAVE(this.query.name) };
      if (this._electronService.isElectronApp) {
        if (this.query.query != this.bkpQuery) {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_QUERY_MESSAGES.QUERY_ENCRYPT(this.query.name));
          this.po_lo_text = { value: CNST_QUERY_MESSAGES.QUERY_ENCRYPT(this.query.name) };
          this.query.query = this._electronService.ipcRenderer.sendSync('encrypt', this.query.query);
        }
      }
      this._queryService.saveQuery(this.query).subscribe((res: boolean) => {
        this.loadQueries();
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, CNST_QUERY_MESSAGES.QUERY_SAVE_OK);
        this.po_lo_text = { value: null };
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_QUERY_MESSAGES.QUERY_SAVE_ERROR(this.query.name), err);
        this.po_lo_text = { value: null };
      });
    }
  }
  
  private validateQuery(): boolean {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, CNST_QUERY_MESSAGES.QUERY_VALIDATE);
    this.po_lo_text = { value: CNST_QUERY_MESSAGES.QUERY_VALIDATE };
    
    let query = new Query();
    let validate: boolean = true;
    
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, query).map((p: string) => {
      if ((this.query[p] == undefined) && (p != 'id')) return p;
    }).filter((p: string) => { return p != null; });
    
    // Validação dos campos de formulário //
    if (propertiesNotDefined.length > 0) {
      this.po_lo_text = { value: null };
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, 'Campo obrigatório "' + this._CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value + '" não preenchido.');
      validate = false;
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
    this.po_lo_text = { value: CNST_QUERY_MESSAGES.QUERY_DELETE };
    this._queryService.deleteQuery(this.queryToDelete).subscribe((b: boolean) => {
      this.loadQueries();
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, CNST_QUERY_MESSAGES.QUERY_DELETE_OK);
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_QUERY_MESSAGES.QUERY_DELETE_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  protected exportQuery(sc: ScheduleQuery): void {
    this.po_lo_text = { value: CNST_QUERY_MESSAGES.QUERY_EXPORT };
    this._queryService.exportQuery(sc).subscribe((res: boolean) => {
      if (res) this.loadQueries();
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_QUERY_MESSAGES.QUERY_EXPORT_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
}