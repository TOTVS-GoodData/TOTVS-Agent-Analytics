/* Componentes padrões do Angular */
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/* Declaração do módulo de modal customizado do Agent */
import { ModalComponent } from '../modal/modal.component';
import { ModalService } from '../modal/modal.service';

@NgModule({
  declarations: [
    ModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  providers: [
    ModalService
  ],
  exports: [
    ModalComponent
  ]
})
export class ModalModule {}