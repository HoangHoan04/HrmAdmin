import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { AddOrUpdateEmployeeComponent } from './employee-manager/add-or-update-employee/add-or-update-employee.component';
import { EmployeeDetailComponent } from './employee-manager/employee-detail/employee-detail.component';
import { EmployeeManagerComponent } from './employee-manager/employee-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'human-resource/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: getRelativePath(ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.path),
    component: EmployeeManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.ADD_EMPLOYEE.path,
    ),
    component: AddOrUpdateEmployeeComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.EDIT_EMPLOYEE.path,
      ) + '/:id',
    component: AddOrUpdateEmployeeComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.DETAIL_EMPLOYEE.path,
      ) + '/:id',
    component: EmployeeDetailComponent,
  },
];

@NgModule({
  declarations: [
    EmployeeManagerComponent,
    AddOrUpdateEmployeeComponent,
    EmployeeDetailComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class HumanResourceModule {}
