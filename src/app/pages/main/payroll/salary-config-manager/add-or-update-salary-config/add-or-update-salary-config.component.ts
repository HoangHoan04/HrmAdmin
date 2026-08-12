import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { CompanySelectBoxDto, SalaryConfig } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-salary-config',
  templateUrl: './add-or-update-salary-config.component.html',
  styleUrls: [],
})
export class AddOrUpdateSalaryConfigComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  currencyOptions = Object.values(enumData.CURRENCY);

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
      standardWorkingDays: [26, [Validators.required, Validators.min(1)]],
      bhxhEmployeeRate: [8, [Validators.required, Validators.min(0)]],
      bhytEmployeeRate: [1.5, [Validators.required, Validators.min(0)]],
      bhtnEmployeeRate: [1, [Validators.required, Validators.min(0)]],
      defaultPayDay: [5, [Validators.min(1), Validators.max(31)]],
      isComputePrevMonth: [false],
      currency: [enumData.CURRENCY.VND.value],
      displayOrder: [0, [Validators.min(0)]],
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
    this.apiService.post<SalaryConfig>(this.apiService.SALARY_CONFIG.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue({
          code: item.code,
          name: item.name,
          description: item.description,
          companyId: item.companyId,
          standardWorkingDays: item.standardWorkingDays,
          bhxhEmployeeRate: item.bhxhEmployeeRate,
          bhytEmployeeRate: item.bhytEmployeeRate,
          bhtnEmployeeRate: item.bhtnEmployeeRate,
          defaultPayDay: item.defaultPayDay,
          isComputePrevMonth: item.isComputePrevMonth ?? false,
          currency: item.currency || enumData.CURRENCY.VND.value,
          displayOrder: item.displayOrder ?? 0,
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
    this.router.navigate([ROUTES_CONFIG.PAYROLL.children.PAYROLL_CONFIG.path]);
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
      description: value.description || null,
      companyId: value.companyId || null,
      standardWorkingDays: value.standardWorkingDays,
      bhxhEmployeeRate: value.bhxhEmployeeRate,
      bhytEmployeeRate: value.bhytEmployeeRate,
      bhtnEmployeeRate: value.bhtnEmployeeRate,
      defaultPayDay: value.defaultPayDay,
      isComputePrevMonth: value.isComputePrevMonth,
      currency: value.currency || enumData.CURRENCY.VND.value,
      displayOrder: value.displayOrder ?? 0,
      isActive: value.isActive,
    };
    const endpoint = this.isEdit
      ? this.apiService.SALARY_CONFIG.UPDATE
      : this.apiService.SALARY_CONFIG.CREATE;
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
