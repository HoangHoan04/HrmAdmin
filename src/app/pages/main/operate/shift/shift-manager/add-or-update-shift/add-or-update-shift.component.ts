import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { CompanySelectBoxDto, ShiftMaster } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-shift',
  templateUrl: './add-or-update-shift.component.html',
  styleUrls: [],
})
export class AddOrUpdateShiftComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.loadCompanies();
    if (this.isEdit && this.id) {
      this.loadDetail(this.id);
    }
  }

  initForm(): void {
    const start = new Date();
    start.setHours(8, 0, 0, 0);
    const end = new Date();
    end.setHours(17, 0, 0, 0);

    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      companyId: [null],
      startTime: [start, [Validators.required]],
      endTime: [end, [Validators.required]],
      breakMinutes: [60, [Validators.min(0)]],
      workingMinutes: [480, [Validators.min(0)]],
      isOvernight: [false],
      isActive: [true],
    });
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => (this.companies = res),
      error: () => this.message.error(this.i18n.instant('common.messages.loadCompanySelectFailed')),
    });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<ShiftMaster>(this.apiService.SHIFT_MASTER.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue({
          code: item.code,
          name: item.name,
          description: item.description,
          companyId: item.companyId,
          startTime: this.parseTime(item.startTime),
          endTime: this.parseTime(item.endTime),
          breakMinutes: item.breakMinutes,
          workingMinutes: item.workingMinutes,
          isOvernight: item.isOvernight ?? false,
          isActive: item.isActive ?? true,
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
    this.router.navigate([ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.path], {
      queryParams: { tab: 'shift' },
    });
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting = true;
    const value = this.validateForm.getRawValue();
    const payload = {
      code: value.code?.trim(),
      name: value.name?.trim(),
      description: value.description || null,
      companyId: value.companyId || null,
      startTime: this.formatTime(value.startTime),
      endTime: this.formatTime(value.endTime),
      breakMinutes: value.breakMinutes ?? 0,
      workingMinutes: value.workingMinutes ?? 0,
      isOvernight: value.isOvernight ?? false,
      isActive: value.isActive ?? true,
    };

    const endpoint = this.isEdit
      ? this.apiService.SHIFT_MASTER.UPDATE
      : this.apiService.SHIFT_MASTER.CREATE;
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

  private parseTime(value?: string | null): Date | null {
    if (!value) return null;
    const parts = value.split(':').map((p) => Number(p));
    if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;
    const d = new Date();
    d.setHours(parts[0], parts[1], parts[2] || 0, 0);
    return d;
  }

  private formatTime(value: Date | null): string | null {
    if (!value) return null;
    const hh = String(value.getHours()).padStart(2, '0');
    const mm = String(value.getMinutes()).padStart(2, '0');
    const ss = String(value.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
}
