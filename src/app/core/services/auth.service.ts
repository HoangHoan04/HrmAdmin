import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { PermissionService } from './permission.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY_USER = 'auth_user';
  private readonly KEY_EMAIL = 'auth_email';
  private readonly KEY_TOKEN = 'auth_token';
  private readonly KEY_REFRESH_TOKEN = 'auth_refresh_token';
  private readonly KEY_TEMP_2FA = 'auth_2fa_temp';
  private readonly KEY_ROLE = 'auth_role';
  private readonly KEY_USER_ID = 'auth_user_id';

  constructor(
    private readonly apiService: ApiService,
    private readonly permissionService: PermissionService,
  ) {}

  get isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.KEY_TOKEN);
  }

  get currentUser(): string | null {
    return sessionStorage.getItem(this.KEY_USER);
  }

  get currentEmail(): string | null {
    return sessionStorage.getItem(this.KEY_EMAIL);
  }

  get currentRole(): string | null {
    return sessionStorage.getItem(this.KEY_ROLE);
  }

  get currentUserId(): string | null {
    return sessionStorage.getItem(this.KEY_USER_ID);
  }

  get token(): string | null {
    return sessionStorage.getItem(this.KEY_TOKEN);
  }

  get refreshToken(): string | null {
    return sessionStorage.getItem(this.KEY_REFRESH_TOKEN);
  }

  get twoFactorTempToken(): string | null {
    return sessionStorage.getItem(this.KEY_TEMP_2FA);
  }

  login(identifier: string, password: string, code2fa?: string): Observable<any> {
    const payload = {
      email: identifier,
      password,
      code2fa: code2fa || null,
    };
    return this.apiService
      .post<any>(this.apiService.AUTH.LOGIN, payload)
      .pipe(tap((res) => this.applyLoginResponse(res)));
  }

  verifyTwoFactor(tempToken: string, code: string): Observable<any> {
    const payload = {
      email: this.currentEmail || '',
      password: '',
      code2fa: code,
    };
    return this.apiService
      .post<any>(this.apiService.AUTH.LOGIN, payload)
      .pipe(tap((res) => this.applyLoginResponse(res)));
  }

  setupTwoFactor(): Observable<any> {
    return this.apiService.post<any>(this.apiService.AUTH.TWO_FA_SETUP, {});
  }

  enableTwoFactor(code: string): Observable<any> {
    return this.apiService.post<any>(this.apiService.AUTH.TWO_FA_ENABLE, { code });
  }

  disableTwoFactor(code: string, password?: string): Observable<any> {
    return this.apiService.post<any>(this.apiService.AUTH.TWO_FA_DISABLE, { code, password });
  }

  getSsoStatus(): Observable<any> {
    return this.apiService.get<any>(this.apiService.AUTH.SSO_STATUS);
  }

  listSessions(body: { includeRevoked?: boolean; allUsers?: boolean } = {}): Observable<any> {
    return this.apiService.get<any>(this.apiService.AUTH.SESSIONS_LIST);
  }

  revokeSession(id: string): Observable<any> {
    return this.apiService.delete<any>(`${this.apiService.AUTH.SESSIONS_REVOKE}/${id}`);
  }

  logout(): void {
    const rfToken = this.refreshToken;
    if (rfToken) {
      this.apiService.post<any>(this.apiService.AUTH.LOGOUT, { refreshToken: rfToken }).subscribe({
        next: () => {},
        error: () => {},
      });
    }
    sessionStorage.removeItem(this.KEY_TOKEN);
    sessionStorage.removeItem(this.KEY_REFRESH_TOKEN);
    sessionStorage.removeItem(this.KEY_USER);
    sessionStorage.removeItem(this.KEY_EMAIL);
    sessionStorage.removeItem(this.KEY_ROLE);
    sessionStorage.removeItem(this.KEY_USER_ID);
    sessionStorage.removeItem(this.KEY_TEMP_2FA);
    this.permissionService.clear();
  }

  refreshTokens(refreshToken: string): Observable<any> {
    return this.apiService.post<any>(this.apiService.AUTH.REFRESH, { refreshToken }).pipe(
      tap((res) => {
        const token = res?.accessToken || res?.token;
        const newRefreshToken = res?.refreshToken || refreshToken;
        if (token) {
          sessionStorage.setItem(this.KEY_TOKEN, token);
          sessionStorage.setItem(this.KEY_REFRESH_TOKEN, newRefreshToken);
          const user = res.user;
          if (user) {
            const userName = user.fullName || user.email || res.username;
            if (userName) sessionStorage.setItem(this.KEY_USER, userName);
            if (user.email) sessionStorage.setItem(this.KEY_EMAIL, user.email);
            if (user.role) sessionStorage.setItem(this.KEY_ROLE, user.role);
            if (user.id) sessionStorage.setItem(this.KEY_USER_ID, user.id);

            const roles = user.role ? [user.role] : (Array.isArray(res.roles) ? res.roles : []);
            this.permissionService.setAuthContext({
              roles,
              permissions: Array.isArray(res.permissions) ? res.permissions : [],
              type: user.role ?? res.type ?? this.permissionService.userType,
            });
          }
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
    return this.apiService.post<any>(this.apiService.AUTH.RESET_PASSWORD, body);
  }

  getInfoUser(): Observable<any> {
    return this.apiService.get<any>(this.apiService.AUTH.ME).pipe(
      tap((user) => {
        if (!user) return;
        const userName = user.fullName || user.email || user.username;
        if (userName) sessionStorage.setItem(this.KEY_USER, userName);
        if (user.email) sessionStorage.setItem(this.KEY_EMAIL, user.email);
        if (user.role) sessionStorage.setItem(this.KEY_ROLE, user.role);
        if (user.id) sessionStorage.setItem(this.KEY_USER_ID, user.id);

        const roles = user.role ? [user.role] : (Array.isArray(user.roles) ? user.roles : []);
        this.permissionService.setAuthContext({
          roles,
          permissions: Array.isArray(user.permissions) ? user.permissions : [],
          type: user.role ?? user.type ?? this.permissionService.userType,
        });
      }),
    );
  }

  private applyLoginResponse(res: any): void {
    if (!res) return;
    if (res.requiresTwoFactor && res.tempToken) {
      sessionStorage.setItem(this.KEY_TEMP_2FA, res.tempToken);
      if (res.username) sessionStorage.setItem(this.KEY_USER, res.username);
      return;
    }
    const token = res.accessToken || res.token;
    if (token) {
      sessionStorage.removeItem(this.KEY_TEMP_2FA);
      sessionStorage.setItem(this.KEY_TOKEN, token);
      if (res.refreshToken) sessionStorage.setItem(this.KEY_REFRESH_TOKEN, res.refreshToken);

      const user = res.user;
      const userName = user?.fullName || user?.email || res.username;
      const userEmail = user?.email || res.email;
      const userRole = user?.role || res.role;
      const userId = user?.id || res.userId;

      if (userName) sessionStorage.setItem(this.KEY_USER, userName);
      if (userEmail) sessionStorage.setItem(this.KEY_EMAIL, userEmail);
      if (userRole) sessionStorage.setItem(this.KEY_ROLE, userRole);
      if (userId) sessionStorage.setItem(this.KEY_USER_ID, userId);

      const roles = userRole ? [userRole] : (Array.isArray(res.roles) ? res.roles : []);
      this.permissionService.setAuthContext({
        roles,
        permissions: Array.isArray(res.permissions) ? res.permissions : [],
        type: userRole ?? res.type ?? null,
      });
    }
  }
}
