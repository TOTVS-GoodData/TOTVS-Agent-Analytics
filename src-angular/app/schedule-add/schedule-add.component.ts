/* Componentes padrões do Angular */
import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, Navigation } from '@angular/router';

/* Componentes visuais da biblioteca Portinari.UI */
import {
  PoSelectOption,
  PoGridRowActions
} from '@po-ui/ng-components';

/* Serviço de comunicação com o Electron */
import { ElectronService } from 'ngx-electronyzer';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';
import { Workspace } from '../workspace/workspace-interface';
import { CNST_ERP, CNST_MODALIDADE_CONTRATACAO_PLATAFORMA } from '../workspace/workspace-constants';

/* Serviço de bancos de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';
import { CNST_DATABASE_TYPES, CNST_DATABASE_OTHER } from '../database/database-constants';

/* Serviço de agendamento do Agent */
import { ScheduleService } from '../schedule/schedule-service';
import { Schedule, ETLParameter, SQLParameter } from '../schedule/schedule-interface';
import { CNST_NEW_PARAMETER_VALUE, CNST_EXTENSION, CNST_EXECUTION_WINDOWS } from '../schedule/schedule-constants';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';
import { CNST_MANDATORY_FORM_FIELD } from '../utilities/constants-angular';

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
  protected listProjects: Array<PoSelectOption> = [{ label: undefined, value: undefined }];
  private projects: Array<Workspace> = [];
  
  //Listagem de todos os bancos de dados disponíveis no Agent
  private databases: Array<Database> = [];
  
  /****** Portinari.UI ******/
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  //Variável de suporte, para mostrar as extensões disponíveis do arquivo de upload do Agent
  protected _CNST_EXTENSION: Array<any> = CNST_EXTENSION;
  
  //Variável de suporte, para mostrar as janelas de execução disponíveis
  protected _CNST_EXECUTION_WINDOWS: Array<PoSelectOption> = CNST_EXECUTION_WINDOWS.map((v: string) => {
    return { label: v, value: v };
  });
  
  //Variável de suporte, que define as colunas e ações da tabela de parâmetros SQL
  protected po_grid_config_sql: Array<any> = [];
  protected po_gridActionsSQL: PoGridRowActions = {
    beforeRemove: this.onBeforeRemoveSQL.bind(this),
    beforeInsert: this.onBeforeInsertSQL.bind(this)
  };
  
  //Variável de suporte, que define as colunas e ações da tabela de parâmetros ETL
  protected po_grid_config_etl: Array<any> = [];
  protected po_gridActionsETL: PoGridRowActions = {
    beforeRemove: this.onBeforeRemoveETL.bind(this),
    beforeInsert: this.onBeforeInsertETL.bind(this)
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
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _scheduleService: ScheduleService,
    private _electronService: ElectronService,
    private _translateService: TranslationService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    
    //Tradução das colunas da tabela de parâmetros SQL
    this.po_grid_config_sql = [
      { property: 'name', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.NAME'], width: 30, required: true, editable: true  },
      { property: 'value', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.VALUE'], width: 59, required: true, editable: true },
      { property: 'sql', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.SQL'], width: 11, required: true, editable: true }
    ];
    
    //Tradução das colunas da tabela de parâmetros ETL
    this.po_grid_config_etl = [
      { property: 'name', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.NAME'], width: 30, required: true, editable: true },
      { property: 'value', label: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.VALUE'], width: 70, required: true, editable: true }
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
    
    //Definição dos campos obrigatórios do formulário
    this.CNST_FIELD_NAMES= [
      { key: 'name', value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.NAME'] },
      { key: 'windows', value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.WINDOWS'] },
      { key: 'workspaceId', value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.WORKSPACE'] },
      { key: 'GDZipFilename', value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ZIP_FILENAME'] },
      { key: 'GDZipExtension', value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ZIP_EXTENSION'] }
    ];
    
    //Consulta o cadastro de ambientes / bancos de dados disponíveis no Agent
    forkJoin([
      this._workspaceService.getWorkspaces(),
      this._databaseService.getDatabases()
    ]).subscribe((results: [Workspace[], Database[]]) => {
      this.projects = results[0];
      this.databases = results[1];
      this.listProjects = this.projects.map((w: Workspace) => {
        return { label: w.name, value: w.id }
      });
    }, (err: any) => {
      this.po_lo_text = { value: null };
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING_ERROR'], err);
    });
    
    //Realiza a leitura do banco de dados a ser editado (se houver)
    let nav: Navigation = this._router.getCurrentNavigation();
    if ((nav != undefined) && (nav.extras.state)) {
      Object.getOwnPropertyNames.call(Object, nav.extras.state).map((p: string) => {
        this.schedule[p] = nav.extras.state[p];
      });
    }
    
    //Verifica se é um novo cadastro, ou uma atualização do agendamento
    if (this.schedule.id == null) this.lbl_title = this._translateService.CNST_TRANSLATIONS['SCHEDULES.NEW_SCHEDULE'];
    else {
      this.lbl_title = this._translateService.CNST_TRANSLATIONS['SCHEDULES.EDIT_SCHEDULE'];
      
      this.isPlatform = (this.projects.find((workspace: Workspace) => (workspace.id == this.schedule.workspaceId)).contractType == CNST_MODALIDADE_CONTRATACAO_PLATAFORMA);
        
      //Converte o valor da coluna "SQL" dos parâmetros SQL, em texto (boolean -> string)
      this.schedule.SQLParameters = this.schedule.SQLParameters.map((p: SQLParameter) => {
        return {
          name: p.name,
          value: p.value,
          sql: (p.sql == true ? this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] : this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED'])
        };
      });
    }
  }
  
  /* Método executado ao trocar o ambiente do agendamento */
  protected onChangeWorkspace(w: string): void {
    this.isPlatform = (this.projects.find((workspace: Workspace) => (workspace.id == w)).contractType == CNST_MODALIDADE_CONTRATACAO_PLATAFORMA);
    this.updateStandardParameters();
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
        this.po_lo_text = { value: translations['SCHEDULES.MESSAGES.SAVE'] };
        
        //Converte o valor da coluna "SQL" dos parâmetros SQL, em true / false (string -> boolean)
        this.schedule.SQLParameters = this.schedule.SQLParameters.map((p: any) => {
          return {
            name: p.name,
            value: p.value,
            sql: (p.sql == this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] ? true : false)
          };
        });
        
        //Grava o novo agendamento do Agent, e retorna à página anterior, caso bem sucedido
        this._scheduleService.saveSchedule({...this.schedule}).subscribe((res: boolean) => {
          if (res) {
            this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.SAVE_OK']);
            this._router.navigate(['/schedule']);
          } else {
            this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['SCHEDULES.MESSAGES.SAVE_ERROR_SAME_NAME']);
          }
          this.po_lo_text = { value: null };
        }, (err: any) => {
          this.po_lo_text = { value: null };
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
    this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.VALIDATE'] };
    
    // Todo processo de ETL precisa ter um graph preenchido.
    if (this.schedule.fileFolder != undefined) {
      schedule.fileFolderWildcard = this.schedule.fileFolderWildcard;
    }
    
    //Verifica se todos os campos da interface de agendamento foram preenchidos
    let propertiesNotDefined: string[] = Object.getOwnPropertyNames.call(Object, schedule).map((p: string) => {
      if ((this.schedule[p] == '') && (p != 'id') && (p != 'enabled')) return p;
    }).filter((p: string) => { return (p != null); });
    
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
      propertiesNotDefined = Object.getOwnPropertyNames.call(Object, schedule).map((p: string) => {
        if ((typeof this.schedule[p] != typeof schedule[p]) && (p != 'id')) return p;
      }).filter((p: string) => { return p != null; });
      if (propertiesNotDefined.length > 0) {
        validate = false;console.log(propertiesNotDefined[0]);
        this.po_lo_text = { value: null };
        let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
        this._translateService.getTranslations([
          new TranslationInput('FORM_ERRORS.FIELD_TYPING_WRONG', [fieldName])
        ]).subscribe((translations: any) => {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_TYPING_WRONG']);
        });
        
      // Validação dos parâmetros SQL
      } else {
        this.schedule.SQLParameters.map((p: any) => {
          if ((p.sql.toUpperCase() != this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED']) && (p.sql.toUpperCase() != this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED'])) { 
            validate = false;
          }
        });
        
        if (!validate) {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['FORM_ERRORS.ONLY_YES_OR_NO']);
          this.po_lo_text = { value: null };
        }
      }
    }
    
    return validate;
  }
  
  /* Método de seleção do diretório local a ser enviado para o GoodData (Apenas disponível c/ Electron) */
  protected getFolder(): void {
    if (this._electronService.isElectronApp) {
      this.schedule.fileFolder = this._electronService.ipcRenderer.sendSync('getFolder');
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['FORM_ERRORS.FOLDER_SELECT_WARNING']);
      this.po_lo_text = { value: null };
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
    let new_parameter: ETLParameter = this.schedule.ETLParameters.find((p: ETLParameter) => {
      return (p.value === CNST_NEW_PARAMETER_VALUE);
    });
    
    //Caso seja encontrado, não é incluído um segundo parâmetro
    if (new_parameter === undefined) {
      this.schedule.ETLParameters.push(new ETLParameter());
      valid = true;
    }
    
    return valid;
  }
  
  /* Método executado antes da remoção de um parâmetro de ETL */
  protected onBeforeRemoveETL() {console.log('RODOU');
    this.schedule.ETLParameters = this.schedule.ETLParameters.filter((p: ETLParameter) => { 
      p.value = p.value.replace(/\s+/g, '');
      return ((p.value != null) && (p.value != '') && (p.value != CNST_NEW_PARAMETER_VALUE));
    });
  }
  
  /* Método executado antes da inclusão de um novo parâmetro de SQL */
  protected onBeforeInsertSQL(): boolean {
    
    //Retorno do método
    let valid: boolean = false;
    
    //Procura um parâmetro já existente, com o valor padrão
    let new_parameter: ETLParameter = this.schedule.SQLParameters.find((p: SQLParameter) => {
      return (p.value === CNST_NEW_PARAMETER_VALUE);
    });
    
    //Caso seja encontrado, não é incluído um segundo parâmetro
    if (new_parameter === undefined) {
      this.schedule.SQLParameters.push(new SQLParameter());
      valid = true;
    }
    
    return valid;
  }
  
  /* Método executado antes da remoção de um parâmetro de SQL */
  protected onBeforeRemoveSQL() {
    this.schedule.SQLParameters = this.schedule.SQLParameters.filter((p: SQLParameter) => { 
      p.value = p.value.replace(/\s+/g, '');
      return ((p.value != null) && (p.value != '') && (p.value != CNST_NEW_PARAMETER_VALUE));
    });
  }
  
  /* Método que atualiza os parâmetros de ETL / SQL padrões do ambiente selecionado */
  protected updateStandardParameters(): void {
    
    //Detecta o ambiente selecionado
    let workspace: Workspace = this.projects.find((w: Workspace) => (w.id === this.schedule.workspaceId));
    
    //Detecta o banco de dados do ambiente selecionado
    let database: Database = this.databases.find((db: Database) => (db.id === workspace.databaseIdRef));
    
    //Atualiza os parâmetros de ETL do novo ambiente selecionado
    this.schedule.ETLParameters = CNST_ERP.find((e: any) => (e.ERP === workspace.erp)).Parametros.ETL;
    
    //Atualiza os parâmetros de SQL (caso exista um banco de dados configurado)
    if (database != undefined) {
      if (database.brand != CNST_DATABASE_OTHER) {
        this.schedule.SQLParameters = CNST_ERP.find((e: any) => (e.ERP === workspace.erp))
          .Parametros[database.brand].filter((p2: any) => {
          return (p2.Modulos.includes(workspace.module) || (p2.Modulos.length == 0))
        }).map((p3: SQLParameter) => {
          return {
            name: p3.name,
            value: p3.value,
            sql: (p3.sql ? this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED']: this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED'])
          }
        });
      }
    }
  }
}
