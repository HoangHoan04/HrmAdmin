import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  PerformanceReviewCycle,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-review-cycle',
  templateUrl: './add-or-update-review-cycle.component.html',
  styleUrls: [],
})
export class AddOrUpdateReviewCycleComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  statusOptions = Object.values(enumData.REVIEW_CYCLE_STATUS);

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      companyId: [null, [Validators.required]],
      branchId: [null],
      periodFrom: [null, [Validators.required]],
      periodTo: [null, [Validators.required]],
      status: ['DRAFT', [Validators.required]],
      note: [''],
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => (this.companies = res),
    });
    this.validateForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.loadBranches(companyId);
      this.validateForm.patchValue({ branchId: null });
    });
    if (this.isEdit && this.id) this.loadDetail(this.id);
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

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService
      .post<PerformanceReviewCycle>(this.apiService.PERFORMANCE_CYCLE.DETAIL, { id })
      .subscribe({
        next: (item) => {
          this.validateForm.patchValue({
            ...item,
            periodFrom: item.periodFrom ? new Date(item.periodFrom) : null,
            periodTo: item.periodTo ? new Date(item.periodTo) : null,
          });
          if (item.companyId) this.loadBranches(item.companyId);
          this.loading = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadDetailFailed(err.error));
          this.goBack();
        },
      });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.REVIEW_CYCLE.path]);
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }
    this.submitting = true;
    const raw = this.validateForm.getRawValue();
    const toDateOnly = (d: Date | null) =>
      d ? new Date(d).toISOString().substring(0, 10) : null;
    const payload = {
      ...raw,
      periodFrom: toDateOnly(raw.periodFrom),
      periodTo: toDateOnly(raw.periodTo),
    };
    const endpoint = this.isEdit
      ? this.apiService.PERFORMANCE_CYCLE.UPDATE
      : this.apiService.PERFORMANCE_CYCLE.CREATE;
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
