import { SelectBoxDto } from './common.models';

export interface Company {
  id?: string;
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
  isActive?: boolean;
  socialInsuranceCode?: string;
  timeKeepingStandardId?: string | null;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

export interface Branch {
  id?: string;
  code: string;
  name: string;
  description: string;
  address: string;
  ipAddress: string;
  groupSalary: string;
  shortName: string;
  type: string;
  companyId?: string;
  companyName?: string;
  isDeleted?: boolean;
  createdAt?: string;
}

export type CompanySelectBoxDto = SelectBoxDto;

export interface BranchSelectBoxDto extends SelectBoxDto {
  companyId?: string;
}
