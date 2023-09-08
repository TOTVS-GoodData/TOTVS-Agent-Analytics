import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";

import { Observable, throwError } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

import { LoginService } from './login.service';
import { SessionService } from './session-service';
import { Utilities } from '../utilities/utilities';

@Injectable({providedIn: 'root'})
export class HttpService {

  constructor(
     private _http: HttpClient
    ,private _loginService: LoginService
    ,private _sessionService: SessionService
    ,private _utilities: Utilities
	) {}
  
  public get(url: string, options: any = {}) {
    options.headers = this._setHeaders(options.headers);
    return this._http.get(this._sessionService.SERVER + url, options)
      .pipe(catchError(error => {
        if (error.status === 401 || error.status === 0 || error.status == null) {
          return this._loginService.refreshLoginSection()
            .pipe(mergeMap(res => {
              options.headers = this._setHeaders(options.headers);
              return this._http.get(this._sessionService.SERVER + url, options);
            }));
        }
        return throwError(error);
      }));
  }
  
  public put(urn: string, body: any, options: any = {}) {
    options.headers = this._setHeaders(options.headers);
    return this._http.put(this._sessionService.SERVER + urn, body, options);
  }
  
  public post(urn: string, body: any, options: any = {}) {
    options.headers = this._setHeaders(options.headers);
    return this._http.post(this._sessionService.SERVER + urn, body, options);
  }
  
  public delete(urn: string, options: any = {}) {
    options.headers = this._setHeaders(options.headers);
    return this._http.delete(this._sessionService.SERVER + urn, options);
  }
  
  public patch(urn: string, options: any = {}) {
    options.headers = this._setHeaders(options.headers);
    return this._http.patch(this._sessionService.SERVER + urn, options);
  }
  
  private _setHeaders(headers: HttpHeaders) {
    if (!headers) {
      headers = this._utilities.getDefaultHeaders();
    }
    headers = this._utilities.addGoodDataHeaders(headers);
    
    return headers;
  }
}