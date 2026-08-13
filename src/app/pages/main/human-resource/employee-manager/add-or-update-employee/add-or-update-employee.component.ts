import { enumData } from '@/app/core/constants/enums/enumData';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil } from 'rxjs';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import { CandidateHirePrefill, Employee } from '../../../../../core/models';
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
  enumData = enumData;
  genderOptions = Object.values(enumData.GENDER);
  employeeLevelOptions = Object.values(enumData.EMPLOYEE_LEVEL);
  workingModeOptions = Object.values(enumData.WORKING_MODE);
  contractTypeOptions = Object.values(enumData.CONTRACT_TYPE);
  workStatusOptions = Object.values(enumData.WORK_STATUS);

  companies: any[] = [];
  branches: any[] = [];
  departments: any[] = [];
  parts: any[] = [];
  positions: any[] = [];
  managerOptions: any[] = [];

  hireCandidateId: string | null = null;
  hireCandidateLabel: string | null = null;

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
    this.hireCandidateId = this.route.snapshot.queryParamMap.get('candidateId');

    this.loadCompanies();
    this.loadManagerOptions();

    if (this.isEdit && this.id) {
      this.loadEmployeeDetail(this.id);
    } else if (this.hireCandidateId) {
      this.loadHirePrefill(this.hireCandidateId);
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
      gender: [null],
      avatarUrl: [null],
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
      status: [enumData.WORK_STATUS.WORKING.value, [Validators.maxLength(100)]],
      joinDate: [null, [Validators.required]],
      resignationDate: [null],
      resignationReason: ['', [Validators.maxLength(500)]],
      companyId: [null],
      branchId: [null],
      departmentId: [null],
      partId: [null],
      positionId: [null],
      directManagerId: [null],
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

    this.validateForm
      .get('companyId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((companyId) => {
        this.branches = [];
        this.departments = [];
        this.parts = [];
        this.positions = [];
        this.validateForm.patchValue(
          { branchId: null, departmentId: null, partId: null, positionId: null },
          { emitEvent: false },
        );
        if (companyId) {
          this.loadBranches(companyId);
          this.loadDepartments(companyId, null);
        }
      });

    this.validateForm
      .get('branchId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((branchId) => {
        this.departments = [];
        this.parts = [];
        this.positions = [];
        this.validateForm.patchValue(
          { departmentId: null, partId: null, positionId: null },
          { emitEvent: false },
        );
        const companyId = this.validateForm.get('companyId')?.value ?? null;
        if (companyId || branchId) {
          this.loadDepartments(companyId, branchId);
        }
      });

    this.validateForm
      .get('departmentId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((departmentId) => {
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
      next: (res) => (this.companies = res),
    });
  }

  loadManagerOptions(): void {
    this.apiService.post<any[]>(this.apiService.EMPLOYEE.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.managerOptions = (res || []).filter((e) => !this.id || e.id !== this.id);
      },
    });
  }

  loadBranches(companyId: string): void {
    this.apiService.post<any[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, { companyId }).subscribe({
      next: (res) => (this.branches = res),
    });
  }

  loadDepartments(companyId: string | null, branchId: string | null): void {
    if (!companyId && !branchId) {
      this.departments = [];
      return;
    }

    if (branchId) {
      this.apiService
        .post<any[]>(this.apiService.DEPARTMENT.LOAD_BY_BRANCH, { branchId })
        .subscribe({
          next: (res) => (this.departments = res),
          error: () => (this.departments = []),
        });
      return;
    }

    this.apiService
      .post<any[]>(this.apiService.DEPARTMENT.LOAD_BY_COMPANY, { companyId })
      .subscribe({
        next: (res) => (this.departments = res),
        error: () => (this.departments = []),
      });
  }

  loadParts(departmentId: string): void {
    this.apiService
      .post<any[]>(this.apiService.PART.LOAD_BY_DEPARTMENT, { departmentId })
      .subscribe({
        next: (res) => (this.parts = res),
      });
  }

  loadPositions(departmentId: string): void {
    this.apiService.post<any[]>(this.apiService.POSITION.SELECT_BOX, { departmentId }).subscribe({
      next: (res) => (this.positions = res),
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
          gender: employee.gender ?? null,
          avatarUrl: employee.avatarUrl ?? null,
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
          status: employee.status || enumData.WORK_STATUS.WORKING.value,
          joinDate: employee.joinDate ? new Date(employee.joinDate) : null,
          resignationDate: employee.resignationDate ? new Date(employee.resignationDate) : null,
          resignationReason: employee.resignationReason,
          companyId: employee.companyId,
          branchId: employee.branchId,
          departmentId: employee.departmentId,
          partId: employee.partId,
          positionId: employee.positionId,
          directManagerId: employee.directManagerId ?? null,
        });

        this.managerOptions = (this.managerOptions || []).filter((e) => e.id !== employee.id);

        if (employee.companyId) {
          this.loadBranches(employee.companyId);
        }
        if (employee.companyId || employee.branchId) {
          this.loadDepartments(employee.companyId ?? null, employee.branchId ?? null);
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

  loadHirePrefill(candidateId: string): void {
    this.loading = true;
    this.apiService
      .post<CandidateHirePrefill>(this.apiService.CANDIDATE.HIRE_PREFILL, { id: candidateId })
      .subscribe({
        next: (prefill) => {
          if (prefill.employeeId) {
            this.message.warning(this.i18n.instant('humanResource.employee.hireAlreadyLinked'));
            this.router.navigate([
              ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.DETAIL_EMPLOYEE.path,
              prefill.employeeId,
            ]);
            return;
          }

          this.hireCandidateLabel = `${prefill.candidateCode} — ${prefill.fullName}`;
          const gender = (prefill.gender || '').toUpperCase();
          const genderValue = ['MALE', 'FEMALE', 'OTHER'].includes(gender) ? gender : null;

          this.validateForm.patchValue({
            code: prefill.suggestedEmployeeCode || '',
            firstName: prefill.firstName || '',
            lastName: prefill.lastName || '',
            fullName: prefill.fullName || '',
            gender: genderValue,
            phone: prefill.phone || '',
            email: prefill.email || '',
            dayOfBirth: prefill.dateOfBirth ? new Date(prefill.dateOfBirth) : null,
            companyId: prefill.companyId || null,
            branchId: prefill.branchId || null,
            departmentId: prefill.departmentId || null,
            partId: prefill.partId || null,
            positionId: prefill.positionId || null,
            joinDate: new Date(),
            status: enumData.WORK_STATUS.WORKING.value,
          });
          this.fullNameManuallyEdited = true;

          if (prefill.companyId) {
            this.loadBranches(prefill.companyId);
          }
          if (prefill.companyId || prefill.branchId) {
            this.loadDepartments(prefill.companyId ?? null, prefill.branchId ?? null);
          }
          if (prefill.departmentId) {
            this.loadParts(prefill.departmentId);
            this.loadPositions(prefill.departmentId);
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.hireCandidateId = null;
          this.loading = false;
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
      next: (res) => {
        if (!this.isEdit && this.hireCandidateId) {
          const employeeId = typeof res === 'string' ? res : res?.id || res?.data || res;
          if (employeeId) {
            this.apiService
              .post(this.apiService.CANDIDATE.LINK_EMPLOYEE, {
                candidateId: this.hireCandidateId,
                employeeId,
                setStatusHired: true,
              })
              .subscribe({
                next: () => {
                  this.message.success(this.i18n.createSuccess());
                  this.goBack();
                },
                error: (err: any) => {
                  this.message.warning(
                    this.i18n.instant('humanResource.employee.hireLinkFailed', {
                      detail: err?.error || '',
                    }),
                  );
                  this.goBack();
                },
              });
            return;
          }
        }
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
