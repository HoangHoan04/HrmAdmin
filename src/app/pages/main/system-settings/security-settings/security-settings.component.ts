import { SsoStatus, TwoFactorSetup } from '@/app/core/models';
import { AuthService, I18nMessageService } from '@/app/core/services';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-security-settings',
  templateUrl: './security-settings.component.html',
  styleUrls: [],
})
export class SecuritySettingsComponent implements OnInit {
  loading = false;
  setupLoading = false;
  enableLoading = false;
  disableLoading = false;
  twoFactorEnabled = false;
  setup: TwoFactorSetup | null = null;
  enableCode = '';
  disableCode = '';
  disablePassword = '';
  ssoStatus: SsoStatus | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.auth.getInfoUser().subscribe({
      next: (res) => {
        this.twoFactorEnabled = !!res?.twoFactorEnabled;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
    this.auth.getSsoStatus().subscribe({
      next: (res) => (this.ssoStatus = res),
      error: () => (this.ssoStatus = null),
    });
  }

  startSetup(): void {
    this.setupLoading = true;
    this.auth.setupTwoFactor().subscribe({
      next: (res) => {
        this.setup = res;
        this.setupLoading = false;
        this.message.success(this.i18n.instant('system.security.setupReady'));
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.setupLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  enable(): void {
    if (!this.enableCode || this.enableCode.trim().length !== 6) {
      this.message.warning(this.i18n.instant('system.security.codeRequired'));
      return;
    }
    this.enableLoading = true;
    this.auth.enableTwoFactor(this.enableCode.trim()).subscribe({
      next: () => {
        this.twoFactorEnabled = true;
        this.enableCode = '';
        this.setup = null;
        this.enableLoading = false;
        this.message.success(this.i18n.instant('system.security.enableSuccess'));
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.enableLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  disable(): void {
    if (!this.disableCode || this.disableCode.trim().length !== 6) {
      this.message.warning(this.i18n.instant('system.security.codeRequired'));
      return;
    }
    this.disableLoading = true;
    this.auth.disableTwoFactor(this.disableCode.trim(), this.disablePassword || undefined).subscribe({
      next: () => {
        this.twoFactorEnabled = false;
        this.disableCode = '';
        this.disablePassword = '';
        this.disableLoading = false;
        this.message.success(this.i18n.instant('system.security.disableSuccess'));
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.disableLoading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
