import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { HiringSource } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-hiring-source',
  templateUrl: './add-or-update-hiring-source.component.html',
  styleUrls: [],
})
export class AddOrUpdateHiringSourceComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  isSystem = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;

  channelOptions = Object.values(enumData.HIRING_SOURCE_CHANNEL).map((x) => ({
    value: x.value,
    label: x.labelKey,
  }));

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      channelType: ['OTHER', [Validators.required]],
      contactEmail: ['', [Validators.email, Validators.maxLength(255)]],
      displayOrder: [100, [Validators.required, Validators.min(0)]],
      description: [''],
      isActive: [true],
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    if (this.isEdit && this.id) this.loadDetail(this.id);
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<HiringSource>(this.apiService.HIRING_SOURCE.DETAIL, { id }).subscribe({
      next: (item) => {
        this.isSystem = !!item.isSystem;
        this.validateForm.patchValue(item);
        if (this.isSystem) this.validateForm.get('code')?.disable();
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.HIRING_SOURCE.path]);
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }
    this.submitting = true;
    const payload = this.validateForm.getRawValue();
    if (typeof payload.code === 'string') payload.code = payload.code.trim().toUpperCase();
    const endpoint = this.isEdit
      ? this.apiService.HIRING_SOURCE.UPDATE
      : this.apiService.HIRING_SOURCE.CREATE;
    const body = this.isEdit ? { ...payload, id: this.id } : payload;
    this.apiService.post<any>(endpoint, body).subscribe({
      next: () => {
        this.message.success(this.isEdit ? this.i18n.updateSuccess() : this.i18n.createSuccess());
        this.goBack();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
      },
    });
  }
}
