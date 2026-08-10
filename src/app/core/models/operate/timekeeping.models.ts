import { BaseDto } from '../common.models';

export interface Timekeeping extends BaseDto {
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  companyId?: string | null;
  branchId?: string | null;
  branchName?: string;
  workDate: string;
  shiftId?: string | null;
  shiftMasterId?: string | null;
  shiftMasterName?: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkOutLatitude?: number | null;
  checkOutLongitude?: number | null;
  checkInDistanceM?: number | null;
  checkOutDistanceM?: number | null;
  status: string;
  lateMinutes: number;
  earlyMinutes: number;
  workedMinutes: number;
  note?: string;
  isManualAdjusted: boolean;
}

export interface TimekeepingSummary extends BaseDto {
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  companyId?: string | null;
  branchId?: string | null;
  branchName?: string;
  year: number;
  month: number;
  workingDays: number;
  onTimeDays: number;
  lateDays: number;
  earlyDays: number;
  leaveDays: number;
  absentDays: number;
  incompleteDays: number;
  totalWorkedMinutes: number;
  totalLateMinutes: number;
  totalEarlyMinutes: number;
}

export interface ManualAdjustTimekeepingRequest {
  id: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  note?: string | null;
  status?: string | null;
}
