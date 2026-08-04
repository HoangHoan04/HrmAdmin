import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EndpointService {
  private readonly baseUrl = environment.apiUrl;

  AUTH = {
    BASE: `${this.baseUrl}/auth`,
    LOGIN: `${this.baseUrl}/auth/login`,
  };

  COMPANY = {
    PAGINATION: `${this.baseUrl}/company/pagination`,
    DETAIL: `${this.baseUrl}/company/detail`,
    CREATE: `${this.baseUrl}/company/create`,
    UPDATE: `${this.baseUrl}/company/update`,
    ACTIVATE: `${this.baseUrl}/company/activate`,
    DEACTIVATE: `${this.baseUrl}/company/deactivate`,
    SELECT_BOX: `${this.baseUrl}/company/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/company/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/company/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/company/excel/import`,
  };

  BRANCH = {
    PAGINATION: `${this.baseUrl}/branch/pagination`,
    DETAIL: `${this.baseUrl}/branch/detail`,
    CREATE: `${this.baseUrl}/branch/create`,
    UPDATE: `${this.baseUrl}/branch/update`,
    ACTIVATE: `${this.baseUrl}/branch/activate`,
    DEACTIVATE: `${this.baseUrl}/branch/deactivate`,
    SELECT_BOX: `${this.baseUrl}/branch/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/branch/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/branch/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/branch/excel/import`,
  };

  DEPARTMENT = {
    PAGINATION: `${this.baseUrl}/department/pagination`,
    DETAIL: `${this.baseUrl}/department/detail`,
    CREATE: `${this.baseUrl}/department/create`,
    UPDATE: `${this.baseUrl}/department/update`,
    ACTIVATE: `${this.baseUrl}/department/activate`,
    DEACTIVATE: `${this.baseUrl}/department/deactivate`,
    SELECT_BOX: `${this.baseUrl}/department/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/department/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/department/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/department/excel/import`,
  };

  PART = {
    PAGINATION: `${this.baseUrl}/part/pagination`,
    DETAIL: `${this.baseUrl}/part/detail`,
    CREATE: `${this.baseUrl}/part/create`,
    UPDATE: `${this.baseUrl}/part/update`,
    ACTIVATE: `${this.baseUrl}/part/activate`,
    DEACTIVATE: `${this.baseUrl}/part/deactivate`,
    SELECT_BOX: `${this.baseUrl}/part/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/part/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/part/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/part/excel/import`,
  };

  PART_MASTER = {
    PAGINATION: `${this.baseUrl}/part-master/pagination`,
    DETAIL: `${this.baseUrl}/part-master/detail`,
    CREATE: `${this.baseUrl}/part-master/create`,
    UPDATE: `${this.baseUrl}/part-master/update`,
    ACTIVATE: `${this.baseUrl}/part-master/activate`,
    DEACTIVATE: `${this.baseUrl}/part-master/deactivate`,
    SELECT_BOX: `${this.baseUrl}/part-master/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/part-master/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/part-master/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/part-master/excel/import`,
  };

  POSITION = {
    PAGINATION: `${this.baseUrl}/position/pagination`,
    DETAIL: `${this.baseUrl}/position/detail`,
    CREATE: `${this.baseUrl}/position/create`,
    UPDATE: `${this.baseUrl}/position/update`,
    ACTIVATE: `${this.baseUrl}/position/activate`,
    DEACTIVATE: `${this.baseUrl}/position/deactivate`,
    SELECT_BOX: `${this.baseUrl}/position/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/position/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/position/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/position/excel/import`,
  };

  POSITION_MASTER = {
    PAGINATION: `${this.baseUrl}/position-master/pagination`,
    DETAIL: `${this.baseUrl}/position-master/detail`,
    CREATE: `${this.baseUrl}/position-master/create`,
    UPDATE: `${this.baseUrl}/position-master/update`,
    ACTIVATE: `${this.baseUrl}/position-master/activate`,
    DEACTIVATE: `${this.baseUrl}/position-master/deactivate`,
    SELECT_BOX: `${this.baseUrl}/position-master/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/position-master/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/position-master/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/position-master/excel/import`,
  };

  ACTION_LOG = {
    BASE: `${this.baseUrl}/action-logs`,
  };

  ORGANIZATION = {
    BRANCHES_BY_COMPANY: `${this.baseUrl}/organization/branches-by-company`,
    DEPARTMENTS_BY_BRANCH: `${this.baseUrl}/organization/departments-by-branch`,
    PARTS_BY_DEPARTMENT: `${this.baseUrl}/organization/parts-by-department`,
    PART_MASTERS_BY_SCOPE: `${this.baseUrl}/organization/part-masters-by-scope`,
    POSITION_MASTERS_BY_SCOPE: `${this.baseUrl}/organization/position-masters-by-scope`,
  };
}
