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

/* Declaração de módulo de cadastro de banco de dados do Agent */
import { DataBaseAddComponent } from './database-add.component';

@NgModule({
  declarations: [
    DataBaseAddComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    PoFieldModule,
    PoPageModule,
    PoLoadingModule,
    PoButtonModule,
    PoContainerModule,
    PoTooltipModule
  ],
  exports: [
    DataBaseAddComponent
  ],
  providers: []
})
export class DataBaseAddModule {}