/* Componentes padrões do Angular */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, Navigation } from '@angular/router';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Porta mínima / máxima aceitável pelo Agent */
import {
  CNST_PORT_MINIMUM,
  CNST_PORT_MAXIMUM,
} from '../app-constants';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';

/* Serviço de banco de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';
import {
  CNST_DATABASE_IPTYPES,
  CNST_DATABASE_TYPES,
  CNST_DATABASE_OTHER,
  CNST_DATABASE_TYPE_SID,
  CNST_DATABASE_TYPE_SERVICE,
  CNST_DATABASE_TYPE_DATABASE,
  CNST_DATABASE_BRAND_SQLSERVER,
  CNST_DATABASE_BRAND_ORACLE,
  CNST_DATABASE_BRAND_PROGRESS,
  CNST_DATABASE_BRAND_INFORMIX,
  CNST_DATABASE_CONNECTIONSTRING_IP,
  CNST_DATABASE_CONNECTIONSTRING_PORT,
  CNST_DATABASE_CONNECTIONSTRING_DATABASE,
  CNST_DATABASE_CONNECTIONSTRING_SERVICE,
  CNST_DATABASE_CONNECTIONSTRING_SID,
  CNST_DATABASE_CONNECTIONSTRING_INSTANCE_1,
  CNST_DATABASE_CONNECTIONSTRING_INSTANCE_2
} from '../database/database-constants';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';
import { CNST_MANDATORY_FORM_FIELD } from '../utilities/angular-constants';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, of, map, switchMap, catchError } from 'rxjs';

@Component({
  selector: 'app-database-add',
  templateUrl: './database-add.component.html',
  styleUrls: ['./database-add.component.css']
})
export class DataBaseAddComponent {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Título da página
  protected lbl_title: string;
  
  //Banco de dados a ser configurado
  protected database: Database = new Database();
  
  //RegEx atualmente selecionado para formatação do IP
  protected regexPattern: string = null;
  
  //Variável de suporte, para mostrar ao usuário os campos obrigatórios não preenchidos.
  protected CNST_FIELD_NAMES: Array<any> = [];
  
  /****** Portinari.UI ******/
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  //Variável de suporte, para mostrar / ocultar o campo de "instancia" do formulário
  protected _CNST_DATABASE_BRAND_SQLSERVER: string = CNST_DATABASE_BRAND_SQLSERVER;
  
  //Variável de suporte, para detectar o usuário que está usando o banco de dados "Outro"
  protected _CNST_DATABASE_OTHER: string = CNST_DATABASE_OTHER;
  
  //Variável de suporte, para mostrar os tipos de bancos de dados disponíveis no Agent
  protected _CNST_DATABASE_TYPES: any;
  
  //Valores mínimo / máximo permitidos para a porta do banco de dados
  protected _CNST_PORT_MINIMUM: number = CNST_PORT_MINIMUM;
  protected _CNST_PORT_MAXIMUM: number = CNST_PORT_MAXIMUM;
  
  //Variável de suporte, para mostrar os tipos de IP's disponíveis (Ipv4, Ipv6, Hostname)
  protected _CNST_DATABASE_IPTYPES: any = CNST_DATABASE_IPTYPES.map((type: any) => {
    return { label: type.label, value: type.value }
  });
  
  /********* Modal **********/
  //Objeto de banco de dados a ser editado, enviado via parâmetro do Modal.
  @Input() databaseObject: Database = null;
  
  //Define se este componente está sendo executado diretamente, ou via Modal.
  @Input() modal: boolean = false;
  
  //Evento disparado após sair deste componente, caso o mesmo tenha sido renderizado em formato de Modal.
  @Output() closeModal: EventEmitter<Database> = new EventEmitter<Database>();
  
  /******* Formulário *******/
  //Títulos dos campos
  protected lbl_name: string = null;
  protected lbl_type: string = null;
  protected lbl_driverClass: string = null;
  protected lbl_driverPath: string = null;
  protected lbl_ipType: string = null;
  protected lbl_ip: string = null;
  protected lbl_port: string = null;
  protected lbl_db_databaseName: string = null;
  protected lbl_instance: string = null;
  protected lbl_connectionString: string = null;
  protected lbl_username: string = null;
  protected lbl_password: string = null;
  protected lbl_testConnection: string = null;
  protected lbl_save: string = null;
  protected lbl_goBack: string = null;
  
  //Balões de ajuda
  protected ttp_driverClass: string = null;
  protected ttp_driverPath: string = null;
  protected ttp_hostType: string = null;
  protected ttp_hostName: string = null;
  protected ttp_port: string = null;
  protected ttp_connectionString: string = null;
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _electronService: ElectronService,
    private _translateService: TranslationService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    
    //Tradução do banco de dados "Outros" para o idioma atual do Agent
    this._CNST_DATABASE_TYPES = CNST_DATABASE_TYPES.map((db: any) => {
      return { label: db.label, value: db.value }
    });
    this._CNST_DATABASE_TYPES.find((type: any) => (type.label == null)).label = this._translateService.CNST_TRANSLATIONS['ANGULAR.OTHER'];
    
    //Tradução dos botões
    this.lbl_testConnection = this._translateService.CNST_TRANSLATIONS['BUTTONS.TEST_CONNECTION'];
    this.lbl_goBack = this._translateService.CNST_TRANSLATIONS['BUTTONS.GO_BACK'];
    this.lbl_save = this._translateService.CNST_TRANSLATIONS['BUTTONS.SAVE'];
    
    //Tradução dos campos de formulário
    this.lbl_name = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.NAME'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_type = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.TYPE'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_driverClass = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.DRIVER_CLASS'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_driverPath = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.DRIVER_PATH'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_ipType = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.HOST_TYPE'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_ip = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.HOST_NAME'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_port = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.PORT'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_db_databaseName = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.DATABASE'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_instance = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.INSTANCE'];
    this.lbl_connectionString = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.CONNECTION_STRING'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_username = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.USERNAME'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_password = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.PASSWORD'] + CNST_MANDATORY_FORM_FIELD;
    
    //Tradução dos balões de ajuda dos campos
    this.ttp_driverClass = this._translateService.CNST_TRANSLATIONS['DATABASES.TOOLTIPS.DRIVER_CLASS'];
    this.ttp_driverPath = this._translateService.CNST_TRANSLATIONS['DATABASES.TOOLTIPS.DRIVER_PATH'];
    this.ttp_hostType = this._translateService.CNST_TRANSLATIONS['DATABASES.TOOLTIPS.HOST_TYPE'];
    this.ttp_hostName = this._translateService.CNST_TRANSLATIONS['DATABASES.TOOLTIPS.HOST_NAME'];
    this.ttp_port = this._translateService.CNST_TRANSLATIONS['DATABASES.TOOLTIPS.PORT'];
    this.ttp_connectionString = this._translateService.CNST_TRANSLATIONS['DATABASES.TOOLTIPS.CONNECTION_STRING'];
    
    //Definição dos campos obrigatórios do formulário
    this.CNST_FIELD_NAMES = [
      { key: 'name', value: this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.NAME'] },
      { key: 'type', value: this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.TYPE'] },
      { key: 'driverClass', value: this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.DRIVER_CLASS'] },
      { key: 'driverPath', value: this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.DRIVER_PATH'] },
      { key: 'ipType', value: this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.HOST_TYPE'] },
      { key: 'ip', value: this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.HOST_NAME'] },
      { key: 'port', minimum: CNST_PORT_MINIMUM, maximum: CNST_PORT_MAXIMUM, value: this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.PORT'] },
      { key: 'db_databaseName', value: this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.DATABASE'] },
      { key: 'connectionString', value: this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.CONNECTION_STRING'] },
      { key: 'username', value: this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.USERNAME'] },
      { key: 'password', value: this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.PASSWORD'] }
    ];
    
    //Realiza a leitura do banco de dados a ser editado (se houver)
    let nav: Navigation = this._router.getCurrentNavigation();
    if ((nav != undefined) && (nav.extras.state)) {
      Object.getOwnPropertyNames.call(Object, nav.extras.state).map((p: string) => {
        this.database[p] = nav.extras.state[p];
      });
    }
    
    //Atualiza o RegEx de IP do banco de dados
    this.updateIpRegexPattern();
    
    //Verifica se é um novo cadastro, ou uma atualização do banco de dados
    if (this.database.id == null) this.lbl_title = this._translateService.CNST_TRANSLATIONS['DATABASES.NEW_DATABASE'];
    else {
      this.lbl_title = this._translateService.CNST_TRANSLATIONS['DATABASES.EDIT_DATABASE'];
      this.updateDatabaseField();
    }
  }
  
  /*
    Método executado após a inicialização do componente.
    
    Este comando é necessário para passar a referência do 
    banco de dados que será editado via Modal, aberto 
    na página "workspace-add".
  */
  protected ngOnChanges(): void {
    if (this.databaseObject) this.database = this.databaseObject;
    
    //Atualiza o RegEx de IP do banco de dados
    this.updateIpRegexPattern();
  }
  
  /* Método que atualiza o alvo da conexão (Banco / Serviço / SID) */
  protected updateDatabaseField(): void {
    switch(this.database.connectionType) {
      case CNST_DATABASE_TYPE_SID:
        this.lbl_db_databaseName = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.SID'] + CNST_MANDATORY_FORM_FIELD;
        this.CNST_FIELD_NAMES.find((field: any) => (field.key == 'db_databaseName')).value = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.SID'];
        break;
      case CNST_DATABASE_TYPE_SERVICE:
        this.lbl_db_databaseName = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.SERVICE_NAME'] + CNST_MANDATORY_FORM_FIELD;
        this.CNST_FIELD_NAMES.find((field: any) => (field.key == 'db_databaseName')).value = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.SERVICE_NAME'];
        break;
      default:
        this.lbl_db_databaseName = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.DATABASE'] + CNST_MANDATORY_FORM_FIELD;
        this.CNST_FIELD_NAMES.find((field: any) => (field.key == 'db_databaseName')).value = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.DATABASE'];
        break;
    }
  }
  
  /* Método disparado ao trocar o tipo do banco de dados */
  protected onChangeDatabaseType(driver: string): void {
    
    //Consulta a marca do banco de dados selecionado
    let dbType: any = CNST_DATABASE_TYPES.find((db: any) => { return db.value == driver });
    
    //Atualiza os campos de formulário para a marca selecionada
    this.database.driverClass = dbType.driverClass;
    this.database.driverPath = dbType.driverPath;
    this.database.brand = dbType.brand;
    this.database.port = dbType.defaultPort;
    this.database.connectionType = dbType.connectionType;
    
    //Adiciona um texto de ajuda no campo seletor de drivers (Obrigatório p/ testes do Angular)
    if (this.database.type == CNST_DATABASE_OTHER) this.database.driverPath = this._translateService.CNST_TRANSLATIONS['BUTTONS.SELECT'];
        
    //Atualiza a string de conexão com o banco de dados
    this.updateConnectionString();
    
    //Atualiza o campo de alvo da conexão
    this.updateDatabaseField();
  }
  
  /* Método de atualização do RegEx de IP do banco de dados */
  protected updateIpRegexPattern(): void {
    this.regexPattern = (this.database.ipType ? CNST_DATABASE_IPTYPES.find((db: any) => {
      return (db.value == this.database.ipType)
    }).pattern : null);
  }
  
  /* Método de atualização da string de conexão do banco de dados */
  private updateConnectionString(): void {
    
    //Variáveis auxiliares
    let strIp: string = null;
    let strPort: string = null;
    let strName: string = null;
    let strInstance: string = null;
    
    //Obtém o formato da string de conexão do driver selecionado
    let type: any = CNST_DATABASE_TYPES.find((db: any) => { return db.value == this.database.type });
    let driverConnectionString: string = null;
    
    if (type != null) {
      driverConnectionString = type.driverConnectionString;
      //Tratamento dos dados preenchidos (remoção de espaços)
      this.database.ip = this.database.ip.replace(/\s+/g, '');
      //this.database.port = ('' + this.database.port).replace(/\s+/g, '');
      this.database.db_databaseName = this.database.db_databaseName.replace(/\s+/g, '');
      this.database.instance = this.database.instance.replace(/\s+/g, '');
      
      //Caso nada válido tenha sido preenchido, atualiza o campo com o texto padrão da string de conexão
      if (this.database.ip == '') strIp = this._translateService.CNST_TRANSLATIONS['DATABASES.CONNECTION_STRING.IP_ADDRESS'];
      else strIp = this.database.ip;
      
      if (this.database.port == null) strPort = this._translateService.CNST_TRANSLATIONS['DATABASES.CONNECTION_STRING.PORT'];
      else strPort = this.database.port + '';
      
      if (this.database.db_databaseName == '') strName = this._translateService.CNST_TRANSLATIONS['DATABASES.CONNECTION_STRING.DATABASE_NAME'];
      else strName = this.database.db_databaseName;
      
      if (this.database.instance == '') strInstance = '';
      else strInstance = this.database.instance;
      
      //Atualiza a string de conexão do banco de dados
      this.database.connectionString = driverConnectionString
        .replace(CNST_DATABASE_CONNECTIONSTRING_IP, strIp)
        .replace(CNST_DATABASE_CONNECTIONSTRING_PORT, strPort)
        .replace(CNST_DATABASE_CONNECTIONSTRING_DATABASE, strName)
        .replace(CNST_DATABASE_CONNECTIONSTRING_SERVICE, strName)
        .replace(CNST_DATABASE_CONNECTIONSTRING_SID, strName)
        .replace(CNST_DATABASE_CONNECTIONSTRING_INSTANCE_1 + CNST_DATABASE_CONNECTIONSTRING_INSTANCE_2, (strInstance == '' ? '': CNST_DATABASE_CONNECTIONSTRING_INSTANCE_1 + strInstance))
      ;
    }
  }
  
  /* Método de retorno à página anterior */
  protected goBack(newDatabase?: Database): void {
    if (this.modal) {
      this.closeModal.emit(newDatabase);
    } else {
      this._router.navigate(['/database']);
    }
  }
  
  /* Método de gravação do banco de dados configurado */
  protected saveDatabase(): void {
    
    //Realiza a validação dos dados preenchidos pelo usuário
    this.validateDatabase().subscribe((validate: boolean) => {
      if (validate) {
        
        //Consulta das traduções
        this._translateService.getTranslations([
          new TranslationInput('DATABASES.MESSAGES.SAVE', [this.database.name]),
          new TranslationInput('DATABASES.MESSAGES.SAVE_ERROR', [this.database.name]),
          new TranslationInput('DATABASES.MESSAGES.SAVE_ERROR_SAME_NAME', [this.database.name])
        ]).subscribe((translations: any) => {
          
          //Realiza a criptografia da senha do banco de dados, caso o Electron esteja disponível
          if ((this._electronService.isElectronApp) && (this.database.id == null)) {
            this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.PASSWORD_ENCRYPT']);
            this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.PASSWORD_ENCRYPT'] };
            this.database.password = this._electronService.ipcRenderer.sendSync('encrypt', this.database.password);
          }
          
          //Grava o novo banco de dados do Agent, e retorna à página anterior, caso bem sucedido
          this.po_lo_text = { value: translations['DATABASES.MESSAGES.SAVE'] };
          this._databaseService.saveDatabase(this.database).subscribe((b: boolean) => {
            if (b) {
              this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.SAVE_OK']);
              this.goBack(this.database);
            } else {
              this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.SAVE_ERROR_SAME_NAME']);
            }
            this.po_lo_text = { value: null };
          }, (err: any) => {
            this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.SAVE_ERROR'], err);
            this.po_lo_text = { value: null };
          });
        });
      }
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['ANGULAR.ERROR']);
      this.po_lo_text = { value: null };
    });
  }
  
  /* Método de validação dos dados preenchidos pelo usuário */
  private validateDatabase(): Observable<boolean> {
    
    //Valor de retorno do método
    let validate: boolean = true;
    
    //Objeto de suporte para validação dos campos
    let db: Database = new Database();
    
    this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.VALIDATE']);
    this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.VALIDATE'] };
    
    //Remove a obrigatoriedade do campo de instância dos bancos que não a utilizam
    //Remove também todos os campos de formulário do banco "Outro"
    switch(this.database.brand) {
      case CNST_DATABASE_BRAND_ORACLE:
        delete db.instance;
        break;
      case CNST_DATABASE_BRAND_PROGRESS:
        delete db.instance;
        break;
      case CNST_DATABASE_BRAND_INFORMIX:
        delete db.instance
        break;
      case CNST_DATABASE_OTHER:
        delete db.ipType;
        delete db.ip;
        delete db.port;
        delete db.db_databaseName;
        delete db.instance;
        break;
    }
    
    //Verifica se todos os campos obrigatórios da interface de banco de dados foram preenchidos
    let propertiesNotDefined: string[] = Object.getOwnPropertyNames.call(Object, db).map((p: string) => {
      if (((this.database[p] == '') || (this.database[p] == null) || (this.database[p] == this._translateService.CNST_TRANSLATIONS['BUTTONS.SELECT'])) && (p != 'id') && (p != 'instance')) return p;
    }).filter((p: string) => { return p != null; });
    
    // Validação dos campos de formulário
    if (propertiesNotDefined.length > 0) {
      validate = false;
      this.po_lo_text = { value: null };
      let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
      this._translateService.getTranslations([
        new TranslationInput('FORM_ERRORS.FIELD_NOT_FILLED', [fieldName])
      ]).subscribe((translations: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_NOT_FILLED']);
      });
    
    //Verifica se a tipagem esperada de todos os campos da interface estão corretas
    } else {
      propertiesNotDefined = Object.getOwnPropertyNames.call(Object, db).map((p: string) => {
        if ((typeof this.database[p] != typeof db[p]) && (p != 'id')) return p;
      }).filter((p: string) => { return p != null; });
      if (propertiesNotDefined.length > 0) {
        validate = false;
        this.po_lo_text = { value: null };
        let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
        this._translateService.getTranslations([
          new TranslationInput('FORM_ERRORS.FIELD_TYPING_WRONG', [fieldName])
        ]).subscribe((translations: any) => {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_TYPING_WRONG']);
        });
        
      //Verifica se os valores mínimos do formulário foram respeitados.
      } else {
        let range: any[] = this.CNST_FIELD_NAMES.filter((p: any) => {
          if (p.minimum != undefined) return ((this.database[p.key] < p.minimum) || (this.database[p.key] > p.maximum));
          else return false;
        });
        if (range.length > 0) {
          validate = false;
          this.po_lo_text = { value: null };
          this._translateService.getTranslations([
            new TranslationInput('FORM_ERRORS.FIELD_RANGE_ERROR', [range[0].value, range[0].minimum, range[0].maximum])
          ]).subscribe((translations: any) => {
            this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_RANGE_ERROR']);
          });
          
        //Validação do ip digitado, via RegEx
        } else if (this.database.type != CNST_DATABASE_OTHER) {
          let regexIp = new RegExp(this.regexPattern);
          if (!regexIp.test(this.database.ip)) {
            validate = false;
            this.po_lo_text = { value: null };
            this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.ERROR_INVALID_IP']);
          }
        }
      }
    }
    
    // Validação da conexão do banco de dados
    if (validate) {
      return this.testDatabaseConnection().pipe(map((validate: boolean) => {
        
        //Remoção dos dados irrelevantes do tipo de banco "Outro"
        if ((validate) && (this.database.type == CNST_DATABASE_OTHER)) {
          this.database.ip = '';
          this.database.ipType = '';
          this.database.port = null;
          this.database.instance = '';
          this.database.db_databaseName = '';
        }
        
        return validate;
      }));
    } else { return of(false); }
  }
  
  /* Método de disparo do teste de conexão ao banco de dados */
  public testDatabaseConnection(): Observable<boolean> {
    
    //Consulta das traduções
    return this._translateService.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.LOGIN', [this.database.name])
    ]).pipe(switchMap((translations: any) => {
      this.po_lo_text = { value: translations['DATABASES.MESSAGES.LOGIN'] };
      
      //Disparo da requisição de teste ao serviço de banco de dados
      return this._databaseService.testConnection(this.database).pipe(map((test: boolean) => {
        this.po_lo_text = { value: null };
        return test;
      }));
    }), catchError((err: any) => {
      this.po_lo_text = null;
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['ANGULAR.ERROR']);
      throw err;
    }));
  }
  
  /* Método de seleção do driver do banco de dados (Apenas disponível c/ Electron) */
  protected getDriverFile(): void {
    if (this._electronService.isElectronApp) {
      this.database.driverPath = this._electronService.ipcRenderer.sendSync('getFile');
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['FORM_ERRORS.FOLDER_SELECT_WARNING']);
      this.po_lo_text = { value: null };
    }
  }
}
