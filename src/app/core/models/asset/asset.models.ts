import { BaseDto } from '../common.models';

export interface AssetType extends BaseDto {
  code: string;
  name: string;
  companyId?: string | null;
  companyName?: string | null;
  description?: string | null;
  isActive: boolean;
  isSerialRequired?: boolean;
  maxPerEmployee?: number | null;
}

export interface Asset extends BaseDto {
  code: string;
  name: string;
  assetTypeId: string;
  assetTypeName?: string | null;
  companyId: string;
  companyName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  purchaseCost?: number | null;
  warrantyExpiryDate?: string | null;
  vendor?: string | null;
  model?: string | null;
  location?: string | null;
  status: string;
  note?: string | null;
  currentHolderEmployeeId?: string | null;
  currentHolderEmployeeCode?: string | null;
  currentHolderEmployeeName?: string | null;
}

export interface AssetTicket extends BaseDto {
  code: string;
  assetId: string;
  assetCode?: string | null;
  assetName?: string | null;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  toEmployeeId?: string | null;
  toEmployeeCode?: string | null;
  toEmployeeName?: string | null;
  companyId: string;
  companyName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  ticketType: string;
  status: string;
  ticketAt: string;
  returnExpectedDate?: string | null;
  condition?: string | null;
  note?: string | null;
}

export interface AssetAssignment extends BaseDto {
  assetId: string;
  assetCode?: string | null;
  assetName?: string | null;
  serialNumber?: string | null;
  assetTypeName?: string | null;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  companyId: string;
  companyName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  issuedAt: string;
  returnedAt?: string | null;
  conditionOnIssue?: string | null;
  conditionOnReturn?: string | null;
  note?: string | null;
  isHolding: boolean;
}

export interface EmployeeAssetSummary {
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  currentHoldingAssets: AssetAssignment[];
  pastAssetHistories: AssetAssignment[];
}

export interface EmployeeAssetClearance {
  employeeId: string;
  hasUnreturnedAssets: boolean;
  unreturnedCount: number;
  unreturnedAssets: AssetAssignment[];
}
