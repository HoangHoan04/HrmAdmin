import { BaseDto } from '../common.models';

export interface PerformanceReviewCycle extends BaseDto {
  code: string;
  name: string;
  companyId: string;
  companyName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  periodFrom: string;
  periodTo: string;
  status: string;
  note?: string | null;
}

export interface KpiGoal extends BaseDto {
  cycleId: string;
  cycleName?: string | null;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  title: string;
  targetValue: number;
  unit?: string | null;
  weight: number;
}

export interface KpiResult extends BaseDto {
  goalId: string;
  goalTitle?: string | null;
  actualValue: number;
  score: number;
  comment?: string | null;
  ratedByEmployeeId?: string | null;
  ratedByEmployeeName?: string | null;
  ratedAt?: string | null;
}

export interface CompetencyFramework extends BaseDto {
  code: string;
  name: string;
  companyId?: string | null;
  companyName?: string | null;
  description?: string | null;
  isActive: boolean;
}

export interface ScoreBand {
  band: string;
  count: number;
}

export interface DeptScore {
  departmentId?: string | null;
  departmentName?: string | null;
  avgScore: number;
  count: number;
}

export interface PerformanceDashboard {
  cycleId?: string | null;
  goalCount: number;
  resultCount: number;
  avgScore: number;
  metTargetPercent: number;
  scoreBands: ScoreBand[];
  deptScores: DeptScore[];
}

export interface Performance360Review extends BaseDto {
  cycleId: string;
  cycleName?: string | null;
  subjectEmployeeId: string;
  subjectEmployeeCode?: string | null;
  subjectEmployeeName?: string | null;
  reviewerEmployeeId: string;
  reviewerEmployeeCode?: string | null;
  reviewerEmployeeName?: string | null;
  reviewerType: string;
  score: number;
  comment?: string | null;
  status: string;
}
