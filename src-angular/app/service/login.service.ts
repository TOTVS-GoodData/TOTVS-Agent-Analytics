import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { switchMap, mergeMap, map, catchError } from 'rxjs/operators';

import { SessionService } from './session-service';
import { Utilities } from '../utilities/utilities';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(
     private _http: HttpClient
    ,private _sessionService: SessionService
    ,private _utilities: Utilities
  ) {}
  
  public doLogin(user: string, password: string, env: string, rememberMe: boolean): Observable<boolean> {
    let payload = {
      postUserLogin: {
         login: user
        ,password: password
        ,remember: rememberMe
        ,verify_level: 2
      }
    };
    
    // Devemos assinalar o alias que está sendo usado utilizado antes de tentar o login,
    // para que o session service defina o servidor que devera realizar o login
    this._sessionService.ENVIRONMENT = env;
    
    let headers: HttpHeaders = this._utilities.getDefaultHeaders();
    return this._http.post(this._sessionService.SERVER + 'gdc/account/login', payload, { withCredentials: true, headers: headers, observe: 'response' })
    .pipe(switchMap((res2: any) => {
      this._sessionService.USER_ID = res2.body.userLogin.profile.replace('/gdc/account/profile/', '');
      this._sessionService.TOKEN_SST = res2.body.userLogin.token;
      return this.refreshLoginSection();
    }), catchError((authError: any) => {
      this._utilities.createNotification('ERR', authError.error.message);
      throw(authError);
    }));
  }
  
  private refreshToken(): Observable<any> {
    let headers: HttpHeaders = this._utilities.getDefaultHeaders();
    headers = this._utilities.addGoodDataHeaders(headers);
    return this._http.get(this._sessionService.SERVER + 'gdc/account/token', { withCredentials: true, headers: headers, observe: 'response' });
  }
  
  public refreshLoginSection(): Observable<boolean> {
    return this.refreshToken().pipe(switchMap((res2: any) => {
      this._sessionService.TOKEN_TT = res2.body.userToken.token;
      return Promise.resolve(true);
    }), catchError((authError: any) => {
      return Promise.resolve(false);
    }));
  }
}