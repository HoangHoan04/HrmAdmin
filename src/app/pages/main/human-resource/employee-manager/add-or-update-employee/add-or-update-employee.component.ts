import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil } from 'rxjs';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import { Employee } from '../../../../../core/models';
import { ApiService } from '../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../core/services/i18n-message.service';

@Component({
  standalone: false,
  selector: 'app-add-or-update-employee',
  templateUrl: './add-or-update-employee.component.html',
  styleUrls: ['./add-or-update-employee.component.scss'],
})
export class AddOrUpdateEmployeeComponent implements OnInit, OnDestroy {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;

  readonly workStatusOptions = [
    { label: 'humanResource.employee.statusWorking', value: 'Đang làm việc' },
    { label: 'humanResource.employee.statusResigned', value: 'Nghỉ việc' },
    { label: 'humanResource.employee.statusOnLeave', value: 'Tạm nghỉ' },
  ];

  companies: any[] = [];
  branches: any[] = [];
  departments: any[] = [];
  parts: any[] = [];
  positions: any[] = [];

  private readonly destroy$ = new Subject<void>();
  private fullNameManuallyEdited = false;

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
      this.loadEmployeeDetail(this.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      id: [null],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      fullName: ['', [Validators.maxLength(250)]],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      secondaryPhone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.maxLength(250), Validators.email]],
      companyEmail: ['', [Validators.maxLength(250), Validators.email]],
      dayOfBirth: [null, [Validators.required]],
      nationality: ['', [Validators.maxLength(100)]],
      ethnicity: ['', [Validators.maxLength(100)]],
      religion: ['', [Validators.maxLength(100)]],
      identityCard: ['', [Validators.required, Validators.maxLength(50)]],
      placeOfIsssuance: ['', [Validators.required, Validators.maxLength(250)]],
      issuanceDate: [null, [Validators.required]],
      permanentAddress: ['', [Validators.maxLength(500)]],
      nowAddress: ['', [Validators.maxLength(500)]],
      currentCity: ['', [Validators.maxLength(100)]],
      currentWard: ['', [Validators.maxLength(100)]],
      bankAccountNumber: ['', [Validators.maxLength(50)]],
      bankname: ['', [Validators.maxLength(250)]],
      bankBranchName: ['', [Validators.maxLength(250)]],
      bankAccountHolder: ['', [Validators.maxLength(250)]],
      taxCode: ['', [Validators.maxLength(50)]],
      socialInsuranceNumber: ['', [Validators.maxLength(50)]],
      healthInsuranceNumber: ['', [Validators.maxLength(50)]],
      level: ['', [Validators.maxLength(100)]],
      workingMode: ['', [Validators.maxLength(100)]],
      contractType: ['', [Validators.maxLength(100)]],
      status: ['Đang làm việc', [Validators.maxLength(100)]],
      joinDate: [null, [Validators.required]],
      resignationDate: [null],
      resignationReason: ['', [Validators.maxLength(500)]],
      companyId: [null],
      branchId: [null],
      departmentId: [null],
      partId: [null],
      positionId: [null],
    });

    this.validateForm
      .get('firstName')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.syncFullName());
    this.validateForm
      .get('lastName')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.syncFullName());
    this.validateForm
      .get('fullName')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        const computed = this.computeFullName();
        this.fullNameManuallyEdited = !!value && value.trim() !== computed;
      });

    // Cascading dropdown subscriptions
    this.validateForm.get('companyId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(companyId => {
      this.branches = [];
      this.departments = [];
      this.parts = [];
      this.positions = [];
      this.validateForm.patchValue({ branchId: null, departmentId: null, partId: null, positionId: null }, { emitEvent: false });
      if (companyId) {
        this.loadBranches(companyId);
      }
    });

    this.validateForm.get('branchId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(branchId => {
      this.departments = [];
      this.parts = [];
      this.positions = [];
      this.validateForm.patchValue({ departmentId: null, partId: null, positionId: null }, { emitEvent: false });
      if (branchId) {
        this.loadDepartments(branchId);
      }
    });

    this.validateForm.get('departmentId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(departmentId => {
      this.parts = [];
      this.positions = [];
      this.validateForm.patchValue({ partId: null, positionId: null }, { emitEvent: false });
      if (departmentId) {
        this.loadParts(departmentId);
        this.loadPositions(departmentId);
      }
    });
  }

  loadCompanies(): void {
    this.apiService.post<any[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => this.companies = res,
    });
  }

  loadBranches(companyId: string): void {
    this.apiService.post<any[]>(this.apiService.ORGANIZATION.BRANCHES_BY_COMPANY, { companyId }).subscribe({
      next: (res) => this.branches = res,
    });
  }

  loadDepartments(branchId: string): void {
    this.apiService.post<any[]>(this.apiService.ORGANIZATION.DEPARTMENTS_BY_BRANCH, { branchId }).subscribe({
      next: (res) => this.departments = res,
    });
  }

  loadParts(departmentId: string): void {
    this.apiService.post<any[]>(this.apiService.ORGANIZATION.PARTS_BY_DEPARTMENT, { departmentId }).subscribe({
      next: (res) => this.parts = res,
    });
  }

  loadPositions(departmentId: string): void {
    this.apiService.post<any[]>(this.apiService.POSITION.SELECT_BOX, { departmentId }).subscribe({
      next: (res) => this.positions = res,
    });
  }

  loadEmployeeDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Employee>(this.apiService.EMPLOYEE.DETAIL, { id }).subscribe({
      next: (employee) => {
        this.fullNameManuallyEdited = true;
        this.validateForm.patchValue({
          id: employee.id,
          code: employee.code,
          firstName: employee.firstName,
          lastName: employee.lastName,
          fullName: employee.fullName,
          phone: employee.phone,
          secondaryPhone: employee.secondaryPhone,
          email: employee.email,
          companyEmail: employee.companyEmail,
          dayOfBirth: employee.dayOfBirth ? new Date(employee.dayOfBirth) : null,
          nationality: employee.nationality,
          ethnicity: employee.ethnicity,
          religion: employee.religion,
          identityCard: employee.identityCard,
          placeOfIsssuance: employee.placeOfIsssuance,
          issuanceDate: employee.issuanceDate ? new Date(employee.issuanceDate) : null,
          permanentAddress: employee.permanentAddress,
          nowAddress: employee.nowAddress,
          currentCity: employee.currentCity,
          currentWard: employee.currentWard,
          bankAccountNumber: employee.bankAccountNumber,
          bankname: employee.bankname,
          bankBranchName: employee.bankBranchName,
          bankAccountHolder: employee.bankAccountHolder,
          taxCode: employee.taxCode,
          socialInsuranceNumber: employee.socialInsuranceNumber,
          healthInsuranceNumber: employee.healthInsuranceNumber,
          level: employee.level,
          workingMode: employee.workingMode,
          contractType: employee.contractType,
          status: employee.status || 'Đang làm việc',
          joinDate: employee.joinDate ? new Date(employee.joinDate) : null,
          resignationDate: employee.resignationDate ? new Date(employee.resignationDate) : null,
          resignationReason: employee.resignationReason,
          companyId: employee.companyId,
          branchId: employee.branchId,
          departmentId: employee.departmentId,
          partId: employee.partId,
          positionId: employee.positionId,
        });

        // Trigger loading child data manually in edit mode to preserve selected items
        if (employee.companyId) {
          this.loadBranches(employee.companyId);
        }
        if (employee.branchId) {
          this.loadDepartments(employee.branchId);
        }
        if (employee.departmentId) {
          this.loadParts(employee.departmentId);
          this.loadPositions(employee.departmentId);
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(err.error || this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    const basePath = ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.path;
    this.router.navigate([basePath]);
  }

  submitForm(): void {
    if (!this.validateForm.get('fullName')?.value?.trim()) {
      this.validateForm.patchValue({ fullName: this.computeFullName() }, { emitEvent: false });
    }

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
    const raw = this.validateForm.getRawValue();
    const payload = {
      ...raw,
      fullName: (raw.fullName || '').trim() || this.computeFullName(),
      dayOfBirth: raw.dayOfBirth ? new Date(raw.dayOfBirth).toISOString() : null,
      issuanceDate: raw.issuanceDate ? new Date(raw.issuanceDate).toISOString() : null,
      joinDate: raw.joinDate ? new Date(raw.joinDate).toISOString() : null,
      resignationDate: raw.resignationDate ? new Date(raw.resignationDate).toISOString() : null,
    };

    const endpoint = this.isEdit
      ? this.apiService.EMPLOYEE.UPDATE
      : this.apiService.EMPLOYEE.CREATE;

    this.apiService.post<any>(endpoint, payload).subscribe({
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

  private computeFullName(): string {
    const firstName = (this.validateForm?.get('firstName')?.value || '').trim();
    const lastName = (this.validateForm?.get('lastName')?.value || '').trim();
    return [firstName, lastName].filter(Boolean).join(' ');
  }

  private syncFullName(): void {
    if (this.fullNameManuallyEdited) return;
    this.validateForm.patchValue({ fullName: this.computeFullName() }, { emitEvent: false });
  }
}
