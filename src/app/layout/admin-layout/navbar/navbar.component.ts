import {
  AuthService,
  DashboardService,
  DashboardSettings,
  SidebarService,
} from '@/app/core/services';
import { TwoFactorSetup } from '@/app/core/models/system/settings.models';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  s: DashboardSettings;
  collapsed = false;
  username = '';
  email = '';
  avatarText = '';
  private sub = new Subscription();

  changePasswordVisible = false;
  changePasswordLoading = false;
  changePasswordError = '';
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Xác thực 2 bước (TOTP)
  twoFactorEnabled = false;
  twoFactorVisible = false;
  twoFactorLoading = false;
  twoFactorError = '';
  twoFactorSetup: TwoFactorSetup | null = null;
  twoFactorCode = '';
  twoFactorPassword = '';

  constructor(
    private sidebarService: SidebarService,
    private dashboardService: DashboardService,
    private auth: AuthService,
    private router: Router,
    private message: NzMessageService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {
    this.s = dashboardService.snapshot;
    this.sidebarService.collapsed$.subscribe((v) => (this.collapsed = v));
  }

  ngOnInit(): void {
    this.sub.add(
      this.dashboardService.settings$.subscribe((settings) => {
        this.s = settings;
      }),
    );
    const sessionUser = this.auth.currentUser;
    if (sessionUser) {
      this.username = sessionUser;
      this.avatarText = sessionUser.substring(0, 2).toUpperCase();
      this.email = this.auth.currentEmail || '';
    }
    if (!this.email) {
      setTimeout(() => this.loadUserInfo(), 0);
    } else {
      setTimeout(() => this.loadUserInfo(), 400);
    }
  }

  loadUserInfo(): void {
    this.auth.getInfoUser().subscribe({
      next: (user) => {
        setTimeout(() => {
          if (user) {
            this.username = user.username;
            this.email = user.email;
            this.twoFactorEnabled = !!user.twoFactorEnabled;
            this.avatarText = this.username ? this.username.substring(0, 2).toUpperCase() : 'US';
          } else {
            this.username = this.auth.currentUser || 'User';
            this.email = '';
            this.avatarText = this.username.substring(0, 2).toUpperCase() || 'US';
          }
          this.cdr.markForCheck();
        });
      },
      error: () => {
        setTimeout(() => {
          this.username = this.auth.currentUser || 'User';
          this.email = '';
          this.avatarText = this.username ? this.username.substring(0, 2).toUpperCase() : 'US';
          this.cdr.markForCheck();
        });
      },
    });
  }

  openChangePasswordModal(): void {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.changePasswordError = '';
    this.showOldPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    this.changePasswordVisible = true;
    this.cdr.detectChanges();
  }

  closeChangePasswordModal(): void {
    this.changePasswordVisible = false;
    this.cdr.detectChanges();
  }

  submitChangePassword(): void {
    this.changePasswordError = '';

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.changePasswordError = this.translate.instant('auth.fillAllFields');
      return;
    }

    if (this.newPassword.length < 6) {
      this.changePasswordError = this.translate.instant('auth.newPasswordMinLength');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.changePasswordError = this.translate.instant('auth.passwordMismatch');
      return;
    }

    this.changePasswordLoading = true;
    this.cdr.detectChanges();

    this.auth
      .changePassword({
        currentPassword: this.oldPassword,
        newPassword: this.newPassword,
        confirmNewPassword: this.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.changePasswordLoading = false;
          this.changePasswordVisible = false;
          this.message.success(this.translate.instant('auth.changePasswordSuccess'));
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.changePasswordLoading = false;
          this.changePasswordError =
            typeof err.error === 'string'
              ? err.error
              : err.error?.message || this.translate.instant('auth.changePasswordFailed');
          this.cdr.detectChanges();
        },
      });
  }

  openTwoFactorModal(): void {
    this.twoFactorError = '';
    this.twoFactorSetup = null;
    this.twoFactorCode = '';
    this.twoFactorPassword = '';
    this.twoFactorVisible = true;
    this.cdr.detectChanges();
  }

  closeTwoFactorModal(): void {
    this.twoFactorVisible = false;
    this.twoFactorSetup = null;
    this.cdr.detectChanges();
  }

  /** Bước 1 khi bật: sinh secret + mã QR */
  startTwoFactorSetup(): void {
    this.twoFactorError = '';
    this.twoFactorLoading = true;
    this.auth.setupTwoFactor().subscribe({
      next: (res) => {
        this.twoFactorLoading = false;
        this.twoFactorSetup = res;
        this.cdr.detectChanges();
      },
      error: (err) => this.handleTwoFactorError(err),
    });
  }

  /** Bước 2 khi bật: xác nhận mã 6 số từ ứng dụng Authenticator */
  confirmEnableTwoFactor(): void {
    if (!/^\d{6}$/.test(this.twoFactorCode.trim())) {
      this.twoFactorError = this.translate.instant('auth.twoFactorCodeRequired');
      return;
    }
    this.twoFactorError = '';
    this.twoFactorLoading = true;
    this.auth.enableTwoFactor(this.twoFactorCode.trim()).subscribe({
      next: (res) => {
        this.twoFactorLoading = false;
        this.twoFactorEnabled = true;
        this.twoFactorVisible = false;
        this.twoFactorSetup = null;
        this.message.success(res?.message || this.translate.instant('navbar.twoFactorEnabledMsg'));
        this.cdr.detectChanges();
      },
      error: (err) => this.handleTwoFactorError(err),
    });
  }

  confirmDisableTwoFactor(): void {
    if (!this.twoFactorPassword || !/^\d{6}$/.test(this.twoFactorCode.trim())) {
      this.twoFactorError = this.translate.instant('auth.fillAllFields');
      return;
    }
    this.twoFactorError = '';
    this.twoFactorLoading = true;
    this.auth.disableTwoFactor(this.twoFactorCode.trim(), this.twoFactorPassword).subscribe({
      next: (res) => {
        this.twoFactorLoading = false;
        this.twoFactorEnabled = false;
        this.twoFactorVisible = false;
        this.message.success(res?.message || this.translate.instant('navbar.twoFactorDisabledMsg'));
        this.cdr.detectChanges();
      },
      error: (err) => this.handleTwoFactorError(err),
    });
  }

  private handleTwoFactorError(err: any): void {
    this.twoFactorLoading = false;
    this.twoFactorError =
      typeof err?.error === 'string'
        ? err.error
        : err?.error?.message || this.translate.instant('auth.requestFailed');
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  openSettings(): void {
    this.dashboardService.setConfigOpen(true);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
