import { BaseDto } from '../common.models';

export interface TransferEmployee extends BaseDto {
  employeeId: string;
  employeeCode?: string;
  employeeName?: string;
  code: string;
  transferType: string;
  requestDate?: string | null;
  effectiveDate: string;
  expectedEndDate?: string | null;
  actualEndDate?: string | null;
  reason?: string;
  decisionNumber?: string;
  decisionDate?: string | null;
  decisionFileUrl?: string;
  approvedBy?: string;
  approvedDate?: string | null;
  status?: string;
  note?: string;
  details?: TransferEmployeePosition[];
}

export interface TransferEmployeePosition extends BaseDto {
  transferEmployeeId?: string;
  employeeId?: string;
  effectiveDate: string;
  oldCompanyId?: string | null;
  oldCompanyName?: string;
  newCompanyId?: string | null;
  newCompanyName?: string;
  oldBranchId?: string | null;
  oldBranchName?: string;
  newBranchId?: string | null;
  newBranchName?: string;
  oldDepartmentId?: string | null;
  oldDepartmentName?: string;
  newDepartmentId?: string | null;
  newDepartmentName?: string;
  oldPartId?: string | null;
  oldPartName?: string;
  newPartId?: string | null;
  newPartName?: string;
  oldPositionId?: string | null;
  oldPositionName?: string;
  newPositionId?: string | null;
  newPositionName?: string;
  changeType?: string;
  note?: string;
}
