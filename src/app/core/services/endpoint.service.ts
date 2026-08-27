import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EndpointService {
  private readonly baseUrl = environment.apiUrl;
  private readonly authApiUrl = environment.authApiUrl || 'http://localhost:8000/api';

  AUTH = {
    LOGIN: `${this.authApiUrl}/auth/login`,
    REFRESH: `${this.authApiUrl}/auth/refresh`,
    LOGOUT: `${this.authApiUrl}/auth/logout`,
    CHANGE_PASSWORD: `${this.authApiUrl}/auth/change-password`,
    FORGOT_PASSWORD: `${this.authApiUrl}/auth/forgot-password`,
    RESET_PASSWORD_WITH_OTP: `${this.authApiUrl}/auth/reset-password`,
    RESET_PASSWORD: `${this.authApiUrl}/auth/reset-password`,
    ME: `${this.authApiUrl}/auth/me`,
    PROFILE: `${this.authApiUrl}/auth/profile`,
    TWO_FA_SETUP: `${this.authApiUrl}/auth/2fa/setup`,
    TWO_FA_ENABLE: `${this.authApiUrl}/auth/2fa/enable`,
    TWO_FA_DISABLE: `${this.authApiUrl}/auth/2fa/disable`,
    TWO_FA_VERIFY: `${this.authApiUrl}/auth/login`,
    SSO_STATUS: `${this.authApiUrl}/auth/sso/status`,
    SSO_START: (provider: string) => `${this.authApiUrl}/auth/sso/${provider}/start`,
    SSO_CALLBACK: (provider: string) => `${this.authApiUrl}/auth/sso/${provider}/callback`,
    SESSIONS_LIST: `${this.authApiUrl}/auth/sessions`,
    SESSIONS_REVOKE: `${this.authApiUrl}/auth/sessions`,
  };

  ADMINISTRATIVE = {
    PROVINCES: `${this.authApiUrl}/administrative/provinces`,
    PROVINCE_DETAIL: (code: string) => `${this.authApiUrl}/administrative/provinces/${code}`,
    PROVINCE_WARDS: (code: string) => `${this.authApiUrl}/administrative/provinces/${code}/wards`,
    WARDS: `${this.authApiUrl}/administrative/wards`,
    WARD_DETAIL: (code: string) => `${this.authApiUrl}/administrative/wards/${code}`,
    TREE: `${this.authApiUrl}/administrative/tree`,
    SEARCH: `${this.authApiUrl}/administrative/search`,
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

  ORG_CHART = {
    TREE: `${this.baseUrl}/org-chart/tree`,
    REPARENT: `${this.baseUrl}/org-chart/reparent`,
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
    LOAD_BY_COMPANY: `${this.baseUrl}/department/load-by-company`,
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
    FILES_EXPIRING: `${this.baseUrl}/employee/files/expiring`,
    SALARY_HISTORY_CREATE: `${this.baseUrl}/employee/salary-history/create`,
    SALARY_HISTORY_UPDATE: `${this.baseUrl}/employee/salary-history/update`,
    SALARY_HISTORY_DELETE: `${this.baseUrl}/employee/salary-history/delete`,
    CHANGE_TIMELINE: `${this.baseUrl}/employee/change-timeline`,
    SET_LIFECYCLE_STATUS: `${this.baseUrl}/employee/set-lifecycle-status`,
    BULK_CHANGE_MANAGER: `${this.baseUrl}/employee/bulk-change-manager`,
    ASSETS: `${this.baseUrl}/employee/assets`,
    ASSET_CLEARANCE: `${this.baseUrl}/employee/asset-clearance`,
  };

  TIMEKEEPING_STANDARD = {
    PAGINATION: `${this.baseUrl}/timekeeping-standard/pagination`,
    DETAIL: `${this.baseUrl}/timekeeping-standard/detail`,
    CREATE: `${this.baseUrl}/timekeeping-standard/create`,
    UPDATE: `${this.baseUrl}/timekeeping-standard/update`,
    ACTIVATE: `${this.baseUrl}/timekeeping-standard/activate`,
    DEACTIVATE: `${this.baseUrl}/timekeeping-standard/deactivate`,
    SELECT_BOX: `${this.baseUrl}/timekeeping-standard/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/timekeeping-standard/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/timekeeping-standard/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/timekeeping-standard/excel/import`,
  };

  SHIFT_MASTER = {
    PAGINATION: `${this.baseUrl}/shift-master/pagination`,
    DETAIL: `${this.baseUrl}/shift-master/detail`,
    CREATE: `${this.baseUrl}/shift-master/create`,
    UPDATE: `${this.baseUrl}/shift-master/update`,
    ACTIVATE: `${this.baseUrl}/shift-master/activate`,
    DEACTIVATE: `${this.baseUrl}/shift-master/deactivate`,
    SELECT_BOX: `${this.baseUrl}/shift-master/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/shift-master/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/shift-master/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/shift-master/excel/import`,
  };

  WORK_SCHEDULE = {
    PAGINATION: `${this.baseUrl}/work-schedule/pagination`,
    DETAIL: `${this.baseUrl}/work-schedule/detail`,
    CREATE: `${this.baseUrl}/work-schedule/create`,
    UPDATE: `${this.baseUrl}/work-schedule/update`,
    DEACTIVATE: `${this.baseUrl}/work-schedule/deactivate`,
    BULK_CREATE: `${this.baseUrl}/work-schedule/bulk-create`,
    COPY_WEEK: `${this.baseUrl}/work-schedule/copy-week`,
    EXCEL_TEMPLATE: `${this.baseUrl}/work-schedule/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/work-schedule/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/work-schedule/excel/import`,
  };

  EMPLOYEE_WORK_PATTERN = {
    PAGINATION: `${this.baseUrl}/employee-work-pattern/pagination`,
    UPSERT: `${this.baseUrl}/employee-work-pattern/upsert`,
    BULK_UPSERT: `${this.baseUrl}/employee-work-pattern/bulk-upsert`,
    DEACTIVATE: `${this.baseUrl}/employee-work-pattern/deactivate`,
    EXCEL_TEMPLATE: `${this.baseUrl}/employee-work-pattern/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/employee-work-pattern/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/employee-work-pattern/excel/import`,
  };

  TIMEKEEPING = {
    PAGINATION: `${this.baseUrl}/timekeeping/pagination`,
    DETAIL: `${this.baseUrl}/timekeeping/detail`,
    ADJUST: `${this.baseUrl}/timekeeping/adjust`,
    SUMMARIZE: `${this.baseUrl}/timekeeping/summarize`,
    SUMMARY_PAGINATION: `${this.baseUrl}/timekeeping/summary/pagination`,
  };

  TIMEKEEPING_PUNCH = {
    IMPORT_CSV: `${this.baseUrl}/timekeeping-punch/import-csv`,
  };

  ATTENDANCE_COMPLAINT = {
    PAGINATION: `${this.baseUrl}/attendance-complaint/pagination`,
    DETAIL: `${this.baseUrl}/attendance-complaint/detail`,
    APPROVE: `${this.baseUrl}/attendance-complaint/approve`,
    REJECT: `${this.baseUrl}/attendance-complaint/reject`,
  };

  OVERTIME_REQUEST = {
    PAGINATION: `${this.baseUrl}/overtime-request/pagination`,
    DETAIL: `${this.baseUrl}/overtime-request/detail`,
    CREATE: `${this.baseUrl}/overtime-request/create`,
    SUBMIT: `${this.baseUrl}/overtime-request/submit`,
    APPROVE: `${this.baseUrl}/overtime-request/approve`,
    REJECT: `${this.baseUrl}/overtime-request/reject`,
    BULK_APPROVE: `${this.baseUrl}/overtime-request/bulk-approve`,
    CANCEL: `${this.baseUrl}/overtime-request/cancel`,
  };

  DAY_OFF_CONFIG = {
    PAGINATION: `${this.baseUrl}/day-off-config/pagination`,
    DETAIL: `${this.baseUrl}/day-off-config/detail`,
    CREATE: `${this.baseUrl}/day-off-config/create`,
    UPDATE: `${this.baseUrl}/day-off-config/update`,
    ACTIVATE: `${this.baseUrl}/day-off-config/activate`,
    DEACTIVATE: `${this.baseUrl}/day-off-config/deactivate`,
    SELECT_BOX: `${this.baseUrl}/day-off-config/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/day-off-config/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/day-off-config/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/day-off-config/excel/import`,
  };

  PUBLIC_HOLIDAY = {
    PAGINATION: `${this.baseUrl}/public-holiday/pagination`,
    DETAIL: `${this.baseUrl}/public-holiday/detail`,
    CREATE: `${this.baseUrl}/public-holiday/create`,
    UPDATE: `${this.baseUrl}/public-holiday/update`,
    ACTIVATE: `${this.baseUrl}/public-holiday/activate`,
    DEACTIVATE: `${this.baseUrl}/public-holiday/deactivate`,
    EXCEL_TEMPLATE: `${this.baseUrl}/public-holiday/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/public-holiday/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/public-holiday/excel/import`,
  };

  REGISTER_DAY_OFF = {
    PAGINATION: `${this.baseUrl}/register-day-off/pagination`,
    DETAIL: `${this.baseUrl}/register-day-off/detail`,
    CREATE: `${this.baseUrl}/register-day-off/create`,
    APPROVE: `${this.baseUrl}/register-day-off/approve`,
    REJECT: `${this.baseUrl}/register-day-off/reject`,
    CANCEL: `${this.baseUrl}/register-day-off/cancel`,
    PREVIEW_DAYS: `${this.baseUrl}/register-day-off/preview-days`,
    CALENDAR_RANGE: `${this.baseUrl}/register-day-off/calendar-range`,
  };

  DAY_OFF_ALLOCATION = {
    PAGINATION: `${this.baseUrl}/day-off-allocation/pagination`,
    UPSERT: `${this.baseUrl}/day-off-allocation/upsert`,
    BALANCE_REPORT: `${this.baseUrl}/day-off-allocation/balance-report`,
  };

  CONTRACT_TYPE = {
    PAGINATION: `${this.baseUrl}/contract-type/pagination`,
    DETAIL: `${this.baseUrl}/contract-type/detail`,
    CREATE: `${this.baseUrl}/contract-type/create`,
    UPDATE: `${this.baseUrl}/contract-type/update`,
    ACTIVATE: `${this.baseUrl}/contract-type/activate`,
    DEACTIVATE: `${this.baseUrl}/contract-type/deactivate`,
    SELECT_BOX: `${this.baseUrl}/contract-type/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/contract-type/excel/template`,
    EXCEL_IMPORT: `${this.baseUrl}/contract-type/excel/import`,
    EXCEL_EXPORT: `${this.baseUrl}/contract-type/excel/export`,
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
    BULK_CREATE: `${this.baseUrl}/transfer-employee/bulk-create`,
    UPDATE: `${this.baseUrl}/transfer-employee/update`,
    APPROVE: `${this.baseUrl}/transfer-employee/approve`,
    REJECT: `${this.baseUrl}/transfer-employee/reject`,
    APPLY: `${this.baseUrl}/transfer-employee/apply`,
    CANCEL: `${this.baseUrl}/transfer-employee/cancel`,
    HISTORY: `${this.baseUrl}/transfer-employee/history`,
    EMPLOYEE_ORG_SNAPSHOT: `${this.baseUrl}/transfer-employee/employee-org-snapshot`,
    EXCEL_TEMPLATE: `${this.baseUrl}/transfer-employee/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/transfer-employee/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/transfer-employee/excel/import`,
  };

  SALARY = {
    PAGINATION: `${this.baseUrl}/salary/pagination`,
    DETAIL: `${this.baseUrl}/salary/detail`,
    CREATE: `${this.baseUrl}/salary/create`,
    UPDATE: `${this.baseUrl}/salary/update`,
    APPROVE: `${this.baseUrl}/salary/approve`,
    MARK_PAID: `${this.baseUrl}/salary/mark-paid`,
    CANCEL: `${this.baseUrl}/salary/cancel`,
    PREVIEW_RUN: `${this.baseUrl}/salary/preview-run`,
    RUN: `${this.baseUrl}/salary/run`,
    FINALIZE_PERIOD: `${this.baseUrl}/salary/finalize-period`,
    PAYSLIP_HTML: `${this.baseUrl}/salary/payslip-html`,
    EXPORT_BANK_FILE: `${this.baseUrl}/salary/export-bank-file`,
    EXPORT_BHXH: `${this.baseUrl}/salary/export-bhxh`,
    EXPORT_ACCOUNTING: `${this.baseUrl}/salary/export-accounting`,
  };

  SALARY_CONFIG = {
    PAGINATION: `${this.baseUrl}/salary-config/pagination`,
    DETAIL: `${this.baseUrl}/salary-config/detail`,
    CREATE: `${this.baseUrl}/salary-config/create`,
    UPDATE: `${this.baseUrl}/salary-config/update`,
    ACTIVATE: `${this.baseUrl}/salary-config/activate`,
    DEACTIVATE: `${this.baseUrl}/salary-config/deactivate`,
    SELECT_BOX: `${this.baseUrl}/salary-config/select-box`,
  };

  ALLOWANCE = {
    PAGINATION: `${this.baseUrl}/allowance/pagination`,
    UPSERT: `${this.baseUrl}/allowance/upsert`,
    SET_ACTIVE: `${this.baseUrl}/allowance/set-active`,
  };

  ADVANCE = {
    PAGINATION: `${this.baseUrl}/advance/pagination`,
    CREATE: `${this.baseUrl}/advance/create`,
    APPROVE: `${this.baseUrl}/advance/approve`,
    REJECT: `${this.baseUrl}/advance/reject`,
    CANCEL: `${this.baseUrl}/advance/cancel`,
  };

  PAYROLL_SLIP = {
    PAGINATION: `${this.baseUrl}/payroll-slip/pagination`,
    CREATE: `${this.baseUrl}/payroll-slip/create`,
    APPROVE: `${this.baseUrl}/payroll-slip/approve`,
    REJECT: `${this.baseUrl}/payroll-slip/reject`,
  };

  PERMISSION = {
    TREE: `${this.baseUrl}/permission/tree`,
    LIST: `${this.baseUrl}/permission/list`,
  };

  ROLE = {
    PAGINATION: `${this.baseUrl}/role/pagination`,
    SELECT_BOX: `${this.baseUrl}/role/select-box`,
    DETAIL: `${this.baseUrl}/role/detail`,
    CREATE: `${this.baseUrl}/role/create`,
    UPDATE: `${this.baseUrl}/role/update`,
    DELETE: `${this.baseUrl}/role/delete`,
    SET_PERMISSIONS: `${this.baseUrl}/role/set-permissions`,
  };

  USER_ROLE = {
    BY_USER: `${this.baseUrl}/user-role/by-user`,
    BY_EMPLOYEE: `${this.baseUrl}/user-role/by-employee`,
    SET: `${this.baseUrl}/user-role/set`,
    SET_BY_EMPLOYEE: `${this.baseUrl}/user-role/set-by-employee`,
  };

  HEADCOUNT = {
    TREE: `${this.baseUrl}/headcount/tree`,
    UPSERT_ROW: `${this.baseUrl}/headcount/upsert-row`,
  };

  JOB_DESCRIPTION = {
    PAGINATION: `${this.baseUrl}/job-description/pagination`,
    DETAIL: `${this.baseUrl}/job-description/detail`,
    CREATE: `${this.baseUrl}/job-description/create`,
    UPDATE: `${this.baseUrl}/job-description/update`,
    DELETE: `${this.baseUrl}/job-description/delete`,
  };

  EVALUATION_CRITERIA = {
    PAGINATION: `${this.baseUrl}/evaluation-criteria/pagination`,
    DETAIL: `${this.baseUrl}/evaluation-criteria/detail`,
    CREATE: `${this.baseUrl}/evaluation-criteria/create`,
    UPDATE: `${this.baseUrl}/evaluation-criteria/update`,
    DELETE: `${this.baseUrl}/evaluation-criteria/delete`,
  };

  HIRING_SOURCE = {
    LIST: `${this.baseUrl}/hiring-source/list`,
    DETAIL: `${this.baseUrl}/hiring-source/detail`,
    CREATE: `${this.baseUrl}/hiring-source/create`,
    UPDATE: `${this.baseUrl}/hiring-source/update`,
    DELETE: `${this.baseUrl}/hiring-source/delete`,
  };

  RECRUITMENT_REQUEST = {
    PAGINATION: `${this.baseUrl}/recruitment-request/pagination`,
    DETAIL: `${this.baseUrl}/recruitment-request/detail`,
    CREATE: `${this.baseUrl}/recruitment-request/create`,
    UPDATE: `${this.baseUrl}/recruitment-request/update`,
    SUBMIT: `${this.baseUrl}/recruitment-request/submit`,
    APPROVE: `${this.baseUrl}/recruitment-request/approve`,
    REJECT: `${this.baseUrl}/recruitment-request/reject`,
    CLOSE: `${this.baseUrl}/recruitment-request/close`,
  };

  HIRING_PLAN = {
    PAGINATION: `${this.baseUrl}/hiring-plan/pagination`,
    DETAIL: `${this.baseUrl}/hiring-plan/detail`,
    CREATE: `${this.baseUrl}/hiring-plan/create`,
    UPDATE: `${this.baseUrl}/hiring-plan/update`,
    SET_CRITERIA: `${this.baseUrl}/hiring-plan/set-criteria`,
  };

  CANDIDATE = {
    PAGINATION: `${this.baseUrl}/candidate/pagination`,
    DETAIL: `${this.baseUrl}/candidate/detail`,
    CREATE: `${this.baseUrl}/candidate/create`,
    UPDATE: `${this.baseUrl}/candidate/update`,
    CHANGE_STATUS: `${this.baseUrl}/candidate/change-status`,
    HIRE_PREFILL: `${this.baseUrl}/candidate/hire-prefill`,
    LINK_EMPLOYEE: `${this.baseUrl}/candidate/link-employee`,
    STATUS_SUMMARY: `${this.baseUrl}/candidate/status-summary`,
  };

  INTERVIEW_SCHEDULE = {
    PAGINATION: `${this.baseUrl}/interview-schedule/pagination`,
    DETAIL: `${this.baseUrl}/interview-schedule/detail`,
    CREATE: `${this.baseUrl}/interview-schedule/create`,
    UPDATE: `${this.baseUrl}/interview-schedule/update`,
    CANCEL: `${this.baseUrl}/interview-schedule/cancel`,
    COMPLETE: `${this.baseUrl}/interview-schedule/complete`,
    SET_INTERVIEWERS: `${this.baseUrl}/interview-schedule/set-interviewers`,
    CALENDAR_RANGE: `${this.baseUrl}/interview-schedule/calendar-range`,
    EVALUATIONS: `${this.baseUrl}/interview-schedule/evaluations`,
    UPSERT_EVALUATIONS: `${this.baseUrl}/interview-schedule/upsert-evaluations`,
  };

  VIOLATION_TYPE = {
    PAGINATION: `${this.baseUrl}/violation-type/pagination`,
    LIST: `${this.baseUrl}/violation-type/list`,
    DETAIL: `${this.baseUrl}/violation-type/detail`,
    CREATE: `${this.baseUrl}/violation-type/create`,
    UPDATE: `${this.baseUrl}/violation-type/update`,
    DELETE: `${this.baseUrl}/violation-type/delete`,
  };

  VIOLATION = {
    PAGINATION: `${this.baseUrl}/violation/pagination`,
    DETAIL: `${this.baseUrl}/violation/detail`,
    CREATE: `${this.baseUrl}/violation/create`,
    UPDATE: `${this.baseUrl}/violation/update`,
    DELETE: `${this.baseUrl}/violation/delete`,
    CONFIRM: `${this.baseUrl}/violation/confirm`,
    CANCEL: `${this.baseUrl}/violation/cancel`,
  };

  ASSET_TYPE = {
    PAGINATION: `${this.baseUrl}/asset-type/pagination`,
    DETAIL: `${this.baseUrl}/asset-type/detail`,
    CREATE: `${this.baseUrl}/asset-type/create`,
    UPDATE: `${this.baseUrl}/asset-type/update`,
    DELETE: `${this.baseUrl}/asset-type/delete`,
    EXCEL_TEMPLATE: `${this.baseUrl}/asset-type/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/asset-type/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/asset-type/excel/import`,
  };

  ASSET = {
    PAGINATION: `${this.baseUrl}/asset/pagination`,
    DETAIL: `${this.baseUrl}/asset/detail`,
    CREATE: `${this.baseUrl}/asset/create`,
    UPDATE: `${this.baseUrl}/asset/update`,
    DELETE: `${this.baseUrl}/asset/delete`,
    SELECT_BOX: `${this.baseUrl}/asset/select-box`,
    EXCEL_TEMPLATE: `${this.baseUrl}/asset/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/asset/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/asset/excel/import`,
  };

  ASSET_TICKET = {
    PAGINATION: `${this.baseUrl}/asset-ticket/pagination`,
    DETAIL: `${this.baseUrl}/asset-ticket/detail`,
    CREATE: `${this.baseUrl}/asset-ticket/create`,
    UPDATE: `${this.baseUrl}/asset-ticket/update`,
    DELETE: `${this.baseUrl}/asset-ticket/delete`,
    COMPLETE: `${this.baseUrl}/asset-ticket/complete`,
    CANCEL: `${this.baseUrl}/asset-ticket/cancel`,
    EXCEL_TEMPLATE: `${this.baseUrl}/asset-ticket/excel/template`,
    EXCEL_EXPORT: `${this.baseUrl}/asset-ticket/excel/export`,
    EXCEL_IMPORT: `${this.baseUrl}/asset-ticket/excel/import`,
  };

  PERFORMANCE_CYCLE = {
    PAGINATION: `${this.baseUrl}/performance-cycle/pagination`,
    LIST: `${this.baseUrl}/performance-cycle/list`,
    DETAIL: `${this.baseUrl}/performance-cycle/detail`,
    CREATE: `${this.baseUrl}/performance-cycle/create`,
    UPDATE: `${this.baseUrl}/performance-cycle/update`,
    DELETE: `${this.baseUrl}/performance-cycle/delete`,
  };

  PERFORMANCE_DASHBOARD = {
    SUMMARY: `${this.baseUrl}/performance-dashboard/summary`,
  };

  PERFORMANCE_360 = {
    PAGINATION: `${this.baseUrl}/performance-360/pagination`,
    DETAIL: `${this.baseUrl}/performance-360/detail`,
    CREATE: `${this.baseUrl}/performance-360/create`,
    UPDATE: `${this.baseUrl}/performance-360/update`,
    DELETE: `${this.baseUrl}/performance-360/delete`,
  };

  KPI_GOAL = {
    PAGINATION: `${this.baseUrl}/kpi-goal/pagination`,
    LIST: `${this.baseUrl}/kpi-goal/list`,
    DETAIL: `${this.baseUrl}/kpi-goal/detail`,
    CREATE: `${this.baseUrl}/kpi-goal/create`,
    UPDATE: `${this.baseUrl}/kpi-goal/update`,
    DELETE: `${this.baseUrl}/kpi-goal/delete`,
  };

  KPI_RESULT = {
    PAGINATION: `${this.baseUrl}/kpi-result/pagination`,
    DETAIL: `${this.baseUrl}/kpi-result/detail`,
    CREATE: `${this.baseUrl}/kpi-result/create`,
    UPDATE: `${this.baseUrl}/kpi-result/update`,
    DELETE: `${this.baseUrl}/kpi-result/delete`,
  };

  COMPETENCY = {
    PAGINATION: `${this.baseUrl}/competency/pagination`,
    LIST: `${this.baseUrl}/competency/list`,
    DETAIL: `${this.baseUrl}/competency/detail`,
    CREATE: `${this.baseUrl}/competency/create`,
    UPDATE: `${this.baseUrl}/competency/update`,
    DELETE: `${this.baseUrl}/competency/delete`,
  };

  TRAINING_COURSE = {
    PAGINATION: `${this.baseUrl}/training-course/pagination`,
    LIST: `${this.baseUrl}/training-course/list`,
    DETAIL: `${this.baseUrl}/training-course/detail`,
    CREATE: `${this.baseUrl}/training-course/create`,
    UPDATE: `${this.baseUrl}/training-course/update`,
    DELETE: `${this.baseUrl}/training-course/delete`,
  };

  TRAINING_COURSE_MATERIAL = {
    PAGINATION: `${this.baseUrl}/training-course-material/pagination`,
    DETAIL: `${this.baseUrl}/training-course-material/detail`,
    CREATE: `${this.baseUrl}/training-course-material/create`,
    UPDATE: `${this.baseUrl}/training-course-material/update`,
    DELETE: `${this.baseUrl}/training-course-material/delete`,
  };

  TRAINING_QUIZ = {
    PAGINATION: `${this.baseUrl}/training-quiz/pagination`,
    DETAIL: `${this.baseUrl}/training-quiz/detail`,
    CREATE: `${this.baseUrl}/training-quiz/create`,
    UPDATE: `${this.baseUrl}/training-quiz/update`,
    DELETE: `${this.baseUrl}/training-quiz/delete`,
  };

  TRAINING_PROGRESS = {
    SUMMARY: `${this.baseUrl}/training-progress/summary`,
  };

  TRAINING_ENROLLMENT = {
    PAGINATION: `${this.baseUrl}/training-enrollment/pagination`,
    LIST: `${this.baseUrl}/training-enrollment/list`,
    DETAIL: `${this.baseUrl}/training-enrollment/detail`,
    CREATE: `${this.baseUrl}/training-enrollment/create`,
    UPDATE: `${this.baseUrl}/training-enrollment/update`,
    DELETE: `${this.baseUrl}/training-enrollment/delete`,
  };

  TRAINING_RESULT = {
    PAGINATION: `${this.baseUrl}/training-result/pagination`,
    DETAIL: `${this.baseUrl}/training-result/detail`,
    CREATE: `${this.baseUrl}/training-result/create`,
    UPDATE: `${this.baseUrl}/training-result/update`,
    DELETE: `${this.baseUrl}/training-result/delete`,
  };

  WORKFLOW_DEFINITION = {
    PAGINATION: `${this.baseUrl}/workflow-definition/pagination`,
    DETAIL: `${this.baseUrl}/workflow-definition/detail`,
    CREATE: `${this.baseUrl}/workflow-definition/create`,
    UPDATE: `${this.baseUrl}/workflow-definition/update`,
    DELETE: `${this.baseUrl}/workflow-definition/delete`,
    SET_STEPS: `${this.baseUrl}/workflow-definition/set-steps`,
  };

  WORKFLOW = {
    INBOX: `${this.baseUrl}/workflow/inbox`,
    DASHBOARD_SUMMARY: `${this.baseUrl}/workflow/dashboard-summary`,
    ADVANCE: `${this.baseUrl}/workflow/advance`,
    REJECT: `${this.baseUrl}/workflow/reject`,
  };

  WORKFLOW_FORM_TEMPLATE = {
    PAGINATION: `${this.baseUrl}/workflow-form-template/pagination`,
    DETAIL: `${this.baseUrl}/workflow-form-template/detail`,
    CREATE: `${this.baseUrl}/workflow-form-template/create`,
    UPDATE: `${this.baseUrl}/workflow-form-template/update`,
    DELETE: `${this.baseUrl}/workflow-form-template/delete`,
  };

  HOME = {
    DASHBOARD: `${this.baseUrl}/home/dashboard`,
  };

  ACTION_LOG = {
    BASE: `${this.baseUrl}/action-logs`,
  };

  COMPLIANCE = {
    SUMMARY: `${this.baseUrl}/compliance/summary`,
  };

  REPORT_SCHEDULE = {
    PAGINATION: `${this.baseUrl}/report-schedule/pagination`,
    DETAIL: `${this.baseUrl}/report-schedule/detail`,
    CREATE: `${this.baseUrl}/report-schedule/create`,
    UPDATE: `${this.baseUrl}/report-schedule/update`,
    DELETE: `${this.baseUrl}/report-schedule/delete`,
    RUN_DUE: `${this.baseUrl}/report-schedule/run-due`,
  };

  LEGAL_RATE_CONFIG = {
    PAGINATION: `${this.baseUrl}/legal-rate-config/pagination`,
    DETAIL: `${this.baseUrl}/legal-rate-config/detail`,
    CREATE: `${this.baseUrl}/legal-rate-config/create`,
    UPDATE: `${this.baseUrl}/legal-rate-config/update`,
    DELETE: `${this.baseUrl}/legal-rate-config/delete`,
  };

  SYSTEM_RETENTION = {
    DETAIL: `${this.baseUrl}/system-retention/detail`,
    UPDATE: `${this.baseUrl}/system-retention/update`,
  };

  IP_ALLOWLIST = {
    PAGINATION: `${this.baseUrl}/ip-allowlist/pagination`,
    DETAIL: `${this.baseUrl}/ip-allowlist/detail`,
    CREATE: `${this.baseUrl}/ip-allowlist/create`,
    UPDATE: `${this.baseUrl}/ip-allowlist/update`,
    DELETE: `${this.baseUrl}/ip-allowlist/delete`,
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

  NOTIFICATION = {
    PAGINATION: `${this.baseUrl}/notifications/pagination`,
    UNREAD_COUNT: `${this.baseUrl}/notifications/unread-count`,
    MARK_READ: `${this.baseUrl}/notifications/mark-read`,
    MARK_ALL_READ: `${this.baseUrl}/notifications/mark-all-read`,
    DELETE: `${this.baseUrl}/notifications/delete`,
    BROADCAST: `${this.baseUrl}/notifications/broadcast`,
    SETTINGS: `${this.baseUrl}/notifications/settings`,
  };
}
