import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import {
   PoModalComponent
  ,PoListViewAction
  ,PoButtonGroupItem
} from '@po-ui/ng-components';

import { ElectronService } from 'ngx-electronyzer';

import { WorkspaceService } from '../workspace/workspace-service';
import { ScheduleService} from './schedule-service';
import * as _constants from '../utilities/constants-angular';
import { Schedule } from '../utilities/interfaces';
import { Utilities } from '../utilities/utilities';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  
  @ViewChild(PoModalComponent) modal_1: PoModalComponent;
  
  private scheduleToDelete: Schedule;
  protected schedules: Schedule[];
  protected po_lo_text: any = { value: null };
  
  protected setoptions: Array<PoListViewAction> = [];
  
  public CNST_MESSAGES: any = {};
  
  protected lbl_title: string;
  protected lbl_deleteConfirmation: string;
  protected lbl_enabled: string;
  protected lbl_workspace: string;
  protected lbl_lastExecution: string;
  protected lbl_windows: string;
  protected lbl_add: string;
  protected lbl_confirm: string;
  protected lbl_goBack: string;
  
  constructor(
    private _workspaceService: WorkspaceService,
    private _scheduleService: ScheduleService,
    private _translateService: TranslationService,
    private _electronService: ElectronService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    this._translateService.getTranslations([
      new TranslationInput('SCHEDULES.TITLE', []),
      new TranslationInput('SCHEDULES.DELETE_CONFIRMATION', []),
      new TranslationInput('SCHEDULES.TABLE.ENABLED', []),
      new TranslationInput('SCHEDULES.TABLE.WORKSPACE', []),
      new TranslationInput('SCHEDULES.TABLE.LAST_EXECUTION', []),
      new TranslationInput('SCHEDULES.TABLE.WINDOWS', []),
      new TranslationInput('BUTTONS.ADD', []),
      new TranslationInput('BUTTONS.EDIT', []),
      new TranslationInput('BUTTONS.DELETE', []),
      new TranslationInput('BUTTONS.EXECUTE', []),
      new TranslationInput('BUTTONS.CONFIRM', []),
      new TranslationInput('BUTTONS.GO_BACK', []),
      new TranslationInput('SCHEDULES.MESSAGES.LOADING', []),
      new TranslationInput('SCHEDULES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('SCHEDULES.MESSAGES.DELETE_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.RUN_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.RUN_WARNING', [])
    ]).subscribe((translations: any) => {
      this.setoptions = [
        { label: translations['BUTTONS.EDIT'], action: this.editSchedule.bind(this) },
        { label: translations['BUTTONS.DELETE'], action: this.deleteSchedule.bind(this) },
        { label: translations['BUTTONS.EXECUTE'], action: this.runAgent.bind(this) }
      ];
      
      this.lbl_title = translations['SCHEDULES.TITLE'];
      this.lbl_deleteConfirmation = translations['SCHEDULES.DELETE_CONFIRMATION'];
      this.lbl_enabled = translations['SCHEDULES.TABLE.ENABLED'];
      this.lbl_workspace = translations['SCHEDULES.TABLE.WORKSPACE'];
      this.lbl_lastExecution = translations['SCHEDULES.TABLE.LAST_EXECUTION'];
      this.lbl_windows = translations['SCHEDULES.TABLE.WINDOWS'];
      this.lbl_add = translations['BUTTONS.ADD'];
      this.lbl_confirm = translations['BUTTONS.CONFIRM'];
      this.lbl_goBack = translations['BUTTONS.GO_BACK'];
      
      this.CNST_MESSAGES = {
        LOADING: translations['SCHEDULES.MESSAGES.LOADING'],
        LOADING_ERROR: translations['SCHEDULES.MESSAGES.LOADING_ERROR'],
        DELETE_OK: translations['SCHEDULES.MESSAGES.DELETE_OK'],
        RUN_OK: translations['SCHEDULES.MESSAGES.RUN_OK'],
        RUN_WARNING: translations['SCHEDULES.MESSAGES.RUN_WARNING'],
      };
    });
  }
  
  public ngOnInit(): void {
    this.loadSchedules();
  }
  
  private loadSchedules(): void {
    this.po_lo_text = { value: this.CNST_MESSAGES.LOADING };
    this._scheduleService.getSchedules(true).subscribe((schedule: Schedule[]) => {
      this.schedules = schedule;
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this.po_lo_text = { value: null };
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.LOADING_ERROR, err);
    });
  }
  
  protected editSchedule(s?: Schedule): void {
    this._router.navigate(['/schedule-add'], { state: s });
  }
  
  protected deleteSchedule(s: Schedule): void {
    this.scheduleToDelete = s;
    this.modal_1.open();
  }
  
  protected modal_1_close(): void {
    this.scheduleToDelete = null;
    this.modal_1.close();
  }
  
  protected modal_1_confirm(): void {
    this.modal_1.close();
    this._translateService.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.DELETE', [this.scheduleToDelete.name]),
      new TranslationInput('SCHEDULES.MESSAGES.DELETE_ERROR', [this.scheduleToDelete.name])
    ]).subscribe((translations: any) => {
      this.po_lo_text = { value: translations['SCHEDULES.MESSAGES.DELETE'] };
      this._scheduleService.deleteSchedule(this.scheduleToDelete).subscribe((b: boolean) => {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.DELETE_OK);
        this.loadSchedules();
      }, (err: any) => {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['SCHEDULES.MESSAGES.DELETE_ERROR'], err);
      });
    });
  }
  
  public runAgent(s: Schedule): void {
    if (this._electronService.isElectronApp) {
      this._translateService.getTranslations([
        new TranslationInput('SCHEDULES.MESSAGES.RUN', [s.name]),
        new TranslationInput('SCHEDULES.MESSAGES.RUN_MANUAL', [s.name])
      ]).subscribe((translations: any) => {
        this.po_lo_text = { value: translations['SCHEDULES.MESSAGES.RUN'] };
        this._utilities.writeToLog(_constants.CNST_LOGLEVEL.INFO, translations['SCHEDULES.MESSAGES.RUN_MANUAL']);
        this._electronService.ipcRenderer.sendSync('executeAndUpdateSchedule', s);
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.RUN_OK);
        this.po_lo_text = { value: null };
      });
    } else {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, this.CNST_MESSAGES.RUN_WARNING, null);
    }
  }
}