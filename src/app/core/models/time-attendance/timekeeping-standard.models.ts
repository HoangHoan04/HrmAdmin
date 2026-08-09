import { Base, SelectBoxDto } from '../common.models';

export interface TimeKeepingStandard extends Base {
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
