import { BaseDto } from '../common.models';

export interface WorkSchedule extends BaseDto {
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  shiftId?: string | null;
  shiftMasterId?: string | null;
  shiftMasterName?: string;
  shiftMasterCode?: string;
  workDate: string;
  branchId?: string | null;
  branchName?: string;
  note?: string;
}
