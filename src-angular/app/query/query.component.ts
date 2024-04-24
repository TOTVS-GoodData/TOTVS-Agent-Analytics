/* Componentes padrões do Angular */
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

/* Componentes visuais da biblioteca Portinari.UI */
import {
  PoModalComponent,
  PoTableAction,
  PoListViewAction,
  PoTableColumn,
  PoSelectOption,
  PoListViewLiterals
} from '@po-ui/ng-components';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';
import { CNST_MANDATORY_FORM_FIELD, CNST_NO_OPTION_SELECTED } from '../utilities/angular-constants';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Serviço de consulta do acesso remoto (MirrorMode) */
import { MirrorService } from '../services/mirror-service';

/* Serviço de comunicação com o Agent-Server */
import { ServerService } from '../services/server/server-service';
import {
  License,
  AvailableLicenses,
  QueryCommunication
} from '../services/server/server-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';
import { Workspace } from '../workspace/workspace-interface';
import { CNST_MODALIDADE_CONTRATACAO_PLATAFORMA } from '../workspace/workspace-constants';

/* Serviço de banco de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';
import { CNST_DATABASE_TYPES, CNST_DATABASE_OTHER } from '../database/database-constants';

/* Constante de módulos do FAST Analytics */
import { Module } from '../utilities/module-interface';
import { CNST_MODULES } from '../utilities/module-constants';

/* Serviço de consultas do Agent */
import { QueryService } from './query-service';
import { QueryClient } from './query-interface';

/* Serviço de agendamentos do Agent */
import { ScheduleService } from '../schedule/schedule-service';
import { Schedule, ScheduleQuery } from '../schedule/schedule-interface';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, map, catchError, forkJoin } from 'rxjs';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Título da página
  protected lbl_title: string = null;
  
  //Consulta selecionada p/ remoção
  protected queryToDelete: QueryClient = null;
  
  //Listagem de todos os agendamentos cadastrados, e suas consultas
  protected schedulesQueryTotal: ScheduleQuery[] = [];
  
  //Listagem de todos os agendamentos cadastrados, e suas consultas (sem permissão p/ exportação)
  protected schedulesQuery: ScheduleQuery[] = [];
  
  //Listagem de todos os agendamentos cadastrados, e suas consultas (com permissão p/ exportação)
  protected schedulesQueryExport: ScheduleQuery[] = [];
  
  //Define se a consulta a ser configurada é de um ambiente de modalidade "Plataforma"
  protected isPlatform: boolean = false;
  
  //Listagem de todos os ambientes disponíveis no Agent
  private workspaces: Array<Workspace> = [];
  
  //Listagem de todos os bancos de dados disponíveis no Agent
  private databases: Array<Database> = [];
  
  //Listagem de todos os agendamentos válidos para receberem novas consultas
  protected listSchedule: Array<PoSelectOption> = null;
  
  //Variável de suporte, para mostrar ao usuário os campos obrigatórios não preenchidos.
  protected CNST_FIELD_NAMES: Array<any> = [];
  
  //Variável de suporte, que mostra os modos de execução disponíveis das consultas (Completa / Mensal)
  protected CNST_QUERY_EXECUTION_MODES: Array<PoSelectOption> = [];
  
  //Define se o Agent está sendo executado via acesso remoto (MirrorMode)
  protected mirrorMode: number = 0;
  
  /****** Portinari.UI ******/
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  //Ações disponíveis para cada agendamento
  protected setListViewActions: Array<PoListViewAction> = [];
  
  //Colunas da tabela de consultas dos agendamentos
  protected setColumns: Array<PoTableColumn> = [];
  
  //Ações disponíveis para cada linha da tabela de consultas
  protected setTableRowActions: Array<PoTableAction> = [];
  
  //Mensagens padrões da listagem das consultas
  protected setLiterals: PoListViewLiterals = null;
  
  /********* Modal **********/
  //Cadastro de consultas
  @ViewChild('modal_addQuery') modal_addQuery: PoModalComponent;
  protected lbl_addQueryTitle: string = null;
  
  //Objeto de consulta do formulário (Modal)
  protected query: QueryClient = new QueryClient(null);
  
  //Variável de suporte, usada para detectar alterações em uma rotina já cadastrada
  protected oldCommand: string = null;
  
  //Remoção de consultas
  @ViewChild('modal_deleteQuery') modal_deleteQuery: PoModalComponent;
  protected lbl_deleteQueryTitle: string = null;
  
  /******* Formulário *******/
  //Títulos dos campos
  protected lbl_schedule: string = null;
  protected lbl_queryName: string = null;
  protected lbl_queryExecutionMode: string = null;
  protected lbl_queryQuery: string = null;
  protected lbl_delete: string = null;
  protected lbl_goBack: string = null;
  protected lbl_confirm: string = null;
  protected lbl_add: string = null;
  
  //Balões de ajuda
  protected ttp_queryName: string = null;
  protected ttp_executionMode: string = null;
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _serverService: ServerService,
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _queryService: QueryService,
    private _scheduleService: ScheduleService,
    private _electronService: ElectronService,
    private _mirrorService: MirrorService,
    private _translateService: TranslationService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    
    //Tradução dos modos de execução das consutlas (completa / mensal)
    this.CNST_QUERY_EXECUTION_MODES = [
      { label: this._translateService.CNST_TRANSLATIONS['QUERIES.EXECUTION_MODES.COMPLETE'], value: 'C' },
      { label: this._translateService.CNST_TRANSLATIONS['QUERIES.EXECUTION_MODES.MONTHLY'], value: 'M' }
    ];
    
    //Tradução das ações de apagar / editar uma consulta de um agendamento
    this.setTableRowActions = [
      {
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.EDIT'],
        visible: (q: QueryClient) => ((this.isPlatform) || (!q.TOTVS)),
        action: (query: QueryClient) => {
          this.lbl_addQueryTitle = this._translateService.CNST_TRANSLATIONS['QUERIES.EDIT_QUERY'];
          this.oldCommand = this.query.command;
          this.query = Object.assign(new QueryClient(null), query);
          this.modal_addQuery.open();
        }
      },{
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.DELETE'],
        visible: true,
        action: (query: QueryClient) => {
          this.queryToDelete = query;
          this.modal_deleteQuery.open();
        }
      }
    ];
    
    //Tradução do botão de exportar consultas dos agendamentos
    this.setListViewActions = [
      { label: this._translateService.CNST_TRANSLATIONS['QUERIES.IMPORT_QUERIES'], action: this.importQuery.bind(this), visible: true }
    ];
    
    //Tradução das colunas da tabela de consultas dos agendamentos
    this.setColumns = [
      { property: 'moduleName', label: this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.MODULE'], type: 'string', width: '15%', sortable: true },
      { property: 'name', label: this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.QUERY_NAME'], type: 'string', width: '19%', sortable: true },
      { property: 'executionModeName', label: this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.MODE'], type: 'string', width: '20%', sortable: false },
      { property: 'command', label: this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.SQL'], type: 'string', width: '23%', sortable: false },
      { property: 'TOTVSName', label: this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.TOTVS'], type: 'string', width: '23%', sortable: true }
    ];
    
    //Tradução das mensagens padrões do componente de listagem do Portinari.UI
    this.setLiterals = {
      noData: this._translateService.CNST_TRANSLATIONS['QUERIES.NO_DATA']
    };
    
    //Tradução dos botões
    this.lbl_add = this._translateService.CNST_TRANSLATIONS['BUTTONS.ADD'];
    this.lbl_confirm = this._translateService.CNST_TRANSLATIONS['BUTTONS.CONFIRM'];
    this.lbl_goBack = this._translateService.CNST_TRANSLATIONS['BUTTONS.GO_BACK'];
    this.lbl_delete = this._translateService.CNST_TRANSLATIONS['BUTTONS.DELETE'];
    
    //Tradução dos campos de formulário
    this.lbl_title = this._translateService.CNST_TRANSLATIONS['QUERIES.TITLE'];
    this.lbl_deleteQueryTitle = this._translateService.CNST_TRANSLATIONS['QUERIES.DELETE_CONFIRMATION'];
    this.lbl_schedule = this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.SCHEDULE_NAME'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_queryName = this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.QUERY_NAME'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_queryExecutionMode = this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.MODE'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_queryQuery = this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.SQL'] + CNST_MANDATORY_FORM_FIELD;
    
    //Tradução dos balões de ajuda dos campos
    this.ttp_queryName = this._translateService.CNST_TRANSLATIONS['QUERIES.TOOLTIPS.QUERY_NAME'];
    this.ttp_executionMode = this._translateService.CNST_TRANSLATIONS['QUERIES.TOOLTIPS.MODE'];
    
    //Configuração da mensagem de acesso remoto (MirrorMode)
    this.mirrorMode = this._mirrorService.getMirrorMode();
    
    //Definição dos campos obrigatórios do formulário
    this.CNST_FIELD_NAMES = [
      { key: 'scheduleId', value: this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.SCHEDULE_NAME'] },
      { key: 'name', value: this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.QUERY_NAME'] },
      { key: 'executionMode', value: this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.MODE'] },
      { key: 'command', value: this._translateService.CNST_TRANSLATIONS['QUERIES.TABLE.SQL'] }
    ];
    
    //Solicita ao Agent-Server as licenças cadastradas para esta instalação do Agent, e consulta o cadastro de ambientes disponíveis no Agent
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.LOADING_LICENSES'] };
    forkJoin([
      this._workspaceService.getWorkspaces(false),
      this._databaseService.getDatabases(false),
      this._serverService.getAvailableLicenses(true)
    ]).subscribe((results: [Workspace[], Database[], AvailableLicenses]) => {
      
      //Redireciona o usuário para a página de origem, caso ocorra uma falha na comunicação com o Agent-Server
      if (results[2] == null) {
        this.connectionLostToServer();
      } else {
        this.workspaces = results[0];
        this.databases = results[1];
        
        //Habilita a edição dos campos disponíveis apenas para a contratação da Plataforma GoodData
        this.isPlatform = (results[2].contractType == CNST_MODALIDADE_CONTRATACAO_PLATAFORMA);
        
        //Realiza a leitura das consultas cadastradas no Agent
        this.loadQueries().subscribe((res: boolean) => {
        });
      }
    }, (err: any) => {
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.LOADING_LICENSES_ERROR'], err);
    });
  }
  
  /* Método que redireciona o usuário para a página inicial do Agent, caso ocorra falha na comunicação com o Agent-Server */
  private connectionLostToServer(): void {
    this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERVER_ERROR']);
    if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    this._router.navigate(['/']);
  }
  
  /* Método de carregamento das consultas cadastradas no Agent */
  private loadQueries(): Observable<boolean> {
    
    //Consulta das informações
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.LOADING'] };
    return forkJoin([
      this._scheduleService.getSchedules(false),
      this._queryService.getQueries(true),
      this._workspaceService.getWorkspaces(false),
      this._databaseService.getDatabases(false)
    ]).pipe(map((results: [Schedule[], QueryClient[], Workspace[], Database[]]) => {
      
      //Combinação dos agendamentos com suas consultas
      this.schedulesQueryTotal = results[0].map((s: Schedule) => {
        let sc: ScheduleQuery = new ScheduleQuery();
        sc.name = s.name;
        sc.schedule = s;
        sc.queries = results[1].filter((q: QueryClient) => (q.scheduleId === s.id));
        
        //Descriptografia das consultas (caso permitido)
        sc.queries = sc.queries.map((q: QueryClient) => {
          q.executionModeName = this.CNST_QUERY_EXECUTION_MODES.find((exec: any) => exec.value == q.executionMode).label;
          q.moduleName = this._translateService.CNST_TRANSLATIONS['LICENSES.MODULES.' + CNST_MODULES.find((module: Module) => module.id == q.module).name];
          q.TOTVSName = (q.TOTVS == false ? this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] : this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED']);
          if ((this._electronService.isElectronApp) && ((!q.TOTVS) || this.isPlatform)) {
            q.command = this._electronService.ipcRenderer.sendSync('AC_decrypt', q.command);
          }
          return q;
        });
        
        let w: Workspace = results[2].find((w: Workspace) => (w.id == s.workspaceId));
        sc.erp = w.license.source;
        sc.product = w.license.product;
        
        //Definição do tipo do banco de dados do agendamento
        sc.databaseType = (() => {
          let db: Database = results[3].find((db: Database) => (db.id == w.databaseIdRef));
          if (db == undefined) return CNST_NO_OPTION_SELECTED;
          else {
            let db_type: any = CNST_DATABASE_TYPES.find((type: any) => (type.value == db.type));
            if (db_type.brand == CNST_DATABASE_OTHER) return CNST_NO_OPTION_SELECTED;
            else return db_type.brand;
          }
        })();
        return sc;
      });
      
      //Definição dos arrays de agendamentos com / sem permissão de exportação de consultas
      this.schedulesQuery = this.schedulesQueryTotal.filter((sq: any) => (sq.databaseType == CNST_NO_OPTION_SELECTED));
      this.schedulesQueryExport = this.schedulesQueryTotal.filter((sq: any) => (sq.databaseType != CNST_NO_OPTION_SELECTED));
      
      //Definição dos agendamentos válidos para receber novas consultas
      this.listSchedule = results[0].filter((s: Schedule) => {
        let w: Workspace = results[2].find((w: Workspace) => (w.id == s.workspaceId));
        let db: Database = results[3].find((db: Database) => (db.id == w.databaseIdRef));
        return (db != undefined);
      }).map((s: Schedule) => {
        return { label: s.name, value: s.id };
      });
      
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      return true;
    }));
  }
  
  /* Método de exportação das consultas padrões do Agent */
  protected importQuery(sc: ScheduleQuery): void {
    
    //Extrai a licença do ambiente atualmente selecionado
    let workspace: Workspace = this.workspaces.find((workspace: Workspace) => (workspace.id == sc.schedule.workspaceId));
    let database: Database = this.databases.find((db: Database) => (db.id == workspace.databaseIdRef));
    let license: License = workspace.license;
    
    //Solicita as consultas mais recentes para o Agent-Server
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.IMPORT_MESSAGE'] };
    forkJoin([
      this._translateService.getTranslations([
        new TranslationInput('QUERIES.MESSAGES.IMPORT_ERROR', [sc.schedule.name])
      ]),
      this._serverService.saveLatestQueries(license, database, sc.schedule.id)
    ]).subscribe((results: [TranslationInput[], number]) => {
      if (results[1] == null) {
        this.connectionLostToServer();
      } else if (results[1] == 0) {
        this.loadQueries().subscribe((res: boolean) => {
          this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.IMPORT_OK'], null);
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        }, (err: any) => {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, results[0]['QUERIES.MESSAGES.IMPORT_ERROR'], err);
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        });
      } else if (results[1] == -1) {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, results[0]['QUERIES.MESSAGES.IMPORT_ERROR']);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      } else if (results[1] == -2) {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.IMPORT_NO_DATA_WARNING']);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      } else {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.IMPORT_WARNING_FAILURES']);
        this.loadQueries().subscribe((res: boolean) => {
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        }, (err: any) => {
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        });
      }
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.LOADING_LICENSES_ERROR'], err);
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    });
  }
  
  /* Método de validação da consulta do Agent */
  private validateQuery(): boolean {
    
    //Valor de retorno do método
    let validate: boolean = true;
    
    //Objeto de suporte para validação dos campos
    let query: QueryClient = new QueryClient(null);
    
    this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.VALIDATE']);
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.VALIDATE'] };
    
    //Verifica se todos os campos da interface de consultas foram preenchidos
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, query).map((p: string) => {
      if ((this.query[p] == '') && (p != 'id') && (p != 'TOTVS')) return p;
    }).filter((p: string) => { return p != null; });
    
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
      propertiesNotDefined = Object.getOwnPropertyNames.call(Object, query).map((p: string) => {
        if ((typeof this.query[p] != typeof query[p]) && (p != 'id') && (p != 'TOTVS')) return p;
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
      }
    }
    
    return validate;
  }
  
  /**************************/
  /*** MÉTODOS DOS MODAIS ***/
  /**************************/
  /* Modal de cadastro de consultas no Agent (OPEN) */
  protected newQuery_OPEN(): void {
    this.lbl_addQueryTitle = this._translateService.CNST_TRANSLATIONS['QUERIES.NEW_QUERY'];
    this.query = new QueryClient(null);
    this.oldCommand = null;
    this.modal_addQuery.open();
  }
  
  /* Modal de edição de consultas no Agent (NAO) */
  protected newQuery_NO(): void {
    this.modal_addQuery.close();
  }
  
  /* Modal de edição de consultas no Agent (SIM) */
  protected newQuery_YES(): void {
    if (this.validateQuery()) {
      
      //Consulta das traduções
      this._translateService.getTranslations([
        new TranslationInput('QUERIES.MESSAGES.SAVE', [this.query.name]),
        new TranslationInput('QUERIES.MESSAGES.ENCRYPT', [this.query.name]),
        new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR', [this.query.name]),
        new TranslationInput('QUERIES.MESSAGES.SAVE_ERROR_SAME_NAME', [this.query.name])
      ]).subscribe((translations: any) => {
        if (this.mirrorMode != 1) this.po_lo_text = { value: translations['QUERIES.MESSAGES.SAVE'] };
        
        //Criptografia da consulta escrita, caso o Electron esteja disponível
        if (this._electronService.isElectronApp) {
          this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['QUERIES.MESSAGES.ENCRYPT']);
          if (this.mirrorMode != 1) this.po_lo_text = { value: translations['QUERIES.MESSAGES.ENCRYPT'] };
          this.query.command = this._electronService.ipcRenderer.sendSync('AC_encrypt', this.query.command);
        }
        
        //Detecção de customizações das consultas padrões
        if (this.oldCommand != this.query.command) this.query.TOTVS = false;
        
        //Gravação da nova consulta no Agent
        this._queryService.saveQuery([Object.assign(new QueryClient(null), this.query)]).subscribe((res: number) => {
          if (res == 0) {
            this.modal_addQuery.close();
            this.loadQueries().subscribe((res: boolean) => {
              this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.SAVE_OK']);
            }, (err: any) => {
              this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.LOADING_ERROR'], err);
              if (this.mirrorMode != 1) this.po_lo_text = { value: null };
            });
          } else {
            if (this._electronService.isElectronApp) this.query.command = this._electronService.ipcRenderer.sendSync('AC_decrypt', this.query.command);
            this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['QUERIES.MESSAGES.SAVE_ERROR_SAME_NAME']);
            if (this.mirrorMode != 1) this.po_lo_text = { value: null };
          }
        }, (err: any) => {
          if (this._electronService.isElectronApp) this.query.command = this._electronService.ipcRenderer.sendSync('AC_decrypt', this.query.command);
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['QUERIES.MESSAGES.SAVE_ERROR'], err);
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        });
      });
    }
  }
  
  /* Modal de remoção de consultas no Agent (NAO) */
  protected deleteQuery_NO(): void {
    this.queryToDelete = null;
    this.modal_deleteQuery.close();
  }
  
  /* Modal de remoção de consultas no Agent (SIM) */
  protected deleteQuery_YES(): void {
    this.modal_deleteQuery.close();
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.DELETE'] };
    
    //Remoção da consulta configurada no Agent
    this._queryService.deleteQuery(this.queryToDelete).subscribe((b: boolean) => {
      
      //Recarga das consultas disponíveis atualmente
      this.loadQueries().subscribe((res: boolean) => {
        this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.DELETE_OK']);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      }, (err: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.DELETE_ERROR'], err);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      });
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['QUERIES.MESSAGES.DELETE_ERROR'], err);
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    });
  }
}
