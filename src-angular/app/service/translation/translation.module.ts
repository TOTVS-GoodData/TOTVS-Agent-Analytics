import { NgModule } from '@angular/core';
import { TranslationService } from './translation-service';

@NgModule({
  declarations: [
    TranslationService
  ],
  imports: [
  ],
  exports: [
    TranslationService
  ],
  providers: [TranslationService],
  bootstrap: []
})
export class TranslationModule { }
