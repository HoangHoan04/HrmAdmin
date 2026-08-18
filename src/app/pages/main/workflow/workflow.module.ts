import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { SharedModule } from '../../../shared/shared.module';
import { echarts } from '../../../shared/echarts';
import { AddOrUpdateWorkflowDefinitionComponent } from './definition-manager/add-or-update-workflow-definition/add-or-update-workflow-definition.component';
import { WorkflowDefinitionManagerComponent } from './definition-manager/workflow-definition-manager.component';
import { WorkflowDashboardComponent } from './dashboard/workflow-dashboard.component';
import { WorkflowInboxComponent } from './inbox/workflow-inbox.component';
import { AddOrUpdateWorkflowFormTemplateComponent } from './form-template-manager/add-or-update-workflow-form-template/add-or-update-workflow-form-template.component';
import { WorkflowFormTemplateManagerComponent } from './form-template-manager/workflow-form-template-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'workflow/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: getRelativePath(ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_DASHBOARD.path),
  },
  {
    path: getRelativePath(ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_DASHBOARD.path),
    component: WorkflowDashboardComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_INBOX.path),
    component: WorkflowInboxComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_DEFINITIONS.path),
    component: WorkflowDefinitionManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_DEFINITIONS.children.ADD_WORKFLOW_DEFINITION.path,
    ),
    component: AddOrUpdateWorkflowDefinitionComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_DEFINITIONS.children.EDIT_WORKFLOW_DEFINITION.path,
      ) + '/:id',
    component: AddOrUpdateWorkflowDefinitionComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_FORM_TEMPLATES.path),
    component: WorkflowFormTemplateManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_FORM_TEMPLATES.children.ADD_WORKFLOW_FORM_TEMPLATE
        .path,
    ),
    component: AddOrUpdateWorkflowFormTemplateComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_FORM_TEMPLATES.children.EDIT_WORKFLOW_FORM_TEMPLATE
          .path,
      ) + '/:id',
    component: AddOrUpdateWorkflowFormTemplateComponent,
  },
];

@NgModule({
  declarations: [
    WorkflowDashboardComponent,
    WorkflowInboxComponent,
    WorkflowDefinitionManagerComponent,
    AddOrUpdateWorkflowDefinitionComponent,
    WorkflowFormTemplateManagerComponent,
    AddOrUpdateWorkflowFormTemplateComponent,
  ],
  imports: [SharedModule, NgxEchartsDirective, RouterModule.forChild(routes)],
  providers: [provideEchartsCore({ echarts })],
})
export class WorkflowModule {}
