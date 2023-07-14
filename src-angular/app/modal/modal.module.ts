import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    providers: [ ModalService ],
    exports: [ ModalComponent ]
})
export class ModalModule {}
