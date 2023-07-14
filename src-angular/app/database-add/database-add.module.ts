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

@NgModule({
  declarations: [DataBaseAddComponent],
  imports: [
     CommonModule
    ,FormsModule
    ,PoLoadingModule
    ,PoPageModule
    ,PoContainerModule
    ,PoFieldModule
    ,PoButtonModule
  ],
  providers: [],
  exports: [DataBaseAddComponent]
})
export class DataBaseAddModule {}