import { BaseDto } from '../common.models';

export interface OvertimeRequest extends BaseDto {
  code: string;
  employeeId: string;
  employeeCode?: string;
  employeeName?: string;
  companyId?: string | null;
  branchId?: string | null;
  branchName?: string;
  workDate: string;
  fromTime: string;
  toTime: string;
  requestedMinutes: number;
  approvedMinutes?: number | null;
  otType: string;
  reason: string;
  attachmentUrl?: string | null;
  status: string;
  approverId?: string | null;
  approverName?: string;
  reviewedAt?: string | null;
  approverNote?: string | null;
}
