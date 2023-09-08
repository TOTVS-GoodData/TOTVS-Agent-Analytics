/* Componentes padrões do Angular */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/* Módulos da página Workspace */
import { WorkspaceComponent } from './workspace/workspace.component';
import { WorkspaceAddComponent } from './workspace-add/workspace-add.component';

/* Módulos da página Database */
import { DataBaseComponent } from './database/database.component';
import { DataBaseAddComponent } from './database-add/database-add.component';

/* Módulos da página Schedule */
import { ScheduleComponent } from './schedule/schedule.component';
import { ScheduleAddComponent } from './schedule-add/schedule-add.component';

/* Módulos da página Query */
import { QueryComponent } from './query/query.component';

/* Módulos da página Script */
import { ScriptComponent } from './script/script.component';

/* Módulos da página Monitor */
import { MonitorComponent } from './monitor/monitor.component';

/* Módulos da página Configuration */
import { ConfigurationComponent } from './configuration/configuration.component';

/* Rotas de redirecionamento disponíveis no Agent */
const routes: Routes = [
  { path: 'workspace', component: WorkspaceComponent },
  { path: 'workspace-add', component: WorkspaceAddComponent },
  { path: 'database', component: DataBaseComponent },
  { path: 'database-add', component: DataBaseAddComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'schedule-add', component: ScheduleAddComponent },
  { path: 'query', component: QueryComponent },
  { path: 'script', component: ScriptComponent },
  { path: 'monitor', component: MonitorComponent },
  { path: 'configuration', component: ConfigurationComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}