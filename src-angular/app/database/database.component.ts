import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ElectronService } from 'ngx-electronyzer';

import {
   PoModalComponent
  ,PoListViewAction
} from '@po-ui/ng-components';

import { WorkspaceService } from '../workspace/workspace-service';
import { DatabaseService } from './database-service';
import { CNST_DATABASE_MESSAGES } from './database-messages';
import * as _constants from '../utilities/constants-angular';
import { Database, Workspace } from '../utilities/interfaces';
import { Utilities } from '../utilities/utilities';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})

export class DataBaseComponent implements OnInit {
  
  @ViewChild(PoModalComponent) modal_1: PoModalComponent;
  
  public CNST_MESSAGES: any = {
     DATABASE_DELETE_ERROR_PROJECTS: 'Não e possível apagar este banco de dados, pois existem projetos atrelados à ele.'
  };
  
  private databaseToDelete: Database;
  protected databases: Database[];
  protected po_lo_text: any = { value: null };
  
  protected setoptions(): Array<PoListViewAction> {
    return [
       { label: 'Editar',  action: this.editDatabase.bind(this) }
      ,{ label: 'Excluir', action: this.deleteDatabase.bind(this) }
    ];
  }
  
  constructor(
     private _workspaceService: WorkspaceService
    ,private _databaseService: DatabaseService
    ,private _utilities: Utilities
    ,private _router: Router
  ) {}
  
  public ngOnInit(): void {
    this.loadDatabases();
  }
  
  private loadDatabases(): void {
    this.po_lo_text = { value: CNST_DATABASE_MESSAGES.DATABASE_LOADING };
    this._databaseService.getDatabases().subscribe((db: Database[]) => {
      this.databases = db;
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_DATABASE_MESSAGES.DATABASE_LOADING_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  private editDatabase(db: Database): void {
    this._router.navigate(['/database-add'], { state: db });
  }
  
  protected addDatabase(): void {
    this._router.navigate(['/database-add']);
  }
  
  private deleteDatabase(db: Database): void {
    this.databaseToDelete = db;
    this.modal_1.open();
  }
  
  private deleteThisDatabase(db: Database): void {
    this.po_lo_text = { value: CNST_DATABASE_MESSAGES.DATABASE_DELETE(this.databaseToDelete.name) };
    this._workspaceService.getWorkspacesByDatabase(db).subscribe((w: Workspace[]) => {
      if (w.length > 0) {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.DATABASE_DELETE_ERROR_PROJECTS);
        this.po_lo_text = { value: null };
      } else {
        this._databaseService.deleteDatabase(db).subscribe((b: boolean) => {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, CNST_DATABASE_MESSAGES.DATABASE_DELETE_OK);
          this.po_lo_text = { value: null };
          this.loadDatabases();
        }, (err: any) => {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_DATABASE_MESSAGES.DATABASE_DELETE_ERROR(this.databaseToDelete.name), err);
          this.po_lo_text = { value: null };
        });
      }
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_DATABASE_MESSAGES.DATABASE_DELETE_ERROR(this.databaseToDelete.name), err);
      this.po_lo_text = { value: null };
    });
  }
  
  protected modal_1_confirm(): void {
    this.modal_1.close();
    this.deleteThisDatabase(this.databaseToDelete);
  }
  
  protected modal_1_close(): void {
    this.databaseToDelete = null;
    this.modal_1.close();
  }
}