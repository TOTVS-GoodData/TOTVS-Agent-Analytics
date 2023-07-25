import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import {
   PoModalComponent
  ,PoListViewAction
} from '@po-ui/ng-components';

import { ElectronService } from 'ngx-electronyzer';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

import { WorkspaceService } from './workspace-service';
import { DatabaseService } from '../database/database-service';
import { Workspace, Database } from '../utilities/interfaces';
import { CNST_MODALIDADE_CONTRATACAO, CNST_NO_OPTION_SELECTED, CNST_LOGLEVEL } from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { Observable, forkJoin, catchError, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css'],
})

export class WorkspaceComponent implements OnInit {
  
  @ViewChild('modal_1') modal_1: PoModalComponent;
  @ViewChild('modal_2') modal_2: PoModalComponent;
  
  public CNST_MESSAGES: any = {};
  
  private databases: Database[] = [];
  protected projects: Workspace[] = [];
  private projectToDelete: Workspace;
  protected _CNST_MODALIDADE_CONTRATACAO: Array<PoListViewAction>;
  protected contractType: string = null;
  protected contractCode: string = null;
  protected po_lo_text: any = { value: null };
  
  protected lbl_title: string;
  protected lbl_deleteConfirmation: string;
  protected lbl_add: string;
  protected lbl_goBack: string;
  protected lbl_confirm: string;
  protected lbl_workspace: string;
  protected lbl_graph: string;
  protected lbl_database: string;
  protected lbl_contractType: string;
  
  protected setoptions: Array<PoListViewAction> = [];
  
  constructor(
    private _electronService: ElectronService,
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _translateService: TranslationService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    this._CNST_MODALIDADE_CONTRATACAO = CNST_MODALIDADE_CONTRATACAO;
    this._translateService.getTranslations([
      new TranslationInput('BUTTONS.EDIT', []),
      new TranslationInput('BUTTONS.DELETE', []),
      new TranslationInput('BUTTONS.ADD', []),
      new TranslationInput('BUTTONS.GO_BACK', []),
      new TranslationInput('BUTTONS.CONFIRM', []),
      new TranslationInput('WORKSPACES.TITLE', []),
      new TranslationInput('WORKSPACES.DELETE_CONFIRMATION', []),
      new TranslationInput('WORKSPACES.TABLE.WORKSPACE', []),
      new TranslationInput('WORKSPACES.TABLE.GRAPH', []),
      new TranslationInput('WORKSPACES.TABLE.DATABASE', []),
      new TranslationInput('WORKSPACES.TABLE.CONTRACT_TYPE', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('WORKSPACES.MESSAGES.DELETE_OK', [])
    ]).subscribe((translations: any) => {
      this.lbl_add = translations['BUTTONS.ADD'];
      this.lbl_goBack = translations['BUTTONS.GO_BACK'];
      this.lbl_confirm = translations['BUTTONS.CONFIRM'];
      this.lbl_workspace = translations['WORKSPACES.TABLE.WORKSPACE'];
      this.lbl_graph = translations['WORKSPACES.TABLE.GRAPH'];
      this.lbl_database = translations['WORKSPACES.TABLE.DATABASE'];
      this.lbl_contractType = translations['WORKSPACES.TABLE.CONTRACT_TYPE'];
      
      this.setoptions = [
        { label: translations['BUTTONS.EDIT'],  action: this.editProject.bind(this) },
        { label: translations['BUTTONS.DELETE'], action: this.deleteProject.bind(this) }
      ];
      
      this.lbl_title = translations['WORKSPACES.TITLE'];
      this.lbl_deleteConfirmation = translations['WORKSPACES.DELETE_CONFIRMATION'];
      this.CNST_MESSAGES = {
        LOADING: translations['WORKSPACES.MESSAGES.LOADING'],
        LOADING_ERROR: translations['WORKSPACES.MESSAGES.LOADING_ERROR'],
        DELETE_OK: translations['WORKSPACES.MESSAGES.DELETE_OK']
      };
    });
  }
  
  public ngOnInit(): void {
    this.loadWorkspaces();
  }
  
  private loadWorkspaces(): void {
    this.po_lo_text = { value: this.CNST_MESSAGES.LOADING };
    forkJoin([
       this._workspaceService.getWorkspaces()
      ,this._databaseService.getDatabases()
    ]).subscribe((results: [Workspace[], Database[]]) => {
      this.databases = results[1];
      this.projects = results[0].map((w: Workspace) => {
        let db: Database = this.databases.find((db: Database) => {
          return db.id === w.databaseIdRef;
        })
        
        if (db != undefined) w.databaseName = db.name;
        else w.databaseName = CNST_NO_OPTION_SELECTED.label;
        return w;
      });
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.LOADING_ERROR);
      this.po_lo_text = { value: null };
    });
  }
  
  private editProject(w: Workspace): void {
    this._router.navigate(['/workspace-add'], { state: w });
  }
  
  protected insertProject(): void {
    this.modal_1.open();
  }
  
  protected modal_1_confirm(): void {
    this.modal_1.close();
    this._router.navigate(['/workspace-add'], { state: { contractType: this.contractType, contractCode: this.contractCode }});
  }
  
  protected modal_1_close(): void {
    this.contractType = null;
    this.contractCode = null;
    this.modal_1.close();
  }
  
  private deleteProject(w: Workspace): void {
    this.projectToDelete = w;
    this.modal_2.open();
  }
  
  protected modal_2_confirm(): Observable<void> {
    this.modal_2.close();
    return this._translateService.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.DELETE', [this.projectToDelete.name]),
      new TranslationInput('WORKSPACES.MESSAGES.DELETE_ERROR', [this.projectToDelete.name])
    ]).pipe(switchMap((translations: any) => {
      this.po_lo_text = { value: translations['WORKSPACES.MESSAGES.DELETE'] };
      return this._workspaceService.deleteWorkspace(this.projectToDelete)
      .pipe(map((b: boolean) => {
        this._utilities.createNotification(CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.DELETE_OK);
        this.po_lo_text = { value: null };
        this.projectToDelete = null;
        this.loadWorkspaces();
      }), catchError((err: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.INFO, translations['WORKSPACES.MESSAGES.DELETE_ERROR']);
        this.po_lo_text = { value: null };
        this.projectToDelete = null;
        throw err;
      }));
    }));
  }
  
  protected modal_2_close(): void {
    this.projectToDelete = null;
    this.modal_2.close();
  }
}
