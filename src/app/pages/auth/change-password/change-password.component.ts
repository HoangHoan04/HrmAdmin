import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  loading = false;
  error = '';

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly message: NzMessageService,
    private readonly translate: TranslateService,
  ) {}

  onSubmit(): void {
    this.error = '';

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.error = this.translate.instant('auth.fillAllFields');
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = this.translate.instant('auth.newPasswordMinLength');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = this.translate.instant('auth.passwordMismatch');
      return;
    }

    this.loading = true;
    this.authService
      .changePassword({
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.message.success(this.translate.instant('auth.passwordUpdateSuccess'));
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.loading = false;
          this.error =
            typeof err.error === 'string'
              ? err.error
              : err.error?.message || this.translate.instant('auth.changePasswordFailed');
        },
      });
  }

  goBack(): void {
    this.router.navigateByUrl('/');
  }
}
