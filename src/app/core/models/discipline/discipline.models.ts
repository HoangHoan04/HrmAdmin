import { BaseDto } from '../common.models';

export interface ViolationType extends BaseDto {
  code: string;
  name: string;
  description?: string | null;
  severity: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Violation extends BaseDto {
  code: string;
  violationTypeId: string;
  violationTypeName?: string | null;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  companyId: string;
  companyName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  occurredAt: string;
  description?: string | null;
  decision?: string | null;
  penaltyType: string;
  status: string;
  note?: string | null;
}
