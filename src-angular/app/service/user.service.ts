import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionService } from './session-service';
import { Utilities } from '../utilities/utilities';
import { Observable } from 'rxjs';

@Injectable()
export class UserService {

    //private baseUrl = 'https://analytics.totvs.com.br';
    private baseUrl = '/gooddata/';

    private httpOptions = {
        headers: new HttpHeaders( {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
          'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type,' +
                                          'Access-Control-Request-Method, Access-Control-Request-Headers'
        })
    };

    constructor( private http: HttpClient, private _sessionService: SessionService ,private _utilities: Utilities

 ) { }

    public login( user: string, password: string ) {

        const loginUrl = `${this.baseUrl}gdc/account/login`;
        const body = JSON.stringify( { postUserLogin: { login: user, password: password, remember: 1, verify_level: 2 } } );

        return this.http.post<UserLogin>( loginUrl, body, this.httpOptions );
    }
  
    public refreshToken(): Observable<any> {
    let headers: HttpHeaders = this._utilities.getDefaultHeaders();
    headers = this._utilities.addGoodDataHeaders(headers);
    //Refresh via headers
    return this.http.get(`${this.baseUrl}gdc/account/token`, { withCredentials: true, headers: headers, observe: 'response' });
  }
  
    public getProjects( profile: string ) {
    let headers: HttpHeaders = this._utilities.getDefaultHeaders();
    headers = this._utilities.addGoodDataHeaders(headers);

        const projectsUrl = `${this.baseUrl}gdc/account/profile/${profile}/projects`;

        return this.http.get( projectsUrl, { withCredentials: true, headers: headers, observe: 'response' });
    }

    public getProcess( idProject: string ) {

        const processUrl = `${this.baseUrl}/gdc/projects/${idProject}/dataload/processes`;

        return this.http.get( processUrl );
    }

    public getGraphs( process: string ) {

        return this.http.get( process );
    }

    public getProject( idProject: string ) {

        const projectUrl = `${this.baseUrl}/gdc/projects/${idProject}`;

        return this.http.get<any>( projectUrl );
    }

}

interface UserLogin {
    userLogin: { profile: string;
                 token: string;
                 state: string;
    };
}
