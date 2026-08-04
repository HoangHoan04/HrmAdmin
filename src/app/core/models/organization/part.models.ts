import { Base, SelectBoxDto } from '../common.models';

export interface Part extends Base {
  code: string;
  name: string;
  description?: string;
  partMasterId?: string | null;
  partMasterName?: string;
  companyId?: string | null;
  companyName?: string;
  branchId?: string | null;
  branchName?: string;
  departmentId?: string | null;
  departmentName?: string;
  managerId?: string | null;
  managerName?: string;
  limit?: number;
  isActive: boolean;
  displayOrder?: number | null;
}

export type PartSelectBoxDto = SelectBoxDto & {
  departmentId?: string | null;
  partMasterId?: string | null;
};
