import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, Navigation } from '@angular/router';

import { ElectronService } from 'ngx-electronyzer';

import { PoSelectOption } from '@po-ui/ng-components';

import { ModalService } from '../modal/modal.service';
import { LoginService } from '../service/login.service';
import { GoodDataService } from '../service/gooddata.service';
import { UserService } from '../service/user.service';
import { SessionService } from '../service/session-service';

import { Workspace, Database, GDWorkspace, GDProcess } from '../utilities/interfaces';
import { WorkspaceService } from '../workspace/workspace-service';

import { DatabaseService } from '../database/database-service';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { merge, switchMap, catchError, map } from 'rxjs/operators';

import { forkJoin, Observable, throwError, of } from 'rxjs';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

@Component({
  selector: 'app-workspace-add',
  templateUrl: './workspace-add.component.html',
  styleUrls: ['./workspace-add.component.css'],
})

export class WorkspaceAddComponent {
  public CNST_MESSAGES: any = {};
  protected _CNST_UPLOAD_URL: any;
  protected _CNST_DOMAIN: any;
  protected _CNST_MODALIDADE_CONTRATACAO: any;
  protected _CNST_ERP: any;
  protected _CNST_ORIGEM: any;
  protected _CNST_MODULO: any;
  protected _CNST_NO_OPTION_SELECTED: any;
  
  protected CNST_FIELD_NAMES: any[] = []
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
  protected lbl_name: string;
  
  protected lbl_edit: string;
  protected lbl_save: string;
  protected lbl_testConnection: string;
  protected lbl_loadWorkspaces: string;
  
  protected lbl_dbUsername: string;
  protected lbl_dbType: string;
  protected lbl_dbPassword: string;
  protected lbl_dbDriverClass: string;
  protected lbl_dbDriverPath: string;
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  
  protected lbl_title: string;
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
  protected listDatabase: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  private listExtensions: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  
  constructor(
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _electronService: ElectronService,
    private _utilities: Utilities,
    private _router: Router,
    private _translateService: TranslationService,
    private _modalService: ModalService,
    private _sessionService: SessionService,
    private _goodDataService: GoodDataService,
    private _loginService: LoginService
  ) {
    this._CNST_NO_OPTION_SELECTED = _constants.CNST_NO_OPTION_SELECTED;
    this._CNST_DOMAIN = _constants.CNST_DOMAIN;
    this._CNST_UPLOAD_URL = _constants.CNST_UPLOAD_URL;
    this._CNST_MODALIDADE_CONTRATACAO = _constants.CNST_MODALIDADE_CONTRATACAO;
    this._CNST_ORIGEM = _constants.CNST_ORIGEM;
    this.project.GDEnvironment = this._CNST_DOMAIN;
    this._CNST_MODULO = null;
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
    
    this._translateService.getTranslations([
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING_WORKSPACES', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING_WORKSPACES_OK', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING_WORKSPACES_ERROR', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING_PROCESSES', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING_PROCESSES_ERROR', []),
      new TranslationInput('DATABASES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('BUTTONS.GO_BACK', []),
      new TranslationInput('BUTTONS.SAVE', []),
      new TranslationInput('BUTTONS.EDIT', []),
      new TranslationInput('BUTTONS.TEST_CONNECTION', []),
      new TranslationInput('BUTTONS.LOAD_WORKSPACES', []),
      new TranslationInput('WORKSPACES.NEW_WORKSPACE', []),
      new TranslationInput('WORKSPACES.EDIT_WORKSPACE', []),
      new TranslationInput('WORKSPACES.TABLE.CONTRACT_TYPE', []),
      new TranslationInput('WORKSPACES.TABLE.CUSTOMER_CODE', []),
      new TranslationInput('WORKSPACES.TABLE.ERP', []),
      new TranslationInput('WORKSPACES.TABLE.MODULE', []),
      new TranslationInput('WORKSPACES.TABLE.SOURCE', []),
      new TranslationInput('WORKSPACES.TABLE.USERNAME', []),
      new TranslationInput('WORKSPACES.TABLE.ENVIRONMENT', []),
      new TranslationInput('WORKSPACES.TABLE.PASSWORD', []),
      new TranslationInput('WORKSPACES.TABLE.WORKSPACE', []),
      new TranslationInput('WORKSPACES.TABLE.UPLOAD_URL', []),
      new TranslationInput('WORKSPACES.TABLE.PROCESS', []),
      new TranslationInput('WORKSPACES.TABLE.GRAPH', []),
      new TranslationInput('WORKSPACES.TABLE.DATABASE', []),
      new TranslationInput('WORKSPACES.TABLE.NAME', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('WORKSPACES.MESSAGES.SAVE_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.VALIDATE', []),
      new TranslationInput('WORKSPACES.MESSAGES.PASSWORD_ENCRYPT', []),
      new TranslationInput('DATABASES.TABLE.USERNAME', []),
      new TranslationInput('DATABASES.TABLE.TYPE', []),
      new TranslationInput('DATABASES.TABLE.PASSWORD', []),
      new TranslationInput('DATABASES.TABLE.DRIVER_CLASS', []),
      new TranslationInput('DATABASES.TABLE.DRIVER_PATH', [])
    ]).subscribe((translations: any) => {
      this.lbl_edit = translations['BUTTONS.EDIT'];
      this.lbl_save = translations['BUTTONS.SAVE'];
      this.lbl_testConnection = translations['BUTTONS.TEST_CONNECTION'];
      this.lbl_loadWorkspaces = translations['BUTTONS.LOAD_WORKSPACES'];
      
      this.lbl_dbUsername = translations['DATABASES.TABLE.USERNAME'];
      this.lbl_dbType = translations['DATABASES.TABLE.TYPE'];
      this.lbl_dbPassword = translations['DATABASES.TABLE.PASSWORD'];
      this.lbl_dbDriverClass = translations['DATABASES.TABLE.DRIVER_CLASS'];
      this.lbl_dbDriverPath = translations['DATABASES.TABLE.DRIVER_PATH'];
      
      this.lbl_contractType = translations['WORKSPACES.TABLE.CONTRACT_TYPE'] + '*';
      this.lbl_contractCode = translations['WORKSPACES.TABLE.CUSTOMER_CODE'] + '*';
      this.lbl_erp = translations['WORKSPACES.TABLE.ERP'] + '*';
      this.lbl_module = translations['WORKSPACES.TABLE.MODULE'] + '*';
      this.lbl_source = translations['WORKSPACES.TABLE.SOURCE'] + '*';
      this.lbl_GDUsername = translations['WORKSPACES.TABLE.USERNAME'] + '*';
      this.lbl_GDEnvironment = translations['WORKSPACES.TABLE.ENVIRONMENT'] + '*';
      this.lbl_GDPassword = translations['WORKSPACES.TABLE.PASSWORD'] + '*';
      this.lbl_GDWorkspaceId = translations['WORKSPACES.TABLE.WORKSPACE'] + '*';
      this.lbl_GDWorkspaceUploadURL = translations['WORKSPACES.TABLE.UPLOAD_URL'] + '*';
      this.lbl_GDProcessId = translations['WORKSPACES.TABLE.PROCESS'];
      this.lbl_GDProcessGraph = translations['WORKSPACES.TABLE.GRAPH'];
      this.lbl_databaseId = translations['WORKSPACES.TABLE.DATABASE'] + '*';
      this.lbl_name = translations['WORKSPACES.TABLE.NAME'] + '*';
      
      this.CNST_FIELD_NAMES = [
        { key: 'contractType', value: translations['WORKSPACES.TABLE.CONTRACT_TYPE'] },
        { key: 'contractCode', value: translations['WORKSPACES.TABLE.CUSTOMER_CODE'] },
        { key: 'erp', value: translations['WORKSPACES.TABLE.ERP'] },
        { key: 'module', value: translations['WORKSPACES.TABLE.MODULE'] },
        { key: 'source', value: translations['WORKSPACES.TABLE.SOURCE'] },
        { key: 'GDUsername', value: translations['WORKSPACES.TABLE.USERNAME'] },
        { key: 'GDEnvironment', value: translations['WORKSPACES.TABLE.ENVIRONMENT'] },
        { key: 'GDPassword', value: translations['WORKSPACES.TABLE.PASSWORD'] },
        { key: 'GDWorkspaceId', value: translations['WORKSPACES.TABLE.WORKSPACE'] },
        { key: 'GDWorkspaceUploadURL', value: translations['WORKSPACES.TABLE.UPLOAD_URL'] },
        { key: 'GDProcessId', value: translations['WORKSPACES.TABLE.PROCESS'] },
        { key: 'GDProcessGraph', value: translations['WORKSPACES.TABLE.GRAPH'] },
        { key: 'databaseIdRef', value: translations['WORKSPACES.TABLE.DATABASE'] },
        { key: 'name', value: translations['WORKSPACES.TABLE.NAME'] }
      ];
      
      this.CNST_MESSAGES = {
        GOODDATA_LOADING: translations['SERVICES.GOODDATA.MESSAGES.LOADING'],
        GOODDATA_LOADING_ERROR: translations['SERVICES.GOODDATA.MESSAGES.LOADING_ERROR'],
        GOODDATA_LOADING_WORKSPACES: translations['SERVICES.GOODDATA.MESSAGES.LOADING_WORKSPACES'],
        GOODDATA_LOADING_WORKSPACES_OK: translations['SERVICES.GOODDATA.MESSAGES.LOADING_WORKSPACES_OK'],
        GOODDATA_LOADING_WORKSPACES_ERROR: translations['SERVICES.GOODDATA.MESSAGES.LOADING_WORKSPACES_ERROR'],
        GOODDATA_LOADING_PROCESSES: translations['SERVICES.GOODDATA.MESSAGES.LOADING_PROCESSES'],
        GOODDATA_LOADING_PROCESSES_ERROR: translations['SERVICES.GOODDATA.MESSAGES.LOADING_PROCESSES_ERROR'],
        DATABASE_LOADING_ERROR: translations['DATABASES.MESSAGES.LOADING_ERROR'],
        LOADING_ERROR: translations['WORKSPACES.MESSAGES.LOADING_ERROR'],
        SAVE_OK: translations['WORKSPACES.MESSAGES.SAVE_OK'],
        VALIDATE: translations['WORKSPACES.MESSAGES.VALIDATE'],
        PASSWORD_ENCRYPT: translations['WORKSPACES.MESSAGES.PASSWORD_ENCRYPT']
      };
      
      this.reloadDatabases().subscribe((res: boolean) => {
      }, (err: any) => {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.LOADING_ERROR);
      });
      
      this._sessionService.initSession();
      let nav: Navigation = this._router.getCurrentNavigation();
      if (nav.extras.state.id) {
        this.lbl_title = translations['WORKSPACES.EDIT_WORKSPACE'];
        this.editMode = true;
        this.project.GDWorkspaceId = nav.extras.state['GDWorkspaceId'];
        this.onChangeERP(nav.extras.state.erp);
        this.onChangeDatabase(nav.extras.state.databaseIdRef);
        
        Object.getOwnPropertyNames.call(Object, nav.extras.state).map((p: string) => {
          this.project[p] = nav.extras.state[p];
        });
        
        this.editPassword = nav.extras.state['GDPassword'];
        this.getProjects(this.project.GDUsername, this.project.GDPassword, this.project.GDEnvironment, false)
          .subscribe(() => {}, (err: any) => {
          this.po_lo_text = { value: null };
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.GOODDATA_LOADING_WORKSPACES_ERROR);
        });
      } else {
        this.lbl_title = translations['WORKSPACES.NEW_WORKSPACE'];
        this.editMode = false;
        this.project.contractType = nav.extras.state.contractType;
        this.project.contractCode = nav.extras.state.contractCode;
        this.listProjects = [];
        this.listProcess = [];
        this.listGraph = [];
      }
    });
  }
  
  protected onChangeContract(): void {
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
    this.po_lo_text = { value: this.CNST_MESSAGES.GOODDATA_LOADING };
    if ((this._electronService.isElectronApp) && (this.editMode) && (this.editPassword == password)) {
      password = this._electronService.ipcRenderer.sendSync('decrypt', password);
    }
    
    return this._loginService.doLogin(username, password, environment, rememberMe)
      .pipe(catchError(((err: any) => {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.GOODDATA_LOADING_ERROR, err);
        return throwError(err);
      })))
      .pipe(switchMap((b: boolean) => {
        this.po_lo_text = { value: this.CNST_MESSAGES.GOODDATA_LOADING_WORKSPACES };
        return this._goodDataService.init(this._sessionService.USER_ID, this.project.GDWorkspaceId)
          .pipe(catchError(((err: any) => {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.GOODDATA_LOADING_WORKSPACES_ERROR, err);
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
          
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.GOODDATA_LOADING_WORKSPACES_OK);
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
    this.po_lo_text = { value: this.CNST_MESSAGES.GOODDATA_LOADING_PROCESSES };
    return this._goodDataService.setCurrentProject(this.project.GDWorkspaceId)
      .pipe(catchError(((err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.GOODDATA_LOADING_PROCESSES_ERROR, err);
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
  
  protected onChangeDatabase(id: string): void {
    if (id != _constants.CNST_NO_OPTION_SELECTED.value) {
      this._databaseService.getDatabases().subscribe((db: Database[]) => {
        this.database = db.find((db: Database) => { return (db.id === id ); });
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.DATABASE_LOADING_ERROR);
      });
    } else {
      this.database = new Database();
    }
  }
  
  protected goToProjects(): void {
    this._router.navigate(['/workspace']);
  }
  
  private validProject(): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.VALIDATE);
    this.po_lo_text = { value: this.CNST_MESSAGES.VALIDATE };
    let workspace = new Workspace();
    
    // Todo processo de ETL precisa ter um graph preenchido. //
    if (this.project.GDProcessId != undefined) {
      workspace.GDProcessGraph = (workspace.GDProcessGraph != undefined ? workspace.GDProcessGraph : null);
    }
    
    // Regras de negócio do FAST Analytics //
    if (((this.project.contractType == 'FAST_1') || (this.project.contractType == 'FAST_2')) && ((this.project.erp == 'Datasul') || (this.project.erp == 'RM'))) {
      workspace.databaseIdRef = (workspace.databaseIdRef != undefined ? workspace.databaseIdRef : null);
    }
    
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, workspace).map((p: string) => {
      if ((this.project[p] == undefined) && (p != 'id')) return p;
    }).filter((p: string) => { return p != null; });
    
    // Validação dos campos de formulário //
    if (propertiesNotDefined.length > 0) {console.log(propertiesNotDefined[0]);
      this.po_lo_text = { value: null };
      let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
      return this._translateService.getTranslations([
        new TranslationInput('FORM_ERRORS.FIELD_NOT_FILLED', [fieldName]),
        new TranslationInput('FORM_ERRORS.FIELD_NOT_FILLED_GRAPH', [fieldName])
      ]).pipe(map((translations: any) => {
        if (propertiesNotDefined[0] == 'gdc_etl_graph') {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_NOT_FILLED_GRAPH']);
        } else {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_NOT_FILLED']);
        }
        return false;
      }));
    }
    
    // Validação das credenciais do GoodData //
    if ((this._electronService.isElectronApp) && (this.editMode) && (this.editPassword == this.project.GDPassword)) {
      this.project.GDPassword = this._electronService.ipcRenderer.sendSync('decrypt', this.project.GDPassword);
    }
    
    return this._loginService.doLogin(this.project.GDUsername, this.project.GDPassword, this.project.GDEnvironment, false);
  }
  
  protected saveProject(): Observable<void> {
    return this._translateService.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.SAVE', [this.project.name]),
      new TranslationInput('WORKSPACES.MESSAGES.SAVE_ERROR', [this.project.name]),
    ]).pipe(switchMap((translations: any) => {
      return this.validProject().pipe(switchMap((v: boolean) => {
        if (v) {
          if ((this._electronService.isElectronApp) && (this.editPassword != this.project.GDPassword)) {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.PASSWORD_ENCRYPT);
            this.po_lo_text = { value: this.CNST_MESSAGES.PASSWORD_ENCRYPT };
            this.project.GDPassword = this._electronService.ipcRenderer.sendSync('encrypt', this.project.GDPassword);
          }
          this.po_lo_text = { value: translations['WORKSPACES.MESSAGES.SAVE'] };
          return this._workspaceService.saveWorkspace(this.project).pipe(map((res: boolean) => {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.SAVE_OK);
            this.po_lo_text = { value: null };
            this.goToProjects();
          }, (err: any) => {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['WORKSPACES.MESSAGES.SAVE_ERROR'], err);
            this.po_lo_text = { value: null };
          }));
        }
      }));
    }));
  }
  
  protected openModalDatabase(): void {
    this.showModalDatabase = true;
    this._modalService.open('modal-database');
  }
  
  protected newModalDatabase(): void {
    this.database = new Database();
    this.project.databaseIdRef = this._CNST_NO_OPTION_SELECTED.value;
    this.openModalDatabase();
  }
  
  protected closeModalDatabase(newDatabase?: Database): void {
    this._modalService.close('modal-database');
    this.showModalDatabase = false;
    if (newDatabase) {
      this.reloadDatabases().subscribe((b: boolean) => {
        this.project.databaseIdRef = newDatabase.id;
        this.database = newDatabase;
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.DATABASE_LOADING_ERROR);
      });
    }
  }
  
  private testDatabaseConnection(): Observable<boolean> {
    return this._translateService.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.LOGIN', [this.database.name]),
    ]).pipe(switchMap((translations: any) => {
      this.po_lo_text = { value: translations['DATABASES.MESSAGES.LOGIN'] };
      return this._databaseService.testConnection(true, this.database).pipe(map((validate: boolean) => {
        this.po_lo_text = { value: null };
        return validate;
      }));
    }));
  }
  
  protected enterPassword(event: any): void {
    event.preventDefault();
    this.getProjects(this.project.GDUsername, this.project.GDPassword, this.project.GDEnvironment, false).subscribe();
  }
}
