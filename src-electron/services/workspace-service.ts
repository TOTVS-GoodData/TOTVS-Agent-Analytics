/* Serviço de logs / arquivos do Agent */
import { Files } from '../files';

/* Serviço de tradução do Electron */
import { TranslationService } from './translation-service';
import { TranslationInput } from '../../src-angular/app/services/translation/translation-interface';

/* Componentes de utilitários do Agent */
import { CNST_LOGLEVEL, CNST_SYSTEMLEVEL } from '../../src-angular/app/utilities/utilities-constants';

/* Interface do banco de dados do Agent */
import { DatabaseData } from '../electron-interface';

/* Interface de ambientes do Agent */
import { Workspace } from '../../src-angular/app/workspace/workspace-interface';

/* Interface de bancos de dados do Agent */
import { Database } from '../../src-angular/app/database/database-interface';

/* Componente de geração de Id's únicos para os registros */
import uuid from 'uuid-v4';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, switchMap, map, of, catchError } from 'rxjs';

export class WorkspaceService {
  
  /**************************/
  /*** MÉTODOS DO SERVIÇO ***/
  /**************************/
  /* Método de consulta dos ambientes salvos do Agent */
  public static getWorkspaces(): Observable<Workspace[]> {
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e retorno dos ambientes cadastrados
    return Files.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.workspaces;
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de consulta dos ambientes vinculados a um banco de dados do Agent */
  public static getWorkspacesByDatabase(db: Database): Observable<Workspace[]> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.LOADING_DATABASES', [db.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.LOADING_DATABASES'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e filtragem dos ambientes cadastrados
    return Files.readApplicationData().pipe(map((_dbd: DatabaseData) => {
      return _dbd.workspaces.filter((w: Workspace) => {
        return (w.databaseIdRef === db.id)
      });
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, TranslationService.CNST_TRANSLATIONS['WORKSPACES.MESSAGES.LOADING_DATABASES_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de gravação dos ambientes do Agent */
  public static saveWorkspace(w: Workspace): Observable<boolean> {
    
    //Objeto que detecta se já existe um ambiente cadastrado com o mesmo nome do que será gravado
    let workspace_name: Workspace = null;
    
    //Define se o ambiente a ser cadastrado já possui um Id registrado, ou não
    let newId: boolean = (w.id == null);
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.SAVE', [w.name]),
      new TranslationInput('WORKSPACES.MESSAGES.SAVE_ERROR', [w.name]),
      new TranslationInput('WORKSPACES.MESSAGES.SAVE_ERROR_SAME_NAME', [w.name])
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.SAVE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      
      //Validação do campo de Id do ambiente. Caso não preenchido, é gerado um novo Id
      if (newId) w.id = uuid();
      
      //Impede o cadastro de um ambiente com o mesmo nome
      workspace_name = _dbd.workspaces.filter((workspace: Workspace) => (workspace.id != w.id)).find((workspace: Workspace) => (workspace.name == w.name));
      if (workspace_name != undefined) {
        Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.SAVE_ERROR_SAME_NAME'], null, null, null);
        return of(false);
      } else {
        
        //Inclusão do ambiente no banco do Agent
        if (newId) {
          _dbd.workspaces.push(w);
        } else {
          let index = _dbd.workspaces.findIndex((workspace: Workspace) => { return workspace.id === w.id; });
          _dbd.workspaces[index] = w;
        }
        
        //Gravação do ambiente no banco do Agent
        return Files.writeApplicationData(_dbd);
      }
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.SAVE_ERROR'], null, null, err);
      throw err;
    }));
  }
  
  /* Método de remoção dos ambientes do Agent */
  public static deleteWorkspace(w: Workspace): Observable<boolean> {
    
    //Consulta das traduções
    let translations: any = TranslationService.getTranslations([
      new TranslationInput('WORKSPACES.MESSAGES.DELETE', [w.name]),
      new TranslationInput('WORKSPACES.MESSAGES.DELETE_ERROR', [w.name]),
    ]);
    
    Files.writeToLog(CNST_LOGLEVEL.DEBUG, CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.DELETE'], null, null, null);
    
    //Leitura do banco de dados atual do Agent, e remoção do ambiente cadastrado
    return Files.readApplicationData().pipe(switchMap((_dbd: DatabaseData) => {
      let index = _dbd.workspaces.findIndex((workspace: Workspace) => { return workspace.id === w.id; });
      _dbd.workspaces.splice(index, 1);
      
      return Files.writeApplicationData(_dbd);
    }), catchError((err: any) => {
      Files.writeToLog(CNST_LOGLEVEL.ERROR, CNST_SYSTEMLEVEL.ELEC, translations['WORKSPACES.MESSAGES.DELETE_ERROR'], null, null, err);
      throw err;
    }));
  }
}