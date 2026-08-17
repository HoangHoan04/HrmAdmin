import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  DepartmentSelectBoxDto,
  JobDescription,
  PagedResult,
  PartSelectBoxDto,
  PositionSelectBoxDto,
  RecruitmentRequest,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin, of, switchMap } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-add-or-update-request',
  templateUrl: './add-or-update-request.component.html',
  styleUrls: [],
})
export class AddOrUpdateRequestComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  isDetail = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  enumData = enumData;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  departments: DepartmentSelectBoxDto[] = [];
  parts: PartSelectBoxDto[] = [];
  positions: PositionSelectBoxDto[] = [];
  jobDescriptions: JobDescription[] = [];
  levelOptions = Object.values(enumData.RECRUITMENT_REQUEST_LEVEL);

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
    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      title: ['', [Validators.required, Validators.maxLength(255)]],
      requestLevel: ['DEPARTMENT', [Validators.required]],
      companyId: [null, [Validators.required]],
      branchId: [null],
      departmentId: [null],
      partId: [null],
      positionId: [null],
      jobDescriptionId: [null],
      quantity: [1, [Validators.required, Validators.min(1)]],
      reason: [''],
      expectedStartDate: [null],
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isDetail = this.router.url.includes('/detail');
    this.isEdit = !!this.id && !this.isDetail;

    if (this.isEdit) {
      this.validateForm.get('code')?.disable({ emitEvent: false });
    }

    this.validateForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.loadBranches(companyId);
      this.validateForm.patchValue(
        { branchId: null, departmentId: null, partId: null },
        { emitEvent: false },
      );
    });
    this.validateForm.get('branchId')?.valueChanges.subscribe((branchId) => {
      this.loadDepartments(branchId);
      this.validateForm.patchValue({ departmentId: null, partId: null }, { emitEvent: false });
    });
    this.validateForm.get('departmentId')?.valueChanges.subscribe((departmentId) => {
      this.loadParts(departmentId);
      this.validateForm.patchValue({ partId: null }, { emitEvent: false });
    });

    forkJoin({
      companies: this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}),
      positions: this.apiService.post<PositionSelectBoxDto[]>(this.apiService.POSITION.SELECT_BOX, {}),
      jobDescriptions: this.apiService.post<PagedResult<JobDescription>>(
        this.apiService.JOB_DESCRIPTION.PAGINATION,
        { pageIndex: 1, pageSize: 200, isActive: true },
      ),
    }).subscribe({
      next: ({ companies, positions, jobDescriptions }) => {
        this.companies = companies;
        this.positions = positions;
        this.jobDescriptions = jobDescriptions.items;
        this.cdr.markForCheck();
        if (this.id) {
          this.loadDetail(this.id);
        } else if (this.isDetail) {
          this.validateForm.disable({ emitEvent: false });
        }
      },
    });
  }

  loadBranches(companyId: string | null): void {
    if (!companyId) {
      this.branches = [];
      this.cdr.markForCheck();
      return;
    }
    this.apiService
      .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, { companyId })
      .subscribe({
        next: (res) => {
          this.branches = res;
          this.cdr.markForCheck();
        },
      });
  }

  loadDepartments(branchId: string | null): void {
    if (!branchId) {
      this.departments = [];
      this.cdr.markForCheck();
      return;
    }
    this.apiService
      .post<DepartmentSelectBoxDto[]>(this.apiService.DEPARTMENT.LOAD_BY_BRANCH, { branchId })
      .subscribe({
        next: (res) => {
          this.departments = res;
          this.cdr.markForCheck();
        },
      });
  }

  loadParts(departmentId: string | null): void {
    if (!departmentId) {
      this.parts = [];
      this.cdr.markForCheck();
      return;
    }
    this.apiService
      .post<PartSelectBoxDto[]>(this.apiService.PART.LOAD_BY_DEPARTMENT, { departmentId })
      .subscribe({
        next: (res) => {
          this.parts = res;
          this.cdr.markForCheck();
        },
      });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService
      .post<RecruitmentRequest>(this.apiService.RECRUITMENT_REQUEST.DETAIL, { id })
      .subscribe({
        next: (item) => {
          const branch$ = item.companyId
            ? this.apiService.post<BranchSelectBoxDto[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, {
                companyId: item.companyId,
              })
            : of([] as BranchSelectBoxDto[]);

          branch$
            .pipe(
              switchMap((branches) => {
                this.branches = branches;
                return item.branchId
                  ? this.apiService.post<DepartmentSelectBoxDto[]>(
                      this.apiService.DEPARTMENT.LOAD_BY_BRANCH,
                      { branchId: item.branchId },
                    )
                  : of([] as DepartmentSelectBoxDto[]);
              }),
              switchMap((departments) => {
                this.departments = departments;
                return item.departmentId
                  ? this.apiService.post<PartSelectBoxDto[]>(this.apiService.PART.LOAD_BY_DEPARTMENT, {
                      departmentId: item.departmentId,
                    })
                  : of([] as PartSelectBoxDto[]);
              }),
            )
            .subscribe({
              next: (parts) => {
                this.parts = parts;
                this.validateForm.patchValue(
                  {
                    ...item,
                    expectedStartDate: item.expectedStartDate
                      ? new Date(item.expectedStartDate)
                      : null,
                  },
                  { emitEvent: false },
                );
                if (this.isEdit) {
                  this.validateForm.get('code')?.disable({ emitEvent: false });
                }
                if (this.isDetail) {
                  this.validateForm.disable({ emitEvent: false });
                }
                this.loading = false;
                this.cdr.markForCheck();
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
    this.router.navigate([ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.REQUEST.path]);
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
    const payload = {
      ...value,
      expectedStartDate: value.expectedStartDate
        ? new Date(value.expectedStartDate).toISOString().slice(0, 10)
        : null,
    };
    const endpoint = this.isEdit
      ? this.apiService.RECRUITMENT_REQUEST.UPDATE
      : this.apiService.RECRUITMENT_REQUEST.CREATE;
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
