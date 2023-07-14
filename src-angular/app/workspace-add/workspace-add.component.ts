import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, Navigation } from '@angular/router';

import { ElectronService } from 'ngx-electronyzer';

import { PoSelectOption } from '@po-ui/ng-components';

import { ModalService } from '../modal/modal.service';
import { LoginService } from '../service/login.service';
import { GoodDataService } from '../service/gooddata.service';
import { UserService } from '../service/user.service';
import { SessionService } from '../service/session-service';

import { Workspace, Database, Java, Parameter, GDWorkspace, GDProcess } from '../utilities/interfaces';
import { WorkspaceService } from '../workspace/workspace-service';
import { CNST_WORKSPACE_MESSAGES } from '../workspace/workspace-messages';
import { JavaService } from '../java/java-service';
import { CNST_JAVA_MESSAGES } from '../java/java-messages';

import { DatabaseService } from '../database/database-service';
import { CNST_DATABASE_MESSAGES } from '../database/database-messages';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { merge, switchMap, catchError } from 'rxjs/operators';

import { forkJoin, Observable, throwError } from 'rxjs';

const CNST_FIELD_NAMES: Array<any> = [
   { key: 'contractType', value: 'Modalidade de Contratação*' }
  ,{ key: 'contractCode', value: 'Código T do cliente*' }
  ,{ key: 'erp', value: 'ERP*' }
  ,{ key: 'module', value: 'Módulo*' }
  ,{ key: 'source', value: 'Origem dos dados*' }
  ,{ key: 'GDUsername', value: 'Usuário*' }
  ,{ key: 'GDEnvironment', value: 'Domínio*' }
  ,{ key: 'GDPassword', value: 'Senha*' }
  ,{ key: 'GDWorkspaceId', value: 'Ambiente*' }
  ,{ key: 'GDWorkspaceUploadURL', value: 'URL para upload do arquivo*' }
  ,{ key: 'GDProcessId', value: 'Id do processo de ETL*' }
  ,{ key: 'GDProcessGraph', value: 'Graph (CloudConnect)*' }
  ,{ key: 'databaseId', value: 'Banco de dados*' }
  ,{ key: 'javaId', value: 'Configuração*' }
  ,{ key: 'name', value: 'Nome desta configuração*' }
];

@Component({
  selector: 'app-workspace-add',
  templateUrl: './workspace-add.component.html',
  styleUrls: ['./workspace-add.component.css'],
})

export class WorkspaceAddComponent {
  
  @ViewChild('javaParams', { read: ElementRef }) javaParams: any;
  
  public CNST_MESSAGES: any = {
     PROJECT_VALIDATE: 'Validando informações do ambiente...'
    ,PROJECT_PASSWORD_ENCRYPT: 'Criptografando senhas...'
  };
  
  protected _CNST_FIELD_NAMES: any;
  protected _CNST_UPLOAD_URL: any;
  protected _CNST_DOMAIN: any;
  protected _CNST_MODALIDADE_CONTRATACAO: any;
  protected _CNST_ERP: any;
  protected _CNST_ORIGEM: any;
  protected _CNST_MODULO: any;
  protected _CNST_NO_OPTION_SELECTED: any;
  
  private po_grid_config = [ { property: 'value', label: 'Parâmetros', width: '100%'} ];
  
  protected project: Workspace = new Workspace();
  protected database: Database = new Database();
  private databaseObject: Database = null;
  
  /*************************************************/
  /* MAPEAMENTO DOS NOMES DOS CAMPOS DO FORMULÁRIO */
  /*************************************************/
  protected lbl_contractType: string;
  protected lbl_contractCode: string;
  protected lbl_erp: string;
  protected lbl_module: string;
  protected lbl_source: string;
  protected lbl_GDEnvironment: string;
  protected lbl_GDUsername: string;
  protected lbl_GDPassword: string;
  protected lbl_GDWorkspaceId: string;
  protected lbl_GDWorkspaceUploadURL: string;
  protected lbl_GDProcessId: string;
  protected lbl_GDProcessGraph: string;
  protected lbl_databaseId: string;
  protected lbl_javaId: string;
  protected lbl_name: string;
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  
  protected operation: string;
  protected po_lo_text: any = { value: null };
  protected showModalDatabase: boolean = false;
  protected showModalJava: boolean = false;
  private p_editMode: boolean = true;
  private g_editMode: boolean = true;
  private editMode: boolean;
  private editPassword: string = null;
  
  protected listProjects: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  protected listProcess: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  protected listGraph: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  protected listJava: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  protected listDatabase: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  private listExtensions: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  private listJavaParams: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  
  constructor(
     private _workspaceService: WorkspaceService
    ,private _javaService: JavaService
    ,private _databaseService: DatabaseService
    ,private _electronService: ElectronService
    ,private _utilities: Utilities
    ,private _router: Router
    ,private _modalService: ModalService
    ,private _sessionService: SessionService
    ,private _goodDataService: GoodDataService
    ,private _loginService: LoginService
  ) {
    this._CNST_FIELD_NAMES = CNST_FIELD_NAMES;
    this.lbl_contractType = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'contractType'; }).value;
    this.lbl_contractCode = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'contractCode'; }).value;
    this.lbl_erp = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'erp'; }).value;
    this.lbl_module = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'module'; }).value;
    this.lbl_source = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'source'; }).value;
    this.lbl_GDEnvironment = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'GDEnvironment'; }).value;
    this.lbl_GDUsername = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'GDUsername'; }).value;
    this.lbl_GDPassword = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'GDPassword'; }).value;
    this.lbl_GDWorkspaceId = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'GDWorkspaceId'; }).value;
    this.lbl_GDWorkspaceUploadURL = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'GDWorkspaceUploadURL'; }).value;
    this.lbl_GDProcessId = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'GDProcessId'; }).value;
    this.lbl_GDProcessGraph = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'GDProcessGraph'; }).value;
    this.lbl_databaseId = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'databaseId'; }).value;
    this.lbl_javaId = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'javaId'; }).value;
    this.lbl_name = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'name'; }).value;
    
    this._CNST_NO_OPTION_SELECTED = _constants.CNST_NO_OPTION_SELECTED;
    this._CNST_DOMAIN = _constants.CNST_DOMAIN;
    this._CNST_UPLOAD_URL = _constants.CNST_UPLOAD_URL;
    this._CNST_MODALIDADE_CONTRATACAO = _constants.CNST_MODALIDADE_CONTRATACAO;
    this._CNST_ORIGEM = _constants.CNST_ORIGEM;
    this._CNST_ERP = _constants.CNST_ERP.map((v) => {
      return { label: v.ERP, value: v.ERP };
    }).sort((v1: any, v2: any) => {
      if (v1.label < v2.label) {
        return -1;
      }
      if (v1.label > v2.label) {
        return 1;
      }
      return 0;
    });
    this.project.GDEnvironment = this._CNST_DOMAIN;
    this._CNST_MODULO = null;
       
    forkJoin([
      this.reloadDatabases(),
      this.reloadJavaConfigurations()
    ]).subscribe((results: [boolean, boolean]) => {
    }, (err: any) => {
      this.po_lo_text = { value: null };
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_WORKSPACE_MESSAGES.WORKSPACE_LOADING_ERROR);
    });
    
    this._sessionService.initSession();
    let nav: Navigation = this._router.getCurrentNavigation();
    if (nav.extras.state.id) {
      this.operation = 'Alterar Ambiente';
      this.editMode = true;
      this.project.GDWorkspaceId = nav.extras.state['GDWorkspaceId'];
      this.onChangeERP(nav.extras.state.erp);
      this.onChangeDatabase(nav.extras.state.databaseId);
      
      Object.getOwnPropertyNames.call(Object, nav.extras.state).map((p: string) => {
        this.project[p] = nav.extras.state[p];
      });
      
      this.editPassword = nav.extras.state['GDPassword'];
      this.getProjects(this.project.GDUsername, this.project.GDPassword, this.project.GDEnvironment, false)
        .subscribe(() => {}, (err: any) => {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this._goodDataService.CNST_MESSAGES.GOODDATA_LOADING_PROJECTS_ERROR);
      });
      this.onChangeJava(this.project.javaId);
    } else {
      this.operation = 'Cadastrar Ambiente';
      this.editMode = false;
      this.project.contractType = nav.extras.state.contractType;
      this.project.contractCode = nav.extras.state.contractCode;
      this.listProjects = [];
      this.listProcess = [];
      this.listGraph = [];
    }
  }
  
  protected onChangeContract(): void {
  }
  
  private reloadJavaConfigurations(): Observable<boolean> {
    return this._javaService.getJavaConfigurations().pipe(switchMap(((java: Java[]) => {
      this.listJava = java.map((j: Java) => {
        return { label: j.name, value: j.id };
      });
      this.listJava.push(_constants.CNST_NO_OPTION_SELECTED);
      return Promise.resolve(true);
    })));
  }
  
  
  private reloadDatabases(): Observable<boolean> {
    return this._databaseService.getDatabases().pipe(switchMap(((database: Database[]) => {
      this.listDatabase = database.map((db: Database) => {
        return { label: db.name, value: db.id };
      });
      this.listDatabase.push(_constants.CNST_NO_OPTION_SELECTED);
      return Promise.resolve(true);
    })));
  }
  
  protected getProjects(username: string, password: string, environment: string, rememberMe: boolean): Observable<boolean> {
    this.po_lo_text = { value: this._goodDataService.CNST_MESSAGES.GOODDATA_LOADING };
    if ((this._electronService.isElectronApp) && (this.editMode) && (this.editPassword == password)) {
      password = this._electronService.ipcRenderer.sendSync('decrypt', password);
    }
    
    return this._loginService.doLogin(username, password, environment, rememberMe)
      .pipe(catchError(((err: any) => {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this._goodDataService.CNST_MESSAGES.GOODDATA_LOADING_ERROR, err);
        return throwError(err);
      })))
      .pipe(switchMap((b: boolean) => {
        this.po_lo_text = { value: this._goodDataService.CNST_MESSAGES.GOODDATA_LOADING_PROJECTS };
        return this._goodDataService.init(this._sessionService.USER_ID, this.project.GDWorkspaceId)
          .pipe(catchError(((err: any) => {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this._goodDataService.CNST_MESSAGES.GOODDATA_LOADING_PROJECTS_ERROR, err);
            this.po_lo_text = { value: null };
            return throwError(err);
          })))
          .pipe(switchMap((b: boolean) => {
            this.listProjects = this._goodDataService.AVAILABLE_PROJECTS.map((w: GDWorkspace) => {
            return { label: w.name + ' - ' + w.id, value: w.id }
          });
          if (this._goodDataService.CURRENT_PROJECT === undefined) {
            this.project.GDWorkspaceId = undefined;
            this.project.GDProcessId = undefined;
            this.project.GDProcessGraph = undefined;
            
            this.listProcess = [];
            this.listGraph = [];
          } else {
            this.listProcess = this._goodDataService.CURRENT_PROJECT.processes.map((p: GDProcess) => {
              return { label: p.name + ' - ' + p.id, value: p.id }
            });
            
            if (this.project.GDProcessId != undefined) {
              this.listGraph = this._goodDataService.CURRENT_PROJECT.processes.find((p: any) => { return this.project.GDProcessId === p.id }).graphs.map((g: string) => {
                return { label: g, value: g }
              });
            }
          }
          
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this._goodDataService.CNST_MESSAGES.GOODDATA_LOADING_PROJECTS_OK);
          this.po_lo_text = { value: null };
          return Promise.resolve(true);
        }));
    }));
  }
  
  protected onChangeERP(e: string): void {
    this._CNST_MODULO = _constants.CNST_ERP.filter((v: any) => v.ERP === e)[0].Modulos.sort((m1: any, m2: any) => {
      if (m1.label < m2.label) {
        return -1;
      }
      if (m1.label > m2.label) {
        return 1;
      }
      return 0;
    });
    
    if (this._CNST_MODULO.length == 1) {
      this.project.module = this._CNST_MODULO[0].value;
    } else {
      this.project.module = null;
    }
  }
  
  protected onChangeProject(): Observable<boolean> {
    this.po_lo_text = { value: this._goodDataService.CNST_MESSAGES.GOODDATA_LOADING_PROCESSES };
    return this._goodDataService.setCurrentProject(this.project.GDWorkspaceId)
      .pipe(catchError(((err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this._goodDataService.CNST_MESSAGES.GOODDATA_LOADING_PROCESSES_ERROR, err);
        this.po_lo_text = { value: null };
        return throwError(err);
      })))
      .pipe(switchMap((b: boolean) => {
        this.listProcess = this._goodDataService.CURRENT_PROJECT.processes.map((p: GDProcess) => {
          return { label: p.name + ' - ' + p.id, value: p.id }
      });
      this.project.name = this._goodDataService.CURRENT_PROJECT.name;
      if ((this.p_editMode) && (this.editMode)) {
        this.p_editMode = false;
      } else {
        this.project.GDProcessId = undefined;
        this.project.GDProcessGraph = undefined;
        this.listGraph = [];
      }
      this.project.GDWorkspaceUploadURL = this._CNST_UPLOAD_URL + 'project-uploads/' + this.project.GDWorkspaceId + '/today/';
      this.po_lo_text = { value: null };
      
      return Promise.resolve(true);
    }));
  }
  
  protected onChangeProcess(): void {
    if ((this.g_editMode) && (this.editMode)) {
      this.g_editMode = false;
    } else {
      this.project.GDProcessGraph = undefined;
      this.listGraph = this._goodDataService.CURRENT_PROJECT.processes.find((p: GDProcess) => { return this.project.GDProcessId === p.id }).graphs.map((g: string) => {
      return { label: g, value: g }
    });
    }
  }
  
  protected onChangeDatabase(id: number): void {
    if (id != _constants.CNST_NO_OPTION_SELECTED.value) {
      this._databaseService.getDatabases().subscribe((db: Database[]) => {
        this.database = db.find((db: Database) => { return (db.id === id ); });
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_DATABASE_MESSAGES.DATABASE_LOADING_ERROR);
      });
    } else {
      this.database = new Database();
    }
  }
  
  protected onChangeJava(id: number): void {
    if (id != _constants.CNST_NO_OPTION_SELECTED.value) {
      this._javaService.getJavaConfigurations().subscribe((j: Java[]) => {
        this.listJavaParams = j.find((j: Java) => { return (j.id === id ); }).parameters.map((p: Parameter) => {
          return { label: p.value, value: p.value };
        });
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_JAVA_MESSAGES.JAVA_LOADING_ERROR);
      });
    } else {
    }
  }
  
  protected goToProjects(): void {
    this._router.navigate(['/workspace']);
  }
  
  private validProject(): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.PROJECT_VALIDATE);
    this.po_lo_text = { value: this.CNST_MESSAGES.PROJECT_VALIDATE };
    let workspace = new Workspace();
    
    // Todo processo de ETL precisa ter um graph preenchido. //
    if (this.project.GDProcessId != undefined) {
      workspace.GDProcessGraph = (workspace.GDProcessGraph != undefined ? workspace.GDProcessGraph : null);
    }
    
    // Regras de negócio do FAST Analytics //
    if (((this.project.contractType == 'FAST_1') || (this.project.contractType == 'FAST_2')) && ((this.project.erp == 'Datasul') || (this.project.erp == 'RM'))) {
      workspace.databaseId = (workspace.databaseId != undefined ? workspace.databaseId : null);
    }
    
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, workspace).map((p: string) => {
      if ((this.project[p] == undefined) && (p != 'id')) return p;
    }).filter((p: string) => { return p != null; });
    
    // Validação dos campos de formulário //
    if (propertiesNotDefined.length > 0) {
      this.po_lo_text = { value: null };
      if (propertiesNotDefined[0] == 'gdc_etl_graph') {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, 'Campo obrigatório "' + this._CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value + '" não preenchido. Por favor selecione um graph para ser executado, ou remova a seleção do campo "' + this._CNST_FIELD_NAMES.find((f: any) => { return f.key === 'gdc_etl_process_url'}).value + '".');
      } else {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, 'Campo obrigatório "' + this._CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value + '" não preenchido.');
      }
      
      return new Observable((obs) => { obs.error(false); });
    }
    
    // Validação das credenciais do GoodData //
    if ((this._electronService.isElectronApp) && (this.editMode) && (this.editPassword == this.project.GDPassword)) {
      this.project.GDPassword = this._electronService.ipcRenderer.sendSync('decrypt', this.project.GDPassword);
    }
    return this._loginService.doLogin(this.project.GDUsername, this.project.GDPassword, this.project.GDEnvironment, false)
      .pipe(switchMap((b: boolean) => {
      return Promise.resolve(b);
    }));
  }
  
  protected saveProject(): void {
    this.validProject().subscribe((v: boolean) => {
      if (v) {
        if ((this._electronService.isElectronApp) && (this.editPassword != this.project.GDPassword)) {
          this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.PROJECT_PASSWORD_ENCRYPT);
          this.po_lo_text = { value: this.CNST_MESSAGES.PROJECT_PASSWORD_ENCRYPT };
          this.project.GDPassword = this._electronService.ipcRenderer.sendSync('encrypt', this.project.GDPassword);
        }
        this.po_lo_text = { value: CNST_WORKSPACE_MESSAGES.WORKSPACE_SAVE };
        this._workspaceService.saveWorkspace(this.project).subscribe((res: boolean) => {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, CNST_WORKSPACE_MESSAGES.WORKSPACE_SAVE_OK);
          this.po_lo_text = { value: null };
          this.goToProjects();
        }, (err: any) => {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_WORKSPACE_MESSAGES.WORKSPACE_SAVE_ERROR, err);
          this.po_lo_text = { value: null };
        });
      }
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_WORKSPACE_MESSAGES.WORKSPACE_SAVE_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  protected openModalDatabase(): void {
    this.showModalDatabase = true;
    this._modalService.open('modal-database');
  }
  
  protected newModalDatabase(): void {
    this.database = new Database();
    this.project.databaseId = this._CNST_NO_OPTION_SELECTED.value;
    this.openModalDatabase();
  }
  
  protected closeModalDatabase(newDatabase?: Database): void {
    this._modalService.close('modal-database');
    this.showModalDatabase = false;
    if (newDatabase) {
      this.reloadDatabases().subscribe((b: boolean) => {
        this.project.databaseId = newDatabase.id;
        this.database = newDatabase;
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_DATABASE_MESSAGES.DATABASE_LOADING_ERROR);
      });
    }
  }
  
  private testDatabaseConnection(): boolean {
    this.po_lo_text = { value: CNST_DATABASE_MESSAGES.DATABASE_LOGIN };
    let b: boolean = this._databaseService.testConnection(true, this.database);
    this.po_lo_text = { value: null };
    return b;
  }
  
  protected openModalJava(): void {
    this.showModalJava = true;
    this._modalService.open('modal-java');
  }
  
  protected closeModalJava(newJava?: Java): void {
    this._modalService.close('modal-java');
    this.showModalJava = false;
    if (newJava) {
      this.reloadJavaConfigurations().subscribe((b: boolean) => {
        this.project.javaId = newJava.id;
        this.listJavaParams = newJava.parameters.map((p: Parameter) => {
          return { label: p.value, value: p.value };
        });
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_JAVA_MESSAGES.JAVA_LOADING_ERROR);
      });
    }
  }
  
  protected enterPassword(event: any): void {
    event.preventDefault();
    this.getProjects(this.project.GDUsername, this.project.GDPassword, this.project.GDEnvironment, false).subscribe();
  }
}
