import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  DepartmentSelectBoxDto,
  Part,
  PartMasterSelectBoxDto,
} from '../../../../../../core/models';
import { ApiService } from '../../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../../core/services/i18n-message.service';

@Component({
  standalone: false,
  selector: 'app-add-or-update-part',
  templateUrl: './add-or-update-part.component.html',
  styleUrls: [],
})
export class AddOrUpdatePartComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  departments: DepartmentSelectBoxDto[] = [];
  partMasters: PartMasterSelectBoxDto[] = [];

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
      this.loadPartDetail(this.id);
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      code: ['', [Validators.maxLength(50)]],
      name: ['', [Validators.maxLength(250)]],
      description: [''],
      companyId: [null, [Validators.required]],
      branchId: [null, [Validators.required]],
      departmentId: [null, [Validators.required]],
      partMasterId: [null, [Validators.required]],
      limit: [null],
      isActive: [true],
      displayOrder: [0],
    });

    this.validateForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.loadBranches(companyId);
      this.loadPartMasters(companyId, null);
      if (!companyId) {
        this.validateForm.patchValue(
          { branchId: null, departmentId: null, partMasterId: null },
          { emitEvent: false },
        );
        this.branches = [];
        this.departments = [];
      }
    });

    this.validateForm.get('branchId')?.valueChanges.subscribe((branchId) => {
      const companyId = this.validateForm.value.companyId;
      this.loadDepartments(branchId);
      this.loadPartMasters(companyId, branchId);
      if (!branchId) {
        this.validateForm.patchValue({ departmentId: null }, { emitEvent: false });
        this.departments = [];
      }
    });
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.companies = res;
        if (!this.isEdit && !this.validateForm.value.companyId && this.companies.length > 0) {
          this.validateForm.patchValue({ companyId: this.companies[0].id });
        }
      },
      error: () => this.message.error(this.i18n.instant('common.messages.loadCompanyListFailed')),
    });
  }

  loadBranches(companyId: string | null): void {
    if (!companyId) {
      this.branches = [];
      return;
    }
    this.apiService
      .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, { companyId })
      .subscribe({
        next: (items) => (this.branches = items),
        error: () => (this.branches = []),
      });
  }

  loadDepartments(branchId: string | null): void {
    if (!branchId) {
      this.departments = [];
      return;
    }
    this.apiService
      .post<DepartmentSelectBoxDto[]>(this.apiService.DEPARTMENT.LOAD_BY_BRANCH, { branchId })
      .subscribe({
        next: (items) => (this.departments = items),
        error: () => (this.departments = []),
      });
  }

  loadPartMasters(companyId: string | null, branchId: string | null): void {
    this.apiService
      .post<PartMasterSelectBoxDto[]>(this.apiService.PART_MASTER.SELECT_BOX, {
        companyId,
        branchId,
      })
      .subscribe({
        next: (items) => (this.partMasters = items),
        error: () => (this.partMasters = []),
      });
  }

  loadPartDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Part>(this.apiService.PART.DETAIL, { id }).subscribe({
      next: (part) => {
        this.validateForm.patchValue({
          code: part.code ?? '',
          name: part.name ?? '',
          description: part.description ?? '',
          companyId: part.companyId,
          branchId: part.branchId,
          departmentId: part.departmentId,
          partMasterId: part.partMasterId,
          limit: part.limit,
          isActive: part.isActive ?? true,
          displayOrder: part.displayOrder ?? 0,
        });
        this.loadBranches(part.companyId ?? null);
        this.loadDepartments(part.branchId ?? null);
        this.loadPartMasters(part.companyId ?? null, part.branchId ?? null);
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.path]);
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
      code: value.code?.trim() || null,
      name: value.name?.trim() || null,
      description: value.description?.trim() || null,
      companyId: value.companyId || null,
      branchId: value.branchId || null,
      departmentId: value.departmentId || null,
      partMasterId: value.partMasterId || null,
      limit: value.limit ?? null,
      isActive: value.isActive ?? true,
      displayOrder: value.displayOrder ?? 0,
    };

    const endpoint = this.isEdit ? this.apiService.PART.UPDATE : this.apiService.PART.CREATE;
    const requestBody = this.isEdit ? { ...payload, id: this.id } : payload;

    this.apiService.post<any>(endpoint, requestBody).subscribe({
      next: () => {
        this.message.success(
          this.isEdit ? 'Cập nhật bộ phận thành công!' : 'Thêm mới bộ phận thành công!',
        );
        this.goBack();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
      },
    });
  }
}
