import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { JavaComponent } from './java.component';

import {
   PoInfoModule
  ,PoLoadingModule
  ,PoModalModule
  ,PoPageModule
  ,PoListViewModule
  ,PoFieldModule
  ,PoButtonModule
} from '@po-ui/ng-components';

@NgModule({
  declarations: [JavaComponent],
  imports: [
     CommonModule
    ,FormsModule
    ,PoInfoModule
    ,PoLoadingModule
    ,PoModalModule
    ,PoPageModule
    ,PoListViewModule
    ,PoFieldModule
    ,PoButtonModule
  ],
  providers: []
})
export class JavaModule {}