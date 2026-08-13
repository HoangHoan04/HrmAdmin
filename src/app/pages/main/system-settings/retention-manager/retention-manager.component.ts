import { PERMISSION_CODES } from '@/app/core/constants/common';
import { SystemRetentionConfig } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-retention-manager',
  templateUrl: './retention-manager.component.html',
  styleUrls: [],
})
export class RetentionManagerComponent implements OnInit {
  loading = false;
  submitting = false;
  canManage = false;
  validateForm!: FormGroup;
  detailId: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly permissionSvc: PermissionService,
  ) {}

  ngOnInit(): void {
    this.canManage = this.permissionSvc.has(PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE);
    this.validateForm = this.fb.group({
      softDeleteRetentionDays: [90, [Validators.required, Validators.min(1)]],
      isPurgeEnabled: [false],
      note: [''],
    });
    if (!this.canManage) this.validateForm.disable();
    this.loadDetail();
  }

  loadDetail(): void {
    this.loading = true;
    this.apiService
      .post<SystemRetentionConfig>(this.apiService.SYSTEM_RETENTION.DETAIL, {})
      .subscribe({
        next: (item) => {
          this.detailId = item?.id || null;
          if (item) this.validateForm.patchValue(item);
          this.loading = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadDetailFailed(err.error));
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
    this.apiService.post<any>(this.apiService.SYSTEM_RETENTION.UPDATE, payload).subscribe({
      next: () => {
        this.message.success(this.i18n.updateSuccess());
        this.submitting = false;
        this.loadDetail();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
      },
    });
  }
}
