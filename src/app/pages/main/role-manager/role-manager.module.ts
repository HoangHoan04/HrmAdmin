import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { AccessControlManagerComponent } from './access-control-manager/access-control-manager.component';
import { RoleAccessPanelComponent } from './access-control-manager/role-access-panel/role-access-panel.component';
import { UserAccessPanelComponent } from './access-control-manager/user-access-panel/user-access-panel.component';
import { RoleListManagerComponent } from './role-list-manager/role-list-manager.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'roles' },
  { path: 'roles', component: RoleListManagerComponent },
  { path: 'access', component: AccessControlManagerComponent },
  { path: 'role', redirectTo: 'roles', pathMatch: 'full' },
  { path: 'user', redirectTo: 'access', pathMatch: 'full' },
  { path: 'accounts', redirectTo: 'roles', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AccessControlManagerComponent,
    RoleListManagerComponent,
    RoleAccessPanelComponent,
    UserAccessPanelComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class RoleManagerModule {}
