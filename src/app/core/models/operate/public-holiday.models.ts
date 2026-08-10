import { BaseDto } from '../common.models';

export interface PublicHoliday extends BaseDto {
  code: string;
  name: string;
  companyId?: string | null;
  companyName?: string;
  holidayDate: string;
  isRecurringYearly: boolean;
  description?: string;
  isActive: boolean;
}
