import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, Navigation } from '@angular/router';

import { ElectronService } from 'ngx-electronyzer';

import { WorkspaceService } from '../workspace/workspace-service';
import { Database } from '../utilities/interfaces';
import { DatabaseService } from '../database/database-service';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

import { TranslationService, TranslationInput } from '../service/translation/translation-service';

import { Observable, of, map } from 'rxjs';

const CNST_FIELD_NAMES: Array<any> = [
   { key: 'name', value: 'Nome da configuração*' }
  ,{ key: 'type', value: 'Tipo de banco de dados*' }
  ,{ key: 'driverClass', value: 'Driver*' }
  ,{ key: 'driverPath', value: 'Caminho do driver*' }
  ,{ key: 'ip', value: 'Endereço IP*' }
  ,{ key: 'ipType', value: 'Tipo*' }
  ,{ key: 'port', value: 'Porta*' }
  ,{ key: 'schema', value: 'Schema / SID*' }
  ,{ key: 'instance', value: 'Instância do banco de dados' }
  ,{ key: 'connectionString', value: 'String de conexão final*' }
  ,{ key: 'username', value: 'Usuário*' }
  ,{ key: 'password', value: 'Senha*' }
];

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
  protected lbl_schema: string;
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
  protected schema: string = null;
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
      new TranslationInput('DATABASES.TABLE.INSTANCE', []),
      new TranslationInput('DATABASES.TABLE.CONNECTION_STRING', []),
      new TranslationInput('DATABASES.TABLE.USERNAME', []),
      new TranslationInput('DATABASES.TABLE.PASSWORD', []),
      new TranslationInput('DATABASES.MESSAGES.SAVE_OK', []),
      new TranslationInput('DATABASES.TABLE.INSTANCE', [])
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
      this.lbl_schema = translations['DATABASES.TABLE.DATABASE'] + '*';
      this.lbl_instance = translations['DATABASES.TABLE.INSTANCE'];
      this.lbl_connectionString = translations['DATABASES.TABLE.CONNECTION_STRING'] + '*';
      this.lbl_username = translations['DATABASES.TABLE.USERNAME'] + '*';
      this.lbl_password = translations['DATABASES.TABLE.PASSWORD'] + '*';
      
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
      this.schema = (this.database.schema ? this.database.schema : this.database.sid);
      if (this.database.id != null) {
        this.lbl_title = translations['DATABASES.EDIT_DATABASE'];
        this.editPassword = this.database.password;
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
      this.lbl_title = 'Alterar Banco de dados';
    }
  }
  
  protected onChangeDatabaseType(driver: string): void {
    this.database.driverClass = _constants.CNST_DATABASE_TYPES.find((db: any) => { return db.value == driver }).driverClass;
    this.database.driverPath = _constants.CNST_DATABASE_TYPES.find((db: any) => { return db.value == driver }).driverPath;
    this.database.port = _constants.CNST_DATABASE_TYPES.find((db: any) => { return db.value == driver }).defaultPort;
    this.setDatabaseSchema((this.database.schema ? this.database.schema : this.database.sid));
    this.updateConnectionString();
  }
  
  protected setDatabaseSchema(schema: string): void {
    switch(this.database.type) {
      case 'Oracle_SID':
        this.database.schema = null;
        this.database.sid = schema;
        break;
      default:
        this.database.schema = schema;
        this.database.sid = null;
        break;
    }
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
    this.database.schema = (this.database.schema == null ? null : this.database.schema.replace(/\s+/g, ''));
    this.database.sid = (this.database.sid == null ? null : this.database.sid.replace(/\s+/g, ''));
    this.database.instance = (this.database.instance == null ? null : this.database.instance.replace(/\s+/g, ''));
    
    if (this.database.ip == '') { this.database.ip = null; }
    if (this.database.port == '') { this.database.port = null; }
    if (this.database.schema == '') { this.database.schema = null; }
    if (this.database.sid == '') { this.database.sid = null; }
    if (this.database.instance == '') { this.database.instance = null; }
    
    switch(this.database.type) {
      case 'SQL_Server':
        this.database.connectionString = driverConnectionString
                               + (this.database.ip == null ? '<ENDERECO_IP>' : this.database.ip)
                               + (this.database.port == null ? ':<PORTA>' : ':' + this.database.port)
                               + (this.database.instance == null ? '' : ';InstanceName=' + this.database.instance)
                               + (this.database.schema == null ? ';DatabaseName=<SCHEMA>' : ';DatabaseName=' + this.database.schema);
        break;
      case 'Oracle_ServiceName':
        this.database.connectionString = driverConnectionString
                               + (this.database.ip == null ? '<ENDERECO_IP>' : this.database.ip)
                               + (this.database.port == null ? ':<PORTA>' : ':' + this.database.port)
                               + (this.database.schema == null ? '/<SCHEMA>' : '/' + this.database.schema);
        break;
      case 'Oracle_SID':
        this.database.connectionString = driverConnectionString
                               + (this.database.ip == null ? '<ENDERECO_IP>' : this.database.ip)
                               + (this.database.port == null ? ':<PORTA>' : ':' + this.database.port)
                               + (this.database.sid == null ? ':<SID>' : ':' + this.database.sid);
        break;
      case 'Progress':
        this.database.connectionString = driverConnectionString
                               + (this.database.ip == null ? '<ENDERECO_IP>' : this.database.ip)
                               + (this.database.port == null ? ':<PORTA>' : ':' + this.database.port)
                               + (this.database.schema == null ? ';DatabaseName=<SCHEMA>' : ';DatabaseName=' + this.database.schema);
        break;
      case 'Informix':
        this.database.connectionString = driverConnectionString
                               + (this.database.ip == null ? '<ENDERECO_IP>' : this.database.ip)
                               + (this.database.port == null ? ':<PORTA>' : ':' + this.database.port)
                               + (this.database.schema == null ? '/<SCHEMA>' : '/' + this.database.schema);
        break;
    }
  }
  
  protected goBack(newDatabase?: Database): void {
    if (this.modal) {
      this.closeModal.emit(newDatabase);
    } else {
      this._router.navigate(['/database']);
    }
  }
  
  protected saveDatabase(): void {
      if (this.validateDatabase()) {
        this._translateService.getTranslations([
          new TranslationInput('DATABASE.MESSAGES.SAVE', [this.database.name]),
          new TranslationInput('DATABASE.MESSAGES.SAVE_ERROR', [this.database.name])
        ]).subscribe((translations: any) => {
          if ((this._electronService.isElectronApp) && (this.editPassword != this.database.password)) {
            this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.PASSWORD_ENCRYPT);
            this.po_lo_text = { value: this.CNST_MESSAGES.PASSWORD_ENCRYPT };
            this.database.password = this._electronService.ipcRenderer.sendSync('encrypt', this.database.password);
          }
          
          this.po_lo_text = { value: translations['DATABASE.MESSAGES.SAVE'] };
          this._databaseService.saveDatabase(this.database).subscribe((b: boolean) => {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, this.CNST_MESSAGES.SAVE_OK);
            this.po_lo_text = { value: null };
            this.goBack(this.database);
          }, (err: any) => {
            this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, translations['DATABASE.MESSAGES.SAVE_ERROR'], err);
            this.po_lo_text = { value: null };
          });
        });
      }
    //}, (err: any) => {
    //  this.po_lo_text = { value: null };
    //  this._utilities.createNotification('ERR', CNST_MESSAGES.DATABASE_DELETE_ERROR, err);
  }
  
  private validateDatabase(): boolean {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.VALIDATE);
    this.po_lo_text = { value: this.CNST_MESSAGES.VALIDATE };
    let db: Database = new Database();
    let password: string = null;
    
    switch (this.database.type) {
      case 'SQL_Server':
        delete db.sid;
        break;
      case 'Oracle_ServiceName':
        delete db.sid;
        delete db.instance;
        break;
      case 'Oracle_SID':
        delete db.schema;
        delete db.instance;
        break;
      case 'Progress':
        delete db.sid;
        delete db.instance;
        break;
      case 'Informix':
        delete db.sid;
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
      return false;
    } else {
      let regexIp = new RegExp(this.regexPattern);
      let regexPort = new RegExp(this._CNST_DATABASE_PORT_REGEX);
      if (!regexIp.test(this.database.ip)) {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.ERROR_INVALID_IP);
        return false;
      } else if (!regexPort.test(this.database.port)) {
        this.po_lo_text = { value: null };
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.ERROR_INVALID_PORT);
        return false;
      }
    }
    
    // Validação da conexão do banco de dados //
    return this.testDatabaseConnection();
  }
  
  public testDatabaseConnection(): boolean {
    this._translateService.getTranslations([
      new TranslationInput('DATABASE.LOGIN', [this.database.name])
    ]).subscribe((translations: any) => {
      this.po_lo_text = { value: translations['DATABASE.LOGIN'] };
    });
    let decrypt: boolean = (this.editPassword == this.database.password) ? true : false;
    let b: boolean = this._databaseService.testConnection(decrypt, { ...this.database });
    this.po_lo_text = { value: null };
    return b;
  }
}