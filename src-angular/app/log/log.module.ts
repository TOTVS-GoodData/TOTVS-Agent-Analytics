import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PoPageModule } from '@po-ui/ng-components';

import { LogComponent } from './log.component';

@NgModule({
    declarations: [
        LogComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        PoPageModule
    ],
    providers: []
})
export class LogModule {}
