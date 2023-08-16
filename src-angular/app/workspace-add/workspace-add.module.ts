import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoPageModule } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';
import { PoInfoModule } from '@po-ui/ng-components';
import { PoButtonModule } from '@po-ui/ng-components';
import { PoListViewModule } from '@po-ui/ng-components';
import { PoContainerModule } from '@po-ui/ng-components';
import { PoGridModule } from '@po-ui/ng-components';
import { PoLoadingModule } from '@po-ui/ng-components';

import { WorkspaceAddComponent } from '../workspace-add/workspace-add.component';
import { UserService } from '../service/user.service';

import { DataBaseAddModule } from '../database-add/database-add.module';
import { ModalModule } from '../modal/modal.module';

import { TranslationModule } from '../service/translation/translation.module';

import { PoTooltipModule } from '@po-ui/ng-components';

@NgModule({
    declarations: [
        WorkspaceAddComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
      PoLoadingModule,
      PoGridModule,
      PoTooltipModule,
      PoListViewModule,
      PoContainerModule,
        HttpClientModule,
        ModalModule,
      DataBaseAddModule,
        PoPageModule,
      TranslationModule,
        PoFieldModule,
        PoInfoModule,
        PoButtonModule
    ],
    providers: [UserService]
})
export class WorkspaceAddModule {}
