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
  session?: string;
  totalDays: number;
  reason?: string;
  attachmentUrl?: string | null;
  status: string;
  requestedApproverId?: string | null;
  requestedApproverName?: string;
  approverId?: string | null;
  approverName?: string;
  approvedAt?: string | null;
  approverNote?: string;
  cancelReason?: string | null;
}

export interface PreviewLeaveDays {
  totalDays: number;
  saturdayPolicy?: string;
  session?: string;
  fromDate?: string;
  toDate?: string;
}

export interface DayOffAllocation {
  id: string;
  dayOffConfigId: string;
  dayOffConfigName?: string;
  dayOffType?: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  year: number;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
  note?: string | null;
}
