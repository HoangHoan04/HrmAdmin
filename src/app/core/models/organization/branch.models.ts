import { BaseDto, SelectBoxDto } from '../common.models';

export interface Branch extends BaseDto {
  code: string;
  name: string;
  shortName?: string;
  description?: string;
  type?: string;
  companyId?: string | null;
  companyName?: string;
  parentBranchId?: string | null;
  parentBranchName?: string;
  isHeadQuarter?: boolean;
  address?: string;
  country?: string;
  city?: string;
  district?: string;
  ward?: string;
  latitude?: number | null;
  longitude?: number | null;
  phoneNumber?: string;
  email?: string;
  fax?: string;
  ipAddress?: string;
  managerId?: string | null;
  managerName?: string;
  managerPhone?: string;
  taxCode?: string;
  businessRegistrationCode?: string;
  openingDate?: string | null;
  closingDate?: string | null;
  operatingStatus?: string;
  isActive?: boolean;
  isUsingHrm?: boolean;
  displayOrder?: number;
  groupSalary?: string;
  timeKeepingStandardId?: string | null;
  maxEmployeeCapacity?: number | null;
  timeZone?: string;
}

export type BranchSelectBoxDto = SelectBoxDto & {
  companyId?: string | null;
};
