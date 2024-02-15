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
  ScriptCommunication
} from '../services/server/server-interface';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';
import { Workspace } from '../workspace/workspace-interface';
import { CNST_ERP_PROTHEUS, CNST_MODALIDADE_CONTRATACAO_PLATAFORMA } from '../workspace/workspace-constants';

/* Serviço de banco de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';
import { CNST_DATABASE_TYPES, CNST_DATABASE_OTHER } from '../database/database-constants';

/* Constante de módulos do FAST Analytics */
import { Module } from '../utilities/module-interface';
import { CNST_MODULES } from '../utilities/module-constants';

/* Serviço de rotinas do Agent */
import { ScriptService } from './script-service';
import { ScriptClient } from './script-interface';

/* Serviço de agendamentos do Agent */
import { ScheduleService } from '../schedule/schedule-service';
import { Schedule, ScheduleScript } from '../schedule/schedule-interface';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, map, catchError, forkJoin } from 'rxjs';

@Component({
  selector: 'app-script',
  templateUrl: './script.component.html',
  styleUrls: ['./script.component.css']
})
export class ScriptComponent {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Título da página
  protected lbl_title: string = null;
  
  //Rotina selecionada p/ remoção
  protected scriptToDelete: ScriptClient = null;
  
  //Listagem de todos os agendamentos cadastrados, e suas rotinas
  protected schedulesScriptTotal: ScheduleScript[] = [];
  
  //Listagem de todos os agendamentos cadastrados, e suas rotinas (sem permissão p/ exportação)
  protected schedulesScript: ScheduleScript[] = [];
  
  //Listagem de todos os agendamentos cadastrados, e suas rotinas (com permissão p/ exportação)
  protected schedulesScriptExport: ScheduleScript[] = [];
  
  //Define se a rotina a ser configurada é de um ambiente de modalidade "Plataforma"
  protected isPlatform: boolean = false;
  
  //Listagem de todos os ambientes disponíveis no Agent
  private workspaces: Array<Workspace> = [];
  
  //Listagem de todos os agendamentos válidos para receberem novas rotinas
  protected listSchedule: Array<PoSelectOption> = null;
  
  //Variável de suporte, para mostrar ao usuário os campos obrigatórios não preenchidos.
  protected CNST_FIELD_NAMES: Array<any> = [];
  
  //Define se o Agent está sendo executado via acesso remoto (MirrorMode)
  protected mirrorMode: number = 0;
  
  /****** Portinari.UI ******/
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  //Ações disponíveis para cada agendamento
  protected setListViewActions: Array<PoListViewAction> = [];
  
  //Colunas da tabela de rotinas dos agendamentos
  protected setColumns: Array<PoTableColumn> = [];
  
  //Ações disponíveis para cada linha da tabela de rotinas
  protected setTableRowActions: Array<PoTableAction> = [];
  
  //Mensagens padrões da listagem de rotinas
  protected setLiterals: PoListViewLiterals = null;
  
  /********* Modal **********/
  //Cadastro de rotinas
  @ViewChild('modal_addScript') modal_addScript: PoModalComponent;
  protected lbl_addScriptTitle: string = null;
  
  //Objeto de rotina do formulário (Modal)
  protected script = new ScriptClient(null);
  
  //Variável de suporte, usada para detectar alterações em uma rotina já cadastrada
  protected oldCommand: string = null;
  
  //Remoção de rotinas
  @ViewChild('modal_deleteScript') modal_deleteScript: PoModalComponent;
  protected lbl_deleteScriptTitle: string = null;
  
  /******* Formulário *******/
  //Títulos dos campos
  protected lbl_schedule: string = null;
  protected lbl_scriptName: string = null;
  protected lbl_scriptQuery: string = null;
  protected lbl_delete: string = null;
  protected lbl_goBack: string = null;
  protected lbl_confirm: string = null;
  protected lbl_add: string = null;
  
  //Balões de ajuda
  protected ttp_scriptName: string = null;
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _serverService: ServerService,
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _scriptService: ScriptService,
    private _scheduleService: ScheduleService,
    private _electronService: ElectronService,
    private _mirrorService: MirrorService,
    private _translateService: TranslationService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    
    //Tradução das ações de apagar / editar uma consulta de um agendamento
    this.setTableRowActions = [
      {
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.EDIT'],
        visible: (s: ScriptClient) => ((this.isPlatform) || (!s.TOTVS)),
        action: (script: ScriptClient) => {
          this.lbl_addScriptTitle = this._translateService.CNST_TRANSLATIONS['SCRIPTS.EDIT_SCRIPT'];
          this.script = Object.assign(new ScriptClient(null), script);
          this.oldCommand = this.script.command;
          this.modal_addScript.open();
        }
      },{
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.DELETE'],
        visible: true,
        action: (script: ScriptClient) => {
          this.scriptToDelete = script;
          this.modal_deleteScript.open();
        }
      }
    ];
    
    //Tradução do botão de exportar consultas dos agendamentos
    this.setListViewActions = [
      { label: this._translateService.CNST_TRANSLATIONS['SCRIPTS.IMPORT_SCRIPTS'], action: this.importScript.bind(this), visible: true }
    ];
    
    //Tradução das colunas da tabela de consultas dos agendamentos
    this.setColumns = [
      { property: 'moduleName', label: this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.MODULE'], type: 'string', width: '15%', sortable: true },
      { property: 'name', label: this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SCRIPT_NAME'], type: 'string', width: '20%', sortable: true },
      { property: 'command', label: this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SQL'], type: 'string', width: '50%', sortable: false },
      { property: 'TOTVSName', label: this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.TOTVS'], type: 'string', width: '15%', sortable: true }
    ];
    
    //Tradução das mensagens padrões do componente de listagem do Portinari.UI
    this.setLiterals = {
      noData: this._translateService.CNST_TRANSLATIONS['SCRIPTS.NO_DATA']
    };
    
    //Tradução dos botões
    this.lbl_add = this._translateService.CNST_TRANSLATIONS['BUTTONS.ADD'];
    this.lbl_confirm = this._translateService.CNST_TRANSLATIONS['BUTTONS.CONFIRM'];
    this.lbl_goBack = this._translateService.CNST_TRANSLATIONS['BUTTONS.GO_BACK'];
    this.lbl_delete = this._translateService.CNST_TRANSLATIONS['BUTTONS.DELETE'];
    
    //Tradução dos campos de formulário
    this.lbl_title = this._translateService.CNST_TRANSLATIONS['SCRIPTS.TITLE'];
    this.lbl_schedule = this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SCHEDULE_NAME'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_scriptName = this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SCRIPT_NAME'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_scriptQuery = this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SQL'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_deleteScriptTitle = this._translateService.CNST_TRANSLATIONS['SCRIPTS.DELETE_CONFIRMATION'];
    
    //Tradução dos balões de ajuda dos campos
    this.ttp_scriptName = this._translateService.CNST_TRANSLATIONS['SCRIPTS.TOOLTIPS.SCRIPT_NAME'];
    
    //Configuração da mensagem de acesso remoto (MirrorMode)
    this.mirrorMode = this._mirrorService.getMirrorMode();
    
    //Definição dos campos obrigatórios do formulário
    this.CNST_FIELD_NAMES = [
      { key: 'scheduleId', value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SCHEDULE_NAME'] },
      { key: 'name', value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SCRIPT_NAME'] },
      { key: 'command', value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SQL'] }
    ];
    
    //Solicita ao Agent-Server as licenças cadastradas para esta instalação do Agent, e consulta o cadastro de ambientes disponíveis no Agent
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.LOADING_LICENSES'] };
    forkJoin([
      this._workspaceService.getWorkspaces(false),
      this._serverService.getAvailableLicenses(true)
    ]).subscribe((results: [Workspace[], AvailableLicenses]) => {
      
      //Redireciona o usuário para a página de origem, caso ocorra uma falha na comunicação com o Agent-Server
      if (results[1] == null) {
        this.connectionLostToServer();
      } else {
        this.workspaces = results[0];
        
        //Habilita a edição dos campos disponíveis apenas para a contratação da Plataforma GoodData
        this.isPlatform = (results[1].contractType == CNST_MODALIDADE_CONTRATACAO_PLATAFORMA);
        
        //Realiza a leitura das consultas cadastradas no Agent
        this.loadScripts().subscribe((res: boolean) => {
        });
        
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
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
  
  /* Método de carregamento das rotinas cadastradas no Agent */
  private loadScripts(): Observable<boolean> {
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING'] };
    
    //Consulta das informações
    return forkJoin([
       this._scheduleService.getSchedules(false)
      ,this._scriptService.getScripts(true)
      ,this._workspaceService.getWorkspaces(false)
      ,this._databaseService.getDatabases(false)
    ]).pipe(map((results: [Schedule[], ScriptClient[], Workspace[], Database[]]) => {
      
      //Combinação dos agendamentos com suas rotinas
      this.schedulesScriptTotal = results[0].map((s: Schedule) => {
        let ss: ScheduleScript = new ScheduleScript();
        ss.name = s.name
        ss.schedule = s;
        ss.scripts = results[1].filter((script: ScriptClient) => (s.id === script.scheduleId));
        
        //Descriptografia das rotinas (caso permitido)
        ss.scripts.map((s: ScriptClient) => {
          s.moduleName = this._translateService.CNST_TRANSLATIONS['LICENSES.MODULES.' + CNST_MODULES.find((module: Module) => module.id == s.module).name];
          s.TOTVSName = (s.TOTVS == false ? this._translateService.CNST_TRANSLATIONS['BUTTONS.YES_SIMPLIFIED'] : this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_SIMPLIFIED']);
          if ((this._electronService.isElectronApp) && ((!s.TOTVS) || this.isPlatform)) {
            s.command = this._electronService.ipcRenderer.sendSync('AC_decrypt', s.command);
          }
        });
        
        let w: Workspace = results[2].find((w: Workspace) => (w.id == s.workspaceId));
        ss.erp = w.license.source;
        ss.product = w.license.product;
        
        //Definição do tipo do banco de dados do agendamento
        ss.databaseType = (() => {
          let db: Database = results[3].find((db: Database) => (db.id == w.databaseIdRef));
          if (db == undefined) return CNST_NO_OPTION_SELECTED;
          else {
            let db_type: any = CNST_DATABASE_TYPES.find((type: any) => (type.value == db.type));
            if (db_type.brand == CNST_DATABASE_OTHER) return CNST_NO_OPTION_SELECTED;
            else return db_type.brand;
          }
        })();
        return ss;
      });
      
      //Definição dos arrays de agendamentos com / sem permissão de exportação de rotinas
      this.schedulesScript = this.schedulesScriptTotal.filter((ss: any) => (ss.databaseType == CNST_NO_OPTION_SELECTED));
      this.schedulesScriptExport = this.schedulesScriptTotal.filter((ss: any) => (ss.databaseType != CNST_NO_OPTION_SELECTED));
      
      //Definição dos agendamentos válidos para receber novas rotinas
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
  
  /* Método de exportação das rotinas padrões do Agent */
  protected importScript(ss: ScheduleScript): void {
    
    //Extrai a licença do ambiente atualmente selecionado
    let workspace: Workspace = this.workspaces.find((workspace: Workspace) => (workspace.id == ss.schedule.workspaceId));
    let license: License = workspace.license;
    
    //Solicita as rotinas mais recentes para o Agent-Server
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.IMPORT_MESSAGE'] };
    forkJoin([
      this._translateService.getTranslations([
        new TranslationInput('SCRIPTS.MESSAGES.IMPORT_ERROR', [ss.schedule.name])
      ]),
      this._serverService.saveLatestScripts(license, ss.databaseType, ss.schedule.id)
    ]).subscribe((results: [TranslationInput[], number]) => {
      if (results[1] == null) {
        this.connectionLostToServer();
      } else if (results[1] == 0) {
        this.loadScripts().subscribe((res: boolean) => {
          this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.IMPORT_OK'], null);
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        }, (err: any) => {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.IMPORT_ERROR'], err);
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        });
      } else if (results[1] == -1) {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, results[0]['SCRIPTS.MESSAGES.IMPORT_ERROR']);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      } else if (results[1] == -2) {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.IMPORT_NO_DATA_ERROR']);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      } else {
        this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.IMPORT_WARNING_FAILURES']);
        this.loadScripts().subscribe((res: boolean) => {
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        }, (err: any) => {
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        });
      }
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.IMPORT_ERROR'], err);
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    });
  }
  
  /* Método de validação da rotina do Agent */
  private validateScript(): boolean {
    
    //Valor de retorno do método
    let validate: boolean = true;
    
    //Objeto de suporte para validação dos campos
    let script = new ScriptClient(null);
    
    this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.VALIDATE']);
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.VALIDATE'] };
    
    //Verifica se todos os campos da interface de rotinas foram preenchidos
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, script).map((p: string) => {
      if ((this.script[p] == '') && (p != 'id') && (p != 'TOTVS')) return p;
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
      propertiesNotDefined = Object.getOwnPropertyNames.call(Object, script).map((p: string) => {
        if ((typeof this.script[p] != typeof script[p]) && (p != 'id') && (p != 'TOTVS')) return p;
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
  /* Modal de cadastro de rotinas no Agent (OPEN) */
  protected newScript_OPEN(): void {
    this.lbl_addScriptTitle = this._translateService.CNST_TRANSLATIONS['SCRIPTS.NEW_SCRIPT'];
    this.script = new ScriptClient(null);
    this.oldCommand = null;
    this.modal_addScript.open();
  }
  
  /* Modal de edição de rotinas no Agent (NAO) */
  protected newScript_NO(): void {
    this.modal_addScript.close();
  }
  
  /* Modal de edição de rotinas no Agent (SIM) */
  protected newScript_YES(): void {
    if (this.validateScript()) {
      
      //Consulta das traduções
      this._translateService.getTranslations([
        new TranslationInput('SCRIPTS.MESSAGES.SAVE', [this.script.name]),
        new TranslationInput('SCRIPTS.MESSAGES.ENCRYPT', [this.script.name]),
        new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR', [this.script.name]),
        new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME', [this.script.name])
      ]).subscribe((translations: any) => {
        if (this.mirrorMode != 1) this.po_lo_text = { value: translations['SCRIPTS.MESSAGES.SAVE'] };
        
        //Criptografia da rotina escrita, caso o Electron esteja disponível
        if (this._electronService.isElectronApp) {
          this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.ENCRYPT']);
          if (this.mirrorMode != 1) this.po_lo_text = { value: translations['SCRIPTS.MESSAGES.ENCRYPT'] };
          this.script.command = this._electronService.ipcRenderer.sendSync('AC_encrypt', this.script.command);
        }
        
        //Detecção de customizações das rotinas padrões
        if (this.oldCommand != this.script.command) this.script.TOTVS = false;
        
        //Gravação da nova rotina no Agent
        this._scriptService.saveScript([Object.assign(new ScriptClient(null), this.script)]).subscribe((res: number) => {
          if (res == 0) {
            this.modal_addScript.close();
            this.loadScripts().subscribe((res: boolean) => {
              this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.SAVE_OK']);
            }, (err: any) => {
              this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING_ERROR'], err);
              if (this.mirrorMode != 1) this.po_lo_text = { value: null };
            });
          } else {
            if (this._electronService.isElectronApp) this.script.command = this._electronService.ipcRenderer.sendSync('AC_decrypt', this.script.command);
            this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME']);
            if (this.mirrorMode != 1) this.po_lo_text = { value: null };
          }
        }, (err: any) => {
          if (this._electronService.isElectronApp) this.script.command = this._electronService.ipcRenderer.sendSync('AC_decrypt', this.script.command);
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.SAVE_ERROR'], err);
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        });
      });
    }
  }
  
  /* Modal de remoção de rotinas no Agent (NAO) */
  protected deleteScript_NO(): void {
    this.scriptToDelete = null;
    this.modal_deleteScript.close();
  }
  
  /* Modal de remoção de rotinas no Agent (SIM) */
  protected deleteScript_YES(): void {
    this.modal_deleteScript.close();
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.DELETE'] };
    
    //Remoção da rotina configurada no Agent
    this._scriptService.deleteScript(this.scriptToDelete).subscribe((b: boolean) => {
      
      //Recarga das rotinas disponíveis atualmente
      this.loadScripts().subscribe((res: boolean) => {
        this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.DELETE_OK']);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      }, (err: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.DELETE_ERROR'], err);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      });
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.DELETE_ERROR'], err);
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    });
  }
}
