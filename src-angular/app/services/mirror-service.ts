/* Componentes padrões do Angular */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

@Injectable({
  providedIn: 'root'
})
export class MirrorService {
  /**************************/
  /*** MÉTODOS DO SERVIÇO ***/
  /**************************/
  constructor(
    private _electronService: ElectronService
  ) {}
  
  /* Método de consulta do acesso remoto (MirrorMode) */
  public getMirrorMode(): number {
    if (this._electronService.isElectronApp) {
      return this._electronService.ipcRenderer.sendSync('AC_getMirrorMode');
    } else {
      return 0;
    }
  }
}
