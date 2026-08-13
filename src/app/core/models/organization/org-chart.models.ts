export type OrgChartNodeType = 'COMPANY' | 'BRANCH' | 'DEPARTMENT' | 'PART';

export interface OrgChartNodeDto {
  id: string;
  nodeType: OrgChartNodeType | string;
  code: string;
  name: string;
  parentId?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  displayOrder: number;
  employeeCount?: number | null;
  managerName?: string | null;
  children?: OrgChartNodeDto[];
}

export interface GetOrgChartTreeRequest {
  companyId: string;
  includeParts?: boolean;
}

export interface ReparentOrgChartNodeRequest {
  nodeType: string;
  id: string;
  newParentId?: string | null;
  newBranchId?: string | null;
  displayOrder?: number | null;
}
