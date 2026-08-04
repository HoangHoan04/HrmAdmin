import { Base, SelectBoxDto } from '../common.models';

export interface Position extends Base {
  companyId?: string | null;
  companyName?: string;
  branchId?: string | null;
  branchName?: string;
  positionMasterId?: string | null;
  positionMasterName?: string;
  departmentId?: string | null;
  departmentName?: string;
  partId?: string | null;
  partName?: string;
  quantityStandard?: number;
  isActive?: boolean;
  displayOrder?: number;
}

export type PositionSelectBoxDto = SelectBoxDto & {
  positionMasterId?: string | null;
  departmentId?: string | null;
};
