import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { PoMenuModule } from '@po-ui/ng-components';
import { PoNotificationModule } from '@po-ui/ng-components';
import { PoTableModule } from '@po-ui/ng-components';
import { PoModule } from '@po-ui/ng-components';

import { WorkspaceModule } from './workspace/workspace.module';
import { WorkspaceAddModule } from './workspace-add/workspace-add.module';
import { DataBaseModule } from './database/database.module';
import { DataBaseAddModule } from './database-add/database-add.module';
import { LogModule } from './log/log.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ScheduleAddModule } from './schedule-add/schedule-add.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { MonitorModule } from './monitor/monitor.module';
import { QueryModule } from './query/query.module';
import { ScriptModule } from './script/script.module';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';

import { WorkspaceService } from './workspace/workspace-service';

import { CustomTranslationLoader } from './service/translation/custom-translation-loader';
import { TranslationModule } from './service/translation/translation.module';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserAnimationsModule,
    PoModule,
    BrowserModule,
    AppRoutingModule,
    PoMenuModule,
    WorkspaceModule,
    WorkspaceAddModule,
    DataBaseModule,
    DataBaseAddModule,
    LogModule,
    ScheduleModule,
    ScheduleAddModule,
    ConfigurationModule,
    MonitorModule,
    QueryModule,
    ScriptModule,
    SharedModule,
    PoNotificationModule,
    PoTableModule,
    TranslationModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslationLoader,
        deps: [HttpClient]
      }
     }),
     HttpClientModule
  ],
  providers: [AppModule, WorkspaceService],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
