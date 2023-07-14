import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoFieldModule } from '@po-ui/ng-components';
import { PoPageModule, PoLoadingModule, PoButtonModule } from '@po-ui/ng-components';

import { ConfigurationComponent } from './configuration.component';

@NgModule({
    declarations: [
        ConfigurationComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
      PoLoadingModule,
        FormsModule,
      PoButtonModule,
        PoFieldModule,
        PoPageModule
    ],
    providers: []
})
export class ConfigurationModule {}
