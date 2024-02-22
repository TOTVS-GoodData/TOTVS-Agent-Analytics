/* Componentes padrões do Angular */
import { Injectable, Pipe, PipeTransform } from '@angular/core';

/* Serviço de tradução do Agent */
import { TranslateService } from '@ngx-translate/core';
import { TranslationInput } from './translation-interface';

/* Constantes de banco de dados */
import {
  CNST_PORT_MINIMUM,
  CNST_PORT_MAXIMUM
} from '../../app-constants';

/* Nome da aplicação (Agent) */
import { CNST_PROGRAM_NAME } from '../../app-constants';

/* Idioma padrão do Agent */
import { CNST_DEFAULT_LANGUAGE } from './translation-constants';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, map, switchMap, filter } from 'rxjs';

@Pipe({name: 'translateExtended'})
export class TranslationService extends TranslateService implements PipeTransform {
  
  //Armazena todas as mensagens do Agent, já traduzidas
  public CNST_TRANSLATIONS: Array<string> = [];
  
  /* Método executado ao usar a pipe "translateExtended" em um componente HTML do Angular */
  public transform(value: string): Observable<string> {
    return this.getTranslations([
      new TranslationInput(value, [])
    ]).pipe(map((translations: any) => {
      return translations[value];
    }));
  }
  
  /*
    Método usado para definir o idioma padrão do Agent
    (Caso o idioma selecionado pelo usuário, ou do 
    sistema operacional do mesmo, não tenha sido 
    configurado).
  */
  public init(): Observable<any> {
    super.setDefaultLang(CNST_DEFAULT_LANGUAGE);
    return this.use(CNST_DEFAULT_LANGUAGE);
  }
  
  /* Método usado para trocar o idioma do Agent */
  public use(language: string): Observable<any> {
    return super.use(language).pipe(switchMap((res: any) => {
      
      //Atualiza todas as mensagens do Agent
      return this.updateStandardTranslations();
    }));
  }
  
  /* Método de tradução das mensagens do Agent */
  public getTranslations(translationInputs: TranslationInput[]): Observable<any> {
    
    //Separa todas as chaves informadas a serem traduzidas
    let keys: string[] = translationInputs.map((ti: TranslationInput) => {
      return ti.key;
    });
    
    //Solicita a mensagem traduzida para serviço pai de tradução (ngx-translate)
    return super.get(keys).pipe(map((translations: any) => {
      
      //Procura em cada mensagem as variáveis de parâmetros padrões
      Object.getOwnPropertyNames.call(Object, translations).map((p: any) => {
        let p1: string = null;
        let p2: string = null;
        let p3: string = null;
        
        //Substitui os parâmetros da mensagem, pelos argumentos passados
        let ti: TranslationInput = translationInputs.find((ti: TranslationInput) => (ti.key == p));
        if (ti.replacements.length > 0) {
          p1 = ti.replacements[0];
          p2 = ti.replacements[1];
          p3 = ti.replacements[2];
          
          //Executa a substituição dos parâmetros, pelos seus valores
          translations[p] = eval('`' + translations[p] + '`');
        }
        
        return translations;
      });
      
      //Retorna todas as mensagens traduzidas
      return translations;
    }));
  }
  
  /* Método de atualização das traduções do Agent */
  public updateStandardTranslations(): Observable<boolean> {
    return this.getTranslations([
      new TranslationInput('ANGULAR.ERROR', []),
      new TranslationInput('ANGULAR.NONE', []),
      new TranslationInput('ANGULAR.OTHER', []),
      new TranslationInput('ANGULAR.SYSTEM_EXIT', []),
      new TranslationInput('ANGULAR.SYSTEM_FINISH_USER', []),
      new TranslationInput('ANGULAR.SYSTEM_FINISH_USER_WARNING', []),
      new TranslationInput('ANGULAR.REGISTER_AGENT_TITLE', []),
      new TranslationInput('ANGULAR.REGISTER_AGENT_DESCRIPTION', []),
      new TranslationInput('ANGULAR.REGISTER_AGENT', []),
      new TranslationInput('ANGULAR.REGISTER_AGENT_FIELD', []),
      new TranslationInput('ANGULAR.REGISTER_AGENT_OK', []),
      new TranslationInput('ANGULAR.REGISTER_AGENT_ERROR', []),
      new TranslationInput('ANGULAR.REGISTER_AGENT_WARNING', []),
      new TranslationInput('BUTTONS.ADD', []),
      new TranslationInput('BUTTONS.EDIT', []),
      new TranslationInput('BUTTONS.DELETE', []),
      new TranslationInput('BUTTONS.DETAILS', []),
      new TranslationInput('BUTTONS.GO_BACK', []),
      new TranslationInput('BUTTONS.CONFIRM', []),
      new TranslationInput('BUTTONS.SAVE', []),
      new TranslationInput('BUTTONS.TEST_CONNECTION', []),
      new TranslationInput('BUTTONS.NEXT_ERROR', []),
      new TranslationInput('BUTTONS.NO_ERRORS', []),
      new TranslationInput('BUTTONS.YES', []),
      new TranslationInput('BUTTONS.NO', []),
      new TranslationInput('BUTTONS.EXECUTE', []),
      new TranslationInput('BUTTONS.SELECT', []),
      new TranslationInput('BUTTONS.YES_SIMPLIFIED', []),
      new TranslationInput('BUTTONS.NO_SIMPLIFIED', []),
      new TranslationInput('BUTTONS.NEW_PARAMETER', []),
      new TranslationInput('BUTTONS.UPDATE_NOW', []),
      new TranslationInput('BUTTONS.UPDATE_LATER', []),
      new TranslationInput('BUTTONS.LOAD_WORKSPACES', []),
      new TranslationInput('CONFIGURATION.TITLE', [CNST_PROGRAM_NAME.DEFAULT]),
      new TranslationInput('CONFIGURATION.APPLICATION', []),
      new TranslationInput('CONFIGURATION.VERSION', []),
      new TranslationInput('CONFIGURATION.JAVA', []),
      new TranslationInput('CONFIGURATION.INSTANCE', []),
      new TranslationInput('CONFIGURATION.DEBUGMODE', []),
      new TranslationInput('CONFIGURATION.AUTOUPDATE', []),
      new TranslationInput('CONFIGURATION.ACTIVATED_1', []),
      new TranslationInput('CONFIGURATION.ACTIVATED_2', []),
      new TranslationInput('CONFIGURATION.DEACTIVATED_1', []),
      new TranslationInput('CONFIGURATION.DEACTIVATED_2', []),
      new TranslationInput('CONFIGURATION.LOGFILES_TO_KEEP', []),
      new TranslationInput('CONFIGURATION.JAVA_XMX', []),
      new TranslationInput('CONFIGURATION.JAVA_TMPDIR', []),
      new TranslationInput('CONFIGURATION.JAVA_JREDIR', []),
      new TranslationInput('CONFIGURATION.TIMEZONE', []),
      new TranslationInput('CONFIGURATION.CLIENT_PORT', []),
      new TranslationInput('CONFIGURATION.MESSAGES.VALIDATE', []),
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING', []),
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING_OK', []),
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('CONFIGURATION.MESSAGES.VALIDATE', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE_OK', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE_ERROR_SERVER', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE_ERROR_CONFIG', []),
      new TranslationInput('CONFIGURATION.TOOLTIPS.INSTANCE', []),
      new TranslationInput('CONFIGURATION.TOOLTIPS.DEBUGMODE', []),
      new TranslationInput('CONFIGURATION.TOOLTIPS.LOGFILES', []),
      new TranslationInput('CONFIGURATION.TOOLTIPS.JAVA_XMX', []),
      new TranslationInput('CONFIGURATION.TOOLTIPS.JAVA_TMPDIR', []),
      new TranslationInput('CONFIGURATION.TOOLTIPS.JAVA_JREDIR', []),
      new TranslationInput('CONFIGURATION.TOOLTIPS.AUTOUPDATE', []),
      new TranslationInput('CONFIGURATION.TOOLTIPS.CLIENT_PORT', ['' + CNST_PORT_MINIMUM, '' + CNST_PORT_MAXIMUM]),
      new TranslationInput('CONTRACT_TYPES.PLATFORM', []),
      new TranslationInput('CONTRACT_TYPES.FAST', []),
      new TranslationInput('DATABASES.TITLE', []),
      new TranslationInput('DATABASES.NEW_DATABASE', []),
      new TranslationInput('DATABASES.EDIT_DATABASE', []),
      new TranslationInput('DATABASES.DELETE_CONFIRMATION', []),
      new TranslationInput('DATABASES.NO_DATA', []),
      new TranslationInput('DATABASES.CONNECTION_STRING.IP_ADDRESS', []),
      new TranslationInput('DATABASES.CONNECTION_STRING.PORT', []),
      new TranslationInput('DATABASES.CONNECTION_STRING.DATABASE_NAME', []),
      new TranslationInput('DATABASES.CONNECTION_STRING.SERVICE_NAME', []),
      new TranslationInput('DATABASES.CONNECTION_STRING.SID', []),
      new TranslationInput('DATABASES.TABLE.NAME', []),
      new TranslationInput('DATABASES.TABLE.TYPE', []),
      new TranslationInput('DATABASES.TABLE.DRIVER_CLASS', []),
      new TranslationInput('DATABASES.TABLE.DRIVER_PATH', []),
      new TranslationInput('DATABASES.TABLE.HOST_TYPE', []),
      new TranslationInput('DATABASES.TABLE.HOST_NAME', []),
      new TranslationInput('DATABASES.TABLE.PORT', []),
      new TranslationInput('DATABASES.TABLE.DATABASE', []),
      new TranslationInput('DATABASES.TABLE.SID', []),
      new TranslationInput('DATABASES.TABLE.SERVICE_NAME', []),
      new TranslationInput('DATABASES.TABLE.INSTANCE', []),
      new TranslationInput('DATABASES.TABLE.CONNECTION_STRING', []),
      new TranslationInput('DATABASES.TABLE.USERNAME', []),
      new TranslationInput('DATABASES.TABLE.PASSWORD', []),
      new TranslationInput('DATABASES.TABLE.INSTANCE', []),
      new TranslationInput('DATABASES.TOOLTIPS.DRIVER_CLASS', []),
      new TranslationInput('DATABASES.TOOLTIPS.DRIVER_PATH', []),
      new TranslationInput('DATABASES.TOOLTIPS.HOST_TYPE', []),
      new TranslationInput('DATABASES.TOOLTIPS.HOST_NAME', []),
      new TranslationInput('DATABASES.TOOLTIPS.PORT', ['' + CNST_PORT_MINIMUM, '' + CNST_PORT_MAXIMUM]),
      new TranslationInput('DATABASES.TOOLTIPS.CONNECTION_STRING', []),
      new TranslationInput('DATABASES.MESSAGES.LOADING', []),
      new TranslationInput('DATABASES.MESSAGES.LOADING_OK', []),
      new TranslationInput('DATABASES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('DATABASES.MESSAGES.SAVE_OK', []),
      new TranslationInput('DATABASES.MESSAGES.DELETE_OK', []),
      new TranslationInput('DATABASES.MESSAGES.DELETE_ERROR_WORKSPACES', []),
      new TranslationInput('DATABASES.MESSAGES.LOGIN_OK', []),
      new TranslationInput('DATABASES.MESSAGES.LOGIN_WARNING', []),
      new TranslationInput('DATABASES.MESSAGES.ERROR_INVALID_IP', []),
      new TranslationInput('DATABASES.MESSAGES.ERROR_INVALID_PORT', ['' + CNST_PORT_MINIMUM, '' + CNST_PORT_MAXIMUM]),
      new TranslationInput('DATABASES.MESSAGES.VALIDATE', []),
      new TranslationInput('DATABASES.MESSAGES.PASSWORD_ENCRYPT', []),
      new TranslationInput('ELECTRON.UPDATE_READY_TITLE', []),
      new TranslationInput('ELECTRON.UPDATE_READY_DESCRIPTION', []),
      new TranslationInput('ELECTRON.PROCESS_KILL', []),
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.CONNECTION_ERROR', []),
      new TranslationInput('ELECTRON.SERVER_COMMUNICATION.MESSAGES.DEACTIVATED', []),
      new TranslationInput('FORM_ERRORS.FOLDER_SELECT_WARNING', []),
      new TranslationInput('FORM_ERRORS.ONLY_YES_OR_NO', []),
      new TranslationInput('LANGUAGES.TITLE', []),
      new TranslationInput('LANGUAGES.en-US', []),
      new TranslationInput('LANGUAGES.pt-BR', []),
      new TranslationInput('LANGUAGES.es-ES', []),
      new TranslationInput('LICENSES.MODULES.ACCOUNTING', []),
      new TranslationInput('LICENSES.MODULES.ANALYTICS', []),
      new TranslationInput('LICENSES.MODULES.CEP_TIN', []),
      new TranslationInput('LICENSES.MODULES.CEP_TOP', []),
      new TranslationInput('LICENSES.MODULES.COMERCIAL', []),
      new TranslationInput('LICENSES.MODULES.DISTRIBUTION', []),
      new TranslationInput('LICENSES.MODULES.EDUCACIONAL', []),
      new TranslationInput('LICENSES.MODULES.FINANCIAL', []),
      new TranslationInput('LICENSES.MODULES.GFE', []),
      new TranslationInput('LICENSES.MODULES.GPS', []),
      new TranslationInput('LICENSES.MODULES.HEALTHCARE', []),
      new TranslationInput('LICENSES.MODULES.HR', []),
      new TranslationInput('LICENSES.MODULES.LEARNING', []),
      new TranslationInput('LICENSES.MODULES.LEGAL', []),
      new TranslationInput('LICENSES.MODULES.LOGISTICS', []),
      new TranslationInput('LICENSES.MODULES.MATERIALS', []),
      new TranslationInput('LICENSES.MODULES.PLS', []),
      new TranslationInput('LICENSES.MODULES.PMS', []),
      new TranslationInput('LICENSES.MODULES.PRODUCTION', []),
      new TranslationInput('LICENSES.MODULES.SERVICES', []),
      new TranslationInput('LICENSES.MODULES.SHOPPING', []),
      new TranslationInput('LICENSES.MODULES.SUPPLY', []),
      new TranslationInput('LICENSES.MODULES.TMS', []),
      new TranslationInput('LICENSES.MODULES.UNIVERSAL', []),
      new TranslationInput('LICENSES.MODULES.WMS', []),
      new TranslationInput('LICENSES.MODULES.CUSTOM', []),
      new TranslationInput('MENU.WORKSPACES', []),
      new TranslationInput('MENU.DATABASES', []),
      new TranslationInput('MENU.SCHEDULES', []),
      new TranslationInput('MENU.QUERIES', []),
      new TranslationInput('MENU.SCRIPTS', []),
      new TranslationInput('MENU.MONITOR', []),
      new TranslationInput('MENU.CONFIGURATION', []),
      new TranslationInput('MENU.ACTIVATION', []),
      new TranslationInput('MENU.REMOTE', []),
      new TranslationInput('MENU.EXIT', []),
      new TranslationInput('MIRROR_MODE.MODAL.TITLE', []),
      new TranslationInput('MIRROR_MODE.MODAL.DESCRIPTION_1', []),
      new TranslationInput('MIRROR_MODE.MODAL.DESCRIPTION_2', []),
      new TranslationInput('MIRROR_MODE.MODAL.FIELD', []),
      new TranslationInput('MIRROR_MODE.MODAL.BUTTONS.PROCEED', []),
      new TranslationInput('MIRROR_MODE.MODAL.BUTTONS.CANCEL', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.ONLINE', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.OFFLINE', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.RUNNING', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.WAIT', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.WARNING', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.WARNING_SAME_AGENT', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.SYNCHRONIZE_LOGS', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.SYNCHRONIZE_LOGS_OK', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.SYNCHRONIZE_DB', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.SYNCHRONIZE_DB_OK', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.SERVER_SYNC', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.SERVER_SYNC_OK', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.SERVER_SYNC_ERROR', []),
      new TranslationInput('MIRROR_MODE.MESSAGES.SERVER_PING_ERROR', []),
      new TranslationInput('MONITOR.TITLE', []),
      new TranslationInput('MONITOR.NO_DATA', []),
      new TranslationInput('MONITOR.TABLE.STATUS', []),
      new TranslationInput('MONITOR.TABLE.LINES', []),
      new TranslationInput('MONITOR.TABLE.SCHEDULE', []),
      new TranslationInput('MONITOR.TABLE.START_DATE', []),
      new TranslationInput('MONITOR.TABLE.FINAL_DATE', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_TIME', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.TITLE', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.TIMESTAMP', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.LEVEL', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.SOURCE', []),
      new TranslationInput('MONITOR.TABLE.DETAILS.MESSAGE', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_STATUS.DONE', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_STATUS.RUNNING', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_STATUS.ERROR', []),
      new TranslationInput('MONITOR.TABLE.EXECUTION_STATUS.CANCELED', []),
      new TranslationInput('MONITOR.MESSAGES.WARNING', []),
      new TranslationInput('MONITOR.MESSAGES.KILL_PROCESS_TITLE', []),
      new TranslationInput('MONITOR.MESSAGES.SCHEDULE_NOT_FOUND', []),
      new TranslationInput('QUERIES.TITLE', []),
      new TranslationInput('QUERIES.IMPORT_QUERIES', []),
      new TranslationInput('QUERIES.NEW_QUERY', []),
      new TranslationInput('QUERIES.EDIT_QUERY', []),
      new TranslationInput('QUERIES.DELETE_CONFIRMATION', []),
      new TranslationInput('QUERIES.NO_DATA', []),
      new TranslationInput('QUERIES.TABLE.SCHEDULE_NAME', []),
      new TranslationInput('QUERIES.TABLE.MODULE', []),
      new TranslationInput('QUERIES.TABLE.QUERY_NAME', []),
      new TranslationInput('QUERIES.TABLE.MODE', []),
      new TranslationInput('QUERIES.TABLE.TOTVS', []),
      new TranslationInput('QUERIES.TABLE.SQL', []),
      new TranslationInput('QUERIES.MESSAGES.LOADING', []),
      new TranslationInput('QUERIES.MESSAGES.LOADING_OK', []),
      new TranslationInput('QUERIES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING_OK', []),
      new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING_ERROR', []),
      new TranslationInput('QUERIES.MESSAGES.VALIDATE', []),
      new TranslationInput('QUERIES.MESSAGES.SAVE_OK', []),
      new TranslationInput('QUERIES.MESSAGES.DELETE', []),
      new TranslationInput('QUERIES.MESSAGES.DELETE_OK', []),
      new TranslationInput('QUERIES.MESSAGES.DELETE_ERROR', []),
      new TranslationInput('QUERIES.MESSAGES.IMPORT_MESSAGE', []),
      new TranslationInput('QUERIES.MESSAGES.IMPORT_OK', []),
      new TranslationInput('QUERIES.MESSAGES.IMPORT_WARNING_FAILURES', []),
      new TranslationInput('QUERIES.MESSAGES.IMPORT_I01', []),
      new TranslationInput('QUERIES.MESSAGES.IMPORT_I01_PREPARE', []),
      new TranslationInput('QUERIES.MESSAGES.IMPORT_NO_DATA_ERROR', []),
      new TranslationInput('QUERIES.EXECUTION_MODES.COMPLETE', []),
      new TranslationInput('QUERIES.EXECUTION_MODES.MONTHLY', []),
      new TranslationInput('QUERIES.TOOLTIPS.QUERY_NAME', []),
      new TranslationInput('QUERIES.TOOLTIPS.MODE', []),
      new TranslationInput('SCHEDULES.TITLE', []),
      new TranslationInput('SCHEDULES.NEW_SCHEDULE', []),
      new TranslationInput('SCHEDULES.EDIT_SCHEDULE', []),
      new TranslationInput('SCHEDULES.DELETE_CONFIRMATION', []),
      new TranslationInput('SCHEDULES.NO_DATA', []),
      new TranslationInput('SCHEDULES.TABLE.NAME', []),
      new TranslationInput('SCHEDULES.TABLE.ENABLED', []),
      new TranslationInput('SCHEDULES.TABLE.WORKSPACE', []),
      new TranslationInput('SCHEDULES.TABLE.LAST_EXECUTION', []),
      new TranslationInput('SCHEDULES.TABLE.WINDOWS', []),
      new TranslationInput('SCHEDULES.TABLE.ZIP_FILENAME', []),
      new TranslationInput('SCHEDULES.TABLE.ZIP_EXTENSION', []),
      new TranslationInput('SCHEDULES.TABLE.FILE_FOLDER', []),
      new TranslationInput('SCHEDULES.TABLE.FILE_WILDCARD', []),
      new TranslationInput('SCHEDULES.TABLE.SQL_PARAMETERS.TITLE', []),
      new TranslationInput('SCHEDULES.TABLE.SQL_PARAMETERS.DESCRIPTION', []),
      new TranslationInput('SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.MODULE', []),
      new TranslationInput('SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.NAME', []),
      new TranslationInput('SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.TOTVS', []),
      new TranslationInput('SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.VALUE', []),
      new TranslationInput('SCHEDULES.TABLE.SQL_PARAMETERS.TABLE.SQL', []),
      new TranslationInput('SCHEDULES.TABLE.ETL_PARAMETERS.TITLE', []),
      new TranslationInput('SCHEDULES.TABLE.ETL_PARAMETERS.DESCRIPTION', []),
      new TranslationInput('SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.MODULE', []),
      new TranslationInput('SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.NAME', []),
      new TranslationInput('SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.TOTVS', []),
      new TranslationInput('SCHEDULES.TABLE.ETL_PARAMETERS.TABLE.VALUE', []),
      new TranslationInput('SCHEDULES.MESSAGES.LOADING', []),
      new TranslationInput('SCHEDULES.MESSAGES.LOADING_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('SCHEDULES.MESSAGES.SAVE_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.DELETE_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.RUN_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.RUN_WARNING', []),
      new TranslationInput('SCHEDULES.MESSAGES.VALIDATE', []),
      new TranslationInput('SCHEDULES.MESSAGES.VALIDATION_ERROR', []),
      new TranslationInput('SCHEDULES.TOOLTIPS.WINDOWS', []),
      new TranslationInput('SCHEDULES.TOOLTIPS.ZIP_FILENAME', []),
      new TranslationInput('SCHEDULES.TOOLTIPS.FILE_FOLDER', []),
      new TranslationInput('SCHEDULES.TOOLTIPS.FILE_WILDCARD', []),
      new TranslationInput('SCRIPTS.TITLE', []),
      new TranslationInput('SCRIPTS.IMPORT_SCRIPTS', []),
      new TranslationInput('SCRIPTS.NEW_SCRIPT', []),
      new TranslationInput('SCRIPTS.EDIT_SCRIPT', []),
      new TranslationInput('SCRIPTS.DELETE_CONFIRMATION', []),
      new TranslationInput('SCRIPTS.NO_DATA', []),
      new TranslationInput('SCRIPTS.TABLE.SCHEDULE_NAME', []),
      new TranslationInput('SCRIPTS.TABLE.MODULE', []),
      new TranslationInput('SCRIPTS.TABLE.SCRIPT_NAME', []),
      new TranslationInput('SCRIPTS.TABLE.TOTVS', []),
      new TranslationInput('SCRIPTS.TABLE.SQL', []),
      new TranslationInput('SCRIPTS.MESSAGES.LOADING', []),
      new TranslationInput('SCRIPTS.MESSAGES.LOADING_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('SCRIPTS.MESSAGES.SCHEDULE_LOADING_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.SCHEDULE_LOADING_ERROR', []),
      new TranslationInput('SCRIPTS.MESSAGES.VALIDATE', []),
      new TranslationInput('SCRIPTS.MESSAGES.SAVE_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.DELETE', []),
      new TranslationInput('SCRIPTS.MESSAGES.DELETE_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.IMPORT_MESSAGE', []),
      new TranslationInput('SCRIPTS.MESSAGES.IMPORT_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.IMPORT_WARNING_FAILURES', []),
      new TranslationInput('SCRIPTS.MESSAGES.IMPORT_NO_DATA_ERROR', []),
      new TranslationInput('SCRIPTS.TOOLTIPS.SCRIPT_NAME', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING_WORKSPACES', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING_WORKSPACES_OK', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING_WORKSPACES_ERROR', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING_PROCESSES', []),
      new TranslationInput('SERVICES.GOODDATA.MESSAGES.LOADING_PROCESSES_ERROR', []),
      new TranslationInput('SERVICES.SERVER.MESSAGES.LOADING_LICENSES', []),
      new TranslationInput('SERVICES.SERVER.MESSAGES.LOADING_LICENSES_ERROR', []),
      new TranslationInput('SERVICES.SERVER.MESSAGES.SERVER_ERROR', []),
      new TranslationInput('SERVICES.SERVER.MESSAGES.COMMUNICATION_WARNING', []),
      new TranslationInput('SERVICES.SERVER.MESSAGES.LOADING_PARAMETERS', []),
      new TranslationInput('SERVICES.SERVER.MESSAGES.LOADING_PARAMETERS_ERROR', []),
      new TranslationInput('SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_ERROR_INVALID', []),
      new TranslationInput('SERVICES.SERVER.MESSAGES.SERIAL_NUMBER_ERROR_COMMUNICATION', []),
      new TranslationInput('SERVICES.SERVER.MESSAGES.UPDATES_ERROR', []),
      new TranslationInput('SOURCES.LOCALLY', []),
      new TranslationInput('SOURCES.CLOUD_OTHERS', []),
      new TranslationInput('SUPPORT_TICKET.HELP', []),
      new TranslationInput('SUPPORT_TICKET.GROUP_1', []),
      new TranslationInput('SUPPORT_TICKET.GROUP_2', []),
      new TranslationInput('SUPPORT_TICKET.GROUP_3', []),
      new TranslationInput('SUPPORT_TICKET.LINK', []),
      new TranslationInput('WORKSPACES.TITLE', []),
      new TranslationInput('WORKSPACES.DELETE_CONFIRMATION', []),
      new TranslationInput('WORKSPACES.NO_DATA', []),
      new TranslationInput('WORKSPACES.NEW_WORKSPACE', []),
      new TranslationInput('WORKSPACES.EDIT_WORKSPACE', []),
      new TranslationInput('WORKSPACES.SECTIONS.1', []),
      new TranslationInput('WORKSPACES.SECTIONS.2', []),
      new TranslationInput('WORKSPACES.SECTIONS.3', []),
      new TranslationInput('WORKSPACES.SECTIONS.4', []),
      new TranslationInput('WORKSPACES.TABLE.ERP', []),
      new TranslationInput('WORKSPACES.TABLE.MODULE', []),
      new TranslationInput('WORKSPACES.TABLE.USERNAME', []),
      new TranslationInput('WORKSPACES.TABLE.ENVIRONMENT', []),
      new TranslationInput('WORKSPACES.TABLE.PASSWORD', []),
      new TranslationInput('WORKSPACES.TABLE.WORKSPACE', []),
      new TranslationInput('WORKSPACES.TABLE.UPLOAD_URL', []),
      new TranslationInput('WORKSPACES.TABLE.PROCESS', []),
      new TranslationInput('WORKSPACES.TABLE.GRAPH', []),
      new TranslationInput('WORKSPACES.TABLE.DATABASE', []),
      new TranslationInput('WORKSPACES.TABLE.NAME', []),
      new TranslationInput('WORKSPACES.TOOLTIPS.ENVIRONMENT', []),
      new TranslationInput('WORKSPACES.TOOLTIPS.USERNAME', []),
      new TranslationInput('WORKSPACES.TOOLTIPS.PASSWORD', []),
      new TranslationInput('WORKSPACES.TOOLTIPS.WORKSPACE', []),
      new TranslationInput('WORKSPACES.TOOLTIPS.UPLOAD_URL', []),
      new TranslationInput('WORKSPACES.TOOLTIPS.PROCESS', []),
      new TranslationInput('WORKSPACES.TOOLTIPS.GRAPH', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_DATABASES_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_DATABASES_ERROR', []),
      new TranslationInput('WORKSPACES.MESSAGES.SAVE_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.DELETE_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.VALIDATE', []),
      new TranslationInput('WORKSPACES.MESSAGES.PASSWORD_ENCRYPT', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_LICENSES_ERROR', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_LICENSES_WARNING', [])
    ]).pipe(map((translations: any) => {
      this.CNST_TRANSLATIONS = translations;
      return true;
    }));
  }
}
