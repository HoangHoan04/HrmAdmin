import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  Department,
  DepartmentSelectBoxDto,
  EmployeeSelectBoxDto,
} from '../../../../../core/models';
import { ApiService } from '../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../core/services/i18n-message.service';

@Component({
  standalone: false,
  selector: 'app-add-or-update-department',
  templateUrl: './add-or-update-department.component.html',
  styleUrls: ['./add-or-update-department.component.scss'],
})
export class AddOrUpdateDepartmentComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  parentDepartments: DepartmentSelectBoxDto[] = [];
  employees: EmployeeSelectBoxDto[] = [];
  private companyCodeFromRoute: string | null = null;
  private branchCodeFromRoute: string | null = null;

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
    this.companyCodeFromRoute = this.route.snapshot.queryParamMap.get('companyCode');
    this.branchCodeFromRoute = this.route.snapshot.queryParamMap.get('branchCode');

    this.loadCompanies();
    this.loadEmployees();

    if (this.isEdit && this.id) {
      this.loadDepartmentDetail(this.id);
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      shortName: ['', [Validators.maxLength(100)]],
      description: [''],
      type: [''],
      companyId: [null, [Validators.required]],
      branchId: [null, [Validators.required]],
      parentDepartmentId: [null],
      managerId: [null],
      deputyManagerId: [null],
      level: [1, [Validators.min(1)]],
      limit: [0, [Validators.min(0)]],
      email: ['', [Validators.email]],
      phoneExtension: [''],
      costCenterCode: [''],
      displayOrder: [0, [Validators.min(0)]],
      isActive: [true],
      isNotifyMarketing: [false],
    });

    this.validateForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.loadBranches(companyId);
      if (!companyId) {
        this.validateForm.patchValue(
          { branchId: null, parentDepartmentId: null },
          { emitEvent: false },
        );
        this.branches = [];
        this.parentDepartments = [];
      }
    });

    this.validateForm.get('branchId')?.valueChanges.subscribe((branchId) => {
      this.loadParentDepartments(branchId);
      if (!branchId) {
        this.validateForm.patchValue({ parentDepartmentId: null }, { emitEvent: false });
        this.parentDepartments = [];
      }
    });
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.companies = res;
        this.applyCompanyFromRoute();
      },
      error: () => {
        this.message.error(this.i18n.instant('common.messages.loadCompanySelectFailed'));
      },
    });
  }

  loadEmployees(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (items) => (this.employees = items),
        error: () => (this.employees = []),
      });
  }

  loadBranches(companyId: string | null, onComplete?: () => void): void {
    if (!companyId) {
      this.branches = [];
      onComplete?.();
      return;
    }

    this.apiService
      .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, { companyId })
      .subscribe({
        next: (items) => {
          this.branches = items;
          this.applyBranchFromRoute();
          onComplete?.();
        },
        error: () => {
          this.branches = [];
          onComplete?.();
        },
      });
  }

  loadParentDepartments(branchId: string | null, excludeId?: string): void {
    if (!branchId) {
      this.parentDepartments = [];
      return;
    }

    this.apiService
      .post<DepartmentSelectBoxDto[]>(this.apiService.DEPARTMENT.LOAD_BY_BRANCH, {
        branchId,
        excludeId,
      })
      .subscribe({
        next: (items) => {
          this.parentDepartments = items;
        },
        error: () => {
          this.parentDepartments = [];
        },
      });
  }

  loadDepartmentDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Department>(this.apiService.DEPARTMENT.DETAIL, { id }).subscribe({
      next: (department) => {
        this.validateForm.patchValue({
          code: department.code,
          name: department.name,
          shortName: department.shortName ?? '',
          description: department.description ?? '',
          type: department.type ?? '',
          companyId: department.companyId,
          branchId: department.branchId,
          parentDepartmentId: department.parentDepartmentId,
          managerId: department.managerId ?? null,
          deputyManagerId: department.deputyManagerId ?? null,
          level: department.level ?? 1,
          limit: department.limit ?? 0,
          email: department.email ?? '',
          phoneExtension: department.phoneExtension ?? '',
          costCenterCode: department.costCenterCode ?? '',
          displayOrder: department.displayOrder ?? 0,
          isActive: department.isActive ?? true,
          isNotifyMarketing: department.isNotifyMarketing ?? false,
        });
        this.loadBranches(department.companyId ?? null, () => {
          this.loadParentDepartments(department.branchId ?? null, id);
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
    const queryParams: Record<string, string> = {};
    if (this.companyCodeFromRoute) queryParams['companyCode'] = this.companyCodeFromRoute;
    if (this.branchCodeFromRoute) queryParams['branchCode'] = this.branchCodeFromRoute;
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.path], {
      queryParams: Object.keys(queryParams).length ? queryParams : undefined,
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
      shortName: value.shortName?.trim() || null,
      description: value.description?.trim() || null,
      type: value.type?.trim() || null,
      companyId: value.companyId || null,
      branchId: value.branchId || null,
      parentDepartmentId: value.parentDepartmentId || null,
      managerId: value.managerId || null,
      deputyManagerId: value.deputyManagerId || null,
      level: value.level ?? 1,
      limit: value.limit ?? 0,
      email: value.email?.trim() || null,
      phoneExtension: value.phoneExtension?.trim() || null,
      costCenterCode: value.costCenterCode?.trim() || null,
      displayOrder: value.displayOrder ?? 0,
      isActive: value.isActive ?? true,
      isNotifyMarketing: value.isNotifyMarketing ?? false,
    };

    const endpoint = this.isEdit
      ? this.apiService.DEPARTMENT.UPDATE
      : this.apiService.DEPARTMENT.CREATE;
    const requestBody = this.isEdit ? { ...payload, id: this.id } : payload;

    this.apiService.post<any>(endpoint, requestBody).subscribe({
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

  private applyCompanyFromRoute(): void {
    if (!this.companyCodeFromRoute || this.isEdit) return;
    const company = this.companies.find(
      (item) => item.code?.toLowerCase() === this.companyCodeFromRoute!.toLowerCase(),
    );
    if (company?.id) {
      this.validateForm.patchValue({ companyId: company.id });
    }
  }

  private applyBranchFromRoute(): void {
    if (!this.branchCodeFromRoute || this.isEdit) return;
    const branch = this.branches.find(
      (item) => item.code?.toLowerCase() === this.branchCodeFromRoute!.toLowerCase(),
    );
    if (branch?.id) {
      this.validateForm.patchValue({ branchId: branch.id });
    }
  }
}
