import { Base, SelectBoxDto } from '../common.models';

export interface Department extends Base {
  code: string;
  name: string;
  shortName?: string;
  description?: string;
  type?: string;
  companyId?: string | null;
  companyName?: string;
  branchId?: string | null;
  branchName?: string;
  parentDepartmentId?: string | null;
  parentDepartmentName?: string;
  level?: number;
  limit?: number;
  currentHeadCount?: number;
  managerId?: string | null;
  deputyManagerId?: string | null;
  email?: string;
  phoneExtension?: string;
  costCenterCode?: string;
  isActive?: boolean;
  displayOrder?: number;
  establishedDate?: string;
  dissolvedDate?: string;
  isNotifyMarketing?: boolean;
}

export type DepartmentSelectBoxDto = SelectBoxDto & {
  companyId?: string | null;
  branchId?: string | null;
};
