import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { SharedModule } from '../../../shared/shared.module';
import { AddOrUpdateContractTypeComponent } from './contract-manager/contract-type-manager/add-or-update-contract-type/add-or-update-contract-type.component';
import { ContractTypeManagerComponent } from './contract-manager/contract-type-manager/contract-type-manager.component';
import { AddOrUpdateContractComponent } from './contract-manager/contract/add-or-update-contract/add-or-update-contract.component';
import { ContractDetailComponent } from './contract-manager/contract/contract-detail/contract-detail.component';
import { ContractManagerComponent } from './contract-manager/contract/contract-manager.component';
import { AddOrUpdateReviewRenewalComponent } from './contract-manager/review-renewal-manager/add-or-update-review-renewal/add-or-update-review-renewal.component';
import { ReviewRenewalManagerComponent } from './contract-manager/review-renewal-manager/review-renewal-manager.component';
import { AddOrUpdateEmployeeComponent } from './employee-manager/add-or-update-employee/add-or-update-employee.component';
import { EmployeeDetailComponent } from './employee-manager/employee-detail/employee-detail.component';
import { EmployeeManagerComponent } from './employee-manager/employee-manager.component';
import { AddOrUpdateTransferComponent } from './transfer-manager/add-or-update-transfer/add-or-update-transfer.component';
import { TransferDetailComponent } from './transfer-manager/transfer-detail/transfer-detail.component';
import { TransferManagerComponent } from './transfer-manager/transfer-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'human-resource/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: getRelativePath(ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.path),
  },
  {
    path: 'contract-manager',
    pathMatch: 'full',
    redirectTo: getRelativePath(
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_LIST.path,
    ),
  },
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
  {
    path: getRelativePath(
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_TYPE.path,
    ),
    component: ContractTypeManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_TYPE.children
        .ADD_CONTRACT_TYPE.path,
    ),
    component: AddOrUpdateContractTypeComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_TYPE.children
          .EDIT_CONTRACT_TYPE.path,
      ) + '/:id',
    component: AddOrUpdateContractTypeComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_LIST.path,
    ),
    component: ContractManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_LIST.children
        .ADD_CONTRACT.path,
    ),
    component: AddOrUpdateContractComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_LIST.children
          .EDIT_CONTRACT.path,
      ) + '/:id',
    component: AddOrUpdateContractComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_LIST.children
          .DETAIL_CONTRACT.path,
      ) + '/:id',
    component: ContractDetailComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.REVIEW_RENEWAL.path,
    ),
    component: ReviewRenewalManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.REVIEW_RENEWAL.children
        .ADD_REVIEW_RENEWAL.path,
    ),
    component: AddOrUpdateReviewRenewalComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.REVIEW_RENEWAL.children
          .EDIT_REVIEW_RENEWAL.path,
      ) + '/:id',
    component: AddOrUpdateReviewRenewalComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.HUMAN_RESOURCE.children.TRANSFER_MANAGER.path),
    component: TransferManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.HUMAN_RESOURCE.children.TRANSFER_MANAGER.children.ADD_TRANSFER.path,
    ),
    component: AddOrUpdateTransferComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.HUMAN_RESOURCE.children.TRANSFER_MANAGER.children.EDIT_TRANSFER.path,
      ) + '/:id',
    component: AddOrUpdateTransferComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.HUMAN_RESOURCE.children.TRANSFER_MANAGER.children.DETAIL_TRANSFER.path,
      ) + '/:id',
    component: TransferDetailComponent,
  },
];

@NgModule({
  declarations: [
    EmployeeManagerComponent,
    AddOrUpdateEmployeeComponent,
    EmployeeDetailComponent,
    ContractTypeManagerComponent,
    AddOrUpdateContractTypeComponent,
    ContractManagerComponent,
    AddOrUpdateContractComponent,
    ContractDetailComponent,
    ReviewRenewalManagerComponent,
    AddOrUpdateReviewRenewalComponent,
    TransferManagerComponent,
    AddOrUpdateTransferComponent,
    TransferDetailComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class HumanResourceModule {}
