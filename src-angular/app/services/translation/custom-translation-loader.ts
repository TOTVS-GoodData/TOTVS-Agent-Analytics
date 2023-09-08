/* Componentes padrões do Angular */
import { Injectable } from '@angular/core';

/* Dependência de tradução de mensagens */
import { TranslateLoader } from '@ngx-translate/core';

/* Serviço de comunicação http (usado pelo ngx-translate) */
import { HttpService } from '../http.service';

/* Traduções disponíveis no Agent */
import { CNST_TRANSLATIONS } from './translation-constants';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomTranslationLoader implements TranslateLoader {
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  constructor(
    private _httpService: HttpService
  ) {}
  
  /* Método que retorna todas as mensagens do idioma informado */
  public getTranslation(language: string): Observable<any> {
    return of(CNST_TRANSLATIONS[language]);
  }
  
  /* Método que retorna todos os idiomas configurados no Agent */
  public getAvailableLanguages(): string[] {
    return Object.keys(CNST_TRANSLATIONS);
  }
}