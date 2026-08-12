export interface EmployeeWorkPattern {
  id: string;
  employeeId: string;
  employeeCode?: string;
  employeeName?: string;
  shiftMasterId: string;
  shiftMasterCode?: string;
  shiftMasterName?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  patternType: string;
  workOnMonday: boolean;
  workOnTuesday: boolean;
  workOnWednesday: boolean;
  workOnThursday: boolean;
  workOnFriday: boolean;
  workOnSaturday: boolean;
  workOnSunday: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  branchId?: string | null;
  branchName?: string;
  note?: string | null;
  isActive: boolean;
  workDaysLabel?: string;
}
