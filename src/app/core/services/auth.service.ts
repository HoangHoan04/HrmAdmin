import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY_USER = 'auth_user';
  private readonly KEY_TOKEN = 'auth_token';
  private readonly KEY_REFRESH_TOKEN = 'auth_refresh_token';

  constructor(private readonly apiService: ApiService) {}

  get isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.KEY_TOKEN);
  }

  get currentUser(): string | null {
    return sessionStorage.getItem(this.KEY_USER);
  }

  get token(): string | null {
    return sessionStorage.getItem(this.KEY_TOKEN);
  }

  get refreshToken(): string | null {
    return sessionStorage.getItem(this.KEY_REFRESH_TOKEN);
  }

  login(username: string, password: string): Observable<any> {
    return this.apiService.post<any>(this.apiService.AUTH.LOGIN, { username, password }).pipe(
      tap((res) => {
        if (res && res.token) {
          sessionStorage.setItem(this.KEY_TOKEN, res.token);
          sessionStorage.setItem(this.KEY_REFRESH_TOKEN, res.refreshToken);
          sessionStorage.setItem(this.KEY_USER, res.username);
        }
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.KEY_TOKEN);
    sessionStorage.removeItem(this.KEY_REFRESH_TOKEN);
    sessionStorage.removeItem(this.KEY_USER);
  }

  refreshTokens(refreshToken: string): Observable<any> {
    return this.apiService.post<any>(this.apiService.AUTH.REFRESH, { refreshToken }).pipe(
      tap((res) => {
        if (res && res.token) {
          sessionStorage.setItem(this.KEY_TOKEN, res.token);
          sessionStorage.setItem(this.KEY_REFRESH_TOKEN, res.refreshToken);
        }
      }),
    );
  }

  changePassword(body: any): Observable<any> {
    return this.apiService.post<any>(this.apiService.AUTH.CHANGE_PASSWORD, body);
  }

  forgotPassword(email: string): Observable<any> {
    return this.apiService.post<any>(this.apiService.AUTH.FORGOT_PASSWORD, { email });
  }

  resetPasswordWithOtp(body: any): Observable<any> {
    return this.apiService.post<any>(this.apiService.AUTH.RESET_PASSWORD_WITH_OTP, body);
  }

  getInfoUser(): Observable<any> {
    return this.apiService.get<any>(this.apiService.AUTH.ME);
  }
}
