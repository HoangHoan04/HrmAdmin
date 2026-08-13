import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { ApiClientKey, CompanySelectBoxDto } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-api-key',
  templateUrl: './add-or-update-api-key.component.html',
  styleUrls: [],
})
export class AddOrUpdateApiKeyComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  createdPlaintextKey: string | null = null;

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
      name: ['', [Validators.required, Validators.maxLength(255)]],
      companyId: [null],
      isActive: [true],
      expiresAt: [null],
      note: [''],
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.loadCompanies();
    if (this.isEdit && this.id) this.loadDetail(this.id);
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (items) => (this.companies = items || []),
      error: () => (this.companies = []),
    });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<ApiClientKey>(this.apiService.API_CLIENT_KEY.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue({
          ...item,
          expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
        });
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.SETTING_SYSTEM.children.API_KEYS.path]);
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
    const raw = this.validateForm.getRawValue();
    const payload = {
      ...raw,
      expiresAt: raw.expiresAt ? new Date(raw.expiresAt).toISOString() : null,
    };
    const endpoint = this.isEdit
      ? this.apiService.API_CLIENT_KEY.UPDATE
      : this.apiService.API_CLIENT_KEY.CREATE;
    const body = this.isEdit ? { ...payload, id: this.id } : payload;
    this.apiService.post<ApiClientKey>(endpoint, body).subscribe({
      next: (res) => {
        this.message.success(this.isEdit ? this.i18n.updateSuccess() : this.i18n.createSuccess());
        if (!this.isEdit && res?.plaintextKey) {
          this.createdPlaintextKey = res.plaintextKey;
          this.submitting = false;
        } else {
          this.goBack();
        }
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
      },
    });
  }
}
