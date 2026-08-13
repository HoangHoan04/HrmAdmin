import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { SharedModule } from '../../../shared/shared.module';
import { ContractExpiryComponent } from './contract-expiry/contract-expiry.component';
import { AddOrUpdateReportScheduleComponent } from './report-schedule-manager/add-or-update-report-schedule/add-or-update-report-schedule.component';
import { ReportScheduleManagerComponent } from './report-schedule-manager/report-schedule-manager.component';
import { ReportsHubComponent } from './reports-hub/reports-hub.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'reports/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean === 'reports' ? '' : clean;
};

const routes: Routes = [
  { path: '', component: ReportsHubComponent },
  {
    path: getRelativePath(ROUTES_CONFIG.REPORTS.children.CONTRACT_EXPIRY.path),
    component: ContractExpiryComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.REPORTS.children.SCHEDULES.path),
    component: ReportScheduleManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.REPORTS.children.SCHEDULES.children.ADD_REPORT_SCHEDULE.path,
    ),
    component: AddOrUpdateReportScheduleComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.REPORTS.children.SCHEDULES.children.EDIT_REPORT_SCHEDULE.path,
      ) + '/:id',
    component: AddOrUpdateReportScheduleComponent,
  },
];

@NgModule({
  declarations: [
    ReportsHubComponent,
    ContractExpiryComponent,
    ReportScheduleManagerComponent,
    AddOrUpdateReportScheduleComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ReportsModule {}
