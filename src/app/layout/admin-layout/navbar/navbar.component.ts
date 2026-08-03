import {
  AuthService,
  DashboardService,
  DashboardSettings,
  SidebarService,
} from '@/app/core/services';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private sidebarService: SidebarService,
    private dashboardService: DashboardService,
    private auth: AuthService,
    private router: Router,
    private message: NzMessageService,
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
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    this.auth.getInfoUser().subscribe({
      next: (user) => {
        if (user) {
          this.username = user.username;
          this.email = user.email;
          this.avatarText = this.username ? this.username.substring(0, 2).toUpperCase() : 'US';
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.username = 'User';
        this.email = '';
        this.avatarText = 'US';
        this.cdr.detectChanges();
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
      this.changePasswordError = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.changePasswordError = 'Mật khẩu mới phải có tối thiểu 6 ký tự.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.changePasswordError = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    this.changePasswordLoading = true;
    this.cdr.detectChanges();

    this.auth
      .changePassword({
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.changePasswordLoading = false;
          this.changePasswordVisible = false;
          this.message.success('Đổi mật khẩu thành công!');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.changePasswordLoading = false;
          this.changePasswordError =
            typeof err.error === 'string'
              ? err.error
              : err.error?.message || 'Có lỗi xảy ra khi đổi mật khẩu.';
          this.cdr.detectChanges();
        },
      });
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
