import { BaseDto } from '../common.models';

export interface RegisterDayOff extends BaseDto {
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  companyId?: string | null;
  branchId?: string | null;
  branchName?: string;
  dayOffConfigId?: string | null;
  dayOffConfigName?: string;
  dayOffType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason?: string;
  status: string;
  approverId?: string | null;
  approverName?: string;
  approvedAt?: string | null;
  approverNote?: string;
}
