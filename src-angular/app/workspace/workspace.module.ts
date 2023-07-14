import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
   PoInfoModule
  ,PoLoadingModule
  ,PoModalModule
  ,PoPageModule
  ,PoListViewModule
  ,PoFieldModule
  ,PoButtonModule
} from '@po-ui/ng-components';

import { WorkspaceComponent } from '../workspace/workspace.component';

@NgModule({
   declarations: [WorkspaceComponent]
  ,imports: [
     CommonModule
    ,FormsModule
    ,PoInfoModule
    ,PoLoadingModule
    ,PoModalModule
    ,PoPageModule
    ,PoListViewModule
    ,PoFieldModule
    ,PoButtonModule
  ]
  ,providers: []
})
export class WorkspaceModule {}