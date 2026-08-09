import { Base, SelectBoxDto } from '../common.models';

export interface DayOffConfig extends Base {
  code: string;
  name: string;
  description?: string;
  companyId?: string | null;
  companyName?: string;
  dayOffType: string;
  defaultDaysPerYear: number;
  isPaid: boolean;
  isActive: boolean;
}

export type DayOffConfigSelectBoxDto = SelectBoxDto & {
  dayOffType?: string;
  companyId?: string | null;
};

export interface PublicHoliday extends Base {
  code: string;
  name: string;
  companyId?: string | null;
  companyName?: string;
  holidayDate: string;
  isRecurringYearly: boolean;
  description?: string;
  isActive: boolean;
}

export interface RegisterDayOff extends Base {
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
