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
  PoInfoModule,
  PoModalModule,
  PoListViewModule
} from '@po-ui/ng-components';

/* Declaração de módulo de agendamentos do Agent */
import { ScheduleComponent } from './schedule.component';

@NgModule({
  declarations: [
    ScheduleComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    PoFieldModule,
    PoPageModule,
    PoLoadingModule,
    PoButtonModule,
    PoInfoModule,
    PoModalModule,
    PoListViewModule
  ],
  providers: []
})
export class ScheduleModule {}