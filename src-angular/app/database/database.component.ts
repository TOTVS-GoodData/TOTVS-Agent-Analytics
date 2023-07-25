import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ElectronService } from 'ngx-electronyzer';

import {
   PoModalComponent
  ,PoListViewAction
} from '@po-ui/ng-components';

import { WorkspaceService } from '../workspace/workspace-service';
import { DatabaseService } from './database-service';
import * as _constants from '../utilities/constants-angular';
import { Database, Workspace } from '../utilities/interfaces';
import { Utilities } from '../utilities/utilities';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})

export class DataBaseComponent implements OnInit {
  
  @ViewChild(PoModalComponent) modal_1: PoModalComponent;
  
  public CNST_MESSAGES: any = {};
  
  private databaseToDelete: Database;
  protected databases: Database[];
  protected po_lo_text: any = { value: null };
  
  protected setoptions: Array<PoListViewAction> = [];
  
  protected lbl_add: string;
  protected lbl_title: string;
  protected lbl_deleteConfirmation: string;
  protected lbl_goBack: string;
  protected lbl_confirm: string;
  
  constructor(
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _translateService: TranslationService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    this._translateService.getTranslations([
      new TranslationInput('DATABASES.TITLE', []),
      new TranslationInput('DATABASES.DELETE_CONFIRMATION', []),
      new TranslationInput('BUTTONS.ADD', []),
      new TranslationInput('BUTTONS.EDIT', []),
      new TranslationInput('BUTTONS.DELETE', []),
      new TranslationInput('BUTTONS.GO_BACK', []),
      new TranslationInput('BUTTONS.CONFIRM', []),
      new TranslationInput('DATABASES.MESSAGES.LOADING', []),
      new TranslationInput('DATABASES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('DATABASES.MESSAGES.DELETE_OK', []),
      new TranslationInput('DATABASES.MESSAGES.DELETE_ERROR_WORKSPACES', [])
    ]).subscribe((translations: any) => {
      this.setoptions = [
        { label: translations['BUTTONS.EDIT'],  action: this.editDatabase.bind(this) },
        { label: translations['BUTTONS.DELETE'], action: this.deleteDatabase.bind(this) }
      ];
      
      this.lbl_title = translations['DATABASES.TITLE'];
      this.lbl_add = translations['BUTTONS.ADD'];
      this.lbl_deleteConfirmation = translations['DATABASES.DELETE_CONFIRMATION'];
      this.lbl_goBack = translations['BUTTONS.GO_BACK'];
      this.lbl_confirm = translations['BUTTONS.CONFIRM'];
      
      this.CNST_MESSAGES = {
        LOADING: translations['DATABASES.MESSAGES.LOADING'],
        LOADING_ERROR: translations['DATABASES.MESSAGES.LOADING_ERROR'],
        DELETE_OK: translations['DATABASES.MESSAGES.DELETE_OK'],
        DELETE_ERROR_WORKSPACES: translations['DATABASES.MESSAGES.DELETE_ERROR_WORKSPACES']
      };
    });
  }
  
  public ngOnInit(): void {
    this.loadDatabases();
  }
  
  private loadDatabases(): void {
    this.po_lo_text = { value: this.CNST_MESSAGES.LOADING };
    this._databaseService.getDatabases().subscribe((db: Database[]) => {
      this.databases = db;
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.LOADING_ERROR, err);
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
    this._translateService.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.DELETE', [this.databaseToDelete.name]),
      new TranslationInput('DATABASES.MESSAGES.DELETE_ERROR', [this.databaseToDelete.name])
    ]).subscribe((translations: any) => {
      this.po_lo_text = { value: translations['DATABASES.MESSAGES.DELETE'] };
      this._workspaceService.getWorkspacesByDatabase(db).subscribe((w: Workspace[]) => {
        if (w.length > 0) {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.DELETE_ERROR_WORKSPACES);
          this.po_lo_text = { value: null };
        } else {
          this._databaseService.deleteDatabase(db).subscribe((b: boolean) => {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.DELETE_OK);
            this.po_lo_text = { value: null };
            this.loadDatabases();
          }, (err: any) => {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.DELETE_ERROR'], err);
            this.po_lo_text = { value: null };
          });
        }
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.DELETE_ERROR'], err);
        this.po_lo_text = { value: null };
      });
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