import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoFieldModule } from '@po-ui/ng-components';
import { PoPageModule, PoLoadingModule, PoButtonModule, PoButtonGroupModule } from '@po-ui/ng-components';

import { ConfigurationComponent } from './configuration.component';
import { TranslationModule } from '../service/translation/translation.module';

import { PoTooltipModule } from '@po-ui/ng-components';

@NgModule({
    declarations: [
        ConfigurationComponent
    ],
    imports: [
        CommonModule,PoButtonGroupModule,
        HttpClientModule,
      PoLoadingModule,
      PoTooltipModule,
        FormsModule,
      PoButtonModule,
        PoFieldModule,
      TranslationModule,
        PoPageModule
    ],
    providers: []
})
export class ConfigurationModule {}
