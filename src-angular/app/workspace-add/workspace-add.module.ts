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
import { JavaModule } from '../java/java.module';
import { ModalModule } from '../modal/modal.module';
import { JavaAddModule } from '../java-add/java-add.module';

@NgModule({
    declarations: [
        WorkspaceAddComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
      PoLoadingModule,
      PoGridModule,
      PoListViewModule,
      PoContainerModule,
        HttpClientModule,
        ModalModule,
        JavaModule,
      DataBaseAddModule,
        PoPageModule,
        PoFieldModule,
        PoInfoModule,
        PoButtonModule,
        JavaAddModule
    ],
    providers: [UserService]
})
export class WorkspaceAddModule {}
