import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  ssoLoginUrl = environment.ssoLoginUrl || 'http://localhost:4300/auth/login';
  clientId = environment.clientId || 'hrm-app';
  redirectUri = `${window.location.origin}/auth/callback`;
  redirecting = false;
  autoRedirectSeconds = 3;
  autoRedirectActive = false;
  private timer: any;

  constructor(
    private readonly router: Router,
    private readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn) {
      this.router.navigateByUrl('/');
      return;
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  redirectToSso(): void {
    this.redirecting = true;
    if (this.timer) {
      clearInterval(this.timer);
    }

    try {
      const targetUrl = new URL(this.ssoLoginUrl);
      targetUrl.searchParams.set('returnUrl', this.redirectUri);
      targetUrl.searchParams.set('redirectUri', this.redirectUri);
      targetUrl.searchParams.set('clientId', this.clientId);
      window.location.href = targetUrl.toString();
    } catch {
      const fallbackUrl = `${this.ssoLoginUrl}?returnUrl=${encodeURIComponent(this.redirectUri)}&clientId=${encodeURIComponent(this.clientId)}`;
      window.location.href = fallbackUrl;
    }
  }
}
