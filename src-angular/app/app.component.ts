import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electronyzer';

import { Utilities } from './utilities/utilities';
import { CNST_LOGLEVEL, CNST_PROGRAM_NAME, CNST_PROGRAM_VERSION } from './utilities/constants-angular';

import { ScheduleService } from './schedule/schedule-service';
import { ConfigurationService } from './configuration/configuration-service';
import { Configuration, Schedule } from './utilities/interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public CNST_MESSAGES: any = {
     SYSTEM_FINISH_USER: '=== Desligamento solicitado pelo usuário (menu manual) ==='
    ,SYSTEM_FINISH_USER_WARNING: 'Aviso - Desligamento do sistema não pode ser testado sem o electron.'
  };
  
  private version: string = '';
  private programName: string = '';
  
  menus = [
    { label: 'Ambientes', link: './workspace', icon: 'po-icon-chart-columns' },
    { label: 'Banco de Dados', link: './database', icon: 'po-icon-database' },
    { label: 'Java', link: './java', icon: 'po-icon-parameters' },
    { label: 'Agendamento', link: './schedule', icon: 'po-icon-clock' },
    { label: 'Consultas (Query)', link: './query', icon: 'po-icon-filter' },
    { label: 'Rotinas (Scripts)', link: './script', icon: 'po-icon-filter' },
    { label: 'Monitor', link: './monitor', icon: 'po-icon-device-desktop' },
    { label: 'Configurações', link: './configuration', icon: 'po-icon-settings' },
    { label: 'Sair', icon: 'po-icon-exit', action: this.exit.bind(this) }
  ];
  
  constructor(
     private _electronService: ElectronService
    ,private _scheduleService: ScheduleService
    ,private _configurationService: ConfigurationService
    ,private _utilities: Utilities
  ) {
    this.programName = CNST_PROGRAM_NAME.SIMPLE;
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('deleteOldLogs');
      this._configurationService.getConfiguration().subscribe((conf: Configuration) => {
        return;
      });
      
      this.version = CNST_PROGRAM_VERSION.PRODUCTION + this._electronService.ipcRenderer.sendSync('getVersion').version;
    } else {
      this.version = CNST_PROGRAM_VERSION.DEVELOPMENT;
    }
  }
  
  public exit(): void {
    if (this._electronService.isElectronApp) {
      this._utilities.writeToLog(CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.SYSTEM_FINISH_USER);
      this._electronService.ipcRenderer.send('exit');
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this.CNST_MESSAGES.SYSTEM_FINISH_USER_WARNING);
    }
  }
}