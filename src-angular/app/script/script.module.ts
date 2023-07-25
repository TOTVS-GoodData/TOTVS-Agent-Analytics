import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoPageModule, PoListViewModule, PoButtonModule } from '@po-ui/ng-components';
import { PoTableModule } from '@po-ui/ng-components';
import { PoModalModule } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';
import { PoLoadingModule } from '@po-ui/ng-components';

import { ScriptComponent } from './script.component';
import { SharedModule } from '../shared/shared.module';
import { TranslationModule } from '../service/translation/translation.module';


@NgModule({
    declarations: [
        ScriptComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
      TranslationModule,
        HttpClientModule,
      PoListViewModule,
      PoButtonModule,
        SharedModule,
        PoPageModule,
        PoTableModule,
        PoModalModule,
        PoFieldModule,
        PoLoadingModule
    ],
    providers: []
})
export class ScriptModule {}
