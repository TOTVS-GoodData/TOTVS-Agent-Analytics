/* Componentes padrões do Angular */
import { Component, OnInit, ViewChild } from '@angular/core';

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
import { ElectronService } from 'ngx-electronyzer';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';
import { Workspace } from '../workspace/workspace-interface';
import { CNST_ERP, CNST_ERP_PROTHEUS, CNST_MODALIDADE_CONTRATACAO_PLATAFORMA } from '../workspace/workspace-constants';

/* Serviço de banco de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';
import { CNST_DATABASE_TYPES, CNST_DATABASE_OTHER } from '../database/database-constants';

/* Serviço de rotinas do Agent */
import { ScriptService } from './script-service';
import { ScriptClient } from './script-interface';
import { CNST_QUERY_VERSION_STANDARD } from '../query/query-constants';

/* Serviço de agendamentos do Agent */
import { ScheduleService } from '../schedule/schedule-service';
import { Schedule, ScheduleScript } from '../schedule/schedule-interface';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-script',
  templateUrl: './script.component.html',
  styleUrls: ['./script.component.css']
})
export class ScriptComponent implements OnInit {
  
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
  
  //Listagem de todos os agendamentos válidos para receberem novas rotinas
  protected listSchedule: Array<PoSelectOption> = null;
  
  //Variável de suporte, para mostrar ao usuário os campos obrigatórios não preenchidos.
  protected CNST_FIELD_NAMES: Array<any> = [];
  
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
  protected script = new ScriptClient(CNST_QUERY_VERSION_STANDARD);
  
  //Variável de suporte, usada para detectar alterações em uma rotina já cadastrada
  public bkpScript: string = null;
  
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
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _scriptService: ScriptService,
    private _scheduleService: ScheduleService,
    private _electronService: ElectronService,
    private _translateService: TranslationService,
    private _utilities: Utilities
  ) {
    
    //Tradução das ações de apagar / editar uma consulta de um agendamento
    this.setTableRowActions = [
      {
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.EDIT'],
        visible: (s: ScriptClient) => s.canDecrypt,
        action: (script: ScriptClient) => {
          this.lbl_addScriptTitle = this._translateService.CNST_TRANSLATIONS['SCRIPTS.EDIT_SCRIPT'];
          this.script = script;
          this.bkpScript = script.script;
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
      { label: this._translateService.CNST_TRANSLATIONS['SCRIPTS.IMPORT_SCRIPTS'], action: this.exportScript.bind(this), visible: true }
    ];
    
    //Tradução das colunas da tabela de consultas dos agendamentos
    this.setColumns = [
      { label: this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SCRIPT_NAME'], property: 'name', type: 'string', width: '20%', sortable: true },
      { label: this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SQL'], property: 'script', type: 'string', width: '80%', sortable: false }
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
      
    //Definição dos campos obrigatórios do formulário
    this.CNST_FIELD_NAMES = [
      { key: 'scheduleId', value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SCHEDULE_NAME'] },
      { key: 'name', value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SCRIPT_NAME'] },
      { key: 'script', value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.TABLE.SQL'] }
    ];
  }
  
  /* Método de inicialização dos dados das consultas do Agent */
  public ngOnInit(): void {
    this.loadScripts();
  }
  
  /* Método de carregamento das rotinas cadastradas no Agent */
  private loadScripts(): void {
    this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING'] };
    
    //Consulta das informações
    forkJoin([
       this._scheduleService.getSchedules(false)
      ,this._scriptService.getScripts(true)
      ,this._workspaceService.getWorkspaces(false)
      ,this._databaseService.getDatabases(false)
    ]).subscribe((results: [Schedule[], ScriptClient[], Workspace[], Database[]]) => {
      
      //Combinação dos agendamentos com suas rotinas
      this.schedulesScriptTotal = results[0].map((s: any) => {
        s.schedule = s;
        s.scripts = results[1].filter((script: ScriptClient) => (s.id === script.scheduleId));
        
        //Descriptografia das rotinas (caso permitido)
        s.scripts.map((script: ScriptClient) => {
          if ((this._electronService.isElectronApp) && (script.canDecrypt)) {
            script.script = this._electronService.ipcRenderer.sendSync('decrypt', script.script);
          }
        });
        
        let w: Workspace = results[2].find((w: Workspace) => (w.id == s.workspaceId));
        s.erp = w.license.source;
        //s.contractType = w.contractType;
        s.module = w.license.module;
        
        //Definição do tipo do banco de dados do agendamento
        s.databaseType = (() => {
          let db: Database = results[3].find((db: Database) => (db.id == w.databaseIdRef));
          if (db == undefined) return CNST_NO_OPTION_SELECTED;
          else {
            let db_type: any = CNST_DATABASE_TYPES.find((type: any) => (type.value == db.type));
            if (db_type.brand == CNST_DATABASE_OTHER) return CNST_NO_OPTION_SELECTED;
            else return db_type.brand;
          }
        })();
        return s;
      });
      
      //Definição dos arrays de agendamentos com / sem permissão de exportação de rotinas
      this.schedulesScript = this.schedulesScriptTotal.filter((ss: any) => (ss.databaseType == CNST_NO_OPTION_SELECTED));
      this.schedulesScriptExport = this.schedulesScriptTotal.filter((ss: any) => (ss.databaseType != CNST_NO_OPTION_SELECTED));
      
      //Definição dos agendamentos válidos para receber novas rotinas
      this.listSchedule = results[0].filter((s: Schedule) => {
        let w: Workspace = results[2].find((w: Workspace) => (w.id == s.workspaceId));
        let db: Database = results[3].find((db: Database) => (db.id == w.databaseIdRef));
        return (db != undefined);// && (w.contractType == CNST_MODALIDADE_CONTRATACAO_PLATAFORMA));
      }).map((s: Schedule) => {
        return { label: s.name, value: s.id };
      });
      
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.LOADING_ERROR'], err);
      this.po_lo_text = { value: null };
    });
  }
  
  /* Método de exportação das rotinas padrões do Agent */
  protected exportScript(ss: ScheduleScript): void {
    this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.EXPORT'] };
    this._scriptService.exportScript(ss).subscribe((res: boolean) => {
      if (res) this.loadScripts();
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.EXPORT_ERROR'], err);
      this.po_lo_text = { value: null };
    });
  }
  
  /* Método de validação da rotina do Agent */
  private validateScript(): boolean {
    
    //Valor de retorno do método
    let validate: boolean = true;
    
    //Objeto de suporte para validação dos campos
    let script = new ScriptClient(CNST_QUERY_VERSION_STANDARD);
    
    this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.VALIDATE']);
    this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.VALIDATE'] };
    
    //Verifica se todos os campos da interface de rotinas foram preenchidos
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, script).map((p: string) => {
      if ((this.script[p] == '') && (p != 'id')) return p;
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
      propertiesNotDefined = Object.getOwnPropertyNames.call(Object, script).map((p: string) => {
        if ((typeof this.script[p] != typeof script[p]) && (p != 'id')) return p;
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
    this.script = new ScriptClient(CNST_QUERY_VERSION_STANDARD);
    this.script.canDecrypt = true;
    this.modal_addScript.open();
  }
  
  /* Modal de edição de rotinas no Agent (NAO) */
  protected newScript_NO(): void {
    this.bkpScript = null;
    this.modal_addScript.close();
  }
  
  /* Modal de edição de rotinas no Agent (SIM) */
  protected newScript_YES(): void {
    if (this.validateScript()) {
      this.modal_addScript.close();
      
      //Consulta das traduções
      this._translateService.getTranslations([
        new TranslationInput('SCRIPTS.MESSAGES.SAVE', [this.script.name]),
        new TranslationInput('SCRIPTS.MESSAGES.ENCRYPT', [this.script.name]),
        new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR', [this.script.name]),
        new TranslationInput('SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME', [this.script.name])
      ]).subscribe((translations: any) => {
        this.po_lo_text = { value: translations['SCRIPTS.MESSAGES.SAVE'] };
        
        //Criptografia da rotina escrita, caso o Electron esteja disponível
        if (this._electronService.isElectronApp) {
          if (this.script.script != this.bkpScript) {
            this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, translations['SCRIPTS.MESSAGES.ENCRYPT']);
            this.po_lo_text = { value: translations['SCRIPTS.MESSAGES.ENCRYPT'] };
            this.script.script = this._electronService.ipcRenderer.sendSync('encrypt', this.script.script);
          }
        }
        
        //Gravação da nova rotina no Agent
        this._scriptService.saveScript(this.script).subscribe((res: boolean) => {
          if (res) {
            this.loadScripts();
            this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.SAVE_OK']);
          } else {
            this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.SAVE_ERROR_SAME_NAME']);
          }
          this.po_lo_text = { value: null };
        }, (err: any) => {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['SCRIPTS.MESSAGES.SAVE_ERROR'], err);
          this.po_lo_text = { value: null };
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
    this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.DELETE'] };
    
    //Remoção da rotina configurada no Agent
    this._scriptService.deleteScript(this.scriptToDelete).subscribe((b: boolean) => {
      
      //Recarga das rotinas disponíveis atualmente
      this.loadScripts();
      
      this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.DELETE_OK']);
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCRIPTS.MESSAGES.DELETE_ERROR'], err);
      this.po_lo_text = { value: null };
    });
  }
}
