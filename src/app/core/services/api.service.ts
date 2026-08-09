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
  get TIMEKEEPING() {
    return this.endpoints.TIMEKEEPING;
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
  get ACTION_LOG() {
    return this.endpoints.ACTION_LOG;
  }
  get ORGANIZATION() {
    return this.endpoints.ORGANIZATION;
  }
  get UPLOAD_FILE() {
    return this.endpoints.UPLOAD_FILE;
  }

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
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
