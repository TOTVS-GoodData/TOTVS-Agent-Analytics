import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor() {}
  
  public async initSession(): Promise<boolean> {
    return Promise.resolve(true);
  }
  
  public clear(): void {
    this._ENVIRONMENT = null;
    this._SERVER = null;
    this._USER_ID = null;
    this._TOKEN_TT = null;
    this._TOKEN_SST = null;
  }
  
  private _ENVIRONMENT: string;
  get ENVIRONMENT(): string {
    return this._ENVIRONMENT;
  }
  
  set ENVIRONMENT(env: string) {
    this._ENVIRONMENT = env;
    if (!environment.production) {
      this.SERVER = '/gooddata/';
    } else {
      this.SERVER = 'https://' + env + '/';
    }
  }
  
  private _SERVER: string;
  get SERVER(): string {
    return this._SERVER;
  }
  
  set SERVER(server: string) {
    this._SERVER = server;
  }
  
  private _USER_ID: string;
  get USER_ID(): string {
    return this._USER_ID;
  }
  
  set USER_ID(user_id: string) {
    this._USER_ID = user_id;
  }

  private _TOKEN_TT: string;
  get TOKEN_TT(): string {
    return this._TOKEN_TT;
  }
  
  set TOKEN_TT(token_tt: string) {
    this._TOKEN_TT = token_tt;
  }
  
  private _TOKEN_SST: string;
  get TOKEN_SST(): string {
    return this._TOKEN_SST;
  }
  
  set TOKEN_SST(token_sst: string) {
    this._TOKEN_SST = token_sst;
  }
}