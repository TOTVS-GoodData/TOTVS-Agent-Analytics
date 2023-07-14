import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
   PoLoadingModule
  ,PoPageModule
  ,PoFieldModule
  ,PoButtonModule
  ,PoGridModule
  ,PoModalModule
} from '@po-ui/ng-components';

import { ScheduleAddComponent } from '../schedule-add/schedule-add.component';

@NgModule({
  declarations: [ScheduleAddComponent],
  imports: [
     FormsModule
    ,CommonModule
    ,PoLoadingModule
    ,PoPageModule
    ,PoFieldModule
    ,PoButtonModule
    ,PoGridModule
    ,PoModalModule
  ],
  providers: []
})
export class ScheduleAddModule {}