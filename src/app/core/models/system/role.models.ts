import { BaseDto } from '../common.models';

export type DataScope = 'ALL' | 'BRANCH' | 'DEPARTMENT' | 'OWN';

export interface PermissionDto {
  code: string;
  name: string;
  module: string;
  action: string;
  actionName?: string;
  description?: string | null;
  isScopable?: boolean;
}

export interface PermissionActionNode {
  code: string;
  name: string;
  action: string;
  actionName: string;
  isScopable?: boolean;
}

export interface PermissionItemNode {
  key: string;
  name: string;
  actions: PermissionActionNode[];
}

export interface PermissionTreeGroup {
  module: string;
  moduleName?: string;
  items?: PermissionItemNode[];
  permissions?: PermissionDto[];
}

export interface RolePermissionItem {
  permissionCode: string;
  permissionName?: string;
  module?: string;
  dataScope: DataScope | string;
}

export interface RoleDto extends BaseDto {
  code: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  isActive: boolean;
  companyId?: string | null;
  companyCode?: string | null;
  companyName?: string | null;
  branchId?: string | null;
  permissionCount?: number;
  userCount?: number;
  permissions?: RolePermissionItem[];
}

export interface RoleSelectBoxDto {
  id: string;
  code: string;
  name: string;
}

export interface CreateRoleRequest {
  code: string;
  name: string;
  description?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  isActive?: boolean;
}

export interface UpdateRoleRequest {
  id: string;
  name: string;
  description?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  isActive?: boolean;
}

export interface SetRolePermissionsRequest {
  roleId: string;
  permissions: Array<{
    permissionCode: string;
    dataScope: DataScope | string;
  }>;
}

export interface AdminUserDto extends BaseDto {
  username: string;
  type: string;
  email?: string | null;
  phoneNumber?: string | null;
  employeeId?: string | null;
  employeeCode?: string | null;
  employeeName?: string | null;
  companyId?: string | null;
  companyCode?: string | null;
  companyName?: string | null;
  branchId?: string | null;
  isActive: boolean;
  isLocked?: boolean;
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  roleIds?: string[];
  roleCodes?: string[];
  roleNames?: string[];
}

export interface CreateUserRequest {
  username: string;
  password?: string | null;
  type?: string;
  email?: string | null;
  phoneNumber?: string | null;
  employeeId?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  isActive?: boolean;
  mustChangePassword?: boolean;
}

export interface UpdateUserRequest {
  id: string;
  email?: string | null;
  phoneNumber?: string | null;
  type?: string;
  employeeId?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  isActive?: boolean;
  isLocked?: boolean;
}

export interface UserRoleDto {
  userId?: string;
  roleId: string;
  roleCode?: string;
  roleName?: string;
  isSystem?: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  /** EMPLOYEE = gán theo nhân viên (sửa được); USER = gán trực tiếp cho tài khoản. */
  source?: 'EMPLOYEE' | 'USER';
}

export interface EmployeeAccountInfoDto {
  userId: string;
  username: string;
  type?: string | null;
  isActive: boolean;
  isLocked: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: string | null;
}

export interface EmployeeAccessSummaryDto {
  employeeId: string;
  code: string;
  fullName: string;
  avatarUrl?: string | null;
  companyEmail?: string | null;
  status?: string | null;
  companyName?: string | null;
  branchName?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  account?: EmployeeAccountInfoDto | null;
  roles: UserRoleDto[];
  usesDefaultEmployeeRole: boolean;
}

export interface SetUserRolesRequest {
  userId: string;
  roleIds: string[];
}

export interface SetEmployeeRolesRequest {
  employeeId: string;
  roleIds: string[];
}
