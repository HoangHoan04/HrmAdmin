import { BaseDto } from '../common.models';

export interface AssetType extends BaseDto {
  code: string;
  name: string;
  companyId?: string | null;
  companyName?: string | null;
  description?: string | null;
  isActive: boolean;
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
  status: string;
  note?: string | null;
}

export interface AssetTicket extends BaseDto {
  code: string;
  assetId: string;
  assetCode?: string | null;
  assetName?: string | null;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  companyId: string;
  companyName?: string | null;
  ticketType: string;
  status: string;
  ticketAt: string;
  note?: string | null;
}
