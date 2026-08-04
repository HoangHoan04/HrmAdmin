import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BranchSelectBoxDto,
  DepartmentSelectBoxDto,
  PartMasterSelectBoxDto,
  PartSelectBoxDto,
  PositionMasterSelectBoxDto,
} from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OrganizationCascadeService {
  constructor(private readonly api: ApiService) {}

  loadBranchesByCompany(companyId: string, excludeId?: string): Observable<BranchSelectBoxDto[]> {
    const payload: Record<string, string> = { companyId };
    if (excludeId) payload['excludeId'] = excludeId;
    return this.api.post<BranchSelectBoxDto[]>(this.api.ORGANIZATION.BRANCHES_BY_COMPANY, payload);
  }

  loadDepartmentsByBranch(branchId: string, excludeId?: string): Observable<DepartmentSelectBoxDto[]> {
    const payload: Record<string, string> = { branchId };
    if (excludeId) payload['excludeId'] = excludeId;
    return this.api.post<DepartmentSelectBoxDto[]>(this.api.ORGANIZATION.DEPARTMENTS_BY_BRANCH, payload);
  }

  loadPartsByDepartment(departmentId: string, excludeId?: string): Observable<PartSelectBoxDto[]> {
    const payload: Record<string, string> = { departmentId };
    if (excludeId) payload['excludeId'] = excludeId;
    return this.api.post<PartSelectBoxDto[]>(this.api.ORGANIZATION.PARTS_BY_DEPARTMENT, payload);
  }

  loadPartMastersByScope(companyId?: string | null, branchId?: string | null): Observable<PartMasterSelectBoxDto[]> {
    const payload: Record<string, string> = {};
    if (companyId) payload['companyId'] = companyId;
    if (branchId) payload['branchId'] = branchId;
    return this.api.post<PartMasterSelectBoxDto[]>(this.api.ORGANIZATION.PART_MASTERS_BY_SCOPE, payload);
  }

  loadPositionMastersByScope(
    companyId?: string | null,
    branchId?: string | null,
  ): Observable<PositionMasterSelectBoxDto[]> {
    const payload: Record<string, string> = {};
    if (companyId) payload['companyId'] = companyId;
    if (branchId) payload['branchId'] = branchId;
    return this.api.post<PositionMasterSelectBoxDto[]>(
      this.api.ORGANIZATION.POSITION_MASTERS_BY_SCOPE,
      payload,
    );
  }
}
