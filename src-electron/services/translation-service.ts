import * as path from 'path';
import * as fs from 'fs-extra';
import * as globals from '../constants-electron';


import { CNST_TRANSLATIONS, CNST_DEFAULT_LANGUAGE } from '../../src-angular/app/services/translation/translation-constants';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

export class TranslationService {
  
  //Armazena o objeto contendo todas as mensagens de tradução, para o idioma selecionado
  private static languageObj: any = null;
  
  //Armazena todas as mensagens do Agent, já traduzidas
  public static CNST_TRANSLATIONS: Array<string> = [];
  
  /*********************************/
  /******* MÉTODOS DO MÓDULO  ******/
  /*********************************/
  
  /* Método usado para trocar o idioma do Agent */
  public static use(language: string): void {
    TranslationService.init(language);
  }
  
  /* Método de inicialização do serviço de tradução */
  public static init(language?: string): void {
    
    /*
      Verifica se o arquivo de tradução existe para o idioma solicitado.
      Caso não exista, utiliza o idioma padrão.
    */
    if (fs.existsSync(path.join(globals.CNST_I18N_PATH, language + '.ts'))) {
      TranslationService.languageObj = CNST_TRANSLATIONS[language];
    } else {
      TranslationService.languageObj = CNST_TRANSLATIONS[CNST_DEFAULT_LANGUAGE];
    }
    
    //Atualiza todas as mensagens do Agent
    TranslationService.updateStandardTranslations();
  }
  
  /* Método de tradução das mensagens do Agent */
  public static getTranslations(translations: TranslationInput[]): any {
    
    //Variável de suporte, que armazena todas as mensagens traduzidas pelo método
    let final_obj: any = {};
    
    //Realiza a tradução de cada mensagem solicitada
    translations.map((ti: TranslationInput) => {
      let p1: string = null;
      let p2: string = null;
      let p3: string = null;
      
      let splits: string[] = ti.key.split('.');
      let message: string = splits.reduce((acc: any, split: string) => acc[split], TranslationService.languageObj);
      
      //Substitui os parâmetros da mensagem, pelos argumentos passados
      if (ti.replacements.length > 0) {
        p1 = ti.replacements[0];
        p2 = ti.replacements[1];
        p3 = ti.replacements[2];
        
        //Executa a substituição dos parâmetros, pelos seus valores
        message = eval('`' + message + '`');
      }
      
      //Cria uma nova chave no objeto de saída
      final_obj[ti.key] = message;
      return;
    });
    
    //Retorna todas as mensagens traduzidas
    return final_obj;
  }
  
  /* Método de atualização das traduções do Agent */
  public static updateStandardTranslations(): boolean {
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING', []),
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING_OK', []),
      new TranslationInput('CONFIGURATION.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE_OK', []),
      new TranslationInput('CONFIGURATION.MESSAGES.SAVE_ERROR', []),
      new TranslationInput('DATABASES.MESSAGES.LOADING', []),
      new TranslationInput('DATABASES.MESSAGES.LOADING_OK', []),
      new TranslationInput('DATABASES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('DATABASES.MESSAGES.SAVE_OK', []),
      new TranslationInput('DATABASES.MESSAGES.DELETE_OK', []),
      new TranslationInput('ELECTRON.DATABASE_LOGIN_ELEC_START', []),
      new TranslationInput('ELECTRON.EXPORT_QUERY_ELEC_START', []),
      new TranslationInput('ELECTRON.TRAY_OPEN_INTERFACE', []),
      new TranslationInput('ELECTRON.TRAY_FINISH_PROCESS', []),
      new TranslationInput('ELECTRON.THREAD_ERROR', []),
      new TranslationInput('ELECTRON.RUN_AGENT_ELEC_START', []),
      new TranslationInput('ELECTRON.WINDOWS_REGISTRY_ERROR', []),
      new TranslationInput('ELECTRON.SYSTEM_START', []),
      new TranslationInput('ELECTRON.SYSTEM_WINDOW_CLOSE', []),
      new TranslationInput('ELECTRON.SYSTEM_FINISH', []),
      new TranslationInput('ELECTRON.SYSTEM_SERVICE', []),
      new TranslationInput('ELECTRON.JAVA_EXECUTION_CANCELLED', []),
      new TranslationInput('ELECTRON.AUTOLAUNCH_ERROR', []),
      new TranslationInput('ELECTRON.UPDATE_CHECK', []),
      new TranslationInput('ELECTRON.UPDATE_ERROR', []),
      new TranslationInput('ELECTRON.FOLDER_SELECT', []),
      new TranslationInput('ELECTRON.DATABASE_DEVELOPMENT', []),
      new TranslationInput('ELECTRON.DATABASE_PRODUCTION', []),
      new TranslationInput('ELECTRON.DATABASE_CREATE', []),
      new TranslationInput('ELECTRON.DATABASE_CREATE_OK', []),
      new TranslationInput('ELECTRON.DELETE_OLD_LOGS', []),
      new TranslationInput('ELECTRON.DELETE_OLD_LOGS_OK', []),
      new TranslationInput('ELECTRON.JAVA_EXECUTION_CANCELLED', []),
      new TranslationInput('QUERIES.MESSAGES.LOADING', []),
      new TranslationInput('QUERIES.MESSAGES.LOADING_OK', []),
      new TranslationInput('QUERIES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('QUERIES.MESSAGES.SAVE_OK', []),
      new TranslationInput('QUERIES.MESSAGES.DELETE_OK', []),
      new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING_OK', []),
      new TranslationInput('QUERIES.MESSAGES.SCHEDULE_LOADING_ERROR', []),
      new TranslationInput('SCHEDULES.MESSAGES.LOADING', []),
      new TranslationInput('SCHEDULES.MESSAGES.LOADING_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('SCHEDULES.MESSAGES.SAVE_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.DELETE_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.TRIGGERSCHEDULES_ERROR', []),
      new TranslationInput('SCHEDULES.MESSAGES.TRIGGERSCHEDULES_OK', []),
      new TranslationInput('SCHEDULES.MESSAGES.RUN_PREPARE', []),
      new TranslationInput('SCRIPTS.MESSAGES.LOADING', []),
      new TranslationInput('SCRIPTS.MESSAGES.LOADING_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('SCRIPTS.MESSAGES.SAVE_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.DELETE_OK', []),
      new TranslationInput('SCRIPTS.MESSAGES.SCHEDULE_LOADING_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_DATABASES_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.SAVE_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.DELETE_OK', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_ERROR', []),
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_DATABASES_ERROR', [])
    ]);
    
    TranslationService.CNST_TRANSLATIONS = translations;
    return true;
  }
}