import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { AccessControlManagerComponent } from './access-control-manager/access-control-manager.component';
import { RoleAccessPanelComponent } from './access-control-manager/role-access-panel/role-access-panel.component';
import { UserAccessPanelComponent } from './access-control-manager/user-access-panel/user-access-panel.component';
import { AccountManagerComponent } from './account-manager/account-manager.component';
import { RoleListManagerComponent } from './role-list-manager/role-list-manager.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'access' },
  { path: 'accounts', component: AccountManagerComponent },
  { path: 'roles', component: RoleListManagerComponent },
  { path: 'access', component: AccessControlManagerComponent },
  { path: 'role', redirectTo: 'roles', pathMatch: 'full' },
  { path: 'user', redirectTo: 'accounts', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AccessControlManagerComponent,
    AccountManagerComponent,
    RoleListManagerComponent,
    RoleAccessPanelComponent,
    UserAccessPanelComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class RoleManagerModule {}
