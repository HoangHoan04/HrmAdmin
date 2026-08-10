import { BaseDto, SelectBoxDto } from '../common.models';

export interface PositionMaster extends BaseDto {
  code: string;
  name: string;
  description?: string;
  companyId?: string | null;
  companyName?: string;
  branchId?: string | null;
  branchName?: string;
  isLimitHoursWorking?: boolean;
  limit?: string;
  workingHour?: number;
  minimumWorkingHour?: number;
  hourWorkingStart?: string;
  hourWorkingEnd?: string;
  isTimeKeeping?: boolean;
  hourSnapShotStart?: string;
  hourSnapShotEnd?: string;
  isAllowOverTimekeepingStandard?: boolean;
  isSwapPosition?: boolean;
  targetChangePositionIds?: string;
  isApprovedWhenHiringCandidate?: boolean;
  isHadASecondInterview?: boolean;
  isApprovedDayOff?: boolean;
  quantityStandard?: number;
  isActive?: boolean;
  displayOrder?: number;
}

export type PositionMasterSelectBoxDto = SelectBoxDto & {
  companyId?: string | null;
  branchId?: string | null;
};
