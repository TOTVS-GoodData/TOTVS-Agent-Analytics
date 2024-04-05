/* Componentes padrões do Angular */
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, Navigation } from '@angular/router';

/* Componentes visuais da biblioteca Portinari.UI */
import { PoSelectOption } from '@po-ui/ng-components';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Serviço de consulta do acesso remoto (MirrorMode) */
import { MirrorService } from '../services/mirror-service';

/* Serviço de comunicação com o Agent-Server */
import { ServerService } from '../services/server/server-service';
import { License, AvailableLicenses } from '../services/server/server-interface';

/* Serviço de modal customizado do Agent (sem Portinari.UI) */
import { ModalService } from '../modal/modal.service';

/* Serviço de comunicação com o GoodData */
import { GoodDataService, GDWorkspace, GDProcess } from '../services/gooddata.service';
import { SessionService } from '../services/session-service';
import { LoginService } from '../services/login.service';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';
import { Workspace } from '../workspace/workspace-interface';
import {
  CNST_MODALIDADE_CONTRATACAO_PLATAFORMA,
  CNST_ERP_OTHER,
  CNST_UPLOAD_URL_PATH,
  CNST_UPLOAD_URL_SUBPATH,
  CNST_DOMAIN
} from '../workspace/workspace-constants';

/* Serviço de banco de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';
import { CNST_MANDATORY_FORM_FIELD, CNST_NO_OPTION_SELECTED } from '../utilities/angular-constants';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, map, switchMap, catchError, of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-workspace-add',
  templateUrl: './workspace-add.component.html',
  styleUrls: ['./workspace-add.component.css'],
})

export class WorkspaceAddComponent {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Título da página
  protected lbl_title: string = null;
  
  //Ambientes a ser configurado
  protected workspace: Workspace = new Workspace();
  
  //Variávels de suporte, usadas para armazenar o ERP / Produto selecionado pelo usuário
  protected workspaceSource: string = '';
  protected workspaceProduct: string = '';
  
  //Licenças recebidas pelo Agent-Server, para esta instalação do Agent
  protected licenses: License[] = [];
  
  //Banco de dados atualmente selecionado
  protected database: Database = new Database();
  
  //Variável de suporte, para mostrar ao usuário os campos obrigatórios não preenchidos.
  protected CNST_FIELD_NAMES: any[] = []
  
  //Variável de suporte, para verificaar se a opção "Nenhum" foi selecionada
  protected _CNST_NO_OPTION_SELECTED: string = CNST_NO_OPTION_SELECTED;
  
  //Define se o Agent está sendo executado via acesso remoto (MirrorMode)
  protected mirrorMode: number = 0;
  
  /****** Portinari.UI ******/
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  //Listagem dos ERPs disponíveis
  protected _CNST_ERP: Array<PoSelectOption> = [];
  
  //Listagem dos produtos dos ERPs disponíveis
  protected _CNST_PRODUTO: Array<PoSelectOption> = [];
  
  //Listagem dos ambientes de GoodData disponíveis
  protected listWorkspaces: Array<PoSelectOption> = [];
  
  //Listagem dos bancos de dados cadastrados no Agent
  protected listDatabase: Array<PoSelectOption> = [];
  
  //Listagem dos processos de ETL disponíveis
  protected listProcess: Array<PoSelectOption> = [];
  
  //Listagem dos graphs do CloudConnect disponíveis
  protected listGraph: Array<PoSelectOption> = [];
  
  /********* Modal **********/
  //Variável que controla a renderização do modal do banco de dados
  protected showModalDatabase: boolean = false;
  
  /******* Formulário *******/
  //Títulos dos campos de ambientes
  protected lbl_erp: string = null;
  protected lbl_product: string = null;
  protected lbl_GDEnvironment: string = null;
  protected lbl_GDUsername: string = null;
  protected lbl_GDPassword: string = null;
  protected lbl_GDWorkspaceId: string = null;
  protected lbl_GDWorkspaceUploadURL: string = null;
  protected lbl_GDProcessId: string = null;
  protected lbl_GDProcessGraph: string = null;
  protected lbl_databaseId: string = null;
  protected lbl_name: string = null;
  protected lbl_edit: string = null;
  protected lbl_goBack: string = null;
  protected lbl_save: string = null;
  protected lbl_testConnection: string = null;
  protected lbl_loadWorkspaces: string = null;
  
  //Títulos dos campos de bancos de dados
  protected lbl_dbUsername: string = null;
  protected lbl_dbType: string = null;
  protected lbl_dbPassword: string = null;
  protected lbl_dbDriverClass: string = null;
  protected lbl_dbDriverPath: string = null;
  
  //Balões de ajuda
  protected ttp_GDEnvironment: string = null;
  protected ttp_GDUsername: string = null;
  protected ttp_GDPassword: string = null;
  protected ttp_GDWorkspaceId: string = null;
  protected ttp_GDWorkspaceUploadURL: string = null;
  protected ttp_GDProcessId: string = null;
  protected ttp_GDProcessGraph: string = null;
  
  constructor(
    private _serverService: ServerService,
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _electronService: ElectronService,
    private _mirrorService: MirrorService,
    private _translateService: TranslationService,
    private _modalService: ModalService,
    private _sessionService: SessionService,
    private _goodDataService: GoodDataService,
    private _loginService: LoginService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    
    //Definição do título da página
    let nav: Navigation = this._router.getCurrentNavigation();
    if ((nav != undefined) && (nav.extras.state)) this.lbl_title = this._translateService.CNST_TRANSLATIONS['WORKSPACES.EDIT_WORKSPACE'];
    else this.lbl_title = this._translateService.CNST_TRANSLATIONS['WORKSPACES.NEW_WORKSPACE'];
    
    //Definição do domínio de upload dos dados para o GoodData (padrão)
    this.workspace.GDEnvironment = CNST_DOMAIN;
    
    //Tradução dos botões
    this.lbl_edit = this._translateService.CNST_TRANSLATIONS['BUTTONS.EDIT'];
    this.lbl_goBack = this._translateService.CNST_TRANSLATIONS['BUTTONS.GO_BACK'];
    this.lbl_save = this._translateService.CNST_TRANSLATIONS['BUTTONS.SAVE'];
    this.lbl_testConnection = this._translateService.CNST_TRANSLATIONS['BUTTONS.TEST_CONNECTION'];
    this.lbl_loadWorkspaces = this._translateService.CNST_TRANSLATIONS['BUTTONS.LOAD_WORKSPACES'];
    
    //Tradução dos campos de formulário (Ambiente)
    this.lbl_erp = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.ERP'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_product = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.PRODUCT'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_GDUsername = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.USERNAME'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_GDEnvironment = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.ENVIRONMENT'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_GDPassword = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.PASSWORD'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_GDWorkspaceId = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.WORKSPACE'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_GDWorkspaceUploadURL = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.UPLOAD_URL'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_GDProcessId = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.PROCESS'];
    this.lbl_GDProcessGraph = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.GRAPH'];
    this.lbl_databaseId = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.DATABASE'] + CNST_MANDATORY_FORM_FIELD;
    this.lbl_name = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.NAME'] + CNST_MANDATORY_FORM_FIELD;
    
    //Tradução dos campos de formulário (Banco de Dados)
    this.lbl_dbUsername = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.USERNAME'];
    this.lbl_dbType = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.TYPE'];
    this.lbl_dbPassword = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.PASSWORD'];
    this.lbl_dbDriverClass = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.DRIVER_CLASS'];
    this.lbl_dbDriverPath = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.DRIVER_PATH'];
    
    //Tradução dos balões de ajuda dos campos
    this.ttp_GDEnvironment = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TOOLTIPS.ENVIRONMENT'];
    this.ttp_GDUsername = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TOOLTIPS.USERNAME'];
    this.ttp_GDPassword = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TOOLTIPS.PASSWORD'];
    this.ttp_GDWorkspaceId = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TOOLTIPS.WORKSPACE'];
    this.ttp_GDWorkspaceUploadURL = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TOOLTIPS.UPLOAD_URL'];
    this.ttp_GDProcessId = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TOOLTIPS.PROCESS'];
    this.ttp_GDProcessGraph = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TOOLTIPS.GRAPH'];
    
    //Configuração da mensagem de acesso remoto (MirrorMode)
    this.mirrorMode = this._mirrorService.getMirrorMode();
    
    //Definição dos campos obrigatórios do formulário
    this.CNST_FIELD_NAMES = [
      { key: 'workspaceSource', value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.ERP'] },
      { key: 'workspaceProduct', value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.PRODUCT'] },
      { key: 'GDUsername', value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.USERNAME'] },
      { key: 'GDEnvironment', value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.ENVIRONMENT'] },
      { key: 'GDPassword', value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.PASSWORD'] },
      { key: 'GDWorkspaceId', value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.WORKSPACE'] },
      { key: 'GDWorkspaceUploadURL', value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.UPLOAD_URL'] },
      { key: 'GDProcessId', value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.PROCESS'] },
      { key: 'GDProcessGraph', value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.GRAPH'] },
      { key: 'databaseIdRef', value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.DATABASE'] },
      { key: 'name', value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.NAME'] }
    ];
    
    //Solicita ao servidor as licenças cadastradas para esta instalação do Agent
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.LOADING_LICENSES'] };
    forkJoin(
      this._serverService.getAvailableLicenses(true),
      this.getDatabases()
    ).subscribe((results: [AvailableLicenses, void]) => {
      
      //Redireciona o usuário para a página de origem, caso ocorra uma falha na comunicação com o Agent-Server
      if (results[0] == null) {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.SERVER_ERROR']);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        this._router.navigate(['/workspace']);
      } else {

        //Armazena as licenças disponíveis para esta instalação do Agent
        this.licenses = results[0].licenses;
        
        //Definição dos ERPs disponíveis para seleção
        let erps: Set<string> = new Set();
        this._CNST_ERP = results[0].licenses.filter((l: License) => {
          let check: boolean = erps.has(l.source);
          erps.add(l.source);
          return !check;
        }).map((l: License) => {
          return { label: l.source, value: l.source };
        }).sort((v1: any, v2: any) => {
          let order: number = null;
          
          if (v1.label < v2.label) order = -1;
          else if (v1.label > v2.label) order =  1;
          else order = 0;
          
          return order;
        });
        
        //Realiza a tradução da opção "Outro" dos ERPs
        let outros: any = this._CNST_ERP.find((erp: any) => (erp.value == CNST_ERP_OTHER));
        if (outros) outros.label = this._translateService.CNST_TRANSLATIONS['ANGULAR.OTHER'];
        
        //Seleção automática do ERP (Caso só exista uma única opção)
        if (this._CNST_ERP.length == 1) {
          this.workspaceSource = this._CNST_ERP[0].value + '';
          this.onChangeERP(this.workspaceSource);
        }

        //Realiza a leitura do ambiente a ser editado (se houver)
        if ((nav != undefined) && (nav.extras.state)) {

          this.workspace.id = nav.extras.state['id'];
          
          //Dispara antecipadamente o evento de alteração do banco de dados do formuláro
          this.onChangeDatabase(nav.extras.state['databaseIdRef']);
          
          //Dispara antecipadamente o evento de configuração dos módulos disponíveis no Agent
          this.onChangeERP(nav.extras.state['license'].source);
          
          //Configura as variáveis de suporte da licença
          this.workspaceSource = nav.extras.state['license'].source;
          this.workspaceProduct = nav.extras.state['license'].product;
          
          //Método disparado para atualiza a listagem de ambientes de GoodData disponíveis para o usuário cadastrado
          this.getWorkspaces(
            nav.extras.state['GDUsername'],
            nav.extras.state['GDPassword'],
            nav.extras.state['GDEnvironment'],
            false
          ).subscribe((res: boolean) => {
            this.workspace.GDWorkspaceId = nav.extras.state['GDWorkspaceId'];
            this.onChangeWorkspace().subscribe((res: boolean) => {
              this.workspace.GDProcessId = nav.extras.state['GDProcessId'];
              this.onChangeProcess();
              
              //Copia todos os valores do ambiente a ser editado, para o objeto de ambiente do formulário
              Object.getOwnPropertyNames.call(Object, nav.extras.state).map((p: string) => {
                this.workspace[p] = nav.extras.state[p];
              });
            });
          });
        } else {
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        }
      }
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.SERVER.MESSAGES.LOADING_LICENSES_ERROR']);
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    });
  }
  
  /* Método usado para ler o comando de "Enter" no campo de senha do usuário */
  protected enterPassword(event: any): void {
    event.preventDefault();
    this.getWorkspaces(
      this.workspace.GDUsername,
      this.workspace.GDPassword,
      this.workspace.GDEnvironment,
      false
    ).subscribe();
  }
  
  /* Método de retorno à página anterior */
  protected goBack(): void {
    this._router.navigate(['/workspace']);
  }
  
  /* Método que atualiza os bancos de dados disponíveis na listagem do formulário */
  private getDatabases(): Observable<void> {
    
    //Consulta todos os bancos de dados cadastrados no Agent
    return this._databaseService.getDatabases(false).pipe(map((database: Database[]) => {
      
      //Atualiza o objeto de lista dos bancos de dados
      this.listDatabase = database.map((db: Database) => {
        return { label: db.name, value: db.id };
      });
      
      //Adiciona o banco de dados "Nenhum" à listagem
      this.listDatabase.push({
        label: this._translateService.CNST_TRANSLATIONS['ANGULAR.NONE'],
        value: CNST_NO_OPTION_SELECTED
      });
    }), catchError((err: any) => {
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_ERROR']);
      throw err;
    }));
  }
  
  /* Método que realiza o login do usuário no GoodData, e atualiza as opções de ambientes / ETL disponíveis no Agent */
  protected getWorkspaces(username: string, password: string, environment: string, rememberMe: boolean): Observable<boolean> {
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SERVICES.GOODDATA.MESSAGES.LOADING'] };
    
    //Solicita a descriptografia da senha do usuário, para fazer o login no GoodData (Apenas disponível c/ Electron)
    if ((this._electronService.isElectronApp) && (this.workspace.id != null)) {
      password = this._electronService.ipcRenderer.sendSync('AC_decrypt', password);
    }
    
    //Efetua o login no GoodData
    return this._loginService.doLogin(
      username,
      password,
      environment,
      rememberMe
    ).pipe(switchMap((b: boolean) => {
      
      /*
        Inicializa o serviço de comunicação com o GoodData.
        
        Este serviço, ao ser inicializado, cria um objeto HOF
        com todos os ambientes disponíveis para o usuário,
        seus métodos de consulta de ETLs, dashboards,
        entre outros objetos.
        O serviço também pré-configura o objeto "CURRENT_PROJECT"
        com o ambiente atualmente selecionado no formulário 
        do Agent (caso tenha sido),
        
        (HOF - Higher Order Function)
      */
      if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SERVICES.GOODDATA.MESSAGES.LOADING_WORKSPACES'] };
      return this._goodDataService.init(
        this._sessionService.USER_ID,
        this.workspace.GDWorkspaceId
      ).pipe(map((b: boolean) => {
        
        //Atualiza a listagem de ambientes de GoodData disponíveis no Agent
        this.listWorkspaces = this._goodDataService.AVAILABLE_PROJECTS.map((w: GDWorkspace) => {
          return { label: w.name + ' - ' + w.id, value: w.id }
        });
        
        /*
          Verifica se o ambiente atualmente selecionado no formulário do Agent
          (caso tenha sido) ainda é válido, para a nova solicitação de login.
          
          Este processo é importante caso um ambiente já tenha sido selecionado
          no formulário, mas o usuário tenha preenchido outras credenciais, e 
          solicitado o login novamente.
          
          Caso seja, apenas a listadem de processos de ETL / graphs disponíveis
          são atualizados.
          Caso não seja, os campos de seleção do Agent são resetados.
        */
        if (this._goodDataService.CURRENT_PROJECT === undefined) {
          this.workspace.GDWorkspaceId = undefined;
          this.workspace.GDProcessId = undefined;
          this.workspace.GDProcessGraph = undefined;
        
          this.listProcess = [];
          this.listGraph = [];
        } else {
          
          //Atualiza a listagem de processos de ETL disponíveis, para o ambiente selecionado
          this.listProcess = this._goodDataService.CURRENT_PROJECT.processes.map((p: GDProcess) => {
            return { label: p.name + ' - ' + p.id, value: p.id }
          });
          
          //Atualiza a listagem de graphs disponíveis, para o ambiente selecionado
          if (this.workspace.GDProcessId != undefined) {
            this.listGraph = this._goodDataService.CURRENT_PROJECT.processes.find((p: any) => { return this.workspace.GDProcessId === p.id }).graphs.map((g: string) => {
              return { label: g, value: g }
            });
          }
        }
        
        this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['SERVICES.GOODDATA.MESSAGES.LOADING_WORKSPACES_OK']);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        return true;
      }), catchError((err: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.GOODDATA.MESSAGES.LOADING_WORKSPACES_ERROR'], err);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        throw err;
      }));
    }), catchError((err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.GOODDATA.MESSAGES.LOADING_ERROR'], err.error.message);
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      throw err;
    }));
  }
  
  /* Método executado ao trocar o ERP do ambiente */
  protected onChangeERP(e: string): void {
    console.log(this.licenses);
    //Define a listagem de todos os módulos disponíveis para o ERP selecionado
    this._CNST_PRODUTO = this.licenses.filter((l: License) => l.source === e)
    .map((l: License) => {
      return { label: l.product, value: l.product };
    }).sort((m1: any, m2: any) => {
      let order: number = null;
      
      if (m1.label < m2.label) order = -1;
      else if (m1.label > m2.label) order = 1;
      else order = 0;
      
      return order;
    });
    
    //Realiza a tradução da opção "Outro" dos produtos
    let outros: any = this._CNST_PRODUTO.find((product: any) => (product.value == CNST_ERP_OTHER));
    if (outros) outros.label = this._translateService.CNST_TRANSLATIONS['ANGULAR.OTHER'];
    
    //Define o valor padrão do campo de produto
    if (this._CNST_PRODUTO.length == 1) {
      this.workspaceProduct = this._CNST_PRODUTO[0].value + '';
    } else {
      this.workspaceProduct = '';
    }
  }
  
  /* Método executado ao trocar o ambiente do GoodData */
  protected onChangeWorkspace(): Observable<boolean> {
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SERVICES.GOODDATA.MESSAGES.LOADING_PROCESSES'] };
    
    //Atualiza o ambiente atualmente selecionado no serviço de comunicação com o GoodData
    return this._goodDataService.setCurrentProject(
      this.workspace.GDWorkspaceId
    ).pipe(map((b: boolean) => {
      
      //Atualiza a listagem de processo de ETL disponíveis
      this.listProcess = this._goodDataService.CURRENT_PROJECT.processes.map((p: GDProcess) => {
        return { label: p.name + ' - ' + p.id, value: p.id }
      });
      
      //Reseta as variáveis de processo / graphs
      this.workspace.GDProcessId = undefined;
      this.workspace.GDProcessGraph = undefined;
      this.listGraph = [];
      
      //Atualiza a URL de upload ods arquivos do GoodData, para o valor padrão
      this.workspace.GDWorkspaceUploadURL = CNST_UPLOAD_URL_PATH + this.workspace.GDWorkspaceId + CNST_UPLOAD_URL_SUBPATH;
      
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      return true;
    }), catchError((err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SERVICES.GOODDATA.MESSAGES.LOADING_PROCESSES_ERROR'], err);
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      throw err;
    }));
  }
  
  /* Método executado ao trocar o processo de ETL do ambiente */
  protected onChangeProcess(): void {
    this.workspace.GDProcessGraph = undefined;
    this.listGraph = this._goodDataService.CURRENT_PROJECT.processes.find(
      (p: GDProcess) => this.workspace.GDProcessId === p.id
    ).graphs.map((g: string) => {
      return { label: g, value: g }
    });
  }
  
  /* Método executado ao trocar o banco de dados do ambiente */
  protected onChangeDatabase(id: string): void {
    
    //Verifica se o banco de dados selecionado no formulário não é o "Nenhum"
    if (id != CNST_NO_OPTION_SELECTED) {
      
      //Procura o banco de dados selecionado no banco do Agent
      this._databaseService.getDatabases(false).subscribe((db: Database[]) => {
        this.database = db.find((db: Database) => { return (db.id === id ); });
      }, (err: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.LOADING_ERROR']);
      });
    } else {
      this.database = new Database();
    }
  }
  
  /* Método de validação dos dados preenchidos pelo usuário */
  private validWorkspace(): Observable<boolean> {
    
    //Valor de retorno do método
    let validate: boolean = true;
    
    //Objeto de suporte para validação dos campos
    let workspace: Workspace = new Workspace();
    
    //Variável de suporte, que armazena a senha descriptografada do usuário do GoodData (Caso necessário)
    let password: string = null;
    
    this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.VALIDATE']);
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.VALIDATE'] };
    
    //Verifica se todos os campos da interface de ambientes foram preenchidos
    let propertiesNotDefined: string[] = Object.getOwnPropertyNames.call(Object, workspace).map((p: string) => {
      if ((this.workspace[p] == '') && (p != 'id')) return p;
    }).filter((p: string) => { return p != null; });
    
    //Verifica se os campos de suporte da licença foi preenchido
    if (this.workspaceSource == '') propertiesNotDefined.push('workspaceSource');
    if (this.workspaceProduct == '') propertiesNotDefined.push('workspaceProduct');
    
    // Validação dos campos de formulário
    if (propertiesNotDefined.length > 0) {
      validate = false;
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      let fieldName: string = this.CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value;
      this._translateService.getTranslations([
        new TranslationInput('FORM_ERRORS.FIELD_NOT_FILLED', [fieldName]),
        new TranslationInput('FORM_ERRORS.FIELD_NOT_FILLED_GRAPH', [fieldName])
      ]).subscribe((translations: any) => {
        if (propertiesNotDefined[0] == 'gdc_etl_graph') {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_NOT_FILLED_GRAPH']);
        } else {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['FORM_ERRORS.FIELD_NOT_FILLED']);
        }
      });
      
    //Verifica se a tipagem esperada de todos os campos da interface estão corretas
    } else {
      propertiesNotDefined = Object.getOwnPropertyNames.call(Object, workspace).map((p: string) => {
        if ((typeof this.workspace[p] != typeof workspace[p]) && (p != 'id')) return p;
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
    
    //Validação do login do GoodData
    if (validate) {
      
      //Descriptografia da senha de usuário do GoodData (Apenas dispnível c/ Electron)
      if ((this._electronService.isElectronApp) && (this.workspace.id != null)) {
        password = this._electronService.ipcRenderer.sendSync('AC_decrypt', this.workspace.GDPassword);
      } else {
        password = this.workspace.GDPassword;
      }
      
      return this._loginService.doLogin(this.workspace.GDUsername, password, this.workspace.GDEnvironment, false);
    } else { return of(false); }
  }
  
  /* Método de gravação do banco de dados configurado */
  protected saveWorkspace(): Observable<void> {
    
    //Realiza a validação dos dados preenchidos pelo usuário
    return this.validWorkspace().pipe(switchMap((validate: boolean) => {
      if (validate) {
        
        //Vincula a licença selecionada neste ambiente
        this.workspace.license = this.licenses.find((l: License) => ((l.source == this.workspaceSource) && (l.product == this.workspaceProduct)));
        
        //Consulta das traduções
        return this._translateService.getTranslations([
          new TranslationInput('WORKSPACES.MESSAGES.SAVE', [this.workspace.name]),
          new TranslationInput('WORKSPACES.MESSAGES.SAVE_ERROR', [this.workspace.name]),
          new TranslationInput('WORKSPACES.MESSAGES.SAVE_ERROR_SAME_NAME', [this.workspace.name]),
        ]).pipe(switchMap((translations: any) => {
          
          //Realiza a criptografia da senha do usuário do GoodData, caso o Electron esteja disponível
          if ((this._electronService.isElectronApp) && (this.workspace.id == null)) {
            this._utilities.writeToLog(CNST_LOGLEVEL.DEBUG, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.PASSWORD_ENCRYPT']);
            if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.PASSWORD_ENCRYPT'] };
            this.workspace.GDPassword = this._electronService.ipcRenderer.sendSync('AC_encrypt', this.workspace.GDPassword);
          }
          
          //Grava o novo ambiente do Agent, e retorna à página anterior, caso bem sucedido
          if (this.mirrorMode != 1) this.po_lo_text = { value: translations['WORKSPACES.MESSAGES.SAVE'] };
          return this._workspaceService.saveWorkspace(Object.assign(new Workspace(), this.workspace)).pipe(map((res: boolean) => {
            if (res) {
              this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.SAVE_OK']);
              this.goBack();
            } else {
              this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['WORKSPACES.MESSAGES.SAVE_ERROR_SAME_NAME']);
            }
            if (this.mirrorMode != 1) this.po_lo_text = { value: null };
          }, (err: any) => {
            this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['WORKSPACES.MESSAGES.SAVE_ERROR'], err);
            if (this.mirrorMode != 1) this.po_lo_text = { value: null };
          }));
        }));
      }
    }));
  }
  
  /**************************/
  /*** MÉTODOS DOS MODAIS ***/
  /**************************/
  /*
    Modal de detalhamento do banco de dados do ambiente (NOVO)
    
    Este método é chamado quando o usuário tenta cadastrar um 
    novo banco de dados para o ambiente, mesmo que já exista
    um vinculado ao mesmo.
  */
  protected newModalDatabase(): void {
    this.database = new Database();
    this.workspace.databaseIdRef = CNST_NO_OPTION_SELECTED;
    this.openModalDatabase();
  }
  
  /* Modal de detalhamento do banco de dados do ambiente (ABRIR) */
  protected openModalDatabase(): void {
    this.showModalDatabase = true;
    this._modalService.open('modal-database');
  }
  
  /* Modal de detalhamento do banco de dados do ambiente (FECHAR) */
  protected closeModalDatabase(newDatabase?: Database): void {
    this._modalService.close('modal-database');
    this.showModalDatabase = false;
    
    /*
      Caso o banco de dados tenha sido cadastrado com sucesso, o 
      mesmo é vinculado ao ambiente atual, e o cadastro de bancos
      disponíveis é atualizado.
    */
    if (newDatabase) {
      this.getDatabases().subscribe(() => {
        
        //Seleciona o banco de dados criado / editado na listagem de bancos de dados
        setTimeout(
          () => {
            this.workspace.databaseIdRef = newDatabase.id;
            this.onChangeDatabase(this.workspace.databaseIdRef);
          },
          100
        );
      });
    }
  }
  
  /* Método de teste de conexão ao banco de dados (via botão da interface) */
  private testDatabaseConnection(): Observable<boolean> {
    
    //Consulta das traduções
    return this._translateService.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.LOGIN', [this.database.name]),
    ]).pipe(switchMap((translations: any) => {
      if (this.mirrorMode != 1) this.po_lo_text = { value: translations['DATABASES.MESSAGES.LOGIN'] };
      
      //Disparo da requisição de teste ao serviço de banco de dados
      let db: Database = new Database().toObject(this.database);
      return this._databaseService.testConnection(db, true).pipe(map((res: number) => {
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        return ((res == 0) || (res == -998));
      }));
    }));
  }
}
