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
  PoModalModule,
  PoTableModule
} from '@po-ui/ng-components';

/* Declaração do módulo de monitoramento do Agent */
import { MonitorComponent } from './monitor.component';
import { MonitorService } from './monitor-service';

@NgModule({
  declarations: [
    MonitorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PoFieldModule,
    PoPageModule,
    PoLoadingModule,
    PoButtonModule,
    PoModalModule,
    PoTableModule
  ],
  providers: [
    MonitorService
  ]
})
export class MonitorModule {}