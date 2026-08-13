import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { SharedModule } from '../../../shared/shared.module';
import { AdvanceManagerComponent } from './advance-manager/advance-manager.component';
import { AllowanceManagerComponent } from './allowance-manager/allowance-manager.component';
import { PayrollAdjustmentManagerComponent } from './payroll-adjustment-manager/payroll-adjustment-manager.component';
import { AddOrUpdateSalaryConfigComponent } from './salary-config-manager/add-or-update-salary-config/add-or-update-salary-config.component';
import { SalaryConfigManagerComponent } from './salary-config-manager/salary-config-manager.component';
import { AddOrUpdateSalaryComponent } from './salary-manager/add-or-update-salary/add-or-update-salary.component';
import { SalaryDetailComponent } from './salary-manager/salary-detail/salary-detail.component';
import { SalaryManagerComponent } from './salary-manager/salary-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'payroll/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: getRelativePath(ROUTES_CONFIG.PAYROLL.children.PAYROLL_RUN_MANAGER.path),
    component: SalaryManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.PAYROLL.children.PAYROLL_RUN_MANAGER.children.ADD_SALARY.path,
    ),
    component: AddOrUpdateSalaryComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.PAYROLL.children.PAYROLL_RUN_MANAGER.children.EDIT_SALARY.path,
      ) + '/:id',
    component: AddOrUpdateSalaryComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.PAYROLL.children.PAYROLL_RUN_MANAGER.children.DETAIL_SALARY.path,
      ) + '/:id',
    component: SalaryDetailComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.PAYROLL.children.PAYROLL_ALLOWANCE.path),
    component: AllowanceManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.PAYROLL.children.PAYROLL_ADVANCE.path),
    component: AdvanceManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.PAYROLL.children.PAYROLL_ADJUSTMENT.path),
    component: PayrollAdjustmentManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.PAYROLL.children.PAYROLL_CONFIG.path),
    component: SalaryConfigManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.PAYROLL.children.PAYROLL_CONFIG.children.ADD_SALARY_CONFIG.path,
    ),
    component: AddOrUpdateSalaryConfigComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.PAYROLL.children.PAYROLL_CONFIG.children.EDIT_SALARY_CONFIG.path,
      ) + '/:id',
    component: AddOrUpdateSalaryConfigComponent,
  },
];

@NgModule({
  declarations: [
    SalaryManagerComponent,
    AddOrUpdateSalaryComponent,
    SalaryDetailComponent,
    AllowanceManagerComponent,
    AdvanceManagerComponent,
    PayrollAdjustmentManagerComponent,
    SalaryConfigManagerComponent,
    AddOrUpdateSalaryConfigComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class PayrollModule {}
