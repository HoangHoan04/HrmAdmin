import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';
  isModalVisible = false;
  rememberMe = false;
  passwordVisible = false;
  requiresTwoFactor = false;
  twoFactorCode = '';
  tempToken = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private readonly translate: TranslateService,
  ) {}

  openContactModal(): void {
    this.isModalVisible = true;
  }

  closeContactModal(): void {
    this.isModalVisible = false;
  }

  onLogin(): void {
    this.error = '';
    if (this.requiresTwoFactor) {
      this.submitTwoFactor();
      return;
    }
    if (!this.username || !this.password) {
      this.error = this.translate.instant('common.messages.loginRequired');
      return;
    }
    this.loading = true;
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.requiresTwoFactor) {
          this.requiresTwoFactor = true;
          this.tempToken = res.tempToken || this.auth.twoFactorTempToken || '';
          return;
        }
        if (res && res.mustChangePassword) {
          this.router.navigateByUrl('/auth/change-password');
        } else {
          this.router.navigateByUrl('/');
        }
      },
      error: (err) => {
        this.loading = false;
        this.error =
          typeof err.error === 'string'
            ? err.error
            : this.translate.instant('common.messages.invalidCredentials');
      },
    });
  }

  submitTwoFactor(): void {
    if (!this.twoFactorCode || this.twoFactorCode.trim().length !== 6) {
      this.error = this.translate.instant('auth.twoFactorCodeRequired');
      return;
    }
    const token = this.tempToken || this.auth.twoFactorTempToken || '';
    if (!token) {
      this.error = this.translate.instant('auth.twoFactorExpired');
      this.requiresTwoFactor = false;
      return;
    }
    this.loading = true;
    this.auth.verifyTwoFactor(token, this.twoFactorCode.trim()).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.mustChangePassword) {
          this.router.navigateByUrl('/auth/change-password');
        } else {
          this.router.navigateByUrl('/');
        }
      },
      error: (err) => {
        this.loading = false;
        this.error =
          typeof err.error === 'string'
            ? err.error
            : this.translate.instant('auth.twoFactorInvalid');
      },
    });
  }

  backToPassword(): void {
    this.requiresTwoFactor = false;
    this.twoFactorCode = '';
    this.error = '';
  }
}
