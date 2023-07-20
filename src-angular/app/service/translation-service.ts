import { TranslateService, TranslateLoader } from '@ngx-translate/core';

import { HttpService } from './http.service';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';

import { Observable , forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { CNST_TRANSLATIONS_EN_US } from 'i18n/en-US';
import { CNST_TRANSLATIONS_PT_BR } from 'i18n/pt-BR';
import { CNST_TRANSLATIONS_ES_ES } from 'i18n/es-ES';

const TRANSLATIONS = {
  en_US: CNST_TRANSLATIONS_EN_US,
  pt_BR: CNST_TRANSLATIONS_PT_BR,
  es_ES: CNST_TRANSLATIONS_ES_ES
};

class Translation {
  key: string;
  replacement: string[];
}

export class TranslationService implements TranslateLoader {
  constructor(private _httpService: HttpService) {
  }
  
  public getTranslation(language: string): Observable<any> {
    language = language.replaceAll('\-','\_');
    return of(TRANSLATIONS[language]);
  }
}