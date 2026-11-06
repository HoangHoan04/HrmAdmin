import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  step: 1 | 2 | 3 = 1;
  email = '';
  otp: string[] = ['', '', '', '', '', ''];
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;
  loading = false;
  error = '';
  info = '';
  /** Thời gian hiệu lực OTP (giây) — khớp với backend (5 phút) */
  otpTimer = 300;
  /** Thời gian chờ trước khi được gửi lại mã (giây) */
  resendCooldown = 0;
  private otpInterval: ReturnType<typeof setInterval> | null = null;

  private static readonly OTP_LIFETIME = 300;
  private static readonly RESEND_COOLDOWN = 60;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private readonly translate: TranslateService,
    private readonly message: NzMessageService,
  ) {}

  ngOnInit(): void {
    const path = this.router.url.split('?')[0];
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.email = email;
    }
    // /auth/reset-password?email=... → vào thẳng bước nhập OTP
    if (path === '/auth/reset-password' && this.email) {
      this.step = 2;
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  get isOtpExpired(): boolean {
    return this.otpTimer <= 0;
  }

  get timerDisplay(): string {
    const m = Math.floor(this.otpTimer / 60);
    const s = this.otpTimer % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  get otpValue(): string {
    return this.otp.join('');
  }

  requestOtp(): void {
    this.error = '';
    if (!this.email) {
      this.error = this.translate.instant('auth.emailRequired');
      return;
    }
    this.email = this.email.trim();
    this.loading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.info = res?.message || '';
        this.otp = ['', '', '', '', '', ''];
        this.step = 2;
        setTimeout(() => this.focusBox(0), 0);
        this.startTimer();
      },
      error: (err) => {
        this.loading = false;
        this.error =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || this.translate.instant('auth.requestFailed');
      },
    });
  }

  onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '');
    this.otp[index] = val.slice(-1);
    input.value = this.otp[index];
    if (this.otp[index] && index < 5) {
      this.focusBox(index + 1);
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      this.focusBox(index - 1);
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      this.focusBox(index - 1);
    }
    if (event.key === 'ArrowRight' && index < 5) {
      this.focusBox(index + 1);
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    const data = event.clipboardData?.getData('text') || '';
    const digits = data.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    event.preventDefault();
    for (let i = 0; i < digits.length; i++) {
      this.otp[i] = digits[i];
    }
    const nextIndex = Math.min(digits.length, 5);
    this.focusBox(nextIndex);
  }

  verifyOtp(): void {
    this.error = '';
    if (this.otpValue.length < 6) {
      this.error = this.translate.instant('auth.otpRequired');
      return;
    }
    if (this.isOtpExpired) {
      this.error = this.translate.instant('auth.otpExpired');
      return;
    }
    this.loading = true;
    this.authService.verifyResetOtp(this.email, this.otpValue).subscribe({
      next: () => {
        this.loading = false;
        this.step = 3;
        this.clearTimer();
      },
      error: (err) => {
        this.loading = false;
        this.error =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || this.translate.instant('auth.requestFailed');
      },
    });
  }

  resendOtp(): void {
    if (this.resendCooldown > 0) return;
    this.error = '';
    this.otp = ['', '', '', '', '', ''];
    this.loading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.info = res?.message || '';
        this.startTimer();
        setTimeout(() => this.focusBox(0), 0);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          typeof err.error === 'string'
            ? err.error
            : this.translate.instant('auth.resendOtpFailed');
      },
    });
  }

  onResetPassword(): void {
    this.error = '';
    if (!this.newPassword || this.newPassword.length < 6) {
      this.error = this.translate.instant('auth.passwordMinLength');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = this.translate.instant('auth.passwordMismatch');
      return;
    }
    this.loading = true;
    this.authService
      .resetPasswordWithOtp({
        email: this.email,
        otp: this.otpValue,
        newPassword: this.newPassword,
        confirmNewPassword: this.confirmPassword,
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.message.success(res?.message || this.translate.instant('auth.passwordUpdateSuccess'));
          this.router.navigateByUrl('/auth/login');
        },
        error: (err) => {
          this.loading = false;
          this.error =
            typeof err.error === 'string'
              ? err.error
              : err.error?.message || this.translate.instant('auth.resetPasswordFailed');
        },
      });
  }

  goBack(): void {
    this.error = '';
    this.clearTimer();
    if (this.step > 1) {
      this.step = (this.step - 1) as 1 | 2 | 3;
    } else {
      this.router.navigateByUrl('/auth/login');
    }
  }

  private focusBox(index: number): void {
    const boxes = this.otpBoxes;
    if (boxes && boxes.get(index)) {
      boxes.get(index)!.nativeElement.focus();
    }
  }

  private startTimer(): void {
    this.clearTimer();
    this.otpTimer = ForgotPasswordComponent.OTP_LIFETIME;
    this.resendCooldown = ForgotPasswordComponent.RESEND_COOLDOWN;
    this.otpInterval = setInterval(() => {
      if (this.resendCooldown > 0) {
        this.resendCooldown--;
      }
      if (this.otpTimer > 0) {
        this.otpTimer--;
      } else {
        this.clearTimer();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.otpInterval) {
      clearInterval(this.otpInterval);
      this.otpInterval = null;
    }
  }
}
