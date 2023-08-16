import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoPageModule, PoListViewModule, PoButtonModule } from '@po-ui/ng-components';
import { PoTableModule } from '@po-ui/ng-components';
import { PoModalModule } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';
import { PoLoadingModule } from '@po-ui/ng-components';

import { QueryComponent } from './query.component';
import { SharedModule } from '../shared/shared.module';

import { TranslationModule } from '../service/translation/translation.module';

import { PoTooltipModule } from '@po-ui/ng-components';

@NgModule({
    declarations: [
        QueryComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
      PoTooltipModule,
      PoListViewModule,
      PoButtonModule,
        SharedModule,
      TranslationModule,
        PoPageModule,
        PoTableModule,
        PoModalModule,
        PoFieldModule,
        PoLoadingModule
    ],
    providers: []
})
export class QueryModule {}
