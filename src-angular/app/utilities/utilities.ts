/* Componentes padrões do Angular */
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

/* Componentes visuais da biblioteca Portinari.UI */
import {
  PoNotificationService,
  PoNotification,
  PoToasterOrientation
} from '@po-ui/ng-components';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Serviço de sessão do Agent */
import { SessionService } from '../services/session-service';

/* Constantes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL, CNST_LOCALHOST_PORT } from './utilities-constants';

@Injectable({
  providedIn: 'root'
})
export class Utilities {
  
  //Define se o modo debug está ativado, ou não (via serviço de configuração)
  private debug: boolean = false;
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _electronService: ElectronService,
    private _sessionService: SessionService,
    private _notificationService: PoNotificationService
  ) { this.debug = true; }
  
  /* Método que retorna a URL de comunicação com a API do Angular (Apenas em modo desenv.) */
  public getLocalhostURL(): string {
    return 'http://localhost:' + CNST_LOCALHOST_PORT;
  }
  
  /* Método de inclusão dos cabeçalhos padrões das requisições http */
  public getDefaultHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-type', 'application/json');
    headers = headers.append('X-PO-No-Message', 'true');
    return headers;
  }
  
  /* Método de inclusão dos cabeçalhos de autenticação da plataforma GoodData */
  public addGoodDataHeaders(headers: HttpHeaders): HttpHeaders {
    if (this._sessionService.TOKEN_SST != undefined) { headers = headers.append('X-GDC-AuthSST', this._sessionService.TOKEN_SST); }
    if (this._sessionService.TOKEN_TT != undefined) { headers = headers.append('X-GDC-AuthTT', this._sessionService.TOKEN_TT); }
    return headers;
  }
  
  /* Método de escrita de mensagens de log para o usuário */
  public writeToLog(loglevel: any, message: string, err?: any): void {
    
    //Escrita da mensagem de log, via prompt de comando
    if (loglevel.level == CNST_LOGLEVEL.ERROR.level) {
      console.error(loglevel.tag + ' ' + message);
      if (err) console.error(err);
    }
    if (loglevel.level == CNST_LOGLEVEL.WARN.level) console.warn(loglevel.tag + ' ' + message);
    if (loglevel.level == CNST_LOGLEVEL.INFO.level) console.info(loglevel.tag + ' ' + message);
    if ((this.debug) && (loglevel.level == CNST_LOGLEVEL.DEBUG.level)) console.debug(loglevel.tag + ' ' + message);
    
    //Redirecionamento da requisição p/ Electron (caso disponível), para gravar a mensagem de log em arquivo local
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.sendSync('AC_writeToLog', loglevel, CNST_SYSTEMLEVEL.ANGL, message, err);
    }
  }
  
  /* Método de criação da popup de notificações para o usuário */
  public async createNotification(type: any, message: string, errObj?: any): Promise<void> {
    
    //Criação do objeto de popup
    let notification: PoNotification = {
       message: (errObj != null ? errObj : message)
      ,orientation: PoToasterOrientation.Top
      ,duration: 4000
    };
    
    //Renderização da popup, de acordo com o tipo de mensagem
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
  
  /* Método GET do modo debug */
  get debugMode(): boolean {
    return this.debug
  }
  
  /* Método SET do modo debug */
  set debugMode(_debug: boolean) {
    this.debug = _debug;
  }
}
