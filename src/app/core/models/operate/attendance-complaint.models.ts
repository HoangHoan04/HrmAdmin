import { BaseDto } from '../common.models';

export interface AttendanceComplaint extends BaseDto {
  employeeId: string;
  employeeCode?: string;
  employeeName?: string;
  companyId?: string | null;
  branchId?: string | null;
  branchName?: string;
  workDate: string;
  timekeepingId?: string | null;
  complaintType: string;
  complaintTypeLabel?: string;
  requestedCheckInTime?: string | null;
  requestedCheckOutTime?: string | null;
  reason: string;
  attachmentUrl?: string | null;
  status: string;
  approverId?: string | null;
  approverName?: string;
  reviewedAt?: string | null;
  approverNote?: string | null;
  currentCheckInAt?: string | null;
  currentCheckOutAt?: string | null;
  currentStatus?: string | null;
}
