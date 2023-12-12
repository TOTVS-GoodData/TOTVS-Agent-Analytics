/* Componentes padrões do Angular */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

/* Componentes visuais da biblioteca Portinari.UI */
import {
  PoModalComponent,
  PoListViewAction,
  PoListViewLiterals
} from '@po-ui/ng-components';

/* Serviço de consulta do acesso remoto (MirrorMode) */
import { MirrorService } from '../services/mirror-service';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';
import { Workspace } from '../workspace/workspace-interface';

/* Serviço de banco de dados do Agent */
import { DatabaseService } from './database-service';
import { Database } from './database-interface';
import { CNST_DATABASE_OTHER } from './database-constants';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})

export class DataBaseComponent implements OnInit {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Título da página
  protected lbl_title: string = null;
  
  //Botão de inclusão de novos bancos
  protected lbl_add: string = null;
  
  //Listagem de todos os bancos de dados configurados no Agent
  protected databases: Database[] = [];
  
  //Banco de dados selecionado p/ remoção
  private databaseToDelete: Database = null;
  
  //Define se o Agent está sendo executado via acesso remoto (MirrorMode)
  protected mirrorMode: number = 0;
  
  /****** Portinari.UI ******/
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  //Títulos dos campos da listagem
  private lbl_type: string = null;
  private lbl_ip: string = null;
  private lbl_port: string = null;
  private lbl_db_databaseName: string = null;
  private lbl_connectionString: string = null;
  
  //Menu de ações disponíveis dos bancos de dados
  protected setoptions: Array<PoListViewAction> = [];
  
  //Mensagens padrões da listagem de banco de dados
  protected setLiterals: PoListViewLiterals = null;
  
  /********* Modal **********/
  @ViewChild('modal_deleteDatabase') modal_deleteDatabase: PoModalComponent = null;
  protected lbl_deleteDatabaseTitle: string = null;
  protected lbl_goBack: string = null;
  protected lbl_confirm: string = null;
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _mirrorService: MirrorService,
    private _workspaceService: WorkspaceService,
    private _databaseService: DatabaseService,
    private _translateService: TranslationService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    //Tradução do menu de ações dos bancos de dados
    this.setoptions = [
      //Editar
      {
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.EDIT'],
        action: (db: Database) => {
          this._router.navigate(['/database-add'], { state: db })
        }
      //Remover
      },{
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.DELETE'],
        action: (db: Database) => {
          this.databaseToDelete = db;
          this.modal_deleteDatabase.open();
        }
      }
    ];
    
    //Tradução das mensagens padrões do componente de listagem do Portinari.UI
    this.setLiterals = {
      noData: this._translateService.CNST_TRANSLATIONS['DATABASES.NO_DATA']
    };
    
    //Tradução dos títulos
    this.lbl_title = this._translateService.CNST_TRANSLATIONS['DATABASES.TITLE'];
    this.lbl_deleteDatabaseTitle = this._translateService.CNST_TRANSLATIONS['DATABASES.DELETE_CONFIRMATION'];
    
    //Tradução dos campos da listagem
    this.lbl_type = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.TYPE'];
    this.lbl_ip = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.HOST_NAME'];
    this.lbl_port = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.PORT'];
    this.lbl_db_databaseName = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.DATABASE'];
    this.lbl_connectionString = this._translateService.CNST_TRANSLATIONS['DATABASES.TABLE.CONNECTION_STRING'];
      
    //Tradução dos botões
    this.lbl_add = this._translateService.CNST_TRANSLATIONS['BUTTONS.ADD'];
    this.lbl_goBack = this._translateService.CNST_TRANSLATIONS['BUTTONS.GO_BACK'];
    this.lbl_confirm = this._translateService.CNST_TRANSLATIONS['BUTTONS.CONFIRM'];
    
    //Configuração da mensagem de acesso remoto (MirrorMode)
    this.mirrorMode = this._mirrorService.getMirrorMode();
  }
  
  /* Método de inicialização do componente */
  public ngOnInit(): void {
    this.loadDatabases();
  }
  
  /* Método de consulta dos bancos de dados configurados no Agent */
  private loadDatabases(): void {
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.LOADING'] };
    
    //Consulta dos bancos de dados cadastrados no Agent
    this._databaseService.getDatabases(true).subscribe((db: Database[]) => {
      this.databases = db.map((db: Database) => {
        
        //Renomeia o tipo do banco de dados "Outro"
        if (db.type == CNST_DATABASE_OTHER) db.type = this._translateService.CNST_TRANSLATIONS['ANGULAR.OTHER'];
        
        return db;
      });
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.LOADING_ERROR'], err);
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    });
  }
  
  /* Método de redirecionamento para a página de cadastro de bancos de dados */
  protected addDatabase(): void {
    this._router.navigate(['/database-add']);
  }
  
  /**************************/
  /*** MÉTODOS DOS MODAIS ***/
  /**************************/
  /* Modal de remoção de um banco de dados configurado no Agent (NAO) */
  protected deleteDatabase_NO(): void {
    this.modal_deleteDatabase.close();
    this.databaseToDelete = null;
  }
  
  /* Modal de remoção de um banco de dados configurado no Agent (SIM) */
  protected deleteDatabase_YES(): void {
    this.modal_deleteDatabase.close();
    
    //Consulta das traduções
    this._translateService.getTranslations([
      new TranslationInput('DATABASES.MESSAGES.DELETE', [this.databaseToDelete.name]),
      new TranslationInput('DATABASES.MESSAGES.DELETE_ERROR', [this.databaseToDelete.name])
    ]).subscribe((translations: any) => {
      if (this.mirrorMode != 1) this.po_lo_text = { value: translations['DATABASES.MESSAGES.DELETE'] };
      
      //Consulta dos ambientes de GoodData atualmente vinculados à este banco de dados
      this._workspaceService.getWorkspacesByDatabase(this.databaseToDelete).subscribe((w: Workspace[]) => {
        
        //Caso exista um ambiente vinculado, o banco não pode ser apagado
        if (w.length > 0) {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.DELETE_ERROR_WORKSPACES']);
          if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        } else {
          
          //Remoção do banco de dados configurado no Agent
          this._databaseService.deleteDatabase(this.databaseToDelete).subscribe((b: boolean) => {
            this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['DATABASES.MESSAGES.DELETE_OK']);
            if (this.mirrorMode != 1) this.po_lo_text = { value: null };
            this.databaseToDelete = null;
            this.loadDatabases();
          }, (err: any) => {
            this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.DELETE_ERROR'], err);
            if (this.mirrorMode != 1) this.po_lo_text = { value: null };
          });
        }
      }, (err: any) => {
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['DATABASES.MESSAGES.DELETE_ERROR'], err);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      });
    });
  }
}
