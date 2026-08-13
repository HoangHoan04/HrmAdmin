import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { SharedModule } from '../../../shared/shared.module';
import { AddOrUpdateViolationTypeComponent } from './violation-type-manager/add-or-update-violation-type/add-or-update-violation-type.component';
import { ViolationTypeManagerComponent } from './violation-type-manager/violation-type-manager.component';
import { AddOrUpdateViolationComponent } from './violation-manager/add-or-update-violation/add-or-update-violation.component';
import { ViolationManagerComponent } from './violation-manager/violation-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'discipline/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: getRelativePath(ROUTES_CONFIG.TALENT.children.DISCIPLINE.children.VIOLATION_TYPE.path),
    component: ViolationTypeManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.DISCIPLINE.children.VIOLATION_TYPE.children.ADD_VIOLATION_TYPE
        .path,
    ),
    component: AddOrUpdateViolationTypeComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.DISCIPLINE.children.VIOLATION_TYPE.children.EDIT_VIOLATION_TYPE
          .path,
      ) + '/:id',
    component: AddOrUpdateViolationTypeComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.TALENT.children.DISCIPLINE.children.VIOLATION.path),
    component: ViolationManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.DISCIPLINE.children.VIOLATION.children.ADD_VIOLATION.path,
    ),
    component: AddOrUpdateViolationComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.DISCIPLINE.children.VIOLATION.children.EDIT_VIOLATION.path,
      ) + '/:id',
    component: AddOrUpdateViolationComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.DISCIPLINE.children.VIOLATION.children.DETAIL_VIOLATION.path,
      ) + '/:id',
    component: AddOrUpdateViolationComponent,
  },
];

@NgModule({
  declarations: [
    ViolationTypeManagerComponent,
    AddOrUpdateViolationTypeComponent,
    ViolationManagerComponent,
    AddOrUpdateViolationComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class DisciplineModule {}
