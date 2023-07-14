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
  ,PoButtonGroupModule
} from '@po-ui/ng-components';

import { ScheduleComponent } from './schedule.component';

@NgModule({
  declarations: [ScheduleComponent],
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
    ,PoButtonGroupModule
  ],
  providers: []
})
export class ScheduleModule {}