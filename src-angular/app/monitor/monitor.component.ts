/* Componentes padrões do Angular */
import { Component, ViewChild, OnInit } from '@angular/core';

/* Componentes visuais da biblioteca Portinari.UI */
import {
  PoModalComponent,
  PoTableColumn,
  PoTableAction,
  PoListViewLiterals
} from '@po-ui/ng-components';

/* Componentes de utilitários do Agent */
import { Utilities } from '../utilities/utilities';
import { CNST_LOGLEVEL } from '../utilities/utilities-constants';

/* Serviço de comunicação com o Electron */
import { ElectronService } from '../core/services';

/* Serviço de consulta do acesso remoto (MirrorMode) */
import { MirrorService } from '../services/mirror-service';

/* Serviço de monitoramento do Agent */
import { MonitorService } from './monitor-service';
import { CNST_MONITOR_TIMER } from './monitor-constants';

/* Serviço de tradução do Agent */
import { TranslationService } from '../services/translation/translation-service';
import { TranslationInput } from '../services/translation/translation-interface';

/* Interface de execuções de agendamentos do Agent */
import { AgentLog, AgentLogMessage } from './monitor-interface';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, map, switchMap } from 'rxjs';

@Component({
    selector: 'app-monitor',
    templateUrl: './monitor.component.html',
    styleUrls: ['./monitor.component.css']
})

export class MonitorComponent implements OnInit {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Título da página
  protected lbl_title: string = null;
  
  //Armazena todos os agendamentos executados pelo Agent, e seus logs
  protected agentLog: Array<AgentLog> = [];
  
  //Variável de suporte, que armazena a execuão selecionada pelo usuário
  protected details: AgentLog = new AgentLog();
  
  //Subscrição do serviço de consulta dos logs
  private monitorLogSubscription: any = null;
  
  //Define se o Agent está sendo executado via acesso remoto (MirrorMode)
  protected mirrorMode: number = 0;
  
  /****** Portinari.UI ******/
  //Comunicação c/ animação (gif) de carregamento
  protected po_lo_text: any = { value: null };
  
  //Colunas da tabela de monitoramento de logs
  protected setColumns: Array<PoTableColumn> = [];
  
  //Ações da tabela de monitoramento de logs
  protected setTableRowActions: Array<PoTableAction> = [];
  
  //Colunas da tabela de detalhamento de logs
  protected setDetailColumns: Array<PoTableColumn> = [];
  
  //Mensagens padrões da tabela de monitoramento de logs
  protected setLiterals: PoListViewLiterals = null;
  
  /********* Modal **********/
  //Detalhes do log
  @ViewChild('modal_logDetails') modal_logDetails: PoModalComponent;
  protected lbl_modalLogDetailsTitle: string = null;
  
  //Index de todas as mensagens de erro encontradas
  protected errorIndexes: Array<number> = [];
  
  //Posição atual do index de mensagem de erro
  protected currentErrorIndex: number = 0;
  
  //Terminar um processo
  @ViewChild('modal_killProcess') modal_killProcess: PoModalComponent;
  protected lbl_modalKillProcessTitle: string = null;
  
  /******* Formulário *******/
  //Títulos dos campos
  protected lbl_goBack: string = null;
  protected lbl_confirm: string = null;
  protected lbl_nextError: string = null;
  protected lbl_noErrors: string = null;
  protected lbl_nextUpdate: string = null;

  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _monitorService: MonitorService,
    private _electronService: ElectronService,
    private _mirrorService: MirrorService,
    private _translateService: TranslationService,
    private _utilities: Utilities
  ) {
    
    //Tradução das colunas da tabela de monitoramento de logs
    this.setColumns = [
      {
        property: 'status',
        sortable: false,
        type: 'subtitle',
        width: '7%',
        subtitles: [
          { value: CNST_LOGLEVEL.INFO.level, color: 'color-10', label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.EXECUTION_STATUS.DONE'], content: '' },
          { value: CNST_LOGLEVEL.WARN.level, color: 'color-01', label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.EXECUTION_STATUS.RUNNING'], content: '' },
          { value: CNST_LOGLEVEL.ERROR.level, color: 'color-07', label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.EXECUTION_STATUS.ERROR'] , content: '' },
          { value: CNST_LOGLEVEL.DEBUG.level, color: 'color-12', label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.EXECUTION_STATUS.CANCELED'] , content: '' }
        ]
      },{
        property: 'scheduleLines',
        sortable: false,
        label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.LINES'],
        width: '10%'
      },{
        property: 'scheduleName',
        sortable: false,
        label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.SCHEDULE'],
        width: '17%'
      },{
        property: 'str_startDate',
        sortable: false,
        label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.START_DATE'],
        width: '23%'
      },{
        property: 'str_endDate',
        sortable: false,
        label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.FINAL_DATE'],
        width: '23%'
      },{
        property: 'duration',
        sortable: false,
        label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.EXECUTION_TIME'],
        width: '15%'
      },{
        property: 'terminate',
        label: ' ',
        width: '5%',
        type: 'icon',
        action: (agentLog: AgentLog) => {
          this.details = agentLog;
          this.modal_killProcess.open();
        }
      }
    ];
    
    //Tradução das colunas da tabela de detalhamento de logs
    this.setDetailColumns = [
      { property: 'str_logDate', label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.DETAILS.LOGDATE'], width: '20%' },
      { property: 'loglevel', label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.DETAILS.LEVEL'], width: '10%' },
      { property: 'system', label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.DETAILS.SOURCE'], width: '10%' },
      { property: 'message', label: this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.DETAILS.MESSAGE'], width: '60%' }
    ];
    
    //Tradução das mensagens padrões do componente de listagem do Portinari.UI
    this.setLiterals = {
      noData: this._translateService.CNST_TRANSLATIONS['MONITOR.NO_DATA']
    };
    
    //Ação de detalhar um log do monitoramento
    this.setTableRowActions = [
      {
        label: this._translateService.CNST_TRANSLATIONS['BUTTONS.DETAILS'],
        icon: 'po-icon-info',
        action: (agentLog: AgentLog) => {
          this.details = agentLog;
          
          //Calcula os indexes de erro de todas as mensagens desta execução
          let lastError: boolean = false;
          this.errorIndexes = agentLog.messages.map((x: AgentLogMessage, index: number) => {
            let error: boolean = false;
            let indexToReturn: number = null;
            
            if (x.loglevel == CNST_LOGLEVEL.ERROR.tag) error = true;
            else error = false;
            
            if ((!lastError)  && (error)) indexToReturn = index;
            else indexToReturn = null;
            
            lastError = error;
            
            return indexToReturn;
          }).filter((index: number) => index != null);
          
          //Atualização do texto do botão de erros da execução
          this.updateErrorLabel();
          this.currentErrorIndex = 0;
          
          this.modal_logDetails.open();
        }
      }
    ];
    
    //Tradução dos campos de formulário
    this.lbl_title = this._translateService.CNST_TRANSLATIONS['MONITOR.TITLE'];
    this.lbl_modalLogDetailsTitle = this._translateService.CNST_TRANSLATIONS['MONITOR.TABLE.DETAILS.TITLE'];
    this.lbl_modalKillProcessTitle = this._translateService.CNST_TRANSLATIONS['MONITOR.MESSAGES.KILL_PROCESS_TITLE'];
    
    //Tradução dos botões
    this.lbl_goBack = this._translateService.CNST_TRANSLATIONS['BUTTONS.GO_BACK'];
    this.lbl_confirm = this._translateService.CNST_TRANSLATIONS['BUTTONS.CONFIRM'];
    this.lbl_noErrors = this._translateService.CNST_TRANSLATIONS['BUTTONS.NO_ERRORS'];

    //Configuração da mensagem de acesso remoto (MirrorMode)
    this.mirrorMode = this._mirrorService.getMirrorMode();
  }
  
  /* Método de inicialização do monitoramento (Apenas disponível pelo Electron) */
  public ngOnInit(): void {
    if (this._electronService.isElectronApp) {
      let mirror: number = this._mirrorService.getMirrorMode();
      let refreshTimer: number = (((mirror == 0) || (mirror == 1)) ? CNST_MONITOR_TIMER.DEFAULT : CNST_MONITOR_TIMER.MIRROR);
      let refresh: number = refreshTimer;

      //Atualização das mensagens do monitoramento, executada fora do temporizador pela primeira vez
      if ((mirror == 2) || (mirror == 3)) {
        this.lbl_nextUpdate = this._translateService.CNST_TRANSLATIONS['MONITOR.REFRESHING_NOW'];
        if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['MONITOR.REFRESHING_NOW'] };
      }

      this.monitorLogSubscription = this._monitorService.emitMonitorLog(refreshTimer).pipe(switchMap((logs: AgentLog[]) => {
        return this._translateService.getTranslations([
          new TranslationInput('MONITOR.NEXT_REFRESH', ['' + refresh])
        ]).pipe(map((translations: any) => {

          //Atualiza a mensagem de monitoramento
          if ((mirror == 2) || (mirror == 3)) {
            if (refresh == 1) {
              this.lbl_nextUpdate = this._translateService.CNST_TRANSLATIONS['MONITOR.REFRESHING_NOW'];
              if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['MONITOR.REFRESHING_NOW'] };
            } else {
              this.lbl_nextUpdate = translations['MONITOR.NEXT_REFRESH'];
              if (this.mirrorMode != 1) this.po_lo_text = { value: null };
            }
          }

          refresh = refresh - 1;

          //Realiza a atualização dos dados do monitoramento
          if (logs.length > 0) {
            refresh = refreshTimer;
            this.agentLog = logs;
          }
        }));
      })).subscribe();
    } else {
      this._utilities.createNotification(CNST_LOGLEVEL.WARN, this._translateService.CNST_TRANSLATIONS['MONITOR.MESSAGES.WARNING'], null);
    }
  }
  
  /* Método de término do monitoramento (Apenas disponível pelo Electron) */
  public ngOnDestroy(): void {
    if (this._electronService.isElectronApp) {
      this.monitorLogSubscription.unsubscribe();
    }
  }
  
  /* Método de atualização do texto do botão de erros da execução */
  public updateErrorLabel(): void {
    this.lbl_nextError =
      this._translateService.CNST_TRANSLATIONS['BUTTONS.NEXT_ERROR']
      + ' ('
      + (this.currentErrorIndex + 1)
      + '/'
      + this.errorIndexes.length
      +')'
    ;
  }
  
  /**************************/
  /*** MÉTODOS DOS MODAIS ***/
  /**************************/
  /* Modal de detalhamento dos logs do agendamento (CLOSE) */
  protected logDetails_CLOSE(): void {
    this.details = new AgentLog();
    this.errorIndexes = [];
    this.modal_logDetails.close();
  }
  
  /* Método de scroll da tabela de detalhamento de logs, para o próximo erro encontrado */
  protected logDetails_SCROLL(): void {
    let rows: any = document.querySelectorAll('#tableLogDetails tr');
    rows[this.errorIndexes[this.currentErrorIndex]].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    
    this.currentErrorIndex++;
    if (this.currentErrorIndex >= this.errorIndexes.length) this.currentErrorIndex = 0;
    
    //Atualização do texto do botão de erros da execução
    this.updateErrorLabel();
  }
  
  /* Modal de encerramento de um processo (NO) */
  protected killProcess_NO(): void {
    this.details = new AgentLog();
    this.modal_killProcess.close();
  }
  
  /* Modal de encerramento de um processo (YES) */
  protected killProcess_YES(): void {
    this.modal_killProcess.close();
    
    //Consulta das traduções
    this._translateService.getTranslations([
      new TranslationInput('ELECTRON.PROCESS_KILL_OK', [this.details.scheduleId, this.details.execId]),
      new TranslationInput('ELECTRON.PROCESS_KILL_WARN', [this.details.scheduleId, this.details.execId]),
      new TranslationInput('ELECTRON.PROCESS_KILL_ERROR', [this.details.scheduleId, this.details.execId])
    ]).subscribe((translations: any) => {
      if (this.mirrorMode != 1) this.po_lo_text = { value: this._translateService.CNST_TRANSLATIONS['ELECTRON.PROCESS_KILL'] };
      
      //Redirecionamento da requisição p/ Electron
      this._electronService.ipcRenderer.invoke('AC_killProcess', this.details.scheduleId, this.details.execId).then((res: number) => {
        if (this.mirrorMode != 1) this.po_lo_text = { value: null };
        if (res == 1) {
          this._utilities.createNotification(CNST_LOGLEVEL.INFO, translations['ELECTRON.PROCESS_KILL_OK'], null);
        } else if (res == 0) {
          this._utilities.createNotification(CNST_LOGLEVEL.ERROR, translations['ELECTRON.PROCESS_KILL_ERROR'], null);
        } else {
          this._utilities.createNotification(CNST_LOGLEVEL.WARN, translations['ELECTRON.PROCESS_KILL_WARN'], null);
        }
      });
    });
  }
}
