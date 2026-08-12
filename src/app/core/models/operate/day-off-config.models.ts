import { BaseDto, SelectBoxDto } from '../common.models';

export interface DayOffConfig extends BaseDto {
  code: string;
  name: string;
  description?: string;
  companyId?: string | null;
  companyName?: string;
  dayOffType: string;
  defaultDaysPerYear: number;
  isPaid: boolean;
  deductBalance?: boolean;
  requireAttachment?: boolean;
  maxDaysPerRequest?: number | null;
  minNoticeDays?: number;
  isActive: boolean;
}

export type DayOffConfigSelectBoxDto = SelectBoxDto & {
  dayOffType?: string;
  companyId?: string | null;
};
