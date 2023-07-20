import { TranslateService } from '@ngx-translate/core';

import { Observable } from 'rxjs';

import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { map, switchMap, filter } from 'rxjs/operators';

export class TranslationInput {
  key: string;
  replacements: string[];
  
  constructor(key: string, replacements: string[]) {
    this.key = key;
    this.replacements = replacements;
  }
}

@Pipe({name: 'translateExtended'})
@Injectable({
  providedIn: 'root'
})
export class TranslateServiceExtended extends TranslateService implements PipeTransform {
  public transform(value: string): Observable<string> {
    let ti: TranslationInput[] = [new TranslationInput(value, [])];
    return this.getTranslations(ti).pipe(map((translations: any) => {
      return translations[value];
    }));
  }
  
  public setDefaultLang(language: string): void {
    super.setDefaultLang(language);
  }
  
  public use(language: string): Observable<any> {
    return super.use(language);
  }
  
  public getTranslations(translationInputs: TranslationInput[]): Observable<any> {
    let keys: string[] = translationInputs.map((ti: TranslationInput) => {
      return ti.key;
    });
    
    return super.get(keys).pipe(map((translations: any) => {
      Object.getOwnPropertyNames.call(Object, translations).map((p: any) => {
        let p1: string = null;
        let p2: string = null;
        let p3: string = null;
        
        let ti: TranslationInput = translationInputs.find((ti: TranslationInput) => (ti.key == p));
        if (ti.replacements.length > 0) {
          p1 = ti.replacements[0];
          p2 = ti.replacements[1];
          p3 = ti.replacements[2];
          translations[p] = eval('`' + translations[p] + '`');
        }
        
        return translations;
      });
      
      return translations;
    }));
  }
}