import { BaseDto, SelectBoxDto } from '../common.models';

export interface EmployeeDependent extends BaseDto {
  employeeId: string;
  fullName: string;
  relationship: string;
  dayOfBirth?: string | null;
  gender?: string;
  identityNumber?: string;
  taxCode?: string;
  dependentFromDate?: string | null;
  dependentToDate?: string | null;
  status?: string;
  note?: string;
}

export interface EmployeeEducation extends BaseDto {
  employeeId: string;
  schoolName: string;
  degree?: string;
  major?: string;
  startDate?: string | null;
  endDate?: string | null;
  gpa?: string;
}

export interface EmployeeCertificate extends BaseDto {
  employeeId: string;
  name: string;
  issuingOrganization?: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  credentialId?: string;
}

export interface EmployeeFile extends BaseDto {
  employeeId: string;
  fileCategory: string;
  fileName: string;
  fileUrl: string;
  contentType?: string;
  fileSize?: number | null;
  description?: string;
  expiryDate?: string | null;
}

export interface EmployeeSalaryHistory extends BaseDto {
  employeeId: string;
  effectiveDate: string;
  oldBasicSalary?: number | null;
  newBasicSalary: number;
  allowance?: number | null;
  changeType?: string;
  reason?: string;
  decisionNumber?: string;
  approvedBy?: string;
  note?: string;
}

export interface Employee extends BaseDto {
  code: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  companyEmail?: string;
  dayOfBirth: string;
  nationality?: string;
  ethnicity?: string;
  religion?: string;
  identityCard: string;
  placeOfIsssuance: string;
  issuanceDate: string;
  permanentAddress?: string;
  nowAddress?: string;
  currentCity?: string;
  currentWard?: string;
  bankAccountNumber?: string;
  bankname?: string;
  bankBranchName?: string;
  bankAccountHolder?: string;
  taxCode?: string;
  socialInsuranceNumber?: string;
  healthInsuranceNumber?: string;
  level?: string;
  workingMode?: string;
  contractType?: string;
  status?: string;
  joinDate: string;
  resignationDate?: string | null;
  resignationReason?: string;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  partId?: string | null;
  positionId?: string | null;
  dependents?: EmployeeDependent[];
  educations?: EmployeeEducation[];
  certificates?: EmployeeCertificate[];
  files?: EmployeeFile[];
  salaryHistories?: EmployeeSalaryHistory[];
}

export interface EmployeeImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

export type EmployeeSelectBoxDto = SelectBoxDto;
