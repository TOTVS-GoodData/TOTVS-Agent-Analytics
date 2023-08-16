import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
   PoLoadingModule
  ,PoPageModule
  ,PoContainerModule
  ,PoFieldModule
  ,PoButtonModule
} from '@po-ui/ng-components';

import { DataBaseAddComponent } from './database-add.component';

import { PoTooltipModule } from '@po-ui/ng-components';

@NgModule({
  declarations: [DataBaseAddComponent],
  imports: [
     CommonModule
    ,FormsModule
    ,PoLoadingModule
    ,PoPageModule
    ,PoTooltipModule
    ,PoContainerModule
    ,PoFieldModule
    ,PoButtonModule
  ],
  providers: [],
  exports: [DataBaseAddComponent]
})
export class DataBaseAddModule {}