import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { SharedModule } from '../../../shared/shared.module';
import { echarts } from '../../../shared/echarts';
import { AddOrUpdateCompetencyComponent } from './competency-manager/add-or-update-competency/add-or-update-competency.component';
import { CompetencyManagerComponent } from './competency-manager/competency-manager.component';
import { PerformanceDashboardComponent } from './dashboard/performance-dashboard.component';
import { AddOrUpdateKpiGoalComponent } from './kpi-goal-manager/add-or-update-kpi-goal/add-or-update-kpi-goal.component';
import { KpiGoalManagerComponent } from './kpi-goal-manager/kpi-goal-manager.component';
import { AddOrUpdateKpiResultComponent } from './kpi-result-manager/add-or-update-kpi-result/add-or-update-kpi-result.component';
import { KpiResultManagerComponent } from './kpi-result-manager/kpi-result-manager.component';
import { AddOrUpdateReview360Component } from './review-360-manager/add-or-update-review-360/add-or-update-review-360.component';
import { Review360ManagerComponent } from './review-360-manager/review-360-manager.component';
import { AddOrUpdateReviewCycleComponent } from './review-cycle-manager/add-or-update-review-cycle/add-or-update-review-cycle.component';
import { ReviewCycleManagerComponent } from './review-cycle-manager/review-cycle-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'performance/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.PERFORMANCE_DASHBOARD.path,
    ),
    component: PerformanceDashboardComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.COMPETENCY.path),
    component: CompetencyManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.COMPETENCY.children.ADD_COMPETENCY.path,
    ),
    component: AddOrUpdateCompetencyComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.COMPETENCY.children.EDIT_COMPETENCY.path,
      ) + '/:id',
    component: AddOrUpdateCompetencyComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.REVIEW_CYCLE.path),
    component: ReviewCycleManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.REVIEW_CYCLE.children.ADD_REVIEW_CYCLE
        .path,
    ),
    component: AddOrUpdateReviewCycleComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.REVIEW_CYCLE.children.EDIT_REVIEW_CYCLE
          .path,
      ) + '/:id',
    component: AddOrUpdateReviewCycleComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.KPI_GOAL.path),
    component: KpiGoalManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.KPI_GOAL.children.ADD_KPI_GOAL.path,
    ),
    component: AddOrUpdateKpiGoalComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.KPI_GOAL.children.EDIT_KPI_GOAL.path,
      ) + '/:id',
    component: AddOrUpdateKpiGoalComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.KPI_RESULT.path),
    component: KpiResultManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.KPI_RESULT.children.ADD_KPI_RESULT.path,
    ),
    component: AddOrUpdateKpiResultComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.KPI_RESULT.children.EDIT_KPI_RESULT
          .path,
      ) + '/:id',
    component: AddOrUpdateKpiResultComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.PERFORMANCE_360.path),
    component: Review360ManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.PERFORMANCE_360.children
        .ADD_PERFORMANCE_360.path,
    ),
    component: AddOrUpdateReview360Component,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.PERFORMANCE_360.children
          .EDIT_PERFORMANCE_360.path,
      ) + '/:id',
    component: AddOrUpdateReview360Component,
  },
];

@NgModule({
  declarations: [
    PerformanceDashboardComponent,
    CompetencyManagerComponent,
    AddOrUpdateCompetencyComponent,
    ReviewCycleManagerComponent,
    AddOrUpdateReviewCycleComponent,
    KpiGoalManagerComponent,
    AddOrUpdateKpiGoalComponent,
    KpiResultManagerComponent,
    AddOrUpdateKpiResultComponent,
    Review360ManagerComponent,
    AddOrUpdateReview360Component,
  ],
  imports: [SharedModule, NgxEchartsDirective, RouterModule.forChild(routes)],
  providers: [provideEchartsCore({ echarts })],
})
export class PerformanceModule {}
