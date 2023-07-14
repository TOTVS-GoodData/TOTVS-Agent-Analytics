import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PoPageModule } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';
import { PoTableModule } from '@po-ui/ng-components';
import { PoModalModule } from '@po-ui/ng-components';

import { MonitorComponent } from './monitor.component';
import { MonitorService } from './monitor-service';
import { PoModule } from '@po-ui/ng-components';

@NgModule({
    declarations: [
        MonitorComponent
    ],
    imports: [
        CommonModule,
        PoPageModule,
        PoFieldModule,
        FormsModule,
        PoTableModule,
        PoModalModule,
        PoModule
    ],
    providers: [
        MonitorService
    ]
})
export class MonitorModule {}
