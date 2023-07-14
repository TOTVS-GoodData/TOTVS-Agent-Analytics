import { Component, ViewChild, OnInit } from '@angular/core';

import { PoModalComponent } from '@po-ui/ng-components';
import { PoTableColumn, PoTableAction } from '@po-ui/ng-components';
import { PoModalAction } from '@po-ui/ng-components';
import { ElectronService } from 'ngx-electronyzer';
import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';

import { AgentLog } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';

import { MonitorService } from './monitor-service';
import { Monitor } from './monitor';
import { MonitorMessage } from './monitor.message';

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
  
  
  public details: AgentLog = new AgentLog();
  public agentLog: Array<AgentLog> = [];
  
  
  public showModalMonitor = false;
  public interval: any;
  private idExecutionCancel: string;
  
  readonly setTableRowActions: Array<PoTableAction> = [
    { action: this.modal_1_open.bind(this), icon: 'po-icon-info', label: 'Detalhes' }
  ];
  
  readonly setColumns: Array<PoTableColumn> = [
     { property: 'status', type: 'subtitle', width: '10%', subtitles: [
       { value: _constants.CNST_LOGLEVEL.INFO.level, color: 'success', label: 'Finalizado', content: ''},
       { value: _constants.CNST_LOGLEVEL.WARN.level, color: 'warning', label: 'Em execução', content: ''},
       { value: _constants.CNST_LOGLEVEL.ERROR.level, color: 'danger', label: 'Erro' , content: ''},
       { value: 'C', color: 'color-12', label: 'Cancelado' , content: ''}
     ]}
    ,{ property: 'scheduleName', label: 'Agendamento' , width: '20%' }
    ,{ property: 'str_startDate', label: 'Data/hora de início', width: '25%' }
    ,{ property: 'str_endDate', label: 'Data/hora de término', width: '25%' }
    ,{ property: 'duration', label: 'Tempo de Execução', width: '20%' }
  ];
  
  readonly setDetailColumns: Array<PoTableColumn> = [
     { property: 'str_timestamp', label: 'Data/Hora', width: '20%' }
    ,{ property: 'loglevel', label: 'Nível', width: '10%' }
    ,{ property: 'system', label: 'Origem', width: '10%' }
    ,{ property: 'message', label: 'Mensagem', width: '60%' }
  ];
  
  constructor(
     public _monitorService: MonitorService
    ,private _electronService: ElectronService
    ,private thfNotification: PoNotificationService
  ) {}
  
  public ngOnInit(): void {
    setInterval(() => { this.updateMonitorLog().subscribe(); }, 60000 * 5);
    this.updateMonitorLog().subscribe();
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
  
  
  
  
  
  
  
  
}
