import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { Salary } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { ActionConfirmService } from '@/app/shared/services/action-confirm.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-salary-detail',
  templateUrl: './salary-detail.component.html',
  styleUrls: [],
})
export class SalaryDetailComponent implements OnInit {
  id: string | null = null;
  loading = false;
  actionSubmitting = false;
  printing = false;
  salary: Salary | null = null;
  enumData = enumData;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly actionConfirm: ActionConfirmService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadDetail(this.id);
    }
  }

  get canEdit(): boolean {
    return (
      !!this.salary &&
      (this.salary.status === enumData.SALARY_STATUS.DRAFT.value ||
        this.salary.status === enumData.SALARY_STATUS.PROCESSING.value)
    );
  }

  get canApprove(): boolean {
    return (
      !!this.salary &&
      (this.salary.status === enumData.SALARY_STATUS.DRAFT.value ||
        this.salary.status === enumData.SALARY_STATUS.PROCESSING.value)
    );
  }

  get canMarkPaid(): boolean {
    return (
      !!this.salary &&
      (this.salary.status === enumData.SALARY_STATUS.APPROVED.value ||
        this.salary.status === enumData.SALARY_STATUS.PROCESSING.value)
    );
  }

  get canCancel(): boolean {
    return (
      !!this.salary &&
      this.salary.status !== enumData.SALARY_STATUS.PAID.value &&
      this.salary.status !== enumData.SALARY_STATUS.CANCELLED.value
    );
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Salary>(this.apiService.SALARY.DETAIL, { id }).subscribe({
      next: (item) => {
        this.salary = item;
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  statusLabel(status?: string): string {
    if (!status) return '-';
    const meta = Object.values(enumData.SALARY_STATUS).find((x) => x.value === status);
    return meta ? this.i18n.instant(meta.labelKey) : status;
  }

  openEdit(): void {
    if (!this.salary?.id) return;
    this.router.navigate([
      ROUTES_CONFIG.PAYROLL.children.PAYROLL_RUN_MANAGER.children.EDIT_SALARY.path,
      this.salary.id,
    ]);
  }

  printPayslip(): void {
    if (!this.salary?.id) return;
    this.printing = true;
    const url = `${this.apiService.SALARY.PAYSLIP_HTML}?id=${this.salary.id}`;
    this.apiService.getText(url).subscribe({
      next: (html) => {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        this.printing = false;
      },
      error: (err: any) => {
        this.message.error(
          this.i18n.instant('salary.printPayslipFailed') || this.i18n.genericError(err.error),
        );
        this.printing = false;
      },
    });
  }

  async approve(): Promise<void> {
    if (!this.salary?.id) return;
    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('salary.approveConfirmTitle'),
      content: this.i18n.instant('salary.approveConfirmContent', {
        period: this.salary.periodCode,
        name: this.salary.employeeName || this.salary.employeeCode || '',
      }),
      okText: this.i18n.instant('salary.approve'),
      okType: 'primary',
      icon: 'confirm',
    });
    if (!confirmed) return;
    this.actionSubmitting = true;
    this.apiService
      .post<boolean>(this.apiService.SALARY.APPROVE, { id: this.salary.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.instant('salary.approveSuccess'));
            this.loadDetail(this.salary!.id);
          } else {
            this.message.error(this.i18n.genericError());
          }
          this.actionSubmitting = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.actionSubmitting = false;
        },
      });
  }

  async markPaid(): Promise<void> {
    if (!this.salary?.id) return;
    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('salary.markPaidConfirmTitle'),
      content: this.i18n.instant('salary.markPaidConfirmContent', {
        period: this.salary.periodCode,
        name: this.salary.employeeName || this.salary.employeeCode || '',
      }),
      okText: this.i18n.instant('salary.markPaid'),
      okType: 'primary',
      icon: 'confirm',
    });
    if (!confirmed) return;
    this.actionSubmitting = true;
    this.apiService
      .post<boolean>(this.apiService.SALARY.MARK_PAID, { id: this.salary.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.instant('salary.markPaidSuccess'));
            this.loadDetail(this.salary!.id);
          } else {
            this.message.error(this.i18n.genericError());
          }
          this.actionSubmitting = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.actionSubmitting = false;
        },
      });
  }

  async cancel(): Promise<void> {
    if (!this.salary?.id) return;
    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('salary.cancelConfirmTitle'),
      content: this.i18n.instant('salary.cancelConfirmContent', {
        period: this.salary.periodCode,
        name: this.salary.employeeName || this.salary.employeeCode || '',
      }),
      okText: this.i18n.instant('salary.cancel'),
      okType: 'primary',
      icon: 'warning',
    });
    if (!confirmed) return;
    this.actionSubmitting = true;
    this.apiService.post<boolean>(this.apiService.SALARY.CANCEL, { id: this.salary.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.instant('salary.cancelSuccess'));
          this.loadDetail(this.salary!.id);
        } else {
          this.message.error(this.i18n.genericError());
        }
        this.actionSubmitting = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.actionSubmitting = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.PAYROLL.children.PAYROLL_RUN_MANAGER.path]);
  }
}
