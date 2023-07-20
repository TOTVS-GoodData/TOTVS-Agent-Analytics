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
  
  public CNST_MESSAGES: any = {};
  
  public details: AgentLog = new AgentLog();
  public agentLog: Array<AgentLog> = [];
  
  protected lbl_title: string;
  
  public showModalMonitor = false;
  public interval: any;
  private idExecutionCancel: string;
  
  public setTableRowActions: Array<PoTableAction> = [];
  public setColumns: Array<PoTableColumn> = [];
  public setDetailColumns: Array<PoTableColumn> = [];
  
  public lbl_goBack: string;

  constructor(
    public _monitorService: MonitorService,
    private _translateService: TranslationService,
    private _electronService: ElectronService,
    private _utilities: Utilities
  ) {
    this._translateService.getTranslations([
      new TranslationInput('MONITOR.TITLE', []),
      new TranslationInput('MONITOR.TABLE.STATUS', []),
      new TranslationInput('MONITOR.TABLE.SCHEDULE', []),
      new TranslationInput('MONITOR.TABLE.START_DATE', []),
      new TranslationInput('MONITOR.TABLE.FINAL_DATE', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_TIME', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.TIMESTAMP', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.LEVEL', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.SOURCE', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.MESSAGE', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_DETAILS.DONE', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_DETAILS.RUNNING', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_DETAILS.ERROR', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_DETAILS.CANCELED', []),
      new TranslationInput('BUTTONS.DETAILS', []),
      new TranslationInput('BUTTONS.GO_BACK', []),
      new TranslationInput('MONITOR.MESSAGES.WARNING', [])
    ]).subscribe((translations: any) => {
      this.setColumns = [
        { property: 'status', type: 'subtitle', width: '10%', subtitles: [
          { value: _constants.CNST_LOGLEVEL.INFO.level, color: 'success', label: translations['MONITOR.TABLE.EXECUTION_DETAILS.DONE'], content: ''},
          { value: _constants.CNST_LOGLEVEL.WARN.level, color: 'warning', label: translations['MONITOR.TABLE.EXECUTION_DETAILS.RUNNING'], content: ''},
          { value: _constants.CNST_LOGLEVEL.ERROR.level, color: 'danger', label: translations['MONITOR.TABLE.EXECUTION_DETAILS.ERROR'] , content: ''},
          { value: 'C', color: 'color-12', label: translations['MONITOR.TABLE.EXECUTION_DETAILS.CANCELED'] , content: ''}
        ]},
        { property: 'scheduleName', label: translations['MONITOR.TABLE.SCHEDULE'] , width: '20%' },
        { property: 'str_startDate', label: translations['MONITOR.TABLE.START_DATE'], width: '25%' },
        { property: 'str_endDate', label: translations['MONITOR.TABLE.FINAL_DATE'], width: '25%' },
        { property: 'duration', label: translations['MONITOR.TABLE.EXECUTION_TIME'], width: '20%' }
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
      this.lbl_goBack = translations['BUTTONS.GOBACK'];
    });
  }
  
  public ngOnInit(): void {
    if (this._electronService.isElectronApp) {
      setInterval(() => { this.updateMonitorLog().subscribe(); }, 60000 * 5);
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
}

  /*
  
  protected modal_2_open(execution: Monitor): void {
    this.idExecutionCancel = execution.idExecution;
    this.modal_2.open();
  }
  
  protected modal_2_close(): void {
    this.idExecutionCancel = null;
    this.modal_2.close();
  }
  
  protected modal_2_confirm(): void {
    this.modal_2.close();
    const changeStatus = this._electronService.ipcRenderer.sendSync( 'setStatusExecution', this.idExecutionCancel, 'C' );
    if (changeStatus) {
      this.agentLog = [];
      //this.agentLog = this._monitorService.getMonitorLog();
    } else {
      const thfNotification: PoNotification = {
        message: 'Houve um erro ao tentar cancelar o status da execução',
        orientation: PoToasterOrientation.Top
      };
      this.thfNotification.error( thfNotification );
    }
  }
  */