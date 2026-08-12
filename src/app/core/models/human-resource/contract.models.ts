import { BaseDto, SelectBoxDto } from '../common.models';

export interface ContractType extends BaseDto {
  code: string;
  name: string;
  description?: string;
  companyId?: string | null;
  companyName?: string;
  isProbation: boolean;
  isUnlimited: boolean;
  defaultDurationMonths?: number | null;
  maxRenewalTimes?: number | null;
  notifyBeforeExpiryDays?: number | null;
  isActive: boolean;
  displayOrder: number;
}

export type ContractTypeSelectBoxDto = SelectBoxDto & {
  companyId?: string | null;
  isProbation?: boolean;
  isUnlimited?: boolean;
  defaultDurationMonths?: number | null;
  maxRenewalTimes?: number | null;
  notifyBeforeExpiryDays?: number | null;
};

export interface Contract extends BaseDto {
  employeeId: string;
  employeeCode?: string;
  employeeName?: string;
  contractTypeId?: string | null;
  contractTypeCode?: string;
  contractTypeName?: string;
  code: string;
  signDate?: string | null;
  startDate: string;
  endDate?: string | null;
  jobTitle?: string;
  workingLocation?: string;
  basicSalary?: number | null;
  allowance?: number | null;
  insuranceSalary?: number | null;
  paymentMethod?: string;
  companyId?: string | null;
  companyName?: string;
  branchId?: string | null;
  branchName?: string;
  departmentId?: string | null;
  departmentName?: string;
  positionId?: string | null;
  positionName?: string;
  signedByCompanyRepresentative?: string;
  signedByEmployeeName?: string;
  isAutoRenew: boolean;
  previousContractId?: string | null;
  previousContractCode?: string;
  renewalTimes: number;
  terminationDate?: string | null;
  terminationReason?: string;
  status?: string;
  fileUrl?: string;
  note?: string;
  daysUntilExpiry?: number | null;
  isExpiringSoon?: boolean;
}

export interface ReviewRenewal extends BaseDto {
  contractId: string;
  contractCode?: string;
  employeeId: string;
  employeeCode?: string;
  employeeName?: string;
  reviewDate?: string | null;
  reviewedBy?: string;
  performanceScore?: number | null;
  reviewResult?: string;
  reviewComment?: string;
  recommendation?: string;
  proposedContractTypeId?: string | null;
  proposedContractTypeName?: string;
  proposedStartDate?: string | null;
  proposedEndDate?: string | null;
  proposedBasicSalary?: number | null;
  approvedBy?: string;
  approvedDate?: string | null;
  status?: string;
  newContractId?: string | null;
  newContractCode?: string;
  note?: string;
  contractEndDate?: string | null;
}
