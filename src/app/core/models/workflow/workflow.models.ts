import { BaseDto } from '../common.models';

export interface WorkflowStep {
  id?: string;
  stepOrder: number;
  name: string;
  approverResolver: string;
  requiredRoleCode?: string | null;
  isFinal: boolean;
}

export interface WorkflowDefinition extends BaseDto {
  code: string;
  name: string;
  entityType: string;
  isActive: boolean;
  companyId?: string | null;
  steps: WorkflowStep[];
}

export interface WorkflowStepInput {
  stepOrder: number;
  name: string;
  approverResolver: string;
  requiredRoleCode?: string | null;
  isFinal: boolean;
}

export interface WorkflowInboxItem {
  taskId: string;
  instanceId: string;
  entityType: string;
  entityId: string;
  stepOrder: number;
  stepName: string;
  approverResolver: string;
  instanceStatus: string;
  startedAt: string;
  assigneeEmployeeId?: string | null;
}

export interface WorkflowStatusCount {
  status: string;
  count: number;
}

export interface WorkflowEntityTypeCount {
  entityType: string;
  count: number;
}

export interface WorkflowDashboardSummary {
  byStatus: WorkflowStatusCount[];
  byEntityType: WorkflowEntityTypeCount[];
  pendingTaskCount: number;
}

export interface WorkflowFormTemplate extends BaseDto {
  entityType: string;
  name: string;
  schemaJson: string;
}
