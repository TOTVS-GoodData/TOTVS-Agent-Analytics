/* Componentes padrões do Angular */
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/* Componentes visuais da biblioteca Portinari.UI */
import {
  PoFieldModule,
  PoPageModule,
  PoLoadingModule,
  PoButtonModule,
  PoTooltipModule,
  PoListViewModule,
  PoModalModule,
  PoTableModule
} from '@po-ui/ng-components';

/* Serviço de tradução do Agent */
import { TranslationModule } from '../services/translation/translation.module';

/* Declaração do módulo de rotinas do Agent */
import { ScriptComponent } from './script.component';

@NgModule({
  declarations: [
    ScriptComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PoFieldModule,
    PoPageModule,
    PoLoadingModule,
    PoButtonModule,
    PoTooltipModule,
    PoListViewModule,
    PoModalModule,
    PoTableModule,
    TranslationModule
  ],
  providers: []
})
export class ScriptModule {}