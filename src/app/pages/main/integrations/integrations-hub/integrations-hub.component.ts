import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { IntegrationAdapterStatus, IntegrationStatusResult } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

interface IntegrationCard {
  key: string;
  titleKey: string;
  descKey: string;
  icon: string;
  path: string;
}

@Component({
  standalone: false,
  selector: 'app-integrations-hub',
  templateUrl: './integrations-hub.component.html',
  styleUrls: ['./integrations-hub.component.scss'],
})
export class IntegrationsHubComponent implements OnInit {
  loading = false;
  adapters: IntegrationAdapterStatus[] = [];
  checkedAt: string | null = null;

  cards: IntegrationCard[] = [
    {
      key: 'sms',
      titleKey: 'system.integrations.cardSms',
      descKey: 'system.integrations.cardSmsDesc',
      icon: 'message',
      path: ROUTES_CONFIG.INTEGRATIONS.children.SMS_CONFIG.path,
    },
    {
      key: 'zalo',
      titleKey: 'system.integrations.cardZalo',
      descKey: 'system.integrations.cardZaloDesc',
      icon: 'comment',
      path: ROUTES_CONFIG.INTEGRATIONS.children.ZALO_CONFIG.path,
    },
    {
      key: 'punch',
      titleKey: 'system.integrations.cardPunch',
      descKey: 'system.integrations.cardPunchDesc',
      icon: 'upload',
      path: ROUTES_CONFIG.INTEGRATIONS.children.PUNCH_IMPORT.path,
    },
    {
      key: 'payroll',
      titleKey: 'system.integrations.cardPayroll',
      descKey: 'system.integrations.cardPayrollDesc',
      icon: 'export',
      path: ROUTES_CONFIG.INTEGRATIONS.children.PAYROLL_EXPORTS.path,
    },
  ];

  constructor(
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.apiService.post<IntegrationStatusResult>(this.apiService.INTEGRATIONS.STATUS, {}).subscribe({
      next: (res) => {
        this.adapters = res?.adapters ?? [];
        this.checkedAt = res?.checkedAt ?? null;
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.loading = false;
      },
    });
  }

  open(path: string): void {
    this.router.navigate([path]);
  }
}
