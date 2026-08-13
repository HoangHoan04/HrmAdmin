import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  EvaluationCriteria,
  HiringPlan,
  JobDescription,
  PagedResult,
  RecruitmentRequest,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

interface PlanCriteriaRow {
  evaluationCriteriaId: string | null;
  weight: number;
  maxScore: number;
  displayOrder: number;
}

@Component({
  standalone: false,
  selector: 'app-add-or-update-hiring-plan',
  templateUrl: './add-or-update-hiring-plan.component.html',
  styleUrls: [],
})
export class AddOrUpdateHiringPlanComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  criteriaSaving = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  requests: RecruitmentRequest[] = [];
  jobDescriptions: JobDescription[] = [];
  criteriaCatalog: EvaluationCriteria[] = [];
  criteriaRows: PlanCriteriaRow[] = [];
  statuses = Object.values(enumData.HIRING_PLAN_STATUS);
  private suppressOrgReset = false;

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
      recruitmentRequestId: [null],
      jobDescriptionId: [null, Validators.required],
      companyId: [null, Validators.required],
      branchId: [null],
      targetQuantity: [1, [Validators.required, Validators.min(1)]],
      status: ['DRAFT', Validators.required],
      note: [''],
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => (this.companies = res),
    });
    this.loadLookups();
    this.loadCriteriaCatalog();

    this.validateForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      if (!this.suppressOrgReset) {
        this.validateForm.patchValue({ branchId: null }, { emitEvent: false });
      }
      this.loadBranches(companyId);
      this.loadJobDescriptions(companyId);
      this.loadApprovedRequests(companyId);
    });
    this.validateForm.get('recruitmentRequestId')?.valueChanges.subscribe((reqId) => {
      this.onRequestChange(reqId);
    });
    this.validateForm.get('jobDescriptionId')?.valueChanges.subscribe((jdId) => {
      this.onJdChange(jdId);
    });

    if (this.isEdit && this.id) this.loadDetail(this.id);
    else this.loadJobDescriptions(null);
  }

  loadLookups(): void {
    this.loadApprovedRequests(null);
  }

  loadCriteriaCatalog(): void {
    this.apiService
      .post<PagedResult<EvaluationCriteria>>(this.apiService.EVALUATION_CRITERIA.PAGINATION, {
        pageIndex: 1,
        pageSize: 200,
        isActive: true,
      })
      .subscribe({ next: (res) => (this.criteriaCatalog = res.items) });
  }

  addCriteriaRow(): void {
    this.criteriaRows = [
      ...this.criteriaRows,
      {
        evaluationCriteriaId: null,
        weight: 1,
        maxScore: 10,
        displayOrder: this.criteriaRows.length,
      },
    ];
  }

  removeCriteriaRow(index: number): void {
    this.criteriaRows = this.criteriaRows
      .filter((_, i) => i !== index)
      .map((row, i) => ({ ...row, displayOrder: i }));
  }

  onCriteriaPick(row: PlanCriteriaRow): void {
    const picked = this.criteriaCatalog.find((c) => c.id === row.evaluationCriteriaId);
    if (!picked) return;
    row.weight = picked.defaultWeight ?? row.weight;
    row.maxScore = picked.maxScore ?? row.maxScore;
  }

  saveCriteria(): void {
    if (!this.isEdit || !this.id) {
      this.message.warning(this.i18n.instant('recruitment.plan.criteriaSaveAfterCreate'));
      return;
    }
    const invalid = this.criteriaRows.some((r) => !r.evaluationCriteriaId);
    if (invalid) {
      this.message.warning(this.i18n.instant('recruitment.plan.criteriaPickRequired'));
      return;
    }
    const ids = this.criteriaRows.map((r) => r.evaluationCriteriaId);
    if (new Set(ids).size !== ids.length) {
      this.message.warning(this.i18n.instant('recruitment.plan.criteriaDuplicate'));
      return;
    }
    this.criteriaSaving = true;
    this.apiService
      .post(this.apiService.HIRING_PLAN.SET_CRITERIA, {
        hiringPlanId: this.id,
        criteria: this.criteriaRows.map((r, i) => ({
          evaluationCriteriaId: r.evaluationCriteriaId,
          weight: r.weight,
          maxScore: r.maxScore,
          displayOrder: r.displayOrder ?? i,
        })),
      })
      .subscribe({
        next: () => {
          this.message.success(this.i18n.updateSuccess());
          this.criteriaSaving = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.criteriaSaving = false;
        },
      });
  }

  loadApprovedRequests(companyId: string | null): void {
    const payload: Record<string, unknown> = {
      pageIndex: 1,
      pageSize: 200,
      status: 'APPROVED',
    };
    if (companyId) payload['companyId'] = companyId;
    this.apiService
      .post<PagedResult<RecruitmentRequest>>(
        this.apiService.RECRUITMENT_REQUEST.PAGINATION,
        payload,
      )
      .subscribe({ next: (res) => (this.requests = res.items) });
  }

  loadJobDescriptions(companyId: string | null): void {
    const payload: Record<string, unknown> = {
      pageIndex: 1,
      pageSize: 200,
      isActive: true,
    };
    if (companyId) payload['companyId'] = companyId;
    this.apiService
      .post<PagedResult<JobDescription>>(this.apiService.JOB_DESCRIPTION.PAGINATION, payload)
      .subscribe({ next: (res) => (this.jobDescriptions = res.items) });
  }

  loadBranches(companyId: string | null): void {
    if (!companyId) {
      this.branches = [];
      return;
    }
    this.apiService
      .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.SELECT_BOX, { companyId })
      .subscribe({ next: (res) => (this.branches = res) });
  }

  onRequestChange(reqId: string | null): void {
    if (!reqId) return;
    const req = this.requests.find((x) => x.id === reqId);
    if (!req) return;
    this.suppressOrgReset = true;
    this.validateForm.patchValue(
      {
        companyId: req.companyId,
        branchId: req.branchId || null,
        jobDescriptionId: req.jobDescriptionId || this.validateForm.value.jobDescriptionId,
        targetQuantity: req.quantity || this.validateForm.value.targetQuantity,
        name: this.validateForm.value.name || req.title,
      },
      { emitEvent: true },
    );
    queueMicrotask(() => {
      this.suppressOrgReset = false;
    });
  }

  onJdChange(jdId: string | null): void {
    if (!jdId || this.validateForm.value.companyId) return;
    const jd = this.jobDescriptions.find((x) => x.id === jdId);
    if (jd?.companyId) {
      this.suppressOrgReset = true;
      this.validateForm.patchValue({ companyId: jd.companyId }, { emitEvent: true });
      queueMicrotask(() => {
        this.suppressOrgReset = false;
      });
    }
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<HiringPlan>(this.apiService.HIRING_PLAN.DETAIL, { id }).subscribe({
      next: (item) => {
        this.suppressOrgReset = true;
        this.validateForm.patchValue({
          code: item.code,
          name: item.name,
          recruitmentRequestId: item.recruitmentRequestId || null,
          jobDescriptionId: item.jobDescriptionId,
          companyId: item.companyId,
          branchId: item.branchId || null,
          targetQuantity: item.targetQuantity,
          status: item.status,
          note: item.note || '',
        });
        this.criteriaRows = (item.criteria || [])
          .slice()
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((c, i) => ({
            evaluationCriteriaId: c.evaluationCriteriaId,
            weight: c.weight ?? 1,
            maxScore: c.maxScore ?? 10,
            displayOrder: c.displayOrder ?? i,
          }));
        this.loadBranches(item.companyId);
        this.loadJobDescriptions(item.companyId);
        this.loadApprovedRequests(item.companyId);
        this.loading = false;
        queueMicrotask(() => {
          this.suppressOrgReset = false;
        });
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.HIRING_PLAN.path]);
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      if (!this.validateForm.value.companyId) {
        this.message.warning(this.i18n.instant('recruitment.plan.companyRequired'));
      }
      return;
    }
    this.submitting = true;
    const payload = this.validateForm.getRawValue();
    const endpoint = this.isEdit
      ? this.apiService.HIRING_PLAN.UPDATE
      : this.apiService.HIRING_PLAN.CREATE;
    const body = this.isEdit ? { ...payload, id: this.id } : payload;
    this.apiService.post(endpoint, body).subscribe({
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
