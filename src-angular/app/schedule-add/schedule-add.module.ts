import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslationModule } from '../service/translation/translation.module';
import {
   PoLoadingModule
  ,PoPageModule
  ,PoFieldModule
  ,PoButtonModule
  ,PoGridModule
  ,PoModalModule
} from '@po-ui/ng-components';

import { ScheduleAddComponent } from '../schedule-add/schedule-add.component';

import { PoTooltipModule } from '@po-ui/ng-components';

@NgModule({
  declarations: [ScheduleAddComponent],
  imports: [
     FormsModule
    ,CommonModule
    ,PoTooltipModule
    ,PoLoadingModule
    ,PoPageModule
    ,TranslationModule
    ,PoFieldModule
    ,PoButtonModule
    ,PoGridModule
    ,PoModalModule
  ],
  providers: []
})
export class ScheduleAddModule {}