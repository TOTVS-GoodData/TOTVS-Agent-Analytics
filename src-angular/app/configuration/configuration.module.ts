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
  PoButtonGroupModule,
  PoTooltipModule
} from '@po-ui/ng-components';

/* Serviço de tradução do Agent */
import { TranslationModule } from '../services/translation/translation.module';

/* Declaração de módulo de configuração do Agent */
import { ConfigurationComponent } from './configuration.component';

@NgModule({
  declarations: [
    ConfigurationComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    TranslationModule,
    PoFieldModule,
    PoPageModule,
    PoLoadingModule,
    PoButtonModule,
    PoButtonGroupModule,
    PoTooltipModule
  ],
  providers: []
})
export class ConfigurationModule {}