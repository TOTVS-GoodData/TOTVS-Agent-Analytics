import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';

/* Componentes visuais do Portinari.UI */
import {
  PoMenuModule,
  PoNotificationModule,
  PoTableModule,
  PoModule,
  PoModalModule
} from '@po-ui/ng-components';

/* Workspace */
import { WorkspaceModule } from './workspace/workspace.module';
import { WorkspaceAddModule } from './workspace-add/workspace-add.module';
import { WorkspaceService } from './workspace/workspace-service';
//aDADD
import { DataBaseModule } from './database/database.module';
import { DataBaseAddModule } from './database-add/database-add.module';

import { ScheduleModule } from './schedule/schedule.module';
import { ScheduleAddModule } from './schedule-add/schedule-add.module';

import { ConfigurationModule } from './configuration/configuration.module';

import { MonitorModule } from './monitor/monitor.module';

import { QueryModule } from './query/query.module';

import { ScriptModule } from './script/script.module';

import { SharedModule } from './shared/shared.module';
import { LogModule } from './log/log.module';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { MenuService } from './service/menu-service';

import { CustomTranslationLoader } from './service/translation/custom-translation-loader';
import { TranslationModule } from './service/translation/translation.module';
import {
  TranslateModule,
  TranslateLoader
} from '@ngx-translate/core';

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
    PoModalModule,
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
  providers: [
    AppModule,
    WorkspaceService,
    MenuService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}