/* Classe global do Agent */
import { TOTVS_Agent_Analytics } from '../../app';

/* Serviço de logs / arquivos do Agent */
import { Files } from '../files';

/* Serviço central do Electron */
import Main from '../../electron-main';

/* Serviço de tradução do Electron */
import { TranslationService } from './translation-service';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../../src-angular/app/utilities/utilities-constants';

/* Interface do banco de dados do Agent */
import { ClientData } from '../electron-interface';

/* Interface de configuração do Agent */
import { Configuration } from '../../src-angular/app/configuration/configuration-interface';

/* Interface do servidor do Agent */
import { ServerService } from './server-service';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, switchMap, map, catchError, of } from 'rxjs';

export class ConfigurationService {
  
  /*******************/
  /*  CONFIGURAÇÃO   */
  /*******************/
  /* Método de consulta da configuração atual do Agent */
  public static getConfiguration(showLogs): Observable<Configuration> {
    
    //Escrita de logs (caso solicitado)
    if (showLogs) Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING'], null, null, null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno da configuraçãO atual
    return Files.readApplicationData().pipe(map((db: ClientData) => {
      let conf: Configuration = new Configuration(
        db.configuration.logfilesToKeep,
        db.configuration.debug,
        db.configuration.javaXmx,
        db.configuration.javaTmpDir,
        db.configuration.locale,
        db.configuration.autoUpdate
      );

      conf.instanceName = db.configuration.instanceName;
      conf.logPath = db.configuration.logPath;
      conf.timezone = db.configuration.timezone;
      conf.serialNumber = db.configuration.serialNumber;
      conf.javaJREDir = db.configuration.javaJREDir;
      conf.contractType = db.configuration.contractType;

      return conf;
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.LOADING_ERROR'], null, null, err, null, null);
      throw err;
    }));
  }
  
  /* Método de gravação da configuração do Agent */
  public static saveConfiguration(conf: Configuration): Observable<number> {
    
    //Leitura da configuração atual do Agent
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE'], null, null, null, null, null);
    return Files.readApplicationData().pipe(switchMap((_dbd: ClientData) => {
      let oldData: ClientData = { ..._dbd };
      _dbd.configuration = conf;

      //Gravação da nova configuração
      return Files.writeApplicationData(_dbd).pipe(switchMap((b: boolean) => {
        if (b) {
          if (conf.serialNumber != null) {
            if ((TOTVS_Agent_Analytics.getMirrorMode() == 0) || (TOTVS_Agent_Analytics.getMirrorMode() == 1)) {

              //Atualiza o idioma utilizado pelo Agent (caso tenha sido alterado)
              TranslationService.use(conf.locale);
              return of(1);
            }
          } else {
            return of(1);
          }
        } else {
          Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE_ERROR_CONFIG'], null, null, null, null, null);
          return of(-1);
        }
      }));
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['CONFIGURATION.MESSAGES.SAVE_ERROR'], null, null, err, null, null);
      throw err;
    }));
  }
}