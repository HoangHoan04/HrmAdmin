import { ROUTES_CONFIG } from '@/app/core/constants/common';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  DepartmentSelectBoxDto,
  JobDescription,
  PartSelectBoxDto,
  PositionSelectBoxDto,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-job-description',
  templateUrl: './add-or-update-job-description.component.html',
  styleUrls: [],
})
export class AddOrUpdateJobDescriptionComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  isDetail = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  departments: DepartmentSelectBoxDto[] = [];
  parts: PartSelectBoxDto[] = [];
  positions: PositionSelectBoxDto[] = [];

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
    this.isDetail = this.router.url.includes('/detail');
    this.isEdit = !!this.id && !this.isDetail;
    this.loadCompanies();
    if (this.id) this.loadDetail(this.id);
    if (this.isDetail) this.validateForm.disable();
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      title: ['', [Validators.required, Validators.maxLength(255)]],
      companyId: [null, [Validators.required]],
      branchId: [null],
      departmentId: [null],
      partId: [null],
      positionId: [null],
      responsibilities: [''],
      requirements: [''],
      benefits: [''],
      isActive: [true],
    });

    this.validateForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.loadBranches(companyId);
      this.validateForm.patchValue({
        branchId: null,
        departmentId: null,
        partId: null,
        positionId: null,
      });
    });
    this.validateForm.get('branchId')?.valueChanges.subscribe((branchId) => {
      this.loadDepartments(branchId);
      this.validateForm.patchValue({ departmentId: null, partId: null, positionId: null });
    });
    this.validateForm.get('departmentId')?.valueChanges.subscribe((departmentId) => {
      this.loadParts(departmentId);
      this.loadPositions();
      this.validateForm.patchValue({ partId: null, positionId: null });
    });
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => (this.companies = res),
    });
  }

  loadBranches(companyId: string | null): void {
    if (!companyId) {
      this.branches = [];
      return;
    }
    this.apiService
      .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, { companyId })
      .subscribe({ next: (res) => (this.branches = res) });
  }

  loadDepartments(branchId: string | null): void {
    if (!branchId) {
      this.departments = [];
      return;
    }
    this.apiService
      .post<DepartmentSelectBoxDto[]>(this.apiService.DEPARTMENT.LOAD_BY_BRANCH, { branchId })
      .subscribe({ next: (res) => (this.departments = res) });
  }

  loadParts(departmentId: string | null): void {
    if (!departmentId) {
      this.parts = [];
      return;
    }
    this.apiService
      .post<PartSelectBoxDto[]>(this.apiService.PART.LOAD_BY_DEPARTMENT, { departmentId })
      .subscribe({ next: (res) => (this.parts = res) });
  }

  loadPositions(): void {
    this.apiService
      .post<PositionSelectBoxDto[]>(this.apiService.POSITION.SELECT_BOX, {})
      .subscribe({ next: (res) => (this.positions = res) });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<JobDescription>(this.apiService.JOB_DESCRIPTION.DETAIL, { id }).subscribe({
      next: (item) => {
        this.loadBranches(item.companyId);
        this.loadDepartments(item.branchId ?? null);
        this.loadParts(item.departmentId ?? null);
        this.loadPositions();
        this.validateForm.patchValue({
          code: item.code,
          title: item.title,
          companyId: item.companyId,
          branchId: item.branchId,
          departmentId: item.departmentId,
          partId: item.partId,
          positionId: item.positionId,
          responsibilities: item.responsibilities,
          requirements: item.requirements,
          benefits: item.benefits,
          isActive: item.isActive,
        });
        this.loading = false;
        if (this.isDetail) this.validateForm.disable();
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.JOB_DESCRIPTION.path]);
  }

  submitForm(): void {
    if (this.isDetail) return;
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }
    this.submitting = true;
    const value = this.validateForm.getRawValue();
    const payload = { ...value };
    const endpoint = this.isEdit
      ? this.apiService.JOB_DESCRIPTION.UPDATE
      : this.apiService.JOB_DESCRIPTION.CREATE;
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
