import { Base, SelectBoxDto } from '../common.models';

export interface PartMaster extends Base {
  code: string;
  name: string;
  description?: string;
  companyId?: string | null;
  companyName?: string;
  branchId?: string | null;
  branchName?: string;
  type?: string | null;
  isActive?: boolean;
  displayOrder?: number | null;
}

export type PartMasterSelectBoxDto = SelectBoxDto & {
  companyId?: string | null;
};
