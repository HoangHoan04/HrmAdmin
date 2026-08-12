import { BaseDto, SelectBoxDto } from '../common.models';

export interface ShiftMaster extends BaseDto {
  code: string;
  name: string;
  description?: string;
  companyId?: string | null;
  companyName?: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  breakMinutes: number;
  workingMinutes: number;
  isOvernight: boolean;
  isActive: boolean;
}

export type ShiftMasterSelectBoxDto = SelectBoxDto & {
  startTime?: string;
  endTime?: string;
  companyId?: string | null;
};
