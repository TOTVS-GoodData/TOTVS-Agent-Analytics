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

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Serviço de consulta do acesso remoto (MirrorMode) */
import { MirrorService } from '../services/mirror-service';

/* Serviço de ambientes do Agent */
import { WorkspaceService } from '../workspace/workspace-service';
import { Workspace } from '../workspace/workspace-interface';

/* Serviço de agendamentos do Agent */
import { ScheduleService } from './schedule-service';
import { Schedule } from '../schedule/schedule-interface';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Título da página
  protected lbl_title: string = null;
  
  //Botão de inclusão de novos bancos
  protected lbl_add: string = null;
  
  //Listagem de todos os agendamentos configurados no Agent
  protected schedules: Schedule[] = [];
  
  //Agendamento selecionado p/ remoção
  private scheduleToDelete: Schedule = null;
  
  //Define se o Agent está sendo executado via acesso remoto (MirrorMode)
  protected mirrorMode: number = 0;
  
  /****** Portinari.UI ******/
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  //Títulos dos campos da listagem
  protected lbl_enabled: string = null;
  protected lbl_workspace: string = null;
  protected lbl_lastExecution: string = null;
  protected lbl_windows: string = null;
  protected lbl_yes: string = null;
  protected lbl_no: string = null;
  
  //Menu de ações disponíveis dos agendamentos
  protected setoptions: Array<PoListViewAction> = [];
  
  //Mensagens padrões da listagem de banco de dados
  protected setLiterals: PoListViewLiterals = null;
  
  /********* Modal **********/
  @ViewChild('modal_deleteSchedule') modal_deleteSchedule: PoModalComponent;
  protected lbl_deleteScheduleTitle: string = null;
  protected lbl_goBack: string = null;
  protected lbl_confirm: string = null;
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _workspaceService: WorkspaceService,
    private _scheduleService: ScheduleService,
    private _electronService: ElectronService,
    private _mirrorService: MirrorService,
    private _translateService: TranslationService,
    private _utilities: Utilities,
    private _router: Router
  ) {
    //Tradução do menu de ações dos agendamentos
    this.setoptions = [
      {
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.EDIT'],
        action: (s: Schedule) => {
          this._router.navigate(['/schedule-add'], { state: s });
        }
      },{
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.DELETE'],
        action: (s: Schedule) => {
          this.scheduleToDelete = s;
          this.modal_deleteSchedule.open();
        }
      },{
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.EXECUTE'],
        action: this.runAgent.bind(this)
      }
    ];
    
    //Tradução das mensagens padrões do componente de listagem do Portinari.UI
    this.setLiterals = {
      noData: this._translateService.CNST_TRANSLATIONS['SCHEDULES.NO_DATA']
    };
    
    //Tradução dos títulos
    this.lbl_title = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TITLE'];
    this.lbl_deleteScheduleTitle = this._translateService.CNST_TRANSLATIONS['SCHEDULES.DELETE_CONFIRMATION'];
    
    //Tradução dos campos da listagem
    this.lbl_enabled = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.ENABLED'];
    this.lbl_workspace = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.WORKSPACE'];
    this.lbl_lastExecution = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.LAST_EXECUTION'];
    this.lbl_windows = this._translateService.CNST_TRANSLATIONS['SCHEDULES.TABLE.WINDOWS'];
    
    //Tradução dos botões
    this.lbl_add = this._translateService.CNST_TRANSLATIONS['BUTTONS.ADD'];
    this.lbl_goBack = this._translateService.CNST_TRANSLATIONS['BUTTONS.GO_BACK'];
    this.lbl_confirm = this._translateService.CNST_TRANSLATIONS['BUTTONS.CONFIRM'];
    this.lbl_yes = this._translateService.CNST_TRANSLATIONS['BUTTONS.YES'];
    this.lbl_no = this._translateService.CNST_TRANSLATIONS['BUTTONS.NO'];
    
    //Configuração da mensagem de acesso remoto (MirrorMode)
    this.mirrorMode = this._mirrorService.getMirrorMode();
  }
  
  /* Método de inicialização do componente */
  public ngOnInit(): void {
    this.loadSchedules();
  }
  
  /* Método de consulta dos agendamentos configurados no Agent */
  private loadSchedules(): void {
    if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING'] };
    
    //Consulta dos agendamentos cadastrados no Agent
    forkJoin([
      this._workspaceService.getWorkspaces(false),
      this._scheduleService.getSchedules(true)
    ]).subscribe((results: [Workspace[], Schedule[]]) => {
      this.schedules = results[1].map((s: Schedule) => {
        let w: Workspace = results[0].find((w: Workspace) => (w.id == s.workspaceId));
        if (w) s.workspaceName = w.name;
        
        return s;
      });
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
    }, (err: any) => {
      if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      this._utilities.createNotification(CNST_LOGLEVEL.ERROR, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.LOADING_ERROR'], err);
    });
  }
  
  /* Método de disparo da execução do Agent (Apenas disponível com o Electron) */
  public runAgent(s: Schedule): void {
    if (this._electronService.isElectronApp) {
      
      //Consulta das traduções
      this._translateService.getTranslations([
        new TranslationInput('SCHEDULES.MESSAGES.RUN', [s.name]),
        new TranslationInput('SCHEDULES.MESSAGES.RUN_MANUAL', [s.name])
      ]).subscribe((translations: any) => {
        if (this.mirrorMode != 1) this.po_lo_text = { value: translations['SCHEDULES.MESSAGES.RUN'] };
        this._utilities.writeToLog(CNST_LOGLEVEL.INFO, translations['SCHEDULES.MESSAGES.RUN_MANUAL']);
        
        //Solicita a execução do agendamento pelo Electron (assíncrono)
        if (this._mirrorService.getMirrorMode() != 2) {
          this._electronService.ipcRenderer.sendSync('AC_executeAndUpdateScheduleLocally', s);
        } else {
          this._electronService.ipcRenderer.sendSync('AC_executeAndUpdateScheduleRemotelly', s);
        }
        
        this.loadSchedules();
        this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.RUN_OK']);
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
      });
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.RUN_WARNING'], null);
    }
  }
  
  /* Método de redirecionamento para a página de cadastro de agendamentos */
  protected addSchedule(): void {
    this._router.navigate(['/schedule-add']);
  }
  
  /**************************/
  /*** MÉTODOS DOS MODAIS ***/
  /**************************/
  /* Modal de remoção de um agendamento configurado no Agent (NAO) */
  protected deleteSchedule_NO(): void {
    this.scheduleToDelete = null;
    this.modal_deleteSchedule.close();
  }
  
  /* Modal de remoção de um agendamento configurado no Agent (SIM) */
  protected deleteSchedule_YES(): void {
    this.modal_deleteSchedule.close();
    
    //Consulta das traduções
    this._translateService.getTranslations([
      new TranslationInput('SCHEDULES.MESSAGES.DELETE', [this.scheduleToDelete.name]),
      new TranslationInput('SCHEDULES.MESSAGES.DELETE_ERROR', [this.scheduleToDelete.name])
    ]).subscribe((translations: any) => {
      if (this.mirrorMode != 1) this.po_lo_text = { value: translations['SCHEDULES.MESSAGES.DELETE'] };
      
      //Remoção do agendamento configurado no Agent
      this._scheduleService.deleteSchedule(this.scheduleToDelete).subscribe((b: boolean) => {
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        this._utilities.createNotification(CNST_LOGLEVEL.INFO, this._translateService.CNST_TRANSLATIONS['SCHEDULES.MESSAGES.DELETE_OK']);
        this.loadSchedules();
      }, (err: any) => {
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['SCHEDULES.MESSAGES.DELETE_ERROR'], err);
      });
    });
  }
}
