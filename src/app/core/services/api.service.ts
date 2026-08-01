import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EndpointService } from './endpoint.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly endpoints: EndpointService
  ) { }

  get AUTH() { return this.endpoints.AUTH; }
  get COMPANY() { return this.endpoints.COMPANY; }
  get BRANCH() { return this.endpoints.BRANCH; }
  get ACTION_LOG() { return this.endpoints.ACTION_LOG; }

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

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
