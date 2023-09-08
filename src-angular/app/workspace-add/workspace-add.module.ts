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
  PoContainerModule,
  PoTooltipModule
} from '@po-ui/ng-components';

/* Declaração de módulo de cadastro de ambientes do Agent */
import { WorkspaceAddComponent } from '../workspace-add/workspace-add.component';

/* Módulo de cadastro de bancos de dados do Agent */
import { DataBaseAddModule } from '../database-add/database-add.module';

/* Módulo de Modal customizado do Agent */
import { ModalModule } from '../modal/modal.module';

/* Módulo de tradução do Agent, importado para uso de sua Pipe no HTML do Angular */
import { TranslationModule } from '../services/translation/translation.module';

@NgModule({
  declarations: [
    WorkspaceAddComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    PoFieldModule,
    PoPageModule,
    PoLoadingModule,
    PoButtonModule,
    PoContainerModule,
    PoTooltipModule,
    ModalModule,
    DataBaseAddModule,
    TranslationModule
  ],
  providers: []
})
export class WorkspaceAddModule {}