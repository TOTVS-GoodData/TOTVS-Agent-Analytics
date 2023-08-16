import * as path from 'path';
import * as fs from 'fs-extra';
import * as globals from './constants-electron';

import { CNST_TRANSLATIONS_EN_US } from '../i18n/en-US';
import { CNST_TRANSLATIONS_PT_BR } from '../i18n/pt-BR';
import { CNST_TRANSLATIONS_ES_ES } from '../i18n/es-ES';

const TRANSLATIONS = {
  en_US: CNST_TRANSLATIONS_EN_US,
  pt_BR: CNST_TRANSLATIONS_PT_BR,
  es_ES: CNST_TRANSLATIONS_ES_ES
};

export class TranslationInput {
  key: string;
  replacements: string[];
  
  constructor(key: string, replacements: string[]) {
    this.key = key;
    this.replacements = replacements;
  }
}

export class Translations {
  private static languageObj: any = null;
  private static defaultLanguage: string = null;
  private static currentLanguage: string = null;
  
  public static setDefaultLanguage(language: string): void {
    Translations.defaultLanguage = language;
    Translations.init();
  }
  
  public static use(language: string): void {
    Translations.currentLanguage = language;
    Translations.init();
  }
  
  public static init(): void {
    if (fs.existsSync(path.join(globals.CNST_I18N_PATH, Translations.currentLanguage + '.ts'))) {
      Translations.languageObj = TRANSLATIONS[Translations.currentLanguage.replaceAll('\-','\_')];
    } else {
      Translations.languageObj = TRANSLATIONS[Translations.defaultLanguage.replaceAll('\-','\_')];
    }
  }
  
  public static getTranslations(translations: TranslationInput[]): any[] {
    let final_obj: any = {};
    
    translations.map((ti: TranslationInput) => {
      let p1: string = null;
      let p2: string = null;
      let p3: string = null;
      
      let splits: string[] = ti.key.split('.');
      let message: string = splits.reduce((acc: any, split: string) => acc[split], Translations.languageObj);
      if (ti.replacements.length > 0) {
        p1 = ti.replacements[0];
        p2 = ti.replacements[1];
        p3 = ti.replacements[2];
        message = eval('`' + message + '`');
      }
      
      final_obj[ti.key] = message;
      return;
    });
    
    return final_obj;
  }
}