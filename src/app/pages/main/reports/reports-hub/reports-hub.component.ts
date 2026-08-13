import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { ComplianceSummary } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

interface ReportCard {
  key: string;
  titleKey: string;
  descKey: string;
  icon: string;
  path: string;
}

@Component({
  standalone: false,
  selector: 'app-reports-hub',
  templateUrl: './reports-hub.component.html',
  styleUrls: ['./reports-hub.component.scss'],
})
export class ReportsHubComponent implements OnInit {
  loading = false;
  withinDays = 30;
  summary: ComplianceSummary | null = null;

  cards: ReportCard[] = [
    {
      key: 'contractExpiry',
      titleKey: 'system.reports.cardContractExpiry',
      descKey: 'system.reports.cardContractExpiryDesc',
      icon: 'file-protect',
      path: ROUTES_CONFIG.REPORTS.children.CONTRACT_EXPIRY.path,
    },
    {
      key: 'leaveBalance',
      titleKey: 'system.reports.cardLeaveBalance',
      descKey: 'system.reports.cardLeaveBalanceDesc',
      icon: 'calendar',
      path: ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.LEAVE_BALANCE_REPORT.path,
    },
    {
      key: 'timekeeping',
      titleKey: 'system.reports.cardTimekeeping',
      descKey: 'system.reports.cardTimekeepingDesc',
      icon: 'clock-circle',
      path: ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.TIMEKEEPING_MANAGER
        .path,
    },
    {
      key: 'payroll',
      titleKey: 'system.reports.cardPayroll',
      descKey: 'system.reports.cardPayrollDesc',
      icon: 'dollar',
      path: ROUTES_CONFIG.PAYROLL.children.PAYROLL_RUN_MANAGER.path,
    },
    {
      key: 'schedules',
      titleKey: 'system.reports.cardSchedules',
      descKey: 'system.reports.cardSchedulesDesc',
      icon: 'schedule',
      path: ROUTES_CONFIG.REPORTS.children.SCHEDULES.path,
    },
  ];

  constructor(
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading = true;
    this.apiService
      .post<ComplianceSummary>(this.apiService.COMPLIANCE.SUMMARY, {
        withinDays: this.withinDays,
      })
      .subscribe({
        next: (res) => {
          this.summary = res;
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
