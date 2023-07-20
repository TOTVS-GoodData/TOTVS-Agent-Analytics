import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electronyzer';

import { PoMenuItem } from '@po-ui/ng-components';

import { Utilities } from './utilities/utilities';
import { CNST_LOGLEVEL, CNST_PROGRAM_NAME, CNST_PROGRAM_VERSION } from './utilities/constants-angular';

import { ScheduleService } from './schedule/schedule-service';
import { ConfigurationService } from './configuration/configuration-service';
import { Configuration, Schedule } from './utilities/interfaces';

import { TranslateService } from '@ngx-translate/core';
import { TranslationService, TranslationInput } from './service/translation/translation-service';

import { map, switchMap, filter } from 'rxjs/operators';

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
  public menus: PoMenuItem[] = [];
  
  constructor(
     private _electronService: ElectronService
    ,private _scheduleService: ScheduleService
    ,private _translateService: TranslationService
    ,private _configurationService: ConfigurationService
    ,private _utilities: Utilities
  ) {
    this.programName = CNST_PROGRAM_NAME.SIMPLE;
    
    this._translateService.setDefaultLang('en-US');
    this._translateService.use('en-US');
    let ti: TranslationInput[] = [
      new TranslationInput('MENU.WORKSPACES', []),
      new TranslationInput('MENU.DATABASES', []),
      new TranslationInput('MENU.SCHEDULES', []),
      new TranslationInput('MENU.QUERIES', []),
      new TranslationInput('MENU.SCRIPTS', []),
      new TranslationInput('MENU.MONITOR', []),
      new TranslationInput('MENU.CONFIGURATION', []),
      new TranslationInput('MENU.EXIT', [])
    ];
    this._translateService.getTranslations(ti).subscribe((translations: any) => {
      this.menus = [
        { label: translations['MENU.WORKSPACES'], link: './workspace', icon: 'po-icon-chart-columns' },
        { label: translations['MENU.DATABASES'], link: './database', icon: 'po-icon-database' },
        { label: translations['MENU.SCHEDULES'], link: './schedule', icon: 'po-icon-clock' },
        { label: translations['MENU.QUERIES'], link: './query', icon: 'po-icon-filter' },
        { label: translations['MENU.SCRIPTS'], link: './script', icon: 'po-icon-filter' },
        { label: translations['MENU.MONITOR'], link: './monitor', icon: 'po-icon-device-desktop' },
        { label: translations['MENU.CONFIGURATION'], link: './configuration', icon: 'po-icon-settings' },
        { label: translations['MENU.EXIT'], icon: 'po-icon-exit', action: this.exit.bind(this) }
      ];
    });
    
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('deleteOldLogs');
      let tmp: string = this._electronService.ipcRenderer.sendSync('getTmpPath');
      this._configurationService.getConfiguration().subscribe((conf: Configuration) => {
        if (conf.javaTmpDir == null) {
          conf.javaTmpDir = tmp;
          return this._configurationService.saveConfiguration(conf).pipe(map((res: boolean) => {
            return res;
          }));
        } else {
          return;
        }
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