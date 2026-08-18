import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { echarts } from '../../../shared/echarts';
import { SharedModule } from '../../../shared/shared.module';
import { AddOrUpdateCandidateComponent } from './candidate-manager/add-or-update-candidate/add-or-update-candidate.component';
import { CandidateManagerComponent } from './candidate-manager/candidate-manager.component';
import { CandidateStatusComponent } from './candidate-status/candidate-status.component';
import { AddOrUpdateEvaluationCriteriaComponent } from './evaluation-criteria-manager/add-or-update-evaluation-criteria/add-or-update-evaluation-criteria.component';
import { EvaluationCriteriaManagerComponent } from './evaluation-criteria-manager/evaluation-criteria-manager.component';
import { HeadcountManagerComponent } from './headcount-manager/headcount-manager.component';
import { AddOrUpdateHiringPlanComponent } from './hiring-plan-manager/add-or-update-hiring-plan/add-or-update-hiring-plan.component';
import { HiringPlanManagerComponent } from './hiring-plan-manager/hiring-plan-manager.component';
import { AddOrUpdateHiringSourceComponent } from './hiring-source-manager/add-or-update-hiring-source/add-or-update-hiring-source.component';
import { HiringSourceManagerComponent } from './hiring-source-manager/hiring-source-manager.component';
import { InterviewCalendarComponent } from './interview-calendar/interview-calendar.component';
import { AddOrUpdateJobDescriptionComponent } from './job-description-manager/add-or-update-job-description/add-or-update-job-description.component';
import { JobDescriptionManagerComponent } from './job-description-manager/job-description-manager.component';
import { PipelineManagerComponent } from './pipeline-manager/pipeline-manager.component';
import { AddOrUpdateRequestComponent } from './request-manager/add-or-update-request/add-or-update-request.component';
import { RequestManagerComponent } from './request-manager/request-manager.component';
import { WaitlistManagerComponent } from './waitlist-manager/waitlist-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'recruitment/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: getRelativePath(ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.HEADCOUNT.path),
  },
  {
    path: 'setup',
    pathMatch: 'full',
    redirectTo: getRelativePath(ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.HEADCOUNT.path),
  },
  {
    path: getRelativePath(ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.HEADCOUNT.path),
    component: HeadcountManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.JOB_DESCRIPTION.path),
    component: JobDescriptionManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.JOB_DESCRIPTION.children.ADD_JOB_DESCRIPTION
        .path,
    ),
    component: AddOrUpdateJobDescriptionComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.JOB_DESCRIPTION.children
          .EDIT_JOB_DESCRIPTION.path,
      ) + '/:id',
    component: AddOrUpdateJobDescriptionComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.JOB_DESCRIPTION.children
          .DETAIL_JOB_DESCRIPTION.path,
      ) + '/:id',
    component: AddOrUpdateJobDescriptionComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.EVALUATION_CRITERIA.path,
    ),
    component: EvaluationCriteriaManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.EVALUATION_CRITERIA.children
        .ADD_EVALUATION_CRITERIA.path,
    ),
    component: AddOrUpdateEvaluationCriteriaComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.EVALUATION_CRITERIA.children
          .EDIT_EVALUATION_CRITERIA.path,
      ) + '/:id',
    component: AddOrUpdateEvaluationCriteriaComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.HIRING_SOURCE.path),
    component: HiringSourceManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.HIRING_SOURCE.children.ADD_HIRING_SOURCE
        .path,
    ),
    component: AddOrUpdateHiringSourceComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.HIRING_SOURCE.children.EDIT_HIRING_SOURCE
          .path,
      ) + '/:id',
    component: AddOrUpdateHiringSourceComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.REQUEST.path),
    component: RequestManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.REQUEST.children.ADD_REQUEST.path,
    ),
    component: AddOrUpdateRequestComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.REQUEST.children.EDIT_REQUEST.path,
      ) + '/:id',
    component: AddOrUpdateRequestComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.REQUEST.children.DETAIL_REQUEST.path,
      ) + '/:id',
    component: AddOrUpdateRequestComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.HIRING_PLAN.path),
    component: HiringPlanManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.HIRING_PLAN.children.ADD_HIRING_PLAN
        .path,
    ),
    component: AddOrUpdateHiringPlanComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.HIRING_PLAN.children.EDIT_HIRING_PLAN
          .path,
      ) + '/:id',
    component: AddOrUpdateHiringPlanComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.PIPELINE.path),
    component: PipelineManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.WAITLIST.path),
    component: WaitlistManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_STATUS.path,
    ),
    component: CandidateStatusComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_LIST.path,
    ),
    component: CandidateManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_LIST.children.ADD_CANDIDATE
        .path,
    ),
    component: AddOrUpdateCandidateComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_LIST.children
          .EDIT_CANDIDATE.path,
      ) + '/:id',
    component: AddOrUpdateCandidateComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_LIST.children
          .DETAIL_CANDIDATE.path,
      ) + '/:id',
    component: AddOrUpdateCandidateComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.INTERVIEW_CALENDAR.path,
    ),
    component: InterviewCalendarComponent,
  },
];

@NgModule({
  declarations: [
    HeadcountManagerComponent,
    JobDescriptionManagerComponent,
    AddOrUpdateJobDescriptionComponent,
    EvaluationCriteriaManagerComponent,
    AddOrUpdateEvaluationCriteriaComponent,
    HiringSourceManagerComponent,
    AddOrUpdateHiringSourceComponent,
    RequestManagerComponent,
    AddOrUpdateRequestComponent,
    HiringPlanManagerComponent,
    AddOrUpdateHiringPlanComponent,
    PipelineManagerComponent,
    WaitlistManagerComponent,
    CandidateStatusComponent,
    CandidateManagerComponent,
    AddOrUpdateCandidateComponent,
    InterviewCalendarComponent,
  ],
  imports: [SharedModule, FullCalendarModule, NgxEchartsDirective, RouterModule.forChild(routes)],
  providers: [provideEchartsCore({ echarts })],
})
export class RecruitmentModule {}
