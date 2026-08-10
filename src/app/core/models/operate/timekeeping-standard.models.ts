import { BaseDto, SelectBoxDto } from '../common.models';

export interface TimeKeepingStandard extends BaseDto {
  code: string;
  name: string;
  description?: string;
  companyId?: string | null;
  companyName?: string;
  allowedRadiusMeters: number;
  lateGraceMinutes: number;
  earlyLeaveGraceMinutes: number;
  isActive: boolean;
}

export type TimeKeepingStandardSelectBoxDto = SelectBoxDto & {
  companyId?: string | null;
};
