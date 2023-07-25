import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';

import { SessionService } from '../service/session-service';
import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';
import { Configuration } from '../utilities/interfaces';
import { CNST_SYSTEMLEVEL, CNST_LOGLEVEL } from '../utilities/constants-angular';

@Injectable({
  providedIn: 'root'
})
export class Utilities {
  
  private debug: boolean = false;
  private CNST_LOCALHOST_PORT: number = 3000;
  
  constructor(
     private _electronService: ElectronService
    ,private _sessionService: SessionService
    ,private _notificationService: PoNotificationService
  ) { this.debug = true; }
  
  public getLocalhostURL(): string {
    return 'http://localhost:' + this.CNST_LOCALHOST_PORT;
  }
  
  public getDefaultHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-type', 'application/json');
    return headers;
  }
  
  public addGoodDataHeaders(headers: HttpHeaders): HttpHeaders {
    if (this._sessionService.TOKEN_SST != undefined) { headers = headers.append('X-GDC-AuthSST', this._sessionService.TOKEN_SST); }
    if (this._sessionService.TOKEN_TT != undefined) { headers = headers.append('X-GDC-AuthTT', this._sessionService.TOKEN_TT); }
    return headers;
  }
  
  public writeToLog(loglevel: any, message: string, err?: any): void {
    if (loglevel.level == CNST_LOGLEVEL.ERROR.level) {
      console.error(loglevel.tag + ' ' + message);
      if (err) console.error(err);
    }
    if (loglevel.level == CNST_LOGLEVEL.WARN.level) console.warn(loglevel.tag + ' ' + message);
    if (loglevel.level == CNST_LOGLEVEL.INFO.level) console.info(loglevel.tag + ' ' + message);
    if ((this.debug) && (loglevel.level == CNST_LOGLEVEL.DEBUG.level)) console.debug(loglevel.tag + ' ' + message);
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.sendSync('writeToLog', loglevel, CNST_SYSTEMLEVEL.ANGL, message, err);
    }
  }
  
  public async createNotification(type: any, message: string, errObj?: any): Promise<void> {
    let notification: PoNotification = {
       message: message
      ,orientation: PoToasterOrientation.Top
      ,duration: 4000
    };
    
    switch (type.level) {
      case (CNST_LOGLEVEL.ERROR.level):
        this._notificationService.error(notification);
        break;
      case (CNST_LOGLEVEL.INFO.level):
        this._notificationService.success(notification);
        break;
      case (CNST_LOGLEVEL.WARN.level):
        this._notificationService.warning(notification);
        break;
    }
  }
  
  get debugMode(): boolean {
    return this.debug
  }
  
  set debugMode(_debug: boolean) {
    this.debug = _debug;
  }
}