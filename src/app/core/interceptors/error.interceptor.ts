import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NetworkErrorToastService } from '../services/network-error-toast.service';
import { isHttpNetworkError } from '../utils/http-network-error';

/** API danh sách tra cứu cho ô chọn (dropdown). */
const LOOKUP_URL_PATTERN = /\/(select-box|load-by-[a-z-]+)(\?|$)/i;

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('i18n/')) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: unknown) => {
        // Không có quyền tải danh sách cho ô chọn -> hiển thị ô chọn rỗng thay vì làm vỡ cả trang.
        // Server vẫn từ chối (không lộ dữ liệu); nhiều màn hình gọi các API này mà không tự bắt lỗi.
        if (
          error instanceof HttpErrorResponse &&
          error.status === 403 &&
          LOOKUP_URL_PATTERN.test(req.url)
        ) {
          console.warn(`[Lookup] Không có quyền tải danh sách: ${req.url}`);
          return of(new HttpResponse({ status: 200, body: [], url: req.url }));
        }

        if (isHttpNetworkError(error)) {
          const networkToast = this.injector.get(NetworkErrorToastService);
          const message = networkToast.notify();
          const original = error as HttpErrorResponse;
          return throwError(
            () =>
              new HttpErrorResponse({
                error: message,
                headers: original.headers,
                status: 0,
                statusText: original.statusText || 'Unknown Error',
                url: original.url ?? undefined,
              }),
          );
        }
        return throwError(() => error);
      }),
    );
  }
}
