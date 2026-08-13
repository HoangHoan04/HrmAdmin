import { BaseDto } from '../common.models';

export interface HeadcountNode {
  nodeType: string;
  id: string;
  parentId?: string | null;
  code: string;
  name: string;
  plannedLimit?: number | null;
  actualCount: number;
  vacancy?: number | null;
  level: number;
  depth: number;
  isEditable?: boolean;
  isAggregated?: boolean;
  childBranchCount?: number;
}

export interface JobDescription extends BaseDto {
  code: string;
  title: string;
  responsibilities?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  companyId: string;
  companyName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  partId?: string | null;
  partName?: string | null;
  positionId?: string | null;
  positionName?: string | null;
  positionMasterId?: string | null;
  positionMasterName?: string | null;
  isActive: boolean;
}

export interface EvaluationCriteria extends BaseDto {
  code: string;
  name: string;
  description?: string | null;
  category?: string | null;
  defaultWeight: number;
  maxScore: number;
  companyId?: string | null;
  companyName?: string | null;
  isActive: boolean;
}

export interface HiringSource extends BaseDto {
  code: string;
  name: string;
  description?: string | null;
  channelType: string;
  contactEmail?: string | null;
  displayOrder: number;
  isSystem: boolean;
  isActive: boolean;
}

export interface RecruitmentRequest extends BaseDto {
  code: string;
  title: string;
  requestLevel: string;
  companyId: string;
  companyName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  partId?: string | null;
  partName?: string | null;
  positionId?: string | null;
  positionName?: string | null;
  jobDescriptionId?: string | null;
  jobDescriptionTitle?: string | null;
  quantity: number;
  reason?: string | null;
  expectedStartDate?: string | null;
  status: string;
  requestedByEmployeeId?: string | null;
  requestedByEmployeeName?: string | null;
  approvedByEmployeeId?: string | null;
  approvedByEmployeeName?: string | null;
  approvedAt?: string | null;
  approvalNote?: string | null;
}

export interface PlanCriteria extends BaseDto {
  hiringPlanId: string;
  evaluationCriteriaId: string;
  evaluationCriteriaCode?: string | null;
  evaluationCriteriaName?: string | null;
  weight: number;
  maxScore: number;
  displayOrder: number;
}

export interface HiringPlan extends BaseDto {
  code: string;
  name: string;
  recruitmentRequestId?: string | null;
  recruitmentRequestCode?: string | null;
  jobDescriptionId: string;
  jobDescriptionTitle?: string | null;
  companyId: string;
  companyName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  partId?: string | null;
  partName?: string | null;
  positionId?: string | null;
  positionName?: string | null;
  targetQuantity: number;
  openFrom?: string | null;
  openTo?: string | null;
  status: string;
  note?: string | null;
  criteria: PlanCriteria[];
}

export interface Candidate extends BaseDto {
  code: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  cvUrl?: string | null;
  hiringPlanId?: string | null;
  hiringPlanName?: string | null;
  recruitmentRequestId?: string | null;
  recruitmentRequestCode?: string | null;
  hiringSourceId?: string | null;
  hiringSourceName?: string | null;
  employeeId?: string | null;
  employeeName?: string | null;
  status: string;
  appliedAt: string;
  notes?: string | null;
}

export interface CandidateStatusSummary {
  status: string;
  count: number;
}

export interface CandidateHirePrefill {
  candidateId: string;
  candidateCode: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  cvUrl?: string | null;
  employeeId?: string | null;
  status: string;
  hiringPlanId?: string | null;
  hiringPlanName?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  partId?: string | null;
  positionId?: string | null;
  suggestedEmployeeCode: string;
}

export interface Interviewer extends BaseDto {
  interviewScheduleId: string;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  isPrimary: boolean;
}

export interface Evaluation extends BaseDto {
  interviewScheduleId: string;
  interviewerEmployeeId: string;
  interviewerEmployeeName?: string | null;
  evaluationCriteriaId: string;
  evaluationCriteriaCode?: string | null;
  evaluationCriteriaName?: string | null;
  score: number;
  comment?: string | null;
}

export interface InterviewSchedule extends BaseDto {
  candidateId: string;
  candidateCode?: string | null;
  candidateName?: string | null;
  hiringPlanId?: string | null;
  hiringPlanName?: string | null;
  round: number;
  startAt: string;
  endAt: string;
  location?: string | null;
  meetingUrl?: string | null;
  status: string;
  notes?: string | null;
  interviewers: Interviewer[];
  evaluations: Evaluation[];
}
