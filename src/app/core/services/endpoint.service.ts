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
    LOAD_BY_COMPANY: `${this.baseUrl}/branch/load-by-company`,
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
    LOAD_BY_BRANCH: `${this.baseUrl}/department/load-by-branch`,
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
    LOAD_BY_DEPARTMENT: `${this.baseUrl}/part/load-by-department`,
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
    LOAD_BY_SCOPE: `${this.baseUrl}/part-master/load-by-scope`,
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
    LOAD_BY_SCOPE: `${this.baseUrl}/position-master/load-by-scope`,
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

  TIMEKEEPING_STANDARD = {
    PAGINATION: `${this.baseUrl}/timekeeping-standard/pagination`,
    DETAIL: `${this.baseUrl}/timekeeping-standard/detail`,
    CREATE: `${this.baseUrl}/timekeeping-standard/create`,
    UPDATE: `${this.baseUrl}/timekeeping-standard/update`,
    ACTIVATE: `${this.baseUrl}/timekeeping-standard/activate`,
    DEACTIVATE: `${this.baseUrl}/timekeeping-standard/deactivate`,
    SELECT_BOX: `${this.baseUrl}/timekeeping-standard/select-box`,
  };

  SHIFT_MASTER = {
    PAGINATION: `${this.baseUrl}/shift-master/pagination`,
    DETAIL: `${this.baseUrl}/shift-master/detail`,
    CREATE: `${this.baseUrl}/shift-master/create`,
    UPDATE: `${this.baseUrl}/shift-master/update`,
    ACTIVATE: `${this.baseUrl}/shift-master/activate`,
    DEACTIVATE: `${this.baseUrl}/shift-master/deactivate`,
    SELECT_BOX: `${this.baseUrl}/shift-master/select-box`,
  };

  WORK_SCHEDULE = {
    PAGINATION: `${this.baseUrl}/work-schedule/pagination`,
    DETAIL: `${this.baseUrl}/work-schedule/detail`,
    CREATE: `${this.baseUrl}/work-schedule/create`,
    UPDATE: `${this.baseUrl}/work-schedule/update`,
    DEACTIVATE: `${this.baseUrl}/work-schedule/deactivate`,
  };

  TIMEKEEPING = {
    PAGINATION: `${this.baseUrl}/timekeeping/pagination`,
    DETAIL: `${this.baseUrl}/timekeeping/detail`,
    ADJUST: `${this.baseUrl}/timekeeping/adjust`,
    SUMMARIZE: `${this.baseUrl}/timekeeping/summarize`,
    SUMMARY_PAGINATION: `${this.baseUrl}/timekeeping/summary/pagination`,
  };

  DAY_OFF_CONFIG = {
    PAGINATION: `${this.baseUrl}/day-off-config/pagination`,
    DETAIL: `${this.baseUrl}/day-off-config/detail`,
    CREATE: `${this.baseUrl}/day-off-config/create`,
    UPDATE: `${this.baseUrl}/day-off-config/update`,
    ACTIVATE: `${this.baseUrl}/day-off-config/activate`,
    DEACTIVATE: `${this.baseUrl}/day-off-config/deactivate`,
    SELECT_BOX: `${this.baseUrl}/day-off-config/select-box`,
  };

  PUBLIC_HOLIDAY = {
    PAGINATION: `${this.baseUrl}/public-holiday/pagination`,
    DETAIL: `${this.baseUrl}/public-holiday/detail`,
    CREATE: `${this.baseUrl}/public-holiday/create`,
    UPDATE: `${this.baseUrl}/public-holiday/update`,
    ACTIVATE: `${this.baseUrl}/public-holiday/activate`,
    DEACTIVATE: `${this.baseUrl}/public-holiday/deactivate`,
  };

  REGISTER_DAY_OFF = {
    PAGINATION: `${this.baseUrl}/register-day-off/pagination`,
    DETAIL: `${this.baseUrl}/register-day-off/detail`,
    CREATE: `${this.baseUrl}/register-day-off/create`,
    APPROVE: `${this.baseUrl}/register-day-off/approve`,
    REJECT: `${this.baseUrl}/register-day-off/reject`,
  };

  CONTRACT_TYPE = {
    PAGINATION: `${this.baseUrl}/contract-type/pagination`,
    DETAIL: `${this.baseUrl}/contract-type/detail`,
    CREATE: `${this.baseUrl}/contract-type/create`,
    UPDATE: `${this.baseUrl}/contract-type/update`,
    ACTIVATE: `${this.baseUrl}/contract-type/activate`,
    DEACTIVATE: `${this.baseUrl}/contract-type/deactivate`,
    SELECT_BOX: `${this.baseUrl}/contract-type/select-box`,
  };

  CONTRACT = {
    PAGINATION: `${this.baseUrl}/contract/pagination`,
    DETAIL: `${this.baseUrl}/contract/detail`,
    CREATE: `${this.baseUrl}/contract/create`,
    UPDATE: `${this.baseUrl}/contract/update`,
    SIGN: `${this.baseUrl}/contract/sign`,
    TERMINATE: `${this.baseUrl}/contract/terminate`,
    RENEW: `${this.baseUrl}/contract/renew`,
    HISTORY: `${this.baseUrl}/contract/history`,
    EXPIRING_SOON: `${this.baseUrl}/contract/expiring-soon`,
  };

  REVIEW_RENEWAL = {
    PAGINATION: `${this.baseUrl}/review-renewal/pagination`,
    DETAIL: `${this.baseUrl}/review-renewal/detail`,
    CREATE: `${this.baseUrl}/review-renewal/create`,
    UPDATE: `${this.baseUrl}/review-renewal/update`,
    APPROVE: `${this.baseUrl}/review-renewal/approve`,
    REJECT: `${this.baseUrl}/review-renewal/reject`,
    APPLY: `${this.baseUrl}/review-renewal/apply`,
  };

  TRANSFER_EMPLOYEE = {
    PAGINATION: `${this.baseUrl}/transfer-employee/pagination`,
    DETAIL: `${this.baseUrl}/transfer-employee/detail`,
    CREATE: `${this.baseUrl}/transfer-employee/create`,
    UPDATE: `${this.baseUrl}/transfer-employee/update`,
    APPROVE: `${this.baseUrl}/transfer-employee/approve`,
    REJECT: `${this.baseUrl}/transfer-employee/reject`,
    APPLY: `${this.baseUrl}/transfer-employee/apply`,
    CANCEL: `${this.baseUrl}/transfer-employee/cancel`,
    HISTORY: `${this.baseUrl}/transfer-employee/history`,
    EMPLOYEE_ORG_SNAPSHOT: `${this.baseUrl}/transfer-employee/employee-org-snapshot`,
  };

  ACTION_LOG = {
    BASE: `${this.baseUrl}/action-logs`,
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
