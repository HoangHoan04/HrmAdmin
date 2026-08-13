import { PERMISSION_CODES } from '@/app/core/constants/common';
import { PagedResult, SmsGatewayConfig } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-sms-config',
  templateUrl: './sms-config.component.html',
  styleUrls: [],
})
export class SmsConfigComponent implements OnInit {
  loading = false;
  submitting = false;
  testing = false;
  canManage = false;
  validateForm!: FormGroup;
  testForm!: FormGroup;
  detailId: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly permissionSvc: PermissionService,
  ) {}

  ngOnInit(): void {
    this.canManage = this.permissionSvc.has(PERMISSION_CODES.INTEGRATIONS_MANAGE);
    this.validateForm = this.fb.group({
      provider: ['', [Validators.required, Validators.maxLength(80)]],
      apiUrl: ['', [Validators.required, Validators.maxLength(1000)]],
      apiKey: ['', [Validators.required, Validators.maxLength(500)]],
      senderId: ['', [Validators.maxLength(80)]],
      isActive: [true],
      note: [''],
    });
    this.testForm = this.fb.group({
      phoneNumber: [''],
      message: ['SMARTHRM SMS test'],
    });
    if (!this.canManage) {
      this.validateForm.disable();
      this.testForm.disable();
    }
    this.loadLatest();
  }

  loadLatest(): void {
    this.loading = true;
    this.apiService
      .post<PagedResult<SmsGatewayConfig>>(this.apiService.SMS_GATEWAY_CONFIG.PAGINATION, {
        pageIndex: 1,
        pageSize: 1,
      })
      .subscribe({
        next: (res) => {
          const item = res?.items?.[0];
          if (item) {
            this.detailId = item.id;
            this.apiService
              .post<SmsGatewayConfig>(this.apiService.SMS_GATEWAY_CONFIG.DETAIL, { id: item.id })
              .subscribe({
                next: (detail) => {
                  this.validateForm.patchValue(detail);
                  this.loading = false;
                },
                error: (err: any) => {
                  this.message.error(this.i18n.loadDetailFailed(err.error));
                  this.loading = false;
                },
              });
          } else {
            this.detailId = null;
            this.loading = false;
          }
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.loading = false;
        },
      });
  }

  submitForm(): void {
    if (!this.canManage || this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }
    this.submitting = true;
    const payload = this.validateForm.getRawValue();
    const endpoint = this.detailId
      ? this.apiService.SMS_GATEWAY_CONFIG.UPDATE
      : this.apiService.SMS_GATEWAY_CONFIG.CREATE;
    const body = this.detailId ? { ...payload, id: this.detailId } : payload;
    this.apiService.post<any>(endpoint, body).subscribe({
      next: (id) => {
        if (!this.detailId && id) this.detailId = id;
        this.message.success(this.detailId ? this.i18n.updateSuccess() : this.i18n.createSuccess());
        this.submitting = false;
        this.loadLatest();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
      },
    });
  }

  sendTest(): void {
    if (!this.canManage) return;
    this.testing = true;
    const payload = {
      configId: this.detailId,
      ...this.testForm.getRawValue(),
    };
    this.apiService.post<string>(this.apiService.SMS_GATEWAY_CONFIG.SEND_TEST, payload).subscribe({
      next: (msg) => {
        this.message.success(typeof msg === 'string' ? msg : this.i18n.updateSuccess());
        this.testing = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.testing = false;
      },
    });
  }
}
