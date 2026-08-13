import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { SharedModule } from '../../../shared/shared.module';
import { AddOrUpdateBranchComponent } from './branch-manager/add-or-update-branch/add-or-update-branch.component';
import { BranchDetailComponent } from './branch-manager/branch-detail/branch-detail.component';
import { BranchManagerComponent } from './branch-manager/branch-manager.component';
import { AddOrUpdateCompanyComponent } from './company-manager/add-or-update-company/add-or-update-company.component';
import { CompanyDetailComponent } from './company-manager/company-detail/company-detail.component';
import { CompanyManagerComponent } from './company-manager/company-manager.component';
import { AddOrUpdateDepartmentComponent } from './department-manager/add-or-update-department/add-or-update-department.component';
import { DepartmentDetailComponent } from './department-manager/department-detail/department-detail.component';
import { DepartmentManagerComponent } from './department-manager/department-manager.component';
import { OrgChartComponent } from './org-chart/org-chart.component';
import { PartManagerComponent } from './part-manager/part-manager.component';
import { AddOrUpdatePartMasterComponent } from './part-manager/part-master/add-or-update-part-master/add-or-update-part-master.component';
import { PartMasterDetailComponent } from './part-manager/part-master/part-master-detail/part-master-detail.component';
import { AddOrUpdatePartComponent } from './part-manager/part/add-or-update-part/add-or-update-part.component';
import { PartDetailComponent } from './part-manager/part/part-detail/part-detail.component';
import { PositionManagerComponent } from './position-manager/position-manager.component';
import { AddOrUpdatePositionMasterComponent } from './position-manager/position-master/add-or-update-position-master/add-or-update-position-master.component';
import { PositionMasterDetailComponent } from './position-manager/position-master/position-master-detail/position-master-detail.component';
import { AddOrUpdatePositionComponent } from './position-manager/position/add-or-update-position/add-or-update-position.component';
import { PositionDetailComponent } from './position-manager/position/position-detail/position-detail.component';

import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'organization/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: getRelativePath(ROUTES_CONFIG.ORGANIZATION.children.ORG_CHART.path),
    component: OrgChartComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.ORGANIZATION.children.COMPANY_MANAGER.path),
    component: CompanyManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.ORGANIZATION.children.COMPANY_MANAGER.children.ADD_COMPANY.path,
    ),
    component: AddOrUpdateCompanyComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ORGANIZATION.children.COMPANY_MANAGER.children.EDIT_COMPANY.path,
      ) + '/:id',
    component: AddOrUpdateCompanyComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ORGANIZATION.children.COMPANY_MANAGER.children.DETAIL_COMPANY.path,
      ) + '/:id',
    component: CompanyDetailComponent,
  },

  {
    path: getRelativePath(ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.path),
    component: BranchManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.children.ADD_BRANCH.path,
    ),
    component: AddOrUpdateBranchComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.children.EDIT_BRANCH.path,
      ) + '/:id',
    component: AddOrUpdateBranchComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.children.DETAIL_BRANCH.path,
      ) + '/:id',
    component: BranchDetailComponent,
  },

  {
    path: getRelativePath(ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.path),
    component: DepartmentManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.children.ADD_DEPARTMENT.path,
    ),
    component: AddOrUpdateDepartmentComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.children.EDIT_DEPARTMENT.path,
      ) + '/:id',
    component: AddOrUpdateDepartmentComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.children.DETAIL_DEPARTMENT.path,
      ) + '/:id',
    component: DepartmentDetailComponent,
  },

  {
    path: getRelativePath(ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.path),
    component: PartManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.ADD_PART.path),
    component: AddOrUpdatePartComponent,
  },
  {
    path:
      getRelativePath(ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.EDIT_PART.path) +
      '/:id',
    component: AddOrUpdatePartComponent,
  },
  {
    path:
      getRelativePath(ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.DETAIL_PART.path) +
      '/:id',
    component: PartDetailComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.ADD_PART_MASTER.path,
    ),
    component: AddOrUpdatePartMasterComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.EDIT_PART_MASTER.path,
      ) + '/:id',
    component: AddOrUpdatePartMasterComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.DETAIL_PART_MASTER.path,
      ) + '/:id',
    component: PartMasterDetailComponent,
  },

  {
    path: getRelativePath(ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.path),
    component: PositionManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.ADD_POSITION.path,
    ),
    component: AddOrUpdatePositionComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.EDIT_POSITION.path,
      ) + '/:id',
    component: AddOrUpdatePositionComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.DETAIL_POSITION.path,
      ) + '/:id',
    component: PositionDetailComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.ADD_POSITION_MASTER.path,
    ),
    component: AddOrUpdatePositionMasterComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.EDIT_POSITION_MASTER.path,
      ) + '/:id',
    component: AddOrUpdatePositionMasterComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.DETAIL_POSITION_MASTER.path,
      ) + '/:id',
    component: PositionMasterDetailComponent,
  },
];

@NgModule({
  declarations: [
    OrgChartComponent,
    CompanyManagerComponent,
    AddOrUpdateCompanyComponent,
    CompanyDetailComponent,
    BranchManagerComponent,
    AddOrUpdateBranchComponent,
    BranchDetailComponent,
    DepartmentManagerComponent,
    AddOrUpdateDepartmentComponent,
    DepartmentDetailComponent,
    AddOrUpdatePartComponent,
    PartDetailComponent,
    AddOrUpdatePartMasterComponent,
    PartMasterDetailComponent,
    AddOrUpdatePositionComponent,
    PositionDetailComponent,
    AddOrUpdatePositionMasterComponent,
    PositionMasterDetailComponent,
  ],
  imports: [
    SharedModule,
    NzTabsModule,
    PartManagerComponent,
    PositionManagerComponent,
    RouterModule.forChild(routes),
  ],
})
export class OrganizationModule {}
