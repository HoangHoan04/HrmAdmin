import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import { toUtcDateIso } from '@/app/core/constants/helpers';
import {
  Contract,
  ContractTypeSelectBoxDto,
  Employee,
  EmployeeSelectBoxDto,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin, of, Subject, takeUntil } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-add-or-update-contract',
  templateUrl: './add-or-update-contract.component.html',
  styleUrls: [],
})
export class AddOrUpdateContractComponent implements OnInit, OnDestroy {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  employees: EmployeeSelectBoxDto[] = [];
  contractTypes: ContractTypeSelectBoxDto[] = [];
  companies: any[] = [];
  branches: any[] = [];
  departments: any[] = [];
  parts: any[] = [];
  positions: any[] = [];
  statusOptions = Object.values(enumData.CONTRACT_STATUS);
  workingModeOptions = Object.values(enumData.WORKING_MODE);
  paymentMethodOptions = Object.values(enumData.PAYMENT_METHOD);
  currencyOptions = Object.values(enumData.CURRENCY);
  enumData = enumData;
  branchDisabled = true;
  departmentDisabled = true;
  partPositionDisabled = true;
  private readonly destroy$ = new Subject<void>();
  private suppressOrgReset = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      employeeId: [null, [Validators.required]],
      contractTypeId: [null],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      decisionNumber: ['', [Validators.maxLength(100)]],
      signDate: [null],
      startDate: [null, [Validators.required]],
      endDate: [null],
      probationEndDate: [null],
      basicSalary: [null],
      salaryCoefficient: [null],
      allowance: [null],
      insuranceSalary: [null],
      currency: [enumData.CURRENCY.VND.value],
      paymentMethod: [null],
      jobTitle: [''],
      jobDescription: [''],
      workingLocation: [''],
      workingMode: [null],
      workingHoursPerWeek: [null],
      annualLeaveDays: [null],
      companyId: [null],
      branchId: [null],
      departmentId: [null],
      partId: [null],
      positionId: [null],
      signedByCompanyRepresentative: [''],
      signedByEmployeeName: [''],
      isAutoRenew: [false],
      fileUrl: [''],
      note: [''],
      status: [enumData.CONTRACT_STATUS.DRAFT.value],
    });

    this.validateForm
      .get('contractTypeId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((typeId) => this.applyContractTypeDefaults(typeId, true));

    this.validateForm
      .get('startDate')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isEdit) {
          const typeId = this.validateForm.get('contractTypeId')?.value;
          if (typeId) this.applyContractTypeDefaults(typeId, false);
        }
      });

    this.validateForm
      .get('employeeId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((employeeId) => {
        if (!this.isEdit && employeeId) {
          this.autofillFromEmployee(employeeId);
        }
      });

    this.validateForm
      .get('companyId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((companyId) => {
        if (this.suppressOrgReset) return;
        this.branches = [];
        this.departments = [];
        this.parts = [];
        this.positions = [];
        this.validateForm.patchValue(
          { branchId: null, departmentId: null, partId: null, positionId: null },
          { emitEvent: false },
        );
        this.syncOrgDisabledState();
        if (companyId) this.loadBranches(companyId);
      });

    this.validateForm
      .get('branchId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((branchId) => {
        if (this.suppressOrgReset) return;
        this.departments = [];
        this.parts = [];
        this.positions = [];
        this.validateForm.patchValue(
          { departmentId: null, partId: null, positionId: null },
          { emitEvent: false },
        );
        this.syncOrgDisabledState();
        if (branchId) this.loadDepartments(branchId);
      });

    this.validateForm
      .get('departmentId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((departmentId) => {
        if (this.suppressOrgReset) return;
        this.parts = [];
        this.positions = [];
        this.validateForm.patchValue({ partId: null, positionId: null }, { emitEvent: false });
        this.syncOrgDisabledState();
        if (departmentId) {
          this.loadParts(departmentId);
          this.loadPositions(departmentId);
        }
      });
  }

  loadSelectBoxes(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.setList('employees', res ?? []),
        error: () => this.message.error(this.i18n.genericError()),
      });
    this.apiService
      .post<ContractTypeSelectBoxDto[]>(this.apiService.CONTRACT_TYPE.SELECT_BOX, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.setList('contractTypes', res ?? []);
          const currentTypeId = this.validateForm.get('contractTypeId')?.value;
          if (currentTypeId) {
            const currentType = (res ?? []).find((t) => t.id === currentTypeId);
            if (currentType?.isUnlimited) {
              this.validateForm.patchValue({ endDate: null }, { emitEvent: false });
              this.validateForm.get('endDate')?.disable({ emitEvent: false });
            }
          }
        },
        error: () => this.message.error(this.i18n.instant('contract.loadContractTypeSelectFailed')),
      });
    this.apiService
      .post<any[]>(this.apiService.COMPANY.SELECT_BOX, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.setList('companies', res ?? []),
      });
  }

  loadBranches(companyId: string): void {
    this.apiService
      .post<any[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, { companyId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.setList('branches', res ?? []),
      });
  }

  loadDepartments(branchId: string): void {
    this.apiService
      .post<any[]>(this.apiService.DEPARTMENT.LOAD_BY_BRANCH, { branchId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.setList('departments', res ?? []),
      });
  }

  loadParts(departmentId: string): void {
    this.apiService
      .post<any[]>(this.apiService.PART.LOAD_BY_DEPARTMENT, { departmentId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.setList('parts', res ?? []),
      });
  }

  loadPositions(departmentId: string): void {
    this.apiService
      .post<any[]>(this.apiService.POSITION.SELECT_BOX, { departmentId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.setList('positions', res ?? []),
      });
  }

  autofillFromEmployee(employeeId: string): void {
    this.apiService
      .post<Employee>(this.apiService.EMPLOYEE.DETAIL, { id: employeeId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employee) => {
          this.applyOrgSnapshot({
            companyId: employee.companyId || null,
            branchId: employee.branchId || null,
            departmentId: employee.departmentId || null,
            partId: employee.partId || null,
            positionId: employee.positionId || null,
            extra: {
              workingMode: employee.workingMode || null,
              signedByEmployeeName: employee.fullName || '',
            },
          });
        },
      });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService
      .post<Contract>(this.apiService.CONTRACT.DETAIL, { id })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (item) => {
          this.applyOrgSnapshot({
            companyId: item.companyId || null,
            branchId: item.branchId || null,
            departmentId: item.departmentId || null,
            partId: item.partId || null,
            positionId: item.positionId || null,
            extra: {
              employeeId: item.employeeId,
              contractTypeId: item.contractTypeId,
              code: item.code,
              decisionNumber: item.decisionNumber || '',
              signDate: item.signDate ? new Date(item.signDate) : null,
              startDate: item.startDate ? new Date(item.startDate) : null,
              endDate: item.endDate ? new Date(item.endDate) : null,
              probationEndDate: item.probationEndDate ? new Date(item.probationEndDate) : null,
              basicSalary: item.basicSalary,
              salaryCoefficient: item.salaryCoefficient,
              allowance: item.allowance,
              insuranceSalary: item.insuranceSalary,
              currency: item.currency || enumData.CURRENCY.VND.value,
              paymentMethod: item.paymentMethod || null,
              jobTitle: item.jobTitle,
              jobDescription: item.jobDescription,
              workingLocation: item.workingLocation,
              workingMode: item.workingMode || null,
              workingHoursPerWeek: item.workingHoursPerWeek,
              annualLeaveDays: item.annualLeaveDays,
              signedByCompanyRepresentative: item.signedByCompanyRepresentative || '',
              signedByEmployeeName: item.signedByEmployeeName || '',
              isAutoRenew: item.isAutoRenew ?? false,
              fileUrl: item.fileUrl || '',
              note: item.note,
              status: item.status || enumData.CONTRACT_STATUS.DRAFT.value,
            },
            afterPatch: () => {
              if (this.isEdit) {
                this.validateForm.get('employeeId')?.disable({ emitEvent: false });
                this.validateForm.get('code')?.disable({ emitEvent: false });
              }
              const selectedType = this.contractTypes.find((t) => t.id === item.contractTypeId);
              if (selectedType?.isUnlimited) {
                this.validateForm.patchValue({ endDate: null }, { emitEvent: false });
                this.validateForm.get('endDate')?.disable({ emitEvent: false });
              }
              this.loading = false;
            },
          });
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
      decisionNumber: value.decisionNumber || null,
      signDate: value.signDate ? toUtcDateIso(value.signDate) : null,
      clearSignDate: !value.signDate,
      startDate: toUtcDateIso(value.startDate),
      endDate: value.endDate ? toUtcDateIso(value.endDate) : null,
      clearEndDate: !value.endDate,
      probationEndDate: value.probationEndDate ? toUtcDateIso(value.probationEndDate) : null,
      clearProbationEndDate: !value.probationEndDate,
      basicSalary: value.basicSalary,
      salaryCoefficient: value.salaryCoefficient,
      allowance: value.allowance,
      insuranceSalary: value.insuranceSalary,
      currency: value.currency || enumData.CURRENCY.VND.value,
      paymentMethod: value.paymentMethod || null,
      jobTitle: value.jobTitle || null,
      jobDescription: value.jobDescription || null,
      workingLocation: value.workingLocation || null,
      workingMode: value.workingMode || null,
      workingHoursPerWeek: value.workingHoursPerWeek,
      annualLeaveDays: value.annualLeaveDays,
      companyId: value.companyId || null,
      branchId: value.branchId || null,
      departmentId: value.departmentId || null,
      partId: value.partId || null,
      positionId: value.positionId || null,
      signedByCompanyRepresentative: value.signedByCompanyRepresentative || null,
      signedByEmployeeName: value.signedByEmployeeName || null,
      isAutoRenew: value.isAutoRenew,
      fileUrl: value.fileUrl || null,
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

  private applyOrgSnapshot(input: {
    companyId: string | null;
    branchId: string | null;
    departmentId: string | null;
    partId: string | null;
    positionId: string | null;
    extra?: Record<string, any>;
    afterPatch?: () => void;
  }): void {
    this.suppressOrgReset = true;

    const branch$ = input.companyId
      ? this.apiService.post<any[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, {
          companyId: input.companyId,
        })
      : of([]);
    const department$ = input.branchId
      ? this.apiService.post<any[]>(this.apiService.DEPARTMENT.LOAD_BY_BRANCH, {
          branchId: input.branchId,
        })
      : of([]);
    const part$ = input.departmentId
      ? this.apiService.post<any[]>(this.apiService.PART.LOAD_BY_DEPARTMENT, {
          departmentId: input.departmentId,
        })
      : of([]);
    const position$ = input.departmentId
      ? this.apiService.post<any[]>(this.apiService.POSITION.SELECT_BOX, {
          departmentId: input.departmentId,
        })
      : of([]);

    forkJoin({
      branches: branch$,
      departments: department$,
      parts: part$,
      positions: position$,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ branches, departments, parts, positions }) => {
          this.branches = branches ?? [];
          this.departments = departments ?? [];
          this.parts = parts ?? [];
          this.positions = positions ?? [];

          this.validateForm.patchValue(
            {
              ...(input.extra || {}),
              companyId: input.companyId,
              branchId: input.branchId,
              departmentId: input.departmentId,
              partId: input.partId,
              positionId: input.positionId,
            },
            { emitEvent: false },
          );

          this.syncOrgDisabledState();
          this.suppressOrgReset = false;
          input.afterPatch?.();
          this.cdr.detectChanges();
        },
        error: () => {
          this.suppressOrgReset = false;
          this.loading = false;
          this.message.error(this.i18n.genericError());
        },
      });
  }

  private syncOrgDisabledState(): void {
    this.branchDisabled = !this.validateForm.get('companyId')?.value;
    this.departmentDisabled = !this.validateForm.get('branchId')?.value;
    this.partPositionDisabled = !this.validateForm.get('departmentId')?.value;
  }

  private setList(
    key:
      | 'employees'
      | 'contractTypes'
      | 'companies'
      | 'branches'
      | 'departments'
      | 'parts'
      | 'positions',
    value: any[],
  ): void {
    queueMicrotask(() => {
      this[key] = value;
      this.cdr.detectChanges();
    });
  }

  private applyContractTypeDefaults(typeId: string | null, forceDuration = false): void {
    if (!typeId) {
      this.validateForm.get('endDate')?.enable({ emitEvent: false });
      return;
    }
    const type = this.contractTypes.find((t) => t.id === typeId);
    if (!type) return;
    if (type.isUnlimited) {
      this.validateForm.patchValue({ endDate: null }, { emitEvent: false });
      this.validateForm.get('endDate')?.disable({ emitEvent: false });
      return;
    }
    this.validateForm.get('endDate')?.enable({ emitEvent: false });
    const currentEndDate = this.validateForm.get('endDate')?.value;
    const startDate = this.validateForm.get('startDate')?.value as Date | null;
    if (type.defaultDurationMonths && startDate && (forceDuration || !currentEndDate)) {
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
