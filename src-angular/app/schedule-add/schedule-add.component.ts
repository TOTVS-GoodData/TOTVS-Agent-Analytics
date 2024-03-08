/* Componentes padrões do Angular */
import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, Navigation } from '@angular/router';

/* Componentes visuais da biblioteca Portinari.UI */
import {
  PoSelectOption,
  PoGridRowActions
} from '@po-ui/ng-components';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Serviço de consulta do acesso remoto (MirrorMode) */
import { MirrorService } from '../services/mirror-service';

/* Serviço de comunicação com o Agent-Server */
import { ServerService } from '../services/server/server-service';
import {
  License,
  AvailableLicenses,
  ETLParameterCommunication,
  SQLParameterCommunication
} from '../services/server/server-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';
import { Workspace } from '../workspace/workspace-interface';
import { CNST_MODALIDADE_CONTRATACAO_PLATAFORMA } from '../workspace/workspace-constants';

/* Serviço de bancos de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';
import { CNST_DATABASE_TYPES, CNST_DATABASE_OTHER } from '../database/database-constants';

/* Serviço de agendamento do Agent */
import { ScheduleService } from '../schedule/schedule-service';
import { Schedule, ETLParameterClient, SQLParameterClient } from '../schedule/schedule-interface';
import { CNST_NEW_PARAMETER_VALUE, CNST_EXTENSION } from '../schedule/schedule-constants';

/* Constante de módulos do FAST Analytics */
import { Module } from '../utilities/module-interface';
import { CNST_MODULES } from '../utilities/module-constants';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';
import { CNST_MANDATORY_FORM_FIELD } from '../utilities/angular-constants';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-schedule-add',
  templateUrl: './schedule-add.component.html',
  styleUrls: ['./schedule-add.component.css']
})

export class ScheduleAddComponent {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Título da página
  protected lbl_title: string = null;
  
  //Agendamento a ser configurado
  protected schedule: Schedule = new Schedule();
  
  //Define se o agendamento a ser configurado é de um ambiente de modalidade "Plataforma"
  protected isPlatform: boolean = false;
  
  //Variável de suporte, para mostrar ao usuário os campos obrigatórios não preenchidos.
  protected CNST_FIELD_NAMES: Array<any> = [];
  
  //Listagem de todos os ambientes disponíveis no Agent
  protected listWorkspaces: Array<PoSelectOption> = [{ label: undefined, value: undefined }];
  private workspaces: Array<Workspace> = [];
  
  //Listagem de todos os bancos de dados disponíveis no Agent
  private databases: Array<Database> = [];
  
  //Define se o Agent está sendo executado via acesso remoto (MirrorMode)
  protected mirrorMode: number = 0;
  
  /****** Portinari.UI ******/
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  //Variável de suporte, para mostrar as extensões disponíveis do arquivo de upload do Agent
  protected _CNST_EXTENSION: Array<any> = CNST_EXTENSION;
  
  //Variável de suporte, que armazena as janelas de execução válidas para este Agent
  protected windows: Array<PoSelectOption> = [];
  
  //Variável de suporte, que define as colunas e ações da tabela de parâmetros SQL
  protected po_grid_config_sql: Array<any> = [];
  protected po_gridActionsSQL: PoGridRowActions = {
    beforeRemove: this.onBeforeRemoveSQL.bind(this),
    beforeInsert: this.onBeforeInsertSQL.bind(this),
    beforeSave: this.onSaveSQL.bind(this)
  };
  
  //Variável de suporte, que define as colunas e ações da tabela de parâmetros ETL
  protected po_grid_config_etl: Array<any> = [];
  protected po_gridActionsETL: PoGridRowActions = {
    beforeRemove: this.onBeforeRemoveETL.bind(this),
    beforeInsert: this.onBeforeInsertETL.bind(this),
    beforeSave: this.onSaveETL.bind(this)
  };
  
  /******* Formulário *******/
  //Títulos dos campos
  protected lbl_newParameter: string = null;
  protected lbl_goBack: string = null;
  protected lbl_save: string = null;
  protected lbl_name: string = null;
  protected lbl_workspaceId: string = null;
  protected lbl_windows: string = null;
  protected lbl_enabled: string = null;
  protected lbl_fileFolder: string = null;
  protected lbl_fileFolderWildcard: string = null;
  protected lbl_GDZipFilename: string = null;
  protected lbl_GDZipExtension: string = null;
  protected lbl_SQLTableTitle: string = null;
  protected lbl_SQLTableDescription: string = null;
  protected lbl_ETLTableTitle: string = null;
  protected lbl_ETLTableDescription: string = null;
  
  //Balões de ajuda
  protected ttp_windows: string = null;
  protected ttp_zipFilename: string = null;
  protected ttp_fileFolder: string = null;
  protected ttp_fileWildcard: string = null;
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _serverService: ServerService,
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _scheduleService: ScheduleService,
    private _electronService: ElectronService,
    private _mirrorService: MirrorService,
    private _translateService: TranslationService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    
    //Definição do título da página
    let nav: Navigation = this._router.getCurrentNavigation();
    if ((nav != undefined) && (nav.extras.state)) this.lbl_title = this._translateService.CNST_TRANSLATIONS['SCHEDULES.EDIT_SCHEDULE'];
    else this.lbl_title = this._translateService.CNST_TRANSLATIONS['SCHEDULES.NEW_SCHEDULE'];
    
    //Tradução das colunas da tabela de parâmetros SQL
    this.po_grid_config_sql = [
      { property: 'moduleName', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.MODULE'], width: 15, required: true, editable: true  },
      { property: 'name', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.NAME'], width: 30, required: true, editable: true  },
      { property: 'command', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.VALUE'], width: 29, required: true, editable: true },
      { property: 'sql', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.SQL'], width: 11, required: true, editable: true },
      { property: 'TOTVSName', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.TOTVS'], width: 15, required: true, editable: true }
    ];
    
    //Tradução das colunas da tabela de parâmetros ETL
    this.po_grid_config_etl = [
      { property: 'moduleName', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.MODULE'], width: 15, required: true, editable: true },
      { property: 'name', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.NAME'], width: 30, required: true, editable: true },
      { property: 'command', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.VALUE'], width: 40, required: true, editable: true },
      { property: 'TOTVSName', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.TOTVS'], width: 15, required: true, editable: true }
    ];
    
    //Tradução dos botões
    this.lbl_newParameter = this._translateService.CNST_TRANSLATIONS['BUTTONS.NEW_PARAMETER'];
    this.lbl_goBack = this._translateService.CNST_TRANSLATIONS['BUTTONS.GO_BACK'];
    this.lbl_save = this._translateService.CNST_TRANSLATIONS['BUTTONS.SAVE'];
    
    //Tradução dos campos de formulário
    this.lbl_SQLTableTitle = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.SQL_PARAMETERS.TITLE'];
    this.lbl_SQLTableDescription = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.SQL_PARAMETERS.DESCRIPTION'];
    this.lbl_ETLTableTitle = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ETL_PARAMETERS.TITLE'];
    this.lbl_ETLTableDescription = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ETL_PARAMETERS.DESCRIPTION'];
    this.lbl_name = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.NAME'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_workspaceId = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.WORKSPACE'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_windows = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.WINDOWS'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_enabled = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ENABLED'];
    this.lbl_GDZipFilename = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ZIP_FILENAME'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_GDZipExtension = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ZIP_EXTENSION'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_fileFolder = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.FILE_FOLDER'];
    this.lbl_fileFolderWildcard = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.FILE_WILDCARD'];
    
    //Tradução dos balões de ajuda dos campos
    this.ttp_windows = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TOOLTIPS.WINDOWS'];
    this.ttp_zipFilename = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TOOLTIPS.ZIP_FILENAME'];
    this.ttp_fileFolder = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TOOLTIPS.FILE_FOLDER'];
    this.ttp_fileWildcard = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TOOLTIPS.FILE_WILDCARD'];
    
    //Configuração da mensagem de acesso remoto (MirrorMode)
    this.mirrorMode = this._mirrorService.getMirrorMode();
    
    //Definição dos campos obrigatórios do formulário
    this.CNST_FIELD_NAMES = [
      { key: 'name', value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.NAME'] },
      { key: 'windows', value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.WINDOWS'] },
      { key: 'workspaceId', value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.WORKSPACE'] },
      { key: 'GDZipFilename', value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ZIP_FILENAME'] },
      { key: 'GDZipExtension', value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ZIP_EXTENSION'] }
    ];
    
    //Solicita ao Agent-Server as licenças cadastradas para esta instalação do Agent, e consulta o cadastro de ambientes / bancos de dados disponíveis no Agent
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.LOADING_LICENSES'] };
    forkJoin([
      this._workspaceService.getWorkspaces(false),
      this._databaseService.getDatabases(false),
      this._serverService.getAvailableExecutionWindows(),
      this._serverService.getAvailableLicenses(true)
    ]).subscribe((results: [Workspace[], Database[], string[], AvailableLicenses]) => {
      
      //Redireciona o usuário para a página de origem, caso ocorra uma falha na comunicação com o Agent-Server
      if (results[3] == null) {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERVER_ERROR']);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        this._router.navigate(['/schedule']);
      } else {
        this.workspaces = results[0];
        this.databases = results[1];
        
        //Configuração dos horários de agendamentos válidos
        this.windows = results[2].map((v: string) => {
          return { label: v, value: v };
        });
        
        this.listWorkspaces = this.workspaces.map((w: Workspace) => {
          return { label: w.name, value: w.id }
        });
        
        //Habilita a edição dos campos disponíveis apenas para a contratação da Plataforma GoodData
        this.isPlatform = (results[3].contractType == CNST_MODALIDADE_CONTRATACAO_PLATAFORMA);
        
        //Realiza a leitura do agendamento a ser editado (se houver)
        if ((nav != undefined) && (nav.extras.state)) {
          Object.getOwnPropertyNames.call(Object, nav.extras.state).map((p: string) => {
            this.schedule[p] = nav.extras.state[p];
          });
          
          //Converte os valores booleanos dos parâmetros de ETL, em texto
          this.schedule.ETLParameters = this.schedule.ETLParameters.map((p: ETLParameterClient) => {
            let param: ETLParameterClient = new ETLParameterClient().toObject(p);
            param.moduleName = this._translateService.CNST_TRANSLATIONS['LICENSES.MODULES.' + CNST_MODULES.find((module: Module) => module.id == param.module).name];
            param.TOTVSName = (param.TOTVS == false ? this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] : this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED']);
            return param;
          });
          
          //Converte os valores booleanos dos parâmetros de SQL, em texto
          this.schedule.SQLParameters = this.schedule.SQLParameters.map((p: SQLParameterClient) => {
            let param: SQLParameterClient = new SQLParameterClient().toObject(p);
            param.sql = (param.sql == true ? this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] : this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED']);
            param.moduleName = this._translateService.CNST_TRANSLATIONS['LICENSES.MODULES.' + CNST_MODULES.find((module: Module) => module.id == param.module).name];
            param.TOTVSName = (param.TOTVS == false ? this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] : this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED']);
            return param;
          });
          
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        } else {
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        }
      }
    }, (err: any) => {
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.LOADING_LICENSES_ERROR'], err);
    });
  }
  
  /* Método executado ao trocar o ambiente do agendamento */
  protected onChangeWorkspace(w: string): void {
    
    //Extrai a licença / banco de dados do ambiente atualmente selecionado
    let workspace: Workspace = this.workspaces.find((workspace: Workspace) => (workspace.id == w));
    let license: License = workspace.license;
    let databaseIdRef: string = workspace.databaseIdRef;
    let database: Database = this.databases.find((db: Database) => (db.id == databaseIdRef));
    
    //Solicita os parâmetros de ETL / SQL mais recentes para o Agent-Server
    if (database != null) {
      
      if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.LOADING_PARAMETERS'] };
      forkJoin(
        this._serverService.getLatestETLParameters(license),
        this._serverService.getLatestSQLParameters(license, database.brand)
      ).subscribe((results: [ETLParameterCommunication, SQLParameterCommunication]) => {

        //Redireciona o usuário para a página de origem, caso ocorra uma falha na comunicação com o Agent-Server
        if ((results[0] == null) || (results[1] == null)) {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERVER_ERROR']);
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
          this._router.navigate(['/schedule']);
        } else {

          //Atualiza todos os parâmetros deste agendamento, com os valores padrões recebidos
          this.schedule.ETLParameters = results[0].ETLParameters.map((p: ETLParameterClient) => {
            p.moduleName = this._translateService.CNST_TRANSLATIONS['LICENSES.MODULES.' + CNST_MODULES.find((module: Module) => module.id == p.module).name];
            p.TOTVSName = (p.TOTVS == false ? this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] : this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED']);
            return p;
          });
          this.schedule.SQLParameters = results[1].SQLParameters.map((p: SQLParameterClient) => {
            let param: SQLParameterClient = new SQLParameterClient().toObject(p);
            param.moduleName = this._translateService.CNST_TRANSLATIONS['LICENSES.MODULES.' + CNST_MODULES.find((module: Module) => module.id == param.module).name];
            param.TOTVSName = (param.TOTVS == false ? this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] : this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED']);
            param.sql = (param.sql == false ? this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] : this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED']);
            return param;
          });
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        }
      }, (err: any) => {
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVER.MESSAGES.LOADING_PARAMETERS_ERROR'], err);
      });
    }
  }
  
  /* Método de retorno à página anterior */
  protected goToSchedules(): void {
    this._router.navigate(['/schedule']);
  }
  
  /* Método de gravação do agendamento configurado */
  protected saveSchedule(): void {
    
    //Realiza a validação dos dados preenchidos pelo usuário
    if (this.validateSchedule()) {
      
      //Consulta das traduções
      this._translateService.getTranslations([
        new TranslationInput('SCHEDULES.MESSAGES.SAVE', [this.schedule.name]),
        new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR', [this.schedule.name]),
        new TranslationInput('SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME', [this.schedule.name])
      ]).subscribe((translations: any) => {
        if (this.mirrorMode != 1) this.po_lo_text = { value: translations['SCHEDULES.MESSAGES.SAVE'] };
        
        //Converte o valor da coluna "SQL" dos parâmetros SQL, em true / false (string -> boolean)
        this.schedule.SQLParameters = this.schedule.SQLParameters.map((p: any) => {
          let param: SQLParameterClient = new SQLParameterClient().toObject(p);
          param.sql = (param.sql == this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] ? true : false);
          return param;
        });
        
        //Grava o novo agendamento do Agent, e retorna à página anterior, caso bem sucedido
        this._scheduleService.saveSchedule(Object.assign(new Schedule(), this.schedule)).subscribe((res: number) => {
          if (res == 0) {
            this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.SAVE_OK']);
            this._router.navigate(['/schedule']);
          } else {
            this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME']);
          }
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        }, (err: any) => {
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.SAVE_ERROR']);
        });
      });
    }
  }
  
  /* Método de validação dos dados preenchidos pelo usuário */
  private validateSchedule(): boolean {
    
    //Valor de retorno do método
    let validate: boolean = true;
    
    //Objeto de suporte para validação dos campos
    let schedule: Schedule = new Schedule();
    
    this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.VALIDATE']);
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.VALIDATE'] };
    
    //Define o valor padrão do fileFolderWilcard, caso o usuário apague o mesmo, e não informe nada diferente.
    if (this.schedule.fileFolderWildcard == '') this.schedule.fileFolderWildcard = '*.*';
    
    //Verifica se todos os campos da interface de agendamento foram preenchidos
    let propertiesNotDefined: string[] = Object.getOwnPropertyNames.call(Object, schedule).map((p: string) => {
      if ((this.schedule[p] == '') && (p != 'id') && (p != 'enabled') && (p != 'SQLParameters') && (p != 'ETLParameters') && (p != 'fileFolder') && (p != 'fileWildcard')) return p;
    }).filter((p: string) => { return (p != null); });
    // Validação dos campos de formulário
    if (propertiesNotDefined.length > 0) {
      validate = false;
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
      this._translateService.getTranslations([
        new TranslationInput('FORM_ERRORS.FIELD_NOT_FILLED', [fieldName])
      ]).subscribe((translations: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_NOT_FILLED']);
      });
      
    //Verifica se a tipagem esperada de todos os campos da interface estão corretas
    } else {
      propertiesNotDefined = Object.getOwnPropertyNames.call(Object, schedule).map((p: string) => {
        if ((typeof this.schedule[p] != typeof schedule[p]) && (p != 'id')) return p;
      }).filter((p: string) => { return p != null; });
      if (propertiesNotDefined.length > 0) {
        validate = false;
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
        this._translateService.getTranslations([
          new TranslationInput('FORM_ERRORS.FIELD_TYPING_WRONG', [fieldName])
        ]).subscribe((translations: any) => {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_TYPING_WRONG']);
        });
      } else {
        
        //Validação dos parâmetros SQL
        this.schedule.SQLParameters.map((p: any) => {
          if
           (((p.sql.toUpperCase() != this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED']) && (p.sql.toUpperCase() != this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED'])) 
            ||
            ((p.TOTVSName.toUpperCase() != this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED']) && (p.TOTVSName.toUpperCase() != this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED'])))
          {
            validate = false;
          }
        });
        
        //Validação dos parâmetros ETL
        this.schedule.ETLParameters.map((p: any) => {
          if ((p.TOTVSName.toUpperCase() != this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED']) && (p.TOTVSName.toUpperCase() != this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED'])) {
            validate = false;
          }
        });
        
        if (!validate) {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['FORM_ERRORS.ONLY_YES_OR_NO']);
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        }
      }
    }
    
    //Remoção dos parâmetros default (Caso existam)
    this.schedule.ETLParameters = this.schedule.ETLParameters.filter((p: ETLParameterClient) => ((p.name != CNST_NEW_PARAMETER_VALUE) && (p.name != '')));
    this.schedule.SQLParameters = this.schedule.SQLParameters.filter((p: SQLParameterClient) => ((p.name != CNST_NEW_PARAMETER_VALUE) && (p.name != '')));
    return validate;
  }
  
  /* Método de seleção do diretório local a ser enviado para o GoodData (Apenas disponível c/ Electron) */
  protected getFolder(): void {
    if (this._electronService.isElectronApp) {
      this.schedule.fileFolder = this._electronService.ipcRenderer.sendSync('AC_getFolder');
      if (this.schedule.fileFolder == null) this.schedule.fileFolder = '';
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['FORM_ERRORS.FOLDER_SELECT_WARNING']);
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    }
  }
  
  /**************************/
  /*** MÉTODOS DOS GRIDS  ***/
  /**************************/
  /* Método executado antes da inclusão de um novo parâmetro de ETL */
  protected onBeforeInsertETL(): boolean {
    
    //Retorno do método
    let valid: boolean = false;
    
    //Procura um parâmetro já existente, com o valor padrão
    let new_parameter: ETLParameterClient = this.schedule.ETLParameters.find((p: ETLParameterClient) => {
      return (p.command === CNST_NEW_PARAMETER_VALUE);
    });
    
    //Caso seja encontrado, não é incluído um segundo parâmetro
    if (new_parameter === undefined) {
      let param: ETLParameterClient = new ETLParameterClient();
      param.moduleName = this._translateService.CNST_TRANSLATIONS['LICENSES.MODULES.' + CNST_MODULES.find((module: Module) => module.id == param.module).name];
      param.TOTVSName = (param.TOTVS == false ? this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] : this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED']);
      
      this.schedule.ETLParameters.push(param);
      valid = true;
    }
    
    return valid;
  }
  
  /* Método executado após a edição de um parâmetro de ETL */
  protected onSaveETL(p1: ETLParameterClient, p2: ETLParameterClient): boolean {
    p1.TOTVS = false;
    p1.TOTVSName = this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'];
    p1.module = p2.module;
    p1.moduleName = this._translateService.CNST_TRANSLATIONS['LICENSES.MODULES.' + CNST_MODULES.find((module: Module) => module.id == p2.module).name];
    return true;
  }
  
  /* Método executado antes da remoção de um parâmetro de ETL */
  protected onBeforeRemoveETL() {
    this.schedule.ETLParameters = this.schedule.ETLParameters.filter((p: ETLParameterClient) => { 
      p.command = p.command.replace(/\s+/g, '');
      return ((p.command != null) && (p.command != '') && (p.command != CNST_NEW_PARAMETER_VALUE));
    });
  }
  
  /* Método executado antes da inclusão de um novo parâmetro de SQL */
  protected onBeforeInsertSQL(): boolean {
    
    //Retorno do método
    let valid: boolean = false;
    
    //Procura um parâmetro já existente, com o valor padrão
    let new_parameter: SQLParameterClient = this.schedule.SQLParameters.find((p: SQLParameterClient) => {
      return (p.command === CNST_NEW_PARAMETER_VALUE);
    });
    
    //Caso seja encontrado, não é incluído um segundo parâmetro
    if (new_parameter === undefined) {
      let param: SQLParameterClient = new SQLParameterClient();
      param.moduleName = this._translateService.CNST_TRANSLATIONS['LICENSES.MODULES.' + CNST_MODULES.find((module: Module) => module.id == param.module).name];
      param.TOTVSName = (param.TOTVS == false ? this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] : this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED']);
      param.sql = this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED'];
      this.schedule.SQLParameters.push(param);
      valid = true;
    }
    
    return valid;
  }
  
  /* Método executado após a edição de um parâmetro de SQL */
  protected onSaveSQL(p1: SQLParameterClient, p2: SQLParameterClient): boolean {
    p1.TOTVS = false;
    p1.TOTVSName = this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'];
    p1.module = p2.module;
    p1.moduleName = this._translateService.CNST_TRANSLATIONS['LICENSES.MODULES.' + CNST_MODULES.find((module: Module) => module.id == p2.module).name];
    return true;
  }
  
  /* Método executado antes da remoção de um parâmetro de SQL */
  protected onBeforeRemoveSQL() {
    this.schedule.SQLParameters = this.schedule.SQLParameters.filter((p: SQLParameterClient) => { 
      p.command = p.command.replace(/\s+/g, '');
      return ((p.command != null) && (p.command != '') && (p.command != CNST_NEW_PARAMETER_VALUE));
    });
  }
}
