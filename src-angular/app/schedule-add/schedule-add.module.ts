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
  PoGridModule,
  PoModalModule,
  PoTooltipModule,
} from '@po-ui/ng-components';

/* Declaração de módulo de cadastro de agendamentos do Agent */
import { ScheduleAddComponent } from '../schedule-add/schedule-add.component';

@NgModule({
  declarations: [
    ScheduleAddComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    PoFieldModule,
    PoPageModule,
    PoLoadingModule,
    PoButtonModule,
    PoGridModule,
    PoModalModule,
    PoTooltipModule
  ],
  providers: []
})
export class ScheduleAddModule {}