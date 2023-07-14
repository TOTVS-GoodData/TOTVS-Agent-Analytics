import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
   PoLoadingModule
  ,PoPageModule
  ,PoFieldModule
  ,PoButtonModule
  ,PoGridModule
} from '@po-ui/ng-components';

import { JavaAddComponent } from './java-add.component';

@NgModule({
   declarations: [JavaAddComponent]
  ,imports: [
     CommonModule
    ,FormsModule
    ,PoLoadingModule
    ,PoPageModule
    ,PoFieldModule
    ,PoButtonModule
    ,PoGridModule
  ]
  ,providers: []
  ,exports: [JavaAddComponent]
})
export class JavaAddModule {}