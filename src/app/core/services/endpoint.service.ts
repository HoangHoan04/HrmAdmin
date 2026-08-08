import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EndpointService {
  private readonly baseUrl = environment.apiUrl;

  AUTH = {
    LOGIN: `${this.baseUrl}/admin/auth/login`,
    REFRESH: `${this.baseUrl}/admin/auth/refresh`,
    CHANGE_PASSWORD: `${this.baseUrl}/admin/auth/change-password`,
    FORGOT_PASSWORD: `${this.baseUrl}/admin/auth/forgot-password`,
    RESET_PASSWORD_WITH_OTP: `${this.baseUrl}/admin/auth/reset-password-with-otp`,
    ME: `${this.baseUrl}/admin/auth/me`,
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

  EMPLOYEE = {
    PAGINATION: `${this.baseUrl}/employee/pagination`,
    DETAIL: `${this.baseUrl}/employee/detail`,
    CREATE: `${this.baseUrl}/employee/create`,
    UPDATE: `${this.baseUrl}/employee/update`,
    ACTIVATE: `${this.baseUrl}/employee/activate`,
    DEACTIVATE: `${this.baseUrl}/employee/deactivate`,
    SELECT_BOX: `${this.baseUrl}/employee/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/employee/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/employee/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/employee/excel/import`,
    DEPENDENT_CREATE: `${this.baseUrl}/employee/dependent/create`,
    DEPENDENT_UPDATE: `${this.baseUrl}/employee/dependent/update`,
    DEPENDENT_DELETE: `${this.baseUrl}/employee/dependent/delete`,
    EDUCATION_CREATE: `${this.baseUrl}/employee/education/create`,
    EDUCATION_UPDATE: `${this.baseUrl}/employee/education/update`,
    EDUCATION_DELETE: `${this.baseUrl}/employee/education/delete`,
    CERTIFICATE_CREATE: `${this.baseUrl}/employee/certificate/create`,
    CERTIFICATE_UPDATE: `${this.baseUrl}/employee/certificate/update`,
    CERTIFICATE_DELETE: `${this.baseUrl}/employee/certificate/delete`,
    FILE_CREATE: `${this.baseUrl}/employee/file/create`,
    FILE_UPDATE: `${this.baseUrl}/employee/file/update`,
    FILE_DELETE: `${this.baseUrl}/employee/file/delete`,
    SALARY_HISTORY_CREATE: `${this.baseUrl}/employee/salary-history/create`,
    SALARY_HISTORY_UPDATE: `${this.baseUrl}/employee/salary-history/update`,
    SALARY_HISTORY_DELETE: `${this.baseUrl}/employee/salary-history/delete`,
  };

  ACTION_LOG = {
    BASE: `${this.baseUrl}/action-logs`,
  };

  ORGANIZATION = {
    BRANCHES_BY_COMPANY: `${this.baseUrl}/branch/by-company`,
    DEPARTMENTS_BY_BRANCH: `${this.baseUrl}/department/by-branch`,
    PARTS_BY_DEPARTMENT: `${this.baseUrl}/part/by-department`,
    PART_MASTERS_BY_SCOPE: `${this.baseUrl}/part-master/by-scope`,
    POSITION_MASTERS_BY_SCOPE: `${this.baseUrl}/position-master/by-scope`,
  };

  UPLOAD_FILE = {
    UPLOAD_SINGLE: `${this.baseUrl}/upload-file/upload-single`,
    UPLOAD_MULTI: `${this.baseUrl}/upload-file/upload-multi`,
    UPLOAD_IMAGE: `${this.baseUrl}/upload-file/upload-image`,
    UPLOAD_AUDIO: `${this.baseUrl}/upload-file/upload-audio`,
    UPLOAD_DOCUMENT: `${this.baseUrl}/upload-file/upload-document`,
    UPLOAD_CATBOX: `${this.baseUrl}/upload-file/upload-catbox`,
    UPLOAD_CATBOX_URL: `${this.baseUrl}/upload-file/upload-catbox-url`,
    UPLOAD_S3: `${this.baseUrl}/upload-file/upload-s3`,
    UPLOAD_SINGLE_S3: `${this.baseUrl}/upload-file/upload-single-s3`,
    UPLOAD_MULTI_S3: `${this.baseUrl}/upload-file/upload-multi-s3`,
    DOWNLOAD_IMAGES_ZIP: `${this.baseUrl}/upload-file/download-images-zip`,
  };
}
