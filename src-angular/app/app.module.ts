/* Componentes padrões do Angular */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/* Componentes do Electron */
import { CoreModule } from './core/core.module';

/* Componentes do Angular para comunicação http */
import { HttpClient, HttpClientModule } from '@angular/common/http';

/* Componentes visuais da biblioteca Portinari.UI */
import {
  PoMenuModule,
  PoNotificationModule,
  PoTableModule,
  PoModule,
  PoModalModule,
  PoLinkModule
} from '@po-ui/ng-components';

/* Módulos da página de ambientes */
import { WorkspaceModule } from './workspace/workspace.module';
import { WorkspaceAddModule } from './workspace-add/workspace-add.module';
import { WorkspaceService } from './workspace/workspace-service';

/* Módulos da página de bancos de dados */
import { DataBaseModule } from './database/database.module';
import { DataBaseAddModule } from './database-add/database-add.module';

/* Módulos da página de agendamentos */
import { ScheduleModule } from './schedule/schedule.module';
import { ScheduleAddModule } from './schedule-add/schedule-add.module';

/* Módulos da página de consultas */
import { QueryModule } from './query/query.module';

/* Módulos da página de rotinas */
import { ScriptModule } from './script/script.module';

/* Módulos da página de monitoramento */
import { MonitorModule } from './monitor/monitor.module';

/* Módulos da página de configuração */
import { ConfigurationModule } from './configuration/configuration.module';

/* Serviço de comunicação com o menu principal do Agent (para atualizar a tradução do Menu) */
import { MenuService } from './services/menu-service';

/* Serviço de tradução do Agent */
import { CustomTranslationLoader } from './services/translation/custom-translation-loader';
import { TranslationModule } from './services/translation/translation.module';
import {
  TranslateModule,
  TranslateLoader
} from '@ngx-translate/core';

/* Declaração do módulo primário do Agent */
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    CoreModule,
    HttpClientModule,
    PoMenuModule,
    PoNotificationModule,
    PoTableModule,
    PoModule,
    PoModalModule,
    PoLinkModule,
    WorkspaceModule,
    WorkspaceAddModule,
    DataBaseModule,
    DataBaseAddModule,
    ScheduleModule,
    ScheduleAddModule,
    QueryModule,
    ScriptModule,
    MonitorModule,
    ConfigurationModule,
    TranslationModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslationLoader,
        deps: [
          HttpClient
        ]
      }
     }),
    AppRoutingModule
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
