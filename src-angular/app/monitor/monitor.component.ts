import { Component, ViewChild, OnInit } from '@angular/core';

import { PoModalComponent } from '@po-ui/ng-components';
import { PoTableColumn, PoTableAction } from '@po-ui/ng-components';
import { PoModalAction } from '@po-ui/ng-components';
import { ElectronService } from 'ngx-electronyzer';
import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

import { Utilities } from '../utilities/utilities';
import { AgentLog } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';

import { MonitorService } from './monitor-service';

import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Component({
    selector: 'app-monitor',
    templateUrl: './monitor.component.html',
    styleUrls: ['./monitor.component.css']
})

export class MonitorComponent implements OnInit {
  @ViewChild('modal_1') modal_1: PoModalComponent;
  @ViewChild('modal_2') modal_2: PoModalComponent;
  
  public CNST_MESSAGES: any = {};
  
  public details: AgentLog = new AgentLog();
  public agentLog: Array<AgentLog> = [];
  
  protected lbl_title: string;
  protected po_lo_text: any = { value: null };
  
  public showModalMonitor = false;
  public interval: any;
  private idExecutionCancel: string;
  
  public setTableRowActions: Array<PoTableAction> = [];
  public setColumns: Array<PoTableColumn> = [];
  public setDetailColumns: Array<PoTableColumn> = [];
  
  public lbl_goBack: string;
  public lbl_confirm: string;
  public lbl_executionDetails: string;
  public lbl_killProcess: string;
  
  constructor(
    public _monitorService: MonitorService,
    private _translateService: TranslationService,
    private _electronService: ElectronService,
    private _utilities: Utilities
  ) {
    this._translateService.getTranslations([
      new TranslationInput('MONITOR.TITLE', []),
      new TranslationInput('MONITOR.TABLE.STATUS', []),
      new TranslationInput('MONITOR.TABLE.LINES', []),
      new TranslationInput('MONITOR.TABLE.SCHEDULE', []),
      new TranslationInput('MONITOR.TABLE.START_DATE', []),
      new TranslationInput('MONITOR.TABLE.FINAL_DATE', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_TIME', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.TITLE', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.TIMESTAMP', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.LEVEL', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.SOURCE', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.MESSAGE', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_STATUS.DONE', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_STATUS.RUNNING', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_STATUS.ERROR', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_STATUS.CANCELED', []),
      new TranslationInput('BUTTONS.DETAILS', []),
      new TranslationInput('BUTTONS.CONFIRM', []),
      new TranslationInput('BUTTONS.GO_BACK', []),
      new TranslationInput('MONITOR.MESSAGES.WARNING', []),
      new TranslationInput('MONITOR.MESSAGES.KILL_PROCESS_TITLE', [])
    ]).subscribe((translations: any) => {
      this.setColumns = [
        { property: 'status', type: 'subtitle', width: '10%', subtitles: [
          { value: _constants.CNST_LOGLEVEL.INFO.level, color: 'color-10', label: translations['MONITOR.TABLE.EXECUTION_STATUS.DONE'], content: ''},
          { value: _constants.CNST_LOGLEVEL.WARN.level, color: 'color-01', label: translations['MONITOR.TABLE.EXECUTION_STATUS.RUNNING'], content: ''},
          { value: _constants.CNST_LOGLEVEL.ERROR.level, color: 'color-07', label: translations['MONITOR.TABLE.EXECUTION_STATUS.ERROR'] , content: ''},
          { value: _constants.CNST_LOGLEVEL.DEBUG.level, color: 'color-12', label: translations['MONITOR.TABLE.EXECUTION_STATUS.CANCELED'] , content: ''}
        ]},
        { property: 'scheduleLines', label: translations['MONITOR.TABLE.LINES'] , width: '10%' },
        { property: 'scheduleName', label: translations['MONITOR.TABLE.SCHEDULE'] , width: '15%' },
        { property: 'str_startDate', label: translations['MONITOR.TABLE.START_DATE'], width: '25%' },
        { property: 'str_endDate', label: translations['MONITOR.TABLE.FINAL_DATE'], width: '25%' },
        { property: 'duration', label: translations['MONITOR.TABLE.EXECUTION_TIME'], width: '20%' },
        { property: 'terminate', label: ' ', width: '5%', type: 'icon', action: this.modal_2_open.bind(this) }
      ];
      
      this.setDetailColumns = [
        { property: 'str_timestamp', label: translations['MONITOR.TABLE.DETAILS.TIMESTAMP'], width: '20%' },
        { property: 'loglevel', label: translations['MONITOR.TABLE.DETAILS.LEVEL'], width: '10%' },
        { property: 'system', label: translations['MONITOR.TABLE.DETAILS.SOURCE'], width: '10%' },
        { property: 'message', label: translations['MONITOR.TABLE.DETAILS.MESSAGE'], width: '60%' }
      ];
      
      this.setTableRowActions = [
        { action: this.modal_1_open.bind(this), icon: 'po-icon-info', label: translations['BUTTONS.DETAILS'] }
      ];
      
      this.CNST_MESSAGES = {
        WARNING: translations['MONITOR.MESSAGES.WARNING']
      };
      
      this.lbl_title = translations['MONITOR.TITLE'];
      this.lbl_executionDetails = translations['MONITOR.TABLE.DETAILS.TITLE'];
      this.lbl_killProcess = translations['MONITOR.MESSAGES.KILL_PROCESS_TITLE'];
      this.lbl_goBack = translations['BUTTONS.GO_BACK'];
      this.lbl_confirm = translations['BUTTONS.CONFIRM'];
    });
  }
  
  public ngOnInit(): void {
    if (this._electronService.isElectronApp) {
      setInterval(() => { this.updateMonitorLog().subscribe(); }, 1000 * 5);
      this.updateMonitorLog().subscribe();
    } else {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, this.CNST_MESSAGES.WARNING, null);
    }
  }
  
  private updateMonitorLog(): Observable<void> {
    return this._monitorService.getMonitorLog().pipe(map((logs: AgentLog[]) => {
      this.agentLog = logs;
    }));
  }
  
  protected modal_1_open(agentLog: AgentLog): void {
    this.details = agentLog;
    this.modal_1.open();
  }
  
  protected modal_1_close(): void {
    this.details = new AgentLog();
    this.modal_1.close();
  }
  
  protected modal_2_open(agentLog: AgentLog): void {
    this.details = agentLog;
    this.modal_2.open();
  }
  
  protected modal_2_close(): void {
    this.details = new AgentLog();
    this.modal_2.close();
  }
  
  protected killProcess(): void {
    this.modal_2.close();
    this._translateService.getTranslations([
      new TranslationInput('ELECTRON.PROCESS_KILL', []),
      new TranslationInput('ELECTRON.PROCESS_KILL_OK', [this.details.scheduleId, this.details.execId]),
      new TranslationInput('ELECTRON.PROCESS_KILL_WARN', [this.details.scheduleId, this.details.execId]),
      new TranslationInput('ELECTRON.PROCESS_KILL_ERROR', [this.details.scheduleId, this.details.execId])
    ]).subscribe((translations: any) => {
      this.po_lo_text = { value: translations['ELECTRON.PROCESS_KILL'] };
      this._electronService.ipcRenderer.invoke('killProcess', this.details.scheduleId, this.details.execId).then((res: number) => {
        this.po_lo_text = { value: null };
        if (res == 1) {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, translations['ELECTRON.PROCESS_KILL_OK'], null);
        } else if (res == 0) {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['ELECTRON.PROCESS_KILL_ERROR'], null);
        } else {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.WARN, translations['ELECTRON.PROCESS_KILL_WARN'], null);
        }
      });
    });
  }
}