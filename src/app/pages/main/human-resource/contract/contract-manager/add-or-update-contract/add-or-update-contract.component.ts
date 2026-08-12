import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import { toUtcDateIso } from '@/app/core/constants/helpers';
import {
  Contract,
  ContractTypeSelectBoxDto,
  EmployeeSelectBoxDto,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-contract',
  templateUrl: './add-or-update-contract.component.html',
  styleUrls: [],
})
export class AddOrUpdateContractComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  employees: EmployeeSelectBoxDto[] = [];
  contractTypes: ContractTypeSelectBoxDto[] = [];
  statusOptions = Object.values(enumData.CONTRACT_STATUS);
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

  initForm(): void {
    this.validateForm = this.fb.group({
      employeeId: [null, [Validators.required]],
      contractTypeId: [null],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      startDate: [null, [Validators.required]],
      endDate: [null],
      basicSalary: [null],
      allowance: [null],
      insuranceSalary: [null],
      paymentMethod: [''],
      jobTitle: [''],
      workingLocation: [''],
      isAutoRenew: [false],
      note: [''],
      status: [enumData.CONTRACT_STATUS.DRAFT.value],
    });

    this.validateForm.get('contractTypeId')?.valueChanges.subscribe((typeId) => {
      this.applyContractTypeDefaults(typeId);
    });
    this.validateForm.get('startDate')?.valueChanges.subscribe(() => {
      const typeId = this.validateForm.get('contractTypeId')?.value;
      if (typeId) this.applyContractTypeDefaults(typeId);
    });
  }

  loadSelectBoxes(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (res) => (this.employees = res),
        error: () => this.message.error(this.i18n.genericError()),
      });
    this.apiService
      .post<ContractTypeSelectBoxDto[]>(this.apiService.CONTRACT_TYPE.SELECT_BOX, {})
      .subscribe({
        next: (res) => (this.contractTypes = res),
        error: () =>
          this.message.error(this.i18n.instant('contract.loadContractTypeSelectFailed')),
      });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Contract>(this.apiService.CONTRACT.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue({
          employeeId: item.employeeId,
          contractTypeId: item.contractTypeId,
          code: item.code,
          startDate: item.startDate ? new Date(item.startDate) : null,
          endDate: item.endDate ? new Date(item.endDate) : null,
          basicSalary: item.basicSalary,
          allowance: item.allowance,
          insuranceSalary: item.insuranceSalary,
          paymentMethod: item.paymentMethod,
          jobTitle: item.jobTitle,
          workingLocation: item.workingLocation,
          isAutoRenew: item.isAutoRenew ?? false,
          note: item.note,
          status: item.status || enumData.CONTRACT_STATUS.DRAFT.value,
        });
        if (this.isEdit) {
          this.validateForm.get('employeeId')?.disable();
          this.validateForm.get('code')?.disable();
        }
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
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_LIST.path,
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
    const payload: Record<string, any> = {
      employeeId: value.employeeId,
      contractTypeId: value.contractTypeId || null,
      code: value.code,
      startDate: toUtcDateIso(value.startDate),
      endDate: value.endDate ? toUtcDateIso(value.endDate) : null,
      clearEndDate: !value.endDate,
      basicSalary: value.basicSalary,
      allowance: value.allowance,
      insuranceSalary: value.insuranceSalary,
      paymentMethod: value.paymentMethod || null,
      jobTitle: value.jobTitle || null,
      workingLocation: value.workingLocation || null,
      isAutoRenew: value.isAutoRenew,
      note: value.note || null,
      status: value.status || enumData.CONTRACT_STATUS.DRAFT.value,
    };
    const endpoint = this.isEdit
      ? this.apiService.CONTRACT.UPDATE
      : this.apiService.CONTRACT.CREATE;
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

  private applyContractTypeDefaults(typeId: string | null): void {
    if (!typeId) return;
    const type = this.contractTypes.find((t) => t.id === typeId);
    if (!type) return;
    if (type.isUnlimited) {
      this.validateForm.patchValue({ endDate: null }, { emitEvent: false });
      return;
    }
    const startDate = this.validateForm.get('startDate')?.value as Date | null;
    if (type.defaultDurationMonths && startDate) {
      this.validateForm.patchValue(
        { endDate: this.addMonths(new Date(startDate), type.defaultDurationMonths) },
        { emitEvent: false },
      );
    }
  }

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }
}
