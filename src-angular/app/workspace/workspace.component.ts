/* Componentes padrões do Angular */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

/* Componentes visuais da biblioteca Portinari.UI */
import {
  PoModalComponent,
  PoListViewAction,
  PoListViewLiterals
} from '@po-ui/ng-components';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from './workspace-service';
import { Workspace } from './workspace-interface';

/* Serviço de banco de dados do Agent */
import { DatabaseService } from '../database/database-service';
import { Database } from '../database/database-interface';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, forkJoin, catchError, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css'],
})

export class WorkspaceComponent implements OnInit {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Título da página
  protected lbl_title: string = null;
  
  //Botão de inclusão de novos bancos
  protected lbl_add: string = null;
  
  //Listagem de todos os ambientes configurados no Agent
  protected workspaces: Workspace[] = [];
  
  //Ambiente selecionado p/ remoção
  private workspaceToDelete: Workspace = null;
  
  //Token do contrato do cliente, usado para validação com o Agent-Server
  protected contractToken: string = null;
  
  /****** Portinari.UI ******/
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  //Títulos dos campos da listagem
  protected lbl_workspace: string = null;
  protected lbl_graph: string = null;
  protected lbl_database: string = null;
  protected lbl_contractToken: string = null;
  protected lbl_contractType: string = null;
  
  //Menu de ações disponíveis dos bancos de dados
  protected setoptions: Array<PoListViewAction> = [];
  
  //Mensagens padrões da listagem de ambientes
  protected setLiterals: PoListViewLiterals = null;
  
  /********* Modal **********/
  //Modal de verificação do contrato do cliente
  @ViewChild('modal_checkContractProducts') modal_checkContractProducts: PoModalComponent = null;
  protected lbl_checkContractProductsTitle: string = null;
  protected lbl_checkContractProductsDescription1: string = null;
  protected lbl_checkContractProductsDescription2: string = null;
  protected lbl_goBack: string = null;
  protected lbl_confirm: string = null;
  
  //Modal de remoção de um ambiente do Agent
  @ViewChild('modal_deleteWorkspace') modal_deleteWorkspace: PoModalComponent = null;
  protected lbl_deleteWorkspaceTitle: string = null;
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _translateService: TranslationService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    //Tradução do menu de ações dos ambientes
    this.setoptions = [
      //Editar
      {
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.EDIT'],
        action: (w: Workspace) => {
          this._router.navigate(['/workspace-add'], { state: w });
        }
      //Remover
      },{
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.DELETE'],
        action: (w: Workspace) => {
          this.workspaceToDelete = w;
          this.modal_deleteWorkspace.open();
        }
      }
    ];
    
    //Tradução das mensagens padrões do componente de listagem do Portinari.UI
    this.setLiterals = {
      noData: this._translateService.CNST_TRANSLATIONS['WORKSPACES.NO_DATA']
    };
    
    //Tradução dos títulos
    this.lbl_title = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TITLE'];
    this.lbl_deleteWorkspaceTitle = this._translateService.CNST_TRANSLATIONS['WORKSPACES.DELETE_CONFIRMATION'];
    this.lbl_checkContractProductsTitle = this._translateService.CNST_TRANSLATIONS['WORKSPACES.CHECK_CONTRACT_PRODUCTS_TITLE'];
    this.lbl_checkContractProductsDescription1 = this._translateService.CNST_TRANSLATIONS['WORKSPACES.CHECK_CONTRACT_PRODUCTS_DESCRIPTION_1'];
    this.lbl_checkContractProductsDescription2 = this._translateService.CNST_TRANSLATIONS['WORKSPACES.CHECK_CONTRACT_PRODUCTS_DESCRIPTION_2'];
    
    //Tradução dos campos da listagem
    this.lbl_workspace = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.WORKSPACE'];
    this.lbl_graph = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.GRAPH'];
    this.lbl_database = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.DATABASE'];
    this.lbl_contractToken = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.CONTRACT_TOKEN'];
    this.lbl_contractType = this._translateService.CNST_TRANSLATIONS['WORKSPACES.TABLE.CONTRACT_TYPE'];
    
    //Tradução dos botões
    this.lbl_add = this._translateService.CNST_TRANSLATIONS['BUTTONS.ADD'];
    this.lbl_goBack = this._translateService.CNST_TRANSLATIONS['BUTTONS.GO_BACK'];
    this.lbl_confirm = this._translateService.CNST_TRANSLATIONS['BUTTONS.CONFIRM'];
  }
  
  /* Método de inicialização do componente */
  public ngOnInit(): void {
    this.loadWorkspaces();
  }
  
  /* Método de consulta dos ambientes configurados no Agent */
  private loadWorkspaces(): void {
    this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING'] };
    
    //Consulta dos ambientes / banco de dados cadastrados no Agent
    forkJoin([
      this._workspaceService.getWorkspaces(),
      this._databaseService.getDatabases()
    ]).subscribe((results: [Workspace[], Database[]]) => {
      
      //Procura o cadastro do banco de dados vinculado a cada ambiente
      this.workspaces = results[0].map((w: Workspace) => {
        let db: Database = results[1].find((db: Database) => {
          return db.id === w.databaseIdRef;
        });
        
        /*
          Caso encontrado, mostra o nome do banco de dados na tela do Agent.
          Em caso negativo, é mostrado um texto padrão "Nenhum".
        */
        if (db != undefined) w.databaseName = db.name;
        else w.databaseName = this._translateService.CNST_TRANSLATIONS['ANGULAR.NONE'];
        return w;
      });
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_ERROR']);
      this.po_lo_text = { value: null };
    });
  }
  
  /* Método de redirecionamento para a página de cadastro de ambientes */
  protected addWorkspace(): void {
    this.modal_checkContractProducts.open();
  }
  
  /* Método usado para ler o comando de "Enter" no campo de verificação de contrato */
  protected enterPassword(event: any): void {
    event.preventDefault();
    this.checkContractProducts_YES();
  }
  
  /**************************/
  /*** MÉTODOS DOS MODAIS ***/
  /**************************/
  /* Modal de verificação do contrato do cliente (NAO) */
  protected checkContractProducts_NO(): void {
    this.contractToken = null;
    this.modal_checkContractProducts.close();
  }
  
  /* Modal de verificação do contrato do cliente (SIM) */
  protected checkContractProducts_YES(): void {
    this.modal_checkContractProducts.close();
    this._router.navigate(['/workspace-add']);
  }
  
  /* Modal de remoção de um ambiente configurado no Agent (NÃO) */
  protected deleteWorkspace_NO(): void {
    this.workspaceToDelete = null;
    this.modal_deleteWorkspace.close();
  }
  
  /* Modal de remoção de um ambiente configurado no Agent (SIM) */
  protected deleteWorkspace_YES(): Observable<void> {
    this.modal_deleteWorkspace.close();
    
    //Consulta das traduções
    return this._translateService.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.DELETE', [this.workspaceToDelete.name]),
      new TranslationInput('WORKSPACES.MESSAGES.DELETE_ERROR', [this.workspaceToDelete.name])
    ]).pipe(switchMap((translations: any) => {
      this.po_lo_text = { value: translations['WORKSPACES.MESSAGES.DELETE'] };
      
      //Remoção do ambiente configurado no Agent
      return this._workspaceService.deleteWorkspace(this.workspaceToDelete)
      .pipe(map((b: boolean) => {
        this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.DELETE_OK']);
        this.po_lo_text = { value: null };
        this.workspaceToDelete = null;
        this.loadWorkspaces();
      }), catchError((err: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.INFO, translations['WORKSPACES.MESSAGES.DELETE_ERROR']);
        this.po_lo_text = { value: null };
        this.workspaceToDelete = null;
        throw err;
      }));
    }));
  }
}