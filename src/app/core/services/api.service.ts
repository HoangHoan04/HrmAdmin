import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EndpointService } from './endpoint.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly endpoints: EndpointService,
  ) {}

  get AUTH() {
    return this.endpoints.AUTH;
  }
  get COMPANY() {
    return this.endpoints.COMPANY;
  }
  get ORG_CHART() {
    return this.endpoints.ORG_CHART;
  }
  get BRANCH() {
    return this.endpoints.BRANCH;
  }
  get DEPARTMENT() {
    return this.endpoints.DEPARTMENT;
  }
  get PART() {
    return this.endpoints.PART;
  }
  get PART_MASTER() {
    return this.endpoints.PART_MASTER;
  }
  get POSITION() {
    return this.endpoints.POSITION;
  }
  get POSITION_MASTER() {
    return this.endpoints.POSITION_MASTER;
  }
  get EMPLOYEE() {
    return this.endpoints.EMPLOYEE;
  }
  get TIMEKEEPING_STANDARD() {
    return this.endpoints.TIMEKEEPING_STANDARD;
  }
  get SHIFT_MASTER() {
    return this.endpoints.SHIFT_MASTER;
  }
  get WORK_SCHEDULE() {
    return this.endpoints.WORK_SCHEDULE;
  }
  get EMPLOYEE_WORK_PATTERN() {
    return this.endpoints.EMPLOYEE_WORK_PATTERN;
  }
  get TIMEKEEPING() {
    return this.endpoints.TIMEKEEPING;
  }
  get ATTENDANCE_COMPLAINT() {
    return this.endpoints.ATTENDANCE_COMPLAINT;
  }
  get OVERTIME_REQUEST() {
    return this.endpoints.OVERTIME_REQUEST;
  }
  get DAY_OFF_CONFIG() {
    return this.endpoints.DAY_OFF_CONFIG;
  }
  get PUBLIC_HOLIDAY() {
    return this.endpoints.PUBLIC_HOLIDAY;
  }
  get REGISTER_DAY_OFF() {
    return this.endpoints.REGISTER_DAY_OFF;
  }
  get DAY_OFF_ALLOCATION() {
    return this.endpoints.DAY_OFF_ALLOCATION;
  }
  get CONTRACT_TYPE() {
    return this.endpoints.CONTRACT_TYPE;
  }
  get CONTRACT() {
    return this.endpoints.CONTRACT;
  }
  get REVIEW_RENEWAL() {
    return this.endpoints.REVIEW_RENEWAL;
  }
  get TRANSFER_EMPLOYEE() {
    return this.endpoints.TRANSFER_EMPLOYEE;
  }
  get SALARY() {
    return this.endpoints.SALARY;
  }
  get SALARY_CONFIG() {
    return this.endpoints.SALARY_CONFIG;
  }
  get ALLOWANCE() {
    return this.endpoints.ALLOWANCE;
  }
  get ADVANCE() {
    return this.endpoints.ADVANCE;
  }
  get PAYROLL_SLIP() {
    return this.endpoints.PAYROLL_SLIP;
  }
  get PERMISSION() {
    return this.endpoints.PERMISSION;
  }
  get ROLE() {
    return this.endpoints.ROLE;
  }
  get USER_ROLE() {
    return this.endpoints.USER_ROLE;
  }
  get USER() {
    return this.endpoints.USER;
  }
  get HEADCOUNT() {
    return this.endpoints.HEADCOUNT;
  }
  get JOB_DESCRIPTION() {
    return this.endpoints.JOB_DESCRIPTION;
  }
  get EVALUATION_CRITERIA() {
    return this.endpoints.EVALUATION_CRITERIA;
  }
  get HIRING_SOURCE() {
    return this.endpoints.HIRING_SOURCE;
  }
  get RECRUITMENT_REQUEST() {
    return this.endpoints.RECRUITMENT_REQUEST;
  }
  get HIRING_PLAN() {
    return this.endpoints.HIRING_PLAN;
  }
  get CANDIDATE() {
    return this.endpoints.CANDIDATE;
  }
  get INTERVIEW_SCHEDULE() {
    return this.endpoints.INTERVIEW_SCHEDULE;
  }
  get VIOLATION_TYPE() {
    return this.endpoints.VIOLATION_TYPE;
  }
  get VIOLATION() {
    return this.endpoints.VIOLATION;
  }
  get ASSET_TYPE() {
    return this.endpoints.ASSET_TYPE;
  }
  get ASSET() {
    return this.endpoints.ASSET;
  }
  get ASSET_TICKET() {
    return this.endpoints.ASSET_TICKET;
  }
  get PERFORMANCE_CYCLE() {
    return this.endpoints.PERFORMANCE_CYCLE;
  }
  get PERFORMANCE_DASHBOARD() {
    return this.endpoints.PERFORMANCE_DASHBOARD;
  }
  get PERFORMANCE_360() {
    return this.endpoints.PERFORMANCE_360;
  }
  get KPI_GOAL() {
    return this.endpoints.KPI_GOAL;
  }
  get KPI_RESULT() {
    return this.endpoints.KPI_RESULT;
  }
  get COMPETENCY() {
    return this.endpoints.COMPETENCY;
  }
  get TRAINING_COURSE() {
    return this.endpoints.TRAINING_COURSE;
  }
  get TRAINING_COURSE_MATERIAL() {
    return this.endpoints.TRAINING_COURSE_MATERIAL;
  }
  get TRAINING_QUIZ() {
    return this.endpoints.TRAINING_QUIZ;
  }
  get TRAINING_PROGRESS() {
    return this.endpoints.TRAINING_PROGRESS;
  }
  get TRAINING_ENROLLMENT() {
    return this.endpoints.TRAINING_ENROLLMENT;
  }
  get TRAINING_RESULT() {
    return this.endpoints.TRAINING_RESULT;
  }
  get WORKFLOW_DEFINITION() {
    return this.endpoints.WORKFLOW_DEFINITION;
  }
  get WORKFLOW() {
    return this.endpoints.WORKFLOW;
  }
  get WORKFLOW_FORM_TEMPLATE() {
    return this.endpoints.WORKFLOW_FORM_TEMPLATE;
  }
  get HOME() {
    return this.endpoints.HOME;
  }
  get ACTION_LOG() {
    return this.endpoints.ACTION_LOG;
  }
  get COMPLIANCE() {
    return this.endpoints.COMPLIANCE;
  }
  get REPORT_SCHEDULE() {
    return this.endpoints.REPORT_SCHEDULE;
  }
  get LEGAL_RATE_CONFIG() {
    return this.endpoints.LEGAL_RATE_CONFIG;
  }
  get NOTIFICATION_TEMPLATE() {
    return this.endpoints.NOTIFICATION_TEMPLATE;
  }
  get API_CLIENT_KEY() {
    return this.endpoints.API_CLIENT_KEY;
  }
  get WEBHOOK_SUBSCRIPTION() {
    return this.endpoints.WEBHOOK_SUBSCRIPTION;
  }
  get SYSTEM_RETENTION() {
    return this.endpoints.SYSTEM_RETENTION;
  }
  get SMS_GATEWAY_CONFIG() {
    return this.endpoints.SMS_GATEWAY_CONFIG;
  }
  get ZALO_OA_CONFIG() {
    return this.endpoints.ZALO_OA_CONFIG;
  }
  get INTEGRATIONS() {
    return this.endpoints.INTEGRATIONS;
  }
  get TIMEKEEPING_PUNCH() {
    return this.endpoints.TIMEKEEPING_PUNCH;
  }
  get IP_ALLOWLIST() {
    return this.endpoints.IP_ALLOWLIST;
  }
  get NOTIFICATION() {
    return this.endpoints.NOTIFICATION;
  }
  get UPLOAD_FILE() {
    return this.endpoints.UPLOAD_FILE;
  }

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  getText(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'text' });
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body);
  }

  postBlob(url: string, body: any = {}): Observable<HttpResponse<Blob>> {
    return this.http.post(url, body, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  uploadFile<T>(url: string, file: File, fieldName = 'file'): Observable<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.http.post<T>(url, formData);
  }

  uploadFileWithFields<T>(
    url: string,
    file: File,
    fields?: Record<string, string>,
    fieldName = 'file',
  ): Observable<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    if (fields) {
      Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    }
    return this.http.post<T>(url, formData);
  }

  uploadFiles<T>(url: string, files: File[], fieldName = 'files'): Observable<T> {
    const formData = new FormData();
    files.forEach((file) => formData.append(fieldName, file));
    return this.http.post<T>(url, formData);
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
