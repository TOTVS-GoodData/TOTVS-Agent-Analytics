import { Component, OnInit, ViewChild } from '@angular/core';
import { ElectronService } from 'ngx-electronyzer';
import { Router } from '@angular/router';

import { PoMenuItem, PoModalComponent } from '@po-ui/ng-components';

import { Utilities } from './utilities/utilities';
import { CNST_LOGLEVEL, CNST_PROGRAM_NAME, CNST_PROGRAM_VERSION } from './utilities/constants-angular';

import { ScheduleService } from './schedule/schedule-service';
import { ConfigurationService } from './configuration/configuration-service';
import { Configuration, Schedule } from './utilities/interfaces';

import { TranslateService } from '@ngx-translate/core';
import { TranslationService, TranslationInput } from './service/translation/translation-service';
import { MenuService } from './service/menu-service';

import { map, switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('modal_1') modal_1: PoModalComponent;
  
  private version: string = '';
  private programName: string = '';
  public menus: PoMenuItem[] = [];
  
  protected lbl_exitConfirmation: string;
  protected lbl_confirm: string;
  protected lbl_goBack: string;
  
  constructor(
    private _electronService: ElectronService,
    private _scheduleService: ScheduleService,
    private _translateService: TranslationService,
    private _configurationService: ConfigurationService,
    private _menuService: MenuService,
    private _router: Router,
    private _utilities: Utilities
  ) {
    this.programName = CNST_PROGRAM_NAME.SIMPLE;
    this._translateService.setDefaultLang('en-US');
    this._configurationService.getConfiguration(true).subscribe((conf: Configuration) => {
      this._translateService.use(conf.locale);
      if (this._electronService.isElectronApp) {
        this._electronService.ipcRenderer.send('deleteOldLogs');
        this.version = CNST_PROGRAM_VERSION.PRODUCTION + this._electronService.ipcRenderer.sendSync('getVersion').version;
        if (conf.javaTmpDir == null) {
          conf.javaTmpDir = this._electronService.ipcRenderer.sendSync('getTmpPath');
          this._configurationService.saveConfiguration(conf).subscribe();
        }
      } else {
        this.version = CNST_PROGRAM_VERSION.DEVELOPMENT;
      }
    });
    
    this.setMenuTranslations();
    this._menuService.menuRefObs$.subscribe(() => {
      this.setMenuTranslations();
    });
  }
  
  public setMenuTranslations(): void {
    this._translateService.getTranslations([
      new TranslationInput('MENU.WORKSPACES', []),
      new TranslationInput('MENU.DATABASES', []),
      new TranslationInput('MENU.SCHEDULES', []),
      new TranslationInput('MENU.QUERIES', []),
      new TranslationInput('MENU.SCRIPTS', []),
      new TranslationInput('MENU.MONITOR', []),
      new TranslationInput('MENU.CONFIGURATION', []),
      new TranslationInput('MENU.EXIT', []),
      new TranslationInput('ANGULAR.SYSTEM_EXIT', []),
      new TranslationInput('BUTTONS.CONFIRM', []),
      new TranslationInput('BUTTONS.GO_BACK', [])
    ]).subscribe((translations: any) => {
      this.menus = [
        { label: translations['MENU.WORKSPACES'], link: './workspace', icon: 'po-icon-chart-columns' },
        { label: translations['MENU.DATABASES'], link: './database', icon: 'po-icon-database' },
        { label: translations['MENU.SCHEDULES'], link: './schedule', icon: 'po-icon-clock' },
        { label: translations['MENU.QUERIES'], link: './query', icon: 'po-icon-filter' },
        { label: translations['MENU.SCRIPTS'], link: './script', icon: 'po-icon-filter' },
        { label: translations['MENU.MONITOR'], link: './monitor', icon: 'po-icon-device-desktop' },
        { label: translations['MENU.CONFIGURATION'], link: './configuration', icon: 'po-icon-settings' },
        { label: translations['MENU.EXIT'], icon: 'po-icon-exit', action: this.exitModal.bind(this) }
      ];
      
      this.lbl_exitConfirmation = translations['ANGULAR.SYSTEM_EXIT'];
      this.lbl_confirm = translations['BUTTONS.CONFIRM'];
      this.lbl_goBack = translations['BUTTONS.GO_BACK'];
    });
  }
  
  private exitModal(): void {
    this.modal_1.open();
  }
  
  protected goBack(): void {
    this.modal_1.close();
  }
  
  public exit(): void {
    this._translateService.getTranslations([
      new TranslationInput('ANGULAR.SYSTEM_FINISH_USER', []),
      new TranslationInput('ANGULAR.SYSTEM_FINISH_USER_WARNING', [])
    ]).subscribe((translations: any) => {
      this.modal_1.close();
      if (this._electronService.isElectronApp) {
        this._utilities.writeToLog(CNST_LOGLEVEL.INFO, translations['ANGULAR.SYSTEM_FINISH_USER']);
        this._electronService.ipcRenderer.send('exit');
      } else {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, translations['ANGULAR.SYSTEM_FINISH_USER_WARNING']);
      }
    });
  }
}