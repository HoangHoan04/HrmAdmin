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

export interface LeaveCalendarEvent {
  eventType: 'LEAVE' | 'HOLIDAY' | string;
  leaveId?: string | null;
  holidayId?: string | null;
  title: string;
  startDate: string;
  endDate: string;
  status?: string | null;
  session?: string | null;
  totalDays?: number | null;
  employeeId?: string | null;
  employeeName?: string | null;
  employeeCode?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  dayOffConfigName?: string | null;
  reason?: string | null;
}

export interface LeaveBalanceReport {
  id: string;
  dayOffConfigId?: string;
  dayOffConfigName?: string;
  employeeId?: string;
  employeeName?: string;
  employeeCode?: string;
  companyId?: string | null;
  branchId?: string | null;
  branchName?: string;
  departmentId?: string | null;
  departmentName?: string;
  year: number;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
  expiresOn: string;
  isExpiringSoon: boolean;
  note?: string | null;
}
