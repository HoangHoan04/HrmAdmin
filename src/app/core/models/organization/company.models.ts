import { BaseDto, SelectBoxDto } from '../common.models';

export interface Company extends BaseDto {
  code: string;
  name: string;
  description?: string;
  address?: string;
  taxCode?: string;
  hotline?: string;
  prefixMaleCode?: string;
  prefixFemaleCode?: string;
  prefixFullTimeCode?: string;
  prefixPartTimeCode?: string;
  parentId?: string | null;
  parentName?: string;
  dayComputeSalary?: string | null;
  isComputePrevMonth?: boolean | null;
  email?: string;
  website?: string;
  fax?: string;
  country?: string;
  city?: string;
  district?: string;
  ward?: string;
  businessRegistrationCode?: string;
  foundedDate?: string | null;
  operatingStatus?: string;
  legalRepresentative?: string;
  legalRepresentativePosition?: string;
  companyType?: string;
  industry?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  timeZone?: string;
  defaultLanguage?: string;
  logoUrl?: string;
  primaryColor?: string;
  isActive?: boolean;
  socialInsuranceCode?: string;
  timeKeepingStandardId?: string | null;
  saturdayPolicy?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CompanyImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

export type CompanySelectBoxDto = SelectBoxDto;
