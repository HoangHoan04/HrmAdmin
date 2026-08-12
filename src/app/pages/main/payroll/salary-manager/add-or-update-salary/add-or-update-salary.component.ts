import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { toUtcDateIso } from '@/app/core/constants/helpers';
import {
  EmployeeSelectBoxDto,
  Salary,
  SalaryConfigSelectBoxDto,
  SalaryLineItem,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-salary',
  templateUrl: './add-or-update-salary.component.html',
  styleUrls: [],
})
export class AddOrUpdateSalaryComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  employees: EmployeeSelectBoxDto[] = [];
  salaryConfigs: SalaryConfigSelectBoxDto[] = [];
  statusOptions = Object.values(enumData.SALARY_STATUS);
  currencyOptions = Object.values(enumData.CURRENCY);
  itemTypeOptions = [
    { label: 'salary.itemTypeIncome', value: 'INCOME' },
    { label: 'salary.itemTypeDeduction', value: 'DEDUCTION' },
  ];
  enumData = enumData;

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
    this.loadSelectBoxes();
    if (this.isEdit && this.id) {
      this.loadDetail(this.id);
    }
  }

  get lineItems(): FormArray {
    return this.validateForm.get('lineItems') as FormArray;
  }

  initForm(): void {
    const now = new Date();
    this.validateForm = this.fb.group({
      employeeId: [null, [Validators.required]],
      salaryConfigId: [null],
      year: [now.getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      month: [now.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      payDate: [null],
      basicSalary: [null],
      insuranceSalary: [null],
      standardWorkingDays: [null],
      actualWorkingDays: [null],
      currency: [enumData.CURRENCY.VND.value],
      note: [''],
      status: [enumData.SALARY_STATUS.DRAFT.value],
      lineItems: this.fb.array([]),
    });
  }

  createLineItemGroup(item?: Partial<SalaryLineItem>): FormGroup {
    return this.fb.group({
      itemType: [item?.itemType || 'INCOME', [Validators.required]],
      itemCode: [item?.itemCode || '', [Validators.required]],
      itemName: [item?.itemName || '', [Validators.required]],
      amount: [item?.amount ?? 0, [Validators.required, Validators.min(0)]],
      displayOrder: [item?.displayOrder ?? 0, [Validators.min(0)]],
    });
  }

  addLineItem(): void {
    this.lineItems.push(this.createLineItemGroup({ displayOrder: this.lineItems.length + 1 }));
  }

  removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
  }

  loadSelectBoxes(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (res) => (this.employees = res),
        error: () => this.message.error(this.i18n.genericError()),
      });
    this.apiService
      .post<SalaryConfigSelectBoxDto[]>(this.apiService.SALARY_CONFIG.SELECT_BOX, {})
      .subscribe({
        next: (res) => (this.salaryConfigs = res),
        error: () => this.message.error(this.i18n.genericError()),
      });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Salary>(this.apiService.SALARY.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue({
          employeeId: item.employeeId,
          salaryConfigId: item.salaryConfigId,
          year: item.year,
          month: item.month,
          payDate: item.payDate ? new Date(item.payDate) : null,
          basicSalary: item.basicSalary,
          insuranceSalary: item.insuranceSalary,
          standardWorkingDays: item.standardWorkingDays,
          actualWorkingDays: item.actualWorkingDays,
          currency: item.currency || enumData.CURRENCY.VND.value,
          note: item.note || '',
          status: item.status || enumData.SALARY_STATUS.DRAFT.value,
        });
        this.lineItems.clear();
        (item.lineItems || []).forEach((line, index) => {
          this.lineItems.push(
            this.createLineItemGroup({ ...line, displayOrder: line.displayOrder ?? index + 1 }),
          );
        });
        this.validateForm.get('employeeId')?.disable({ emitEvent: false });
        this.validateForm.get('year')?.disable({ emitEvent: false });
        this.validateForm.get('month')?.disable({ emitEvent: false });
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.PAYROLL.children.PAYROLL_RUN_MANAGER.path]);
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.lineItems.controls.forEach((group) => {
        Object.values((group as FormGroup).controls).forEach((control) => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
      });
      return;
    }

    this.submitting = true;
    const value = this.validateForm.getRawValue();
    const lineItems = (value.lineItems || []).map((line: any, index: number) => ({
      itemType: line.itemType,
      itemCode: line.itemCode,
      itemName: line.itemName,
      amount: line.amount,
      displayOrder: line.displayOrder ?? index + 1,
    }));

    const payload: Record<string, any> = {
      employeeId: value.employeeId,
      salaryConfigId: value.salaryConfigId || null,
      year: value.year,
      month: value.month,
      payDate: value.payDate ? toUtcDateIso(value.payDate) : null,
      basicSalary: value.basicSalary,
      insuranceSalary: value.insuranceSalary,
      standardWorkingDays: value.standardWorkingDays,
      actualWorkingDays: value.actualWorkingDays,
      currency: value.currency || enumData.CURRENCY.VND.value,
      note: value.note || null,
      status: value.status || enumData.SALARY_STATUS.DRAFT.value,
      lineItems,
    };

    if (!this.isEdit) {
      payload['autoGenerateInsuranceLines'] = true;
    }

    const endpoint = this.isEdit ? this.apiService.SALARY.UPDATE : this.apiService.SALARY.CREATE;
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
