import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import {
   PoModalComponent
  ,PoListViewAction
} from '@po-ui/ng-components';

import { ElectronService } from 'ngx-electronyzer';

import { WorkspaceService } from './workspace-service';
import { CNST_WORKSPACE_MESSAGES } from '../workspace/workspace-messages';
import { DatabaseService } from '../database/database-service';
import { Workspace, Database } from '../utilities/interfaces';
import { CNST_MODALIDADE_CONTRATACAO, CNST_NO_OPTION_SELECTED, CNST_LOGLEVEL } from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css'],
})

export class WorkspaceComponent implements OnInit {
  
  @ViewChild('modal_1') modal_1: PoModalComponent;
  @ViewChild('modal_2') modal_2: PoModalComponent;
  
  private databases: Database[] = [];
  protected projects: Workspace[] = [];
  private projectToDelete: Workspace;
  protected _CNST_MODALIDADE_CONTRATACAO: Array<PoListViewAction>;
  protected contractType: string = null;
  protected contractCode: string = null;
  protected po_lo_text: any = { value: null };
  
  protected setoptions(): Array<PoListViewAction> {
    return [
       { label: 'Editar',  action: this.editProject.bind(this) }
      ,{ label: 'Excluir', action: this.deleteProject.bind(this) }
    ];
  }
  
  constructor(
     private _electronService: ElectronService
    ,private _workspaceService: WorkspaceService
    ,private _databaseService: DatabaseService
    ,private _utilities: Utilities
    ,private _router: Router
  ) {
    this._CNST_MODALIDADE_CONTRATACAO = CNST_MODALIDADE_CONTRATACAO;
  }
  
  public ngOnInit(): void {
    this.loadWorkspaces();
  }
  
  private loadWorkspaces(): void {
    this.po_lo_text = { value: CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING };
    forkJoin([
       this._workspaceService.getWorkspaces()
      ,this._databaseService.getDatabases()
    ]).subscribe((results: [Workspace[], Database[]]) => {
      this.databases = results[1];
      this.projects = results[0]
        .filter((w: Workspace) => { return w.databaseId != CNST_NO_OPTION_SELECTED.value })
        .map((w: Workspace) => { 
          w.databaseName = this.databases.find((db: Database) => {
            return db.id === w.databaseId;
          }).name;
            return w;
        });
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_ERROR);
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
  
  protected modal_2_confirm(): void {
    this.modal_2.close();
    this.po_lo_text = { value: CNST_WORKSPACE_MESSAGES.WORKSPACE_DELETE(this.projectToDelete.name) };
    this._workspaceService.deleteWorkspace(this.projectToDelete)
    .subscribe((b: boolean) => {
      this._utilities.createNotification(CNST_LOGLEVEL.INFO, CNST_WORKSPACE_MESSAGES.WORKSPACE_DELETE_OK);
      this.po_lo_text = { value: null };
      this.projectToDelete = null;
      this.loadWorkspaces();
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.INFO, CNST_WORKSPACE_MESSAGES.WORKSPACE_DELETE_ERROR(this.projectToDelete.name));
      this.po_lo_text = { value: null };
      this.projectToDelete = null;
    });
  }
  
  protected modal_2_close(): void {
    this.projectToDelete = null;
    this.modal_2.close();
  }
}
