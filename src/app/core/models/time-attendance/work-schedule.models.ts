import { Base } from '../common.models';

export interface WorkSchedule extends Base {
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
