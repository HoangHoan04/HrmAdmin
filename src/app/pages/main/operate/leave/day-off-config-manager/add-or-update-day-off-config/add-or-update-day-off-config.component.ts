import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import { CompanySelectBoxDto, DayOffConfig } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-day-off-config',
  templateUrl: './add-or-update-day-off-config.component.html',
  styleUrls: [],
})
export class AddOrUpdateDayOffConfigComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  enumData = enumData;
  typeOptions = Object.values(enumData.DAY_OFF_CONFIG_TYPE);

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
    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      companyId: [null],
      type: [null, [Validators.required]],
      defaultDayPerYear: [0, [Validators.min(0)]],
      isPaid: [true],
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
    this.apiService.post<DayOffConfig>(this.apiService.DAY_OFF_CONFIG.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue({
          code: item.code,
          name: item.name,
          description: item.description,
          companyId: item.companyId,
          type: item.dayOffType,
          defaultDayPerYear: item.defaultDaysPerYear,
          isPaid: item.isPaid,
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
    this.router.navigate([
      ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.DAY_OFF_CONFIG.path,
    ]);
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
      code: value.code,
      name: value.name,
      description: value.description,
      companyId: value.companyId || null,
      dayOffType: value.type,
      defaultDaysPerYear: value.defaultDayPerYear,
      isPaid: value.isPaid,
      isActive: value.isActive,
    };
    const endpoint = this.isEdit
      ? this.apiService.DAY_OFF_CONFIG.UPDATE
      : this.apiService.DAY_OFF_CONFIG.CREATE;
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
