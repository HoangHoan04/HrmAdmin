import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  DepartmentSelectBoxDto,
  PartSelectBoxDto,
  Position,
  PositionMasterSelectBoxDto,
} from '../../../../../../core/models';
import { ApiService } from '../../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../../core/services/i18n-message.service';
import { OrganizationCascadeService } from '../../../../../../core/services/organization-cascade.service';

@Component({
  standalone: false,
  selector: 'app-add-or-update-position',
  templateUrl: './add-or-update-position.component.html',
  styleUrls: [],
})
export class AddOrUpdatePositionComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  departments: DepartmentSelectBoxDto[] = [];
  parts: PartSelectBoxDto[] = [];
  positionMasters: PositionMasterSelectBoxDto[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cascade: OrganizationCascadeService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.loadCompanies();
    if (this.isEdit && this.id) {
      this.loadPositionDetail(this.id);
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      positionMasterId: [null, [Validators.required]],
      companyId: [null, [Validators.required]],
      branchId: [null, [Validators.required]],
      departmentId: [null, [Validators.required]],
      partId: [null],
      quantityStandard: [null],
      isActive: [true],
      displayOrder: [0],
    });

    this.validateForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.loadBranches(companyId);
      this.loadPositionMasters(companyId, null);
      if (!companyId) {
        this.validateForm.patchValue({ branchId: null, departmentId: null, partId: null }, { emitEvent: false });
        this.branches = [];
        this.departments = [];
        this.parts = [];
      }
    });

    this.validateForm.get('branchId')?.valueChanges.subscribe((branchId) => {
      const companyId = this.validateForm.value.companyId;
      this.loadDepartments(branchId);
      this.loadPositionMasters(companyId, branchId);
      this.validateForm.patchValue({ departmentId: null, partId: null }, { emitEvent: false });
      this.parts = [];
    });

    this.validateForm.get('departmentId')?.valueChanges.subscribe((departmentId) => {
      this.loadParts(departmentId);
      if (!departmentId) {
        this.validateForm.patchValue({ partId: null }, { emitEvent: false });
        this.parts = [];
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
    this.cascade.loadBranchesByCompany(companyId).subscribe({
      next: (items) => (this.branches = items),
      error: () => (this.branches = []),
    });
  }

  loadDepartments(branchId: string | null): void {
    if (!branchId) {
      this.departments = [];
      return;
    }
    this.cascade.loadDepartmentsByBranch(branchId).subscribe({
      next: (items) => (this.departments = items),
      error: () => (this.departments = []),
    });
  }

  loadParts(departmentId: string | null): void {
    if (!departmentId) {
      this.parts = [];
      return;
    }
    this.cascade.loadPartsByDepartment(departmentId).subscribe({
      next: (items) => (this.parts = items),
      error: () => (this.parts = []),
    });
  }

  loadPositionMasters(companyId: string | null, branchId: string | null): void {
    this.cascade.loadPositionMastersByScope(companyId, branchId).subscribe({
      next: (items) => (this.positionMasters = items),
      error: () => (this.positionMasters = []),
    });
  }

  loadPositionDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Position>(this.apiService.POSITION.DETAIL, { id }).subscribe({
      next: (position) => {
        this.validateForm.patchValue({
          positionMasterId: position.positionMasterId,
          companyId: position.companyId,
          branchId: position.branchId,
          departmentId: position.departmentId,
          partId: position.partId,
          quantityStandard: position.quantityStandard,
          isActive: position.isActive ?? true,
          displayOrder: position.displayOrder ?? 0,
        });
        this.loadBranches(position.companyId ?? null);
        this.loadDepartments(position.branchId ?? null);
        this.loadParts(position.departmentId ?? null);
        this.loadPositionMasters(position.companyId ?? null, position.branchId ?? null);
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.path]);
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
      positionMasterId: value.positionMasterId || null,
      companyId: value.companyId || null,
      branchId: value.branchId || null,
      departmentId: value.departmentId || null,
      partId: value.partId || null,
      quantityStandard: value.quantityStandard ?? null,
      isActive: value.isActive ?? true,
      displayOrder: value.displayOrder ?? 0,
    };

    const endpoint = this.isEdit ? this.apiService.POSITION.UPDATE : this.apiService.POSITION.CREATE;
    const requestBody = this.isEdit ? { ...payload, id: this.id } : payload;

    this.apiService.post<any>(endpoint, requestBody).subscribe({
      next: () => {
        this.message.success(this.isEdit ? 'Cập nhật chức vụ thành công!' : 'Thêm mới chức vụ thành công!');
        this.goBack();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
      },
    });
  }
}
