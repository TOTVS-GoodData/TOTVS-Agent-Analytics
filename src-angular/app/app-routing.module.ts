import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WorkspaceComponent } from './workspace/workspace.component';
import { WorkspaceAddComponent } from './workspace-add/workspace-add.component';
import { DataBaseComponent } from './database/database.component';
import { DataBaseAddComponent } from './database-add/database-add.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { ScheduleAddComponent } from './schedule-add/schedule-add.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { MonitorComponent } from './monitor/monitor.component';
import { QueryComponent } from './query/query.component';
import { ScriptComponent } from './script/script.component';

const routes: Routes = [
  { path: 'workspace', component: WorkspaceComponent },
  { path: 'workspace-add', component: WorkspaceAddComponent },
  { path: 'database', component: DataBaseComponent },
  { path: 'database-add', component: DataBaseAddComponent },
  { path: 'database-add/:id', component: DataBaseAddComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'schedule-add', component: ScheduleAddComponent },
  { path: 'schedule-add/:id', component: ScheduleAddComponent },
  { path: 'configuration', component: ConfigurationComponent },
  { path: 'monitor', component: MonitorComponent },
  { path: 'query', component: QueryComponent },
  { path: 'script', component: ScriptComponent }
//  { path: '', redirectTo: 'project', pathMatch: 'full'}
//  { path: '**', redirectTo: 'project', pathMatch: 'full' }
];

@NgModule({
  imports: [ RouterModule.forRoot( routes, { useHash: true } ) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
