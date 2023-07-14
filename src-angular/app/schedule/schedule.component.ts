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
import { CNST_SCHEDULE_MESSAGES as scheduleMessage } from './schedule-messages';
import * as _constants from '../utilities/constants-angular';
import { Schedule } from '../utilities/interfaces';
import { Utilities } from '../utilities/utilities';

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
  
  protected setoptions: Array<PoListViewAction> = [
     { label: 'Editar', action: this.editSchedule.bind(this) }
    ,{ label: 'Excluir', action: this.deleteSchedule.bind(this) }
    ,{ label: 'Executar Agent', action: this.runAgent.bind(this) }
  ];
  
  constructor(
     private _workspaceService: WorkspaceService
    ,private _scheduleService: ScheduleService
    ,private _electronService: ElectronService
    ,private _utilities: Utilities
    ,private _router: Router
  ) {}
  
  public ngOnInit(): void {
    this.loadSchedules();
  }
  
  private loadSchedules(): void {
    this.po_lo_text = { value: scheduleMessage.SCHEDULE_LOADING };
    this._scheduleService.getSchedules(true).subscribe((schedule: Schedule[]) => {
      this.schedules = schedule;
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this.po_lo_text = { value: null };
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, scheduleMessage.SCHEDULE_LOADING_ERROR, err);
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
    this.po_lo_text = { value: scheduleMessage.SCHEDULE_DELETE(this.scheduleToDelete.name) };
    this._scheduleService.deleteSchedule(this.scheduleToDelete).subscribe((b: boolean) => {
      this.po_lo_text = { value: null };
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, scheduleMessage.SCHEDULE_DELETE_OK);
      this.loadSchedules();
    }, (err: any) => {
      this.po_lo_text = { value: null };
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, scheduleMessage.SCHEDULE_DELETE_ERROR(this.scheduleToDelete.name), err);
    });
  }
  
  public runAgent(s: Schedule): void {
    if (this._electronService.isElectronApp) {
      this.po_lo_text = { value: scheduleMessage.RUN_AGENT(s.name) };
      this._utilities.writeToLog(_constants.CNST_LOGLEVEL.INFO, scheduleMessage.RUN_AGENT_MANUAL(s.name));
      this._electronService.ipcRenderer.sendSync('executeAndUpdateSchedule', s);
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, scheduleMessage.RUN_AGENT_OK);
      this.po_lo_text = { value: null };
    } else {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.WRN, scheduleMessage.RUN_AGENT_WARNING(), null);
    }
  }
}