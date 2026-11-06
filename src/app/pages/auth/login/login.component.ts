import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  rememberMe = true;
  showPassword = false;
  loading = false;
  errorMessage: string | null = null;

  // 2FA state
  requiresTwoFactor = false;
  twoFactorCode = '';

  // Support / Account Request Modal
  showSupportModal = false;

  private readonly STORAGE_REMEMBER_KEY = 'hrm_remember_user';
  private readonly STORAGE_REMEMBER_FLAG = 'hrm_remember_flag';

  constructor(
    private readonly router: Router,
    private readonly auth: AuthService,
    private readonly translate: TranslateService,
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn) {
      this.router.navigateByUrl('/');
      return;
    }

    const savedFlag = localStorage.getItem(this.STORAGE_REMEMBER_FLAG);
    if (savedFlag !== null) {
      this.rememberMe = savedFlag === 'true';
    }

    if (this.rememberMe) {
      const savedUser = localStorage.getItem(this.STORAGE_REMEMBER_KEY);
      if (savedUser) {
        this.username = savedUser;
      }
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  quickFill(account: 'admin'): void {
    if (account === 'admin') {
      this.username = 'admin';
      this.password = 'admin123@';
      this.errorMessage = null;
    }
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (!this.username.trim()) {
      this.errorMessage = this.translate.instant('auth.fillAllFields') || 'Vui lòng nhập tên đăng nhập.';
      return;
    }

    if (!this.password) {
      this.errorMessage = this.translate.instant('auth.fillAllFields') || 'Vui lòng nhập mật khẩu.';
      return;
    }

    if (this.requiresTwoFactor && (!this.twoFactorCode || this.twoFactorCode.trim().length !== 6)) {
      this.errorMessage = this.translate.instant('auth.twoFactorCodeRequired') || 'Vui lòng nhập mã xác thực 6 chữ số.';
      return;
    }

    this.loading = true;

    this.auth.login(
      this.username.trim(),
      this.password,
      this.requiresTwoFactor ? this.twoFactorCode.trim() : undefined,
    ).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res?.requiresTwoFactor) {
          this.requiresTwoFactor = true;
          this.errorMessage = null;
          return;
        }

        // Handle Remember Me
        if (this.rememberMe) {
          localStorage.setItem(this.STORAGE_REMEMBER_KEY, this.username.trim());
          localStorage.setItem(this.STORAGE_REMEMBER_FLAG, 'true');
        } else {
          localStorage.removeItem(this.STORAGE_REMEMBER_KEY);
          localStorage.setItem(this.STORAGE_REMEMBER_FLAG, 'false');
        }

        if (res?.mustChangePassword) {
          this.router.navigateByUrl('/auth/change-password');
        } else {
          this.router.navigateByUrl('/');
        }
      },
      error: (err) => {
        this.loading = false;
        if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else if (typeof err?.error === 'string') {
          this.errorMessage = err.error;
        } else if (err?.status === 0) {
          this.errorMessage = 'Không thể kết nối đến máy chủ API (HRMApi). Vui lòng kiểm tra backend đang chạy.';
        } else if (err?.status === 401) {
          this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác.';
        } else if (err?.status === 403) {
          this.errorMessage = 'Tài khoản của bạn đã bị vô hiệu hóa hoặc không có quyền truy cập.';
        } else if (err?.status === 423) {
          this.errorMessage = err?.error?.message || 'Tài khoản tạm thời bị khóa do nhiều lần đăng nhập thất bại.';
        } else {
          this.errorMessage = this.translate.instant('auth.requestFailed') || 'Đăng nhập không thành công. Vui lòng thử lại.';
        }
      },
    });
  }

  cancelTwoFactor(): void {
    this.requiresTwoFactor = false;
    this.twoFactorCode = '';
    this.errorMessage = null;
  }

  openSupportModal(): void {
    this.showSupportModal = true;
  }

  closeSupportModal(): void {
    this.showSupportModal = false;
  }
}
