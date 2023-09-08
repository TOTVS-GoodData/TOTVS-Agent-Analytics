import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { merge, flatMap, map, switchMap, mergeMap } from 'rxjs/operators';

import { HttpService } from './http.service';

import { environment } from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class GoodDataService {
  private url: string;
  
  public CNST_MESSAGES: any = {
     GOODDATA_LOADING: 'Fazendo login na plataforma GoodData...'
    ,GOODDATA_LOADING_ERROR: 'Falha no login. Por favor, verifique seu usuário / senha.'
    ,GOODDATA_LOADING_PROJECTS: 'Login bem sucedido. Carregando ambientes...'
    ,GOODDATA_LOADING_PROJECTS_OK: 'Ambientes carregados com sucesso!'
    ,GOODDATA_LOADING_PROJECTS_ERROR: 'Não foi possível se conectar ao GoodData. Verifique sua conexão e tente novamente.'
    ,GOODDATA_LOADING_PROCESSES: 'Carregando processos de ETL...'
    ,GOODDATA_LOADING_PROCESSES_ERROR: 'Não foi possível se conectar ao GoodData. Verifique sua conexão e tente novamente.'
  };
  
  constructor( private _httpService: HttpService ) {
  }
  
  public init(profile_id: string,  current_project_id: string): Observable<boolean> {
    return this.getProjects(profile_id).pipe(mergeMap((workspaces: GDWorkspace[]) => {
      this.AVAILABLE_PROJECTS = workspaces;
      this._CURRENT_PROJECT = this.AVAILABLE_PROJECTS.find((w: GDWorkspace) => { return w.id === current_project_id});
      if (this._CURRENT_PROJECT != undefined) {
        return this.updateProjectTree().pipe(map((res) => {
          return res;
        }));
      } else {
        return Promise.resolve(true);
      }
    }));
  }
  
  private updateProjectTree(): Observable<boolean> {
    return this._CURRENT_PROJECT.ob_processes.pipe(switchMap((p: Array<GDProcess>) => {
      this._CURRENT_PROJECT.processes = p;
      return Promise.resolve(true);
    }));
  }
  
  private getProjects(profile_id: string): Observable<GDWorkspace[]> {
    let url: string = 'gdc/account/profile/' + profile_id + '/projects';
    return this._httpService.get(url, { withCredentials: true })
      .pipe(map((res: any) => {
        let projects: GDWorkspace[] = res.projects.map((project: any) => {
          let id: string = project.project.links.self.replace('/gdc/projects/', '');
          return {
             id: id
            ,name: project.project.meta.title
            ,description: project.project.meta.summary
            ,ob_processes: this.getProcesses(id)
            ,processes: []
          }
        });
        return projects;
    }));
  }
  
  public getProcesses(project_id: string): Observable<GDProcess[]> {
    let url: string = 'gdc/projects/' + project_id + '/dataload/processes';
    return this._httpService.get(url, { withCredentials: true })
      .pipe(map((res: any) => {
        let processes: GDProcess[] = res.processes.items.map((p: any) => {
          return {
             id: p.process.links.self.replace('/gdc/projects/' + project_id + '/dataload/processes/', '')
            ,url: p.process.links.self
            ,name: p.process.name
            ,graphs: p.process.graphs.map((g: any) => {
              return g.replace(p.process.name,'');
              })
            ,type: p.process.type
          }
        });
        return processes;
    }));
  }
  
  public setCurrentProject(id: string): Observable<boolean> {
    this._CURRENT_PROJECT = this._AVAILABLE_PROJECTS.find((w: GDWorkspace) => { return w.id === id });
    return this.updateProjectTree().pipe(map((res: boolean) => {
      return res;
    }));
  }
  
  private _CURRENT_PROJECT: GDWorkspace;
  get CURRENT_PROJECT(): GDWorkspace {
    return this._CURRENT_PROJECT;
  }
  
  set CURRENT_PROJECT(current_project: GDWorkspace) {
    this._CURRENT_PROJECT = current_project;
  }
  
  private _AVAILABLE_PROJECTS: GDWorkspace[];
  get AVAILABLE_PROJECTS(): GDWorkspace[] {
    return this._AVAILABLE_PROJECTS;
  }
  
  set AVAILABLE_PROJECTS(availableProjects: GDWorkspace[]) {
    this._AVAILABLE_PROJECTS = availableProjects;
  }
}

export class GDWorkspace {
  id: string;
  name: string;
  description: string;
  ob_processes: Observable<GDProcess[]>;
  processes: GDProcess[];
}

export class GDProcess {
  id: string;
  url: string;
  name: string;
  graphs: string[];
  type: string;
}