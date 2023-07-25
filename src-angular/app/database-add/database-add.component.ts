import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, Navigation } from '@angular/router';

import { ElectronService } from 'ngx-electronyzer';

import { WorkspaceService } from '../workspace/workspace-service';
import { Database } from '../utilities/interfaces';
import { DatabaseService } from '../database/database-service';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

import { Observable, of, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-database-add',
  templateUrl: './database-add.component.html',
  styleUrls: ['./database-add.component.css']
})
export class DataBaseAddComponent {
  
  @Input() modal: boolean = false;
  @Input() databaseObject: Database = null;
  @Output() closeModal: EventEmitter<Database> = new EventEmitter<Database>();
  
  public CNST_MESSAGES: any = {};
  protected CNST_FIELD_NAMES: Array<any> = [];
  
  /*************************************************/
  /* MAPEAMENTO DOS NOMES DOS CAMPOS DO FORMULÁRIO */
  /*************************************************/
  protected lbl_name: string;
  protected lbl_type: string;
  protected lbl_driverClass: string;
  protected lbl_driverPath: string;
  protected lbl_ipType: string;
  protected lbl_ip: string;
  protected lbl_port: string;
  protected lbl_db_databaseName: string;
  protected lbl_instance: string;
  protected lbl_connectionString: string;
  protected lbl_username: string;
  protected lbl_password: string;
  protected lbl_testConnection: string;
  protected lbl_save: string;
  protected lbl_goBack: string;
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  protected _CNST_DATABASE_PORT_REGEX: any;
  protected _CNST_DATABASE_IPTYPES: any;
  protected _CNST_DATABASE_TYPES: any;
  protected lbl_title: string;
  protected po_lo_text: any = { value: null };
  protected database: Database = new Database();
  protected db_databaseName: string = null;
  protected editPassword: string = null;
  protected regexPattern: string = null;
  
  constructor(
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _electronService: ElectronService,
    private _translateService: TranslationService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    this._CNST_DATABASE_PORT_REGEX = _constants.CNST_DATABASE_PORT_REGEX;
    this._CNST_DATABASE_IPTYPES = _constants.CNST_DATABASE_IPTYPES.map((db: any) => {
      return { label: db.label, value: db.value }
    });
      
    this._CNST_DATABASE_TYPES = _constants.CNST_DATABASE_TYPES.map((db: any) => {
      return { label: db.label, value: db.value }
    });
      
    this._translateService.getTranslations([
      new TranslationInput('BUTTONS.TEST_CONNECTION', []),
      new TranslationInput('BUTTONS.GO_BACK', []),
      new TranslationInput('BUTTONS.SAVE', []),
      new TranslationInput('DATABASES.NEW_DATABASE', []),
      new TranslationInput('DATABASES.EDIT_DATABASE', []),
      new TranslationInput('DATABASES.TABLE.NAME', []),
      new TranslationInput('DATABASES.TABLE.TYPE', []),
      new TranslationInput('DATABASES.TABLE.DRIVER_CLASS', []),
      new TranslationInput('DATABASES.TABLE.DRIVER_PATH', []),
      new TranslationInput('DATABASES.TABLE.HOST_TYPE', []),
      new TranslationInput('DATABASES.TABLE.HOST_NAME', []),
      new TranslationInput('DATABASES.TABLE.PORT', []),
      new TranslationInput('DATABASES.TABLE.DATABASE', []),
      new TranslationInput('DATABASES.TABLE.SID', []),
      new TranslationInput('DATABASES.TABLE.SERVICE_NAME', []),
      new TranslationInput('DATABASES.TABLE.INSTANCE', []),
      new TranslationInput('DATABASES.TABLE.CONNECTION_STRING', []),
      new TranslationInput('DATABASES.TABLE.USERNAME', []),
      new TranslationInput('DATABASES.TABLE.PASSWORD', []),
      new TranslationInput('DATABASES.TABLE.INSTANCE', []),
      new TranslationInput('DATABASES.MESSAGES.SAVE_OK', []),
      new TranslationInput('DATABASES.MESSAGES.VALIDATE', [])
    ]).subscribe((translations: any) => {
      this.lbl_testConnection = translations['BUTTONS.TEST_CONNECTION'];
      this.lbl_goBack = translations['BUTTONS.GO_BACK'];
      this.lbl_save = translations['BUTTONS.SAVE'];
      
      this.lbl_name = translations['DATABASES.TABLE.NAME'] + '*';
      this.lbl_type = translations['DATABASES.TABLE.TYPE'] + '*';
      this.lbl_driverClass = translations['DATABASES.TABLE.DRIVER_CLASS'] + '*';
      this.lbl_driverPath = translations['DATABASES.TABLE.DRIVER_PATH'] + '*';
      this.lbl_ipType = translations['DATABASES.TABLE.HOST_TYPE'] + '*';
      this.lbl_ip = translations['DATABASES.TABLE.HOST_NAME'] + '*';
      this.lbl_port = translations['DATABASES.TABLE.PORT'] + '*';
      this.lbl_db_databaseName = translations['DATABASES.TABLE.DATABASE'] + '*';
      this.lbl_instance = translations['DATABASES.TABLE.INSTANCE'];
      this.lbl_connectionString = translations['DATABASES.TABLE.CONNECTION_STRING'] + '*';
      this.lbl_username = translations['DATABASES.TABLE.USERNAME'] + '*';
      this.lbl_password = translations['DATABASES.TABLE.PASSWORD'] + '*';
      
      this.CNST_FIELD_NAMES = [
        { key: 'name', value: translations['DATABASES.TABLE.NAME'] },
        { key: 'type', value: translations['DATABASES.TABLE.TYPE'] },
        { key: 'driverClass', value: translations['DATABASES.TABLE.DRIVER_CLASS'] },
        { key: 'driverPath', value: translations['DATABASES.TABLE.DRIVER_PATH'] },
        { key: 'ip', value: translations['DATABASES.TABLE.HOST_NAME'] },
        { key: 'ipType', value: translations['DATABASES.TABLE.HOST_TYPE'] },
        { key: 'port', value: translations['DATABASES.TABLE.PORT'] },
        { key: 'db_databaseName', value: translations['DATABASES.TABLE.DATABASE'] },
        { key: 'instance', value: translations['DATABASES.TABLE.INSTANCE'] },
        { key: 'connectionString', value: translations['DATABASES.TABLE.CONNECTION_STRING'] },
        { key: 'username', value: translations['DATABASES.TABLE.USERNAME'] },
        { key: 'password', value: translations['DATABASES.TABLE.PASSWORD'] }
      ];
      
      this.CNST_MESSAGES = {
        SAVE_OK: translations['DATABASES.MESSAGES.SAVE_OK'],
        VALIDATE: translations['DATABASES.MESSAGES.VALIDATE'],
        ERROR_INVALID_IP: translations['DATABASES.MESSAGES.ERROR_INVALID_IP'],
        ERROR_INVALID_PORT: translations['DATABASES.MESSAGES.ERROR_INVALID_PORT'],
        PASSWORD_ENCRYPT: translations['DATABASES.MESSAGES.PASSWORD_ENCRYPT']
      };
      
      let nav: Navigation = this._router.getCurrentNavigation();
      if ((nav != undefined) && (nav.extras.state)) {
        Object.getOwnPropertyNames.call(Object, nav.extras.state).map((p: string) => {
          this.database[p] = nav.extras.state[p];
        });
      }
      this.regexPattern = (this.database.ipType ? _constants.CNST_DATABASE_IPTYPES.find((db: any) => {
        return (db.value == this.database.ipType)
      }).pattern : null);
      if (this.database.id != null) {
        this.lbl_title = translations['DATABASES.EDIT_DATABASE'];
        this.editPassword = this.database.password;
        switch(this.database.type) {
        case 'Oracle_SID':
          this.lbl_db_databaseName = translations['DATABASES.TABLE.SID'] + '*';
          break;
        case 'Oracle_ServiceName':
          this.lbl_db_databaseName = translations['DATABASES.TABLE.SERVICE_NAME'] + '*';
          break;
        default:
          this.lbl_db_databaseName = translations['DATABASES.TABLE.DATABASE'] + '*';
          break;
        }
      } else {
        this.lbl_title = translations['DATABASES.NEW_DATABASE'];
        this.editPassword = null;
      }
    });
  }
  
  protected ngOnChanges(): void {
    if (this.databaseObject) {
      this.database = this.databaseObject;
      this.editPassword = this.database.password;
    }
  }
  
  protected onChangeDatabaseType(driver: string): void {
    this.database.driverClass = _constants.CNST_DATABASE_TYPES.find((db: any) => { return db.value == driver }).driverClass;
    this.database.driverPath = _constants.CNST_DATABASE_TYPES.find((db: any) => { return db.value == driver }).driverPath;
    this.database.port = _constants.CNST_DATABASE_TYPES.find((db: any) => { return db.value == driver }).defaultPort;
    this.setDatabaseName(null);
    this.updateConnectionString();
    
    this._translateService.getTranslations([
      new TranslationInput('DATABASES.TABLE.SID', []),
      new TranslationInput('DATABASES.TABLE.SERVICE_NAME', []),
      new TranslationInput('DATABASES.TABLE.DATABASE', [])
    ]).subscribe((translations: any) => {
      switch(this.database.type) {
        case 'Oracle_SID':
          this.lbl_db_databaseName = translations['DATABASES.TABLE.SID'] + '*';
          this.CNST_FIELD_NAMES.find((field: any) => (field.key == 'db_databaseName')).value = translations['DATABASES.TABLE.SID'];
          break;
        case 'Oracle_ServiceName':
          this.lbl_db_databaseName = translations['DATABASES.TABLE.SERVICE_NAME'] + '*';
          this.CNST_FIELD_NAMES.find((field: any) => (field.key == 'db_databaseName')).value = translations['DATABASES.TABLE.SERVICE_NAME'];
          break;
        default:
          this.lbl_db_databaseName = translations['DATABASES.TABLE.DATABASE'] + '*';
          this.CNST_FIELD_NAMES.find((field: any) => (field.key == 'db_databaseName')).value = translations['DATABASES.TABLE.DATABASE'];
          break;
      }
    });
  }
  
  protected setDatabaseName(db: string): void {
    this.updateConnectionString();
  }
  
  protected updateIpRegexPattern(): void {
    this.regexPattern = _constants.CNST_DATABASE_IPTYPES.find((db: any) => {
      return (db.value == this.database.ipType)
    }).pattern;
  }
  
  private updateConnectionString(): void {
    let driverConnectionString = _constants.CNST_DATABASE_TYPES.find((db: any) => { return db.value == this.database.type }).driverConnectionString;
    
    this.database.ip = (this.database.ip == null ? null : this.database.ip.replace(/\s+/g, ''));
    this.database.port = (this.database.port == null ? null : this.database.port.replace(/\s+/g, ''));
    this.database.db_databaseName = (this.database.db_databaseName == null ? null : this.database.db_databaseName.replace(/\s+/g, ''));
    this.database.instance = (this.database.instance == null ? null : this.database.instance.replace(/\s+/g, ''));
    
    if (this.database.ip == '') { this.database.ip = null; }
    if (this.database.port == '') { this.database.port = null; }
    if (this.database.db_databaseName == '') { this.database.db_databaseName = null; }
    if (this.database.instance == '') { this.database.instance = null; }
    
    this._translateService.getTranslations([
      new TranslationInput('DATABASES.CONNECTION_STRING.IP_ADDRESS', []),
      new TranslationInput('DATABASES.CONNECTION_STRING.PORT', []),
      new TranslationInput('DATABASES.CONNECTION_STRING.DATABASE_NAME', []),
      new TranslationInput('DATABASES.CONNECTION_STRING.SERVICE_NAME', []),
      new TranslationInput('DATABASES.CONNECTION_STRING.SID', [])
    ]).subscribe((translations: any) => {
      switch(this.database.type) {
        case 'SQL_Server (2012)':
          this.database.connectionString = driverConnectionString
                                 + (this.database.ip == null ? translations['DATABASES.CONNECTION_STRING.IP_ADDRESS'] : this.database.ip) + ':'
                                 + (this.database.port == null ? translations['DATABASES.CONNECTION_STRING.PORT'] : this.database.port)
                                 + (this.database.instance == null ? '' : ';InstanceName=' + this.database.instance) + ';DatabaseName='
                                 + (this.database.db_databaseName == null ? translations['DATABASES.CONNECTION_STRING.DATABASE_NAME'] : this.database.db_databaseName);
          break;
        case 'Oracle_ServiceName':
          this.database.connectionString = driverConnectionString
                                 + (this.database.ip == null ? translations['DATABASES.CONNECTION_STRING.IP_ADDRESS'] : this.database.ip) + ':'
                                 + (this.database.port == null ? translations['DATABASES.CONNECTION_STRING.PORT'] : this.database.port) + '/'
                                 + (this.database.db_databaseName == null ? translations['DATABASES.CONNECTION_STRING.SERVICE_NAME'] : this.database.db_databaseName);
          break;
        case 'Oracle_SID':
          this.database.connectionString = driverConnectionString
                                 + (this.database.ip == null ? translations['DATABASES.CONNECTION_STRING.IP_ADDRESS'] : this.database.ip) + ':'
                                 + (this.database.port == null ? translations['DATABASES.CONNECTION_STRING.PORT'] : this.database.port) + ':'
                                 + (this.database.db_databaseName == null ? translations['DATABASES.CONNECTION_STRING.SID'] : this.database.db_databaseName);
          break;
        case 'Progress':
          this.database.connectionString = driverConnectionString
                                 + (this.database.ip == null ? translations['DATABASES.CONNECTION_STRING.IP_ADDRESS'] : this.database.ip) + ':'
                                 + (this.database.port == null ? translations['DATABASES.CONNECTION_STRING.PORT'] : this.database.port) + ';DatabaseName='
                                 + (this.database.db_databaseName == null ? translations['DATABASES.CONNECTION_STRING.DATABASE_NAME'] : this.database.db_databaseName);
          break;
        case 'Informix':
          this.database.connectionString = driverConnectionString
                                 + (this.database.ip == null ? translations['DATABASES.CONNECTION_STRING.IP_ADDRESS'] : this.database.ip) + ':'
                                 + (this.database.port == null ? translations['DATABASES.CONNECTION_STRING.PORT'] : this.database.port) + '/'
                                 + (this.database.db_databaseName == null ? translations['DATABASES.CONNECTION_STRING.DATABASE_NAME'] : this.database.db_databaseName);
          break;
      }
    });
  }
  
  protected goBack(newDatabase?: Database): void {
    if (this.modal) {
      this.closeModal.emit(newDatabase);
    } else {
      this._router.navigate(['/database']);
    }
  }
  
  protected saveDatabase(): void {
    this.validateDatabase().subscribe((validate: boolean) => {
      if (validate) {
        this._translateService.getTranslations([
          new TranslationInput('DATABASES.MESSAGES.SAVE', [this.database.name]),
          new TranslationInput('DATABASES.MESSAGES.SAVE_ERROR', [this.database.name]),
          new TranslationInput('DATABASES.MESSAGES.SAVE_ERROR_SAME_NAME', [this.database.name])
        ]).subscribe((translations: any) => {
          if ((this._electronService.isElectronApp) && (this.editPassword != this.database.password)) {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.PASSWORD_ENCRYPT);
            this.po_lo_text = { value: this.CNST_MESSAGES.PASSWORD_ENCRYPT };
            this.database.password = this._electronService.ipcRenderer.sendSync('encrypt', this.database.password);
          }
          
          this.po_lo_text = { value: translations['DATABASES.MESSAGES.SAVE'] };
          this._databaseService.saveDatabase(this.database).subscribe((b: boolean) => {
            if (b) {
              this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.SAVE_OK);
              this.goBack(this.database);
            } else {
              this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.SAVE_ERROR_SAME_NAME']);
            }
            this.po_lo_text = { value: null };
          }, (err: any) => {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.SAVE_ERROR'], err);
            this.po_lo_text = { value: null };
          });
        });
      }
    });
    //}, (err: any) => {
    //  this.po_lo_text = { value: null };
    //  this._utilities.createNotification('ERR', CNST_MESSAGES.DATABASE_DELETE_ERROR, err);
  }
  
  private validateDatabase(): Observable<boolean> {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.VALIDATE);
    this.po_lo_text = { value: this.CNST_MESSAGES.VALIDATE };
    let db: Database = new Database();
    let password: string = null;
    
    switch (this.database.type) {
      case 'Oracle_ServiceName':
        delete db.instance;
        break;
      case 'Oracle_SID':
        delete db.instance;
        break;
      case 'Progress':
        delete db.instance;
        break;
      case 'Informix':
        delete db.instance;
        break;
    }
    
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, db).map((p: string) => {
      if ((this.database[p] == undefined) && (p != 'id')) return p;
    }).filter((p: string) => { return p != null; });
    
    // Validação dos campos de formulário //
    if (propertiesNotDefined.length > 0) {
      this.po_lo_text = { value: null };
      let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
      this._translateService.getTranslations([
        new TranslationInput('FORM_ERRORS.FIELD_NOT_FILLED', [fieldName])
      ]).subscribe((translations: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_NOT_FILLED']);
      });
      return of(false);
    } else {
      let regexIp = new RegExp(this.regexPattern);
      let regexPort = new RegExp(this._CNST_DATABASE_PORT_REGEX);
      if (!regexIp.test(this.database.ip)) {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.ERROR_INVALID_IP);
        return of(false);
      } else if (!regexPort.test(this.database.port)) {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.ERROR_INVALID_PORT);
        return of(false);
      }
    }
    
    // Validação da conexão do banco de dados //
    return this.testDatabaseConnection().pipe(map((validate: boolean) => {
      return validate;
    }));
  }
  
  public testDatabaseConnection(): Observable<boolean> {
    return this._translateService.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.LOGIN', [this.database.name])
    ]).pipe(switchMap((translations: any) => {
      this.po_lo_text = { value: translations['DATABASES.MESSAGES.LOGIN'] };
      let decrypt: boolean = (this.editPassword == this.database.password) ? true : false;
      return this._databaseService.testConnection(decrypt, { ...this.database }).pipe(map((test: boolean) => {
        this.po_lo_text = { value: null };
        return test;
      }));
    }));
  }
}