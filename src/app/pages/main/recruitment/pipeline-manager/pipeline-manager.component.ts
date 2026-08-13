import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import {
  BranchSelectBoxDto,
  Candidate,
  CompanySelectBoxDto,
  EmployeeSelectBoxDto,
  HiringPlan,
  InterviewSchedule,
  PagedResult,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
import {
  candidateStatusLabel,
  interviewStatusLabel,
} from '@/app/core/utils/recruitment-label.util';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-pipeline-manager',
  templateUrl: './pipeline-manager.component.html',
  styleUrls: ['./pipeline-manager.component.scss'],
})
export class PipelineManagerComponent implements OnInit {
  readonly TOTAL_STEPS = 6;
  currentStep = 0;
  loading = false;
  submitting = false;

  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  companyId: string | null = null;
  branchId: string | null = null;

  plans: HiringPlan[] = [];
  selectedPlanId: string | null = null;
  selectedPlan?: HiringPlan;

  candidates: Candidate[] = [];
  selectedCandidateId: string | null = null;
  selectedCandidate?: Candidate;

  waitlist: Candidate[] = [];
  interviews: InterviewSchedule[] = [];
  selectedInterviewId: string | null = null;
  employees: EmployeeSelectBoxDto[] = [];

  candidateForm!: FormGroup;
  interviewForm!: FormGroup;
  interviewerForm!: FormGroup;

  canCreateCandidate = false;
  canManageInterview = false;
  canUpdateCandidate = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly permissionSvc: PermissionService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.canCreateCandidate = this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_CANDIDATE_CREATE);
    this.canManageInterview = this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_INTERVIEW_MANAGE);
    this.canUpdateCandidate = this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_CANDIDATE_UPDATE);

    this.candidateForm = this.fb.group({
      code: ['', Validators.required],
      fullName: ['', Validators.required],
      email: [''],
      phone: [''],
      hiringPlanId: [null],
      status: ['NEW'],
    });
    this.interviewForm = this.fb.group({
      round: [1, [Validators.required, Validators.min(1)]],
      startAt: [null, Validators.required],
      endAt: [null, Validators.required],
      location: [''],
    });
    this.interviewerForm = this.fb.group({
      interviewScheduleId: [null, Validators.required],
      employeeIds: [[], Validators.required],
      primaryEmployeeId: [null],
    });

    this.loadCompanies();
  }

  get canGoNext(): boolean {
    switch (this.currentStep) {
      case 0:
        return !!this.companyId;
      case 1:
        return !!this.selectedPlanId;
      case 2:
        return !!this.selectedCandidateId;
      case 3:
        return (
          !!this.selectedInterviewId ||
          this.candidateInterviews().some((i) => i.status === 'SCHEDULED')
        );
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  }

  get nextLabelKey(): string {
    return this.currentStep >= this.TOTAL_STEPS - 1
      ? 'recruitment.pipeline.btnFinish'
      : 'recruitment.pipeline.btnContinue';
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.companies = res;
        this.cdr.markForCheck();
      },
    });
  }

  onCompanyChange(companyId: string | null): void {
    this.companyId = companyId;
    this.branchId = null;
    this.branches = [];
    this.resetFromStep(1);
    if (!companyId) return;
    this.apiService
      .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.SELECT_BOX, { companyId })
      .subscribe({
        next: (res) => {
          this.branches = res;
          this.cdr.markForCheck();
        },
      });
  }

  onBranchChange(branchId: string | null): void {
    this.branchId = branchId;
    this.resetFromStep(1);
  }

  private resetFromStep(from: number): void {
    if (from <= 1) {
      this.plans = [];
      this.selectedPlanId = null;
      this.selectedPlan = undefined;
    }
    if (from <= 2) {
      this.candidates = [];
      this.selectedCandidateId = null;
      this.selectedCandidate = undefined;
      this.waitlist = [];
    }
    if (from <= 3) {
      this.interviews = [];
      this.selectedInterviewId = null;
    }
    if (from <= 4) {
      this.employees = [];
      this.interviewerForm.patchValue({
        interviewScheduleId: null,
        employeeIds: [],
        primaryEmployeeId: null,
      });
    }
  }

  loadPlans(): void {
    if (!this.companyId) return;
    this.loading = true;
    const payload: Record<string, unknown> = {
      pageIndex: 1,
      pageSize: 100,
      status: 'OPEN',
      companyId: this.companyId,
    };
    if (this.branchId) payload['branchId'] = this.branchId;

    this.apiService
      .post<PagedResult<HiringPlan>>(this.apiService.HIRING_PLAN.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.plans = this.branchId
            ? res.items.filter((p) => !p.branchId || p.branchId === this.branchId)
            : res.items;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.loading = false;
        },
      });
  }

  selectPlan(plan: HiringPlan): void {
    this.selectedPlanId = plan.id;
    this.selectedPlan = plan;
    this.candidateForm.patchValue({ hiringPlanId: plan.id });
    this.selectedCandidateId = null;
    this.selectedCandidate = undefined;
    this.selectedInterviewId = null;
    this.reloadPlanData();
  }

  selectCandidate(c: Candidate): void {
    if (!['NEW', 'SCREENING', 'INTERVIEW'].includes(c.status)) {
      this.message.warning(this.i18n.instant('recruitment.pipeline.candidateNotSchedulable'));
      return;
    }
    this.selectedCandidateId = c.id;
    this.selectedCandidate = c;
    this.cdr.markForCheck();
  }

  reloadPlanData(): void {
    if (!this.selectedPlanId) return;
    this.apiService
      .post<PagedResult<Candidate>>(this.apiService.CANDIDATE.PAGINATION, {
        pageIndex: 1,
        pageSize: 200,
        hiringPlanId: this.selectedPlanId,
      })
      .subscribe({
        next: (res) => {
          this.candidates = res.items;
          this.waitlist = res.items.filter((c) => c.status === 'WAITLIST' || c.status === 'OFFER');
          if (
            this.selectedCandidateId &&
            !res.items.some((c) => c.id === this.selectedCandidateId)
          ) {
            this.selectedCandidateId = null;
            this.selectedCandidate = undefined;
          } else if (this.selectedCandidateId) {
            this.selectedCandidate = res.items.find((c) => c.id === this.selectedCandidateId);
          }
          this.cdr.markForCheck();
        },
      });
    this.apiService
      .post<PagedResult<InterviewSchedule>>(this.apiService.INTERVIEW_SCHEDULE.PAGINATION, {
        pageIndex: 1,
        pageSize: 100,
        hiringPlanId: this.selectedPlanId,
      })
      .subscribe({
        next: (res) => {
          this.interviews = res.items;
          if (this.selectedCandidateId) {
            const mine = res.items.find(
              (i) => i.candidateId === this.selectedCandidateId && i.status === 'SCHEDULED',
            );
            if (mine) {
              this.selectedInterviewId = mine.id;
              this.interviewerForm.patchValue({ interviewScheduleId: mine.id });
            }
          }
          this.cdr.markForCheck();
        },
      });
  }

  loadEmployeesForOrg(): void {
    if (!this.companyId) {
      this.employees = [];
      return;
    }
    const body: Record<string, unknown> = { companyId: this.companyId };
    if (this.branchId) body['branchId'] = this.branchId;
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, body)
      .subscribe({
        next: (res) => {
          this.employees = res;
          this.cdr.markForCheck();
        },
      });
  }

  onStepIndexChange(index: number): void {
    if (index > this.currentStep) {
      if (!this.canEnterStep(index)) {
        this.message.warning(this.i18n.instant('recruitment.pipeline.completePreviousSteps'));
        return;
      }
    }
    this.enterStep(index);
  }

  private canEnterStep(index: number): boolean {
    if (index >= 1 && !this.companyId) return false;
    if (index >= 2 && !this.selectedPlanId) return false;
    if (index >= 3 && !this.selectedCandidateId) return false;
    return true;
  }

  private enterStep(index: number): void {
    this.currentStep = index;
    if (index === 1 && this.companyId) this.loadPlans();
    if (index === 2 && this.selectedPlanId) this.reloadPlanData();
    if (index === 4) {
      this.loadEmployeesForOrg();
      if (this.selectedInterviewId) {
        this.interviewerForm.patchValue({ interviewScheduleId: this.selectedInterviewId });
      }
    }
    if (index === 5 && this.selectedPlanId) this.reloadPlanData();
    this.cdr.markForCheck();
  }

  goBack(): void {
    if (this.currentStep <= 0) return;
    this.enterStep(this.currentStep - 1);
  }

  goNext(): void {
    if (this.currentStep === 0) {
      if (!this.companyId) {
        this.message.warning(this.i18n.instant('recruitment.pipeline.selectCompanyFirst'));
        return;
      }
      this.enterStep(1);
      return;
    }
    if (this.currentStep === 1) {
      if (!this.selectedPlanId) {
        this.message.warning(this.i18n.instant('recruitment.pipeline.selectPlanFirst'));
        return;
      }
      this.enterStep(2);
      return;
    }
    if (this.currentStep === 2) {
      if (!this.selectedCandidateId) {
        this.message.warning(this.i18n.instant('recruitment.pipeline.selectCandidateFirst'));
        return;
      }
      this.enterStep(3);
      return;
    }
    if (this.currentStep === 3) {
      if (!this.selectedInterviewId && !this.interviews.some((i) => i.status === 'SCHEDULED')) {
        this.message.warning(this.i18n.instant('recruitment.pipeline.createInterviewFirst'));
        return;
      }
      this.enterStep(4);
      return;
    }
    if (this.currentStep === 4) {
      this.enterStep(5);
      return;
    }
    if (this.currentStep === 5) {
      this.message.success(this.i18n.instant('recruitment.pipeline.finishDone'));
      this.currentStep = 0;
      this.resetFromStep(1);
      this.cdr.markForCheck();
    }
  }

  goManagePlans(): void {
    this.router.navigate([ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.HIRING_PLAN.path]);
  }

  goFullCandidateForm(): void {
    this.router.navigate(
      [
        ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_LIST.children.ADD_CANDIDATE
          .path,
      ],
      { queryParams: this.selectedPlanId ? { hiringPlanId: this.selectedPlanId } : {} },
    );
  }

  createCandidate(): void {
    if (this.candidateForm.invalid || !this.selectedPlanId) return;
    this.submitting = true;
    const body = { ...this.candidateForm.getRawValue(), hiringPlanId: this.selectedPlanId };
    this.apiService.post<string>(this.apiService.CANDIDATE.CREATE, body).subscribe({
      next: (id) => {
        this.message.success(this.i18n.createSuccess());
        this.candidateForm.reset({ status: 'NEW', hiringPlanId: this.selectedPlanId });
        this.apiService
          .post<PagedResult<Candidate>>(this.apiService.CANDIDATE.PAGINATION, {
            pageIndex: 1,
            pageSize: 200,
            hiringPlanId: this.selectedPlanId,
          })
          .subscribe({
            next: (res) => {
              this.candidates = res.items;
              const created = res.items.find((c) => c.id === id) || res.items[0];
              if (created) this.selectCandidate(created);
              this.submitting = false;
              this.cdr.markForCheck();
            },
            error: () => {
              this.reloadPlanData();
              this.submitting = false;
            },
          });
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
      },
    });
  }

  createInterview(): void {
    if (!this.selectedCandidateId || this.interviewForm.invalid) return;
    this.submitting = true;
    const raw = this.interviewForm.getRawValue();
    const body = {
      candidateId: this.selectedCandidateId,
      hiringPlanId: this.selectedPlanId,
      round: raw.round,
      location: raw.location,
      startAt: raw.startAt ? new Date(raw.startAt).toISOString() : null,
      endAt: raw.endAt ? new Date(raw.endAt).toISOString() : null,
    };
    this.apiService.post<string>(this.apiService.INTERVIEW_SCHEDULE.CREATE, body).subscribe({
      next: (id) => {
        this.message.success(this.i18n.createSuccess());
        this.selectedInterviewId = id;
        this.interviewerForm.patchValue({ interviewScheduleId: id });
        this.interviewForm.patchValue({ round: 1, startAt: null, endAt: null, location: '' });
        this.reloadPlanData();
        this.submitting = false;
        this.enterStep(4);
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
      },
    });
  }

  assignInterviewers(): void {
    if (this.interviewerForm.invalid) return;
    this.submitting = true;
    const raw = this.interviewerForm.getRawValue();
    const interviewers = (raw.employeeIds as string[]).map((employeeId) => ({
      employeeId,
      isPrimary: employeeId === raw.primaryEmployeeId,
    }));
    this.apiService
      .post(this.apiService.INTERVIEW_SCHEDULE.SET_INTERVIEWERS, {
        interviewScheduleId: raw.interviewScheduleId,
        interviewers,
      })
      .subscribe({
        next: () => {
          this.message.success(this.i18n.updateSuccess());
          this.submitting = false;
          this.enterStep(5);
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.submitting = false;
        },
      });
  }

  completeInterview(item: InterviewSchedule): void {
    this.apiService
      .post(this.apiService.INTERVIEW_SCHEDULE.COMPLETE, {
        id: item.id,
        moveCandidateToWaitlist: true,
      })
      .subscribe({
        next: () => {
          this.message.success(this.i18n.updateSuccess());
          this.reloadPlanData();
          this.enterStep(5);
        },
        error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
      });
  }

  changeCandidateStatus(c: Candidate, status: string): void {
    this.apiService.post(this.apiService.CANDIDATE.CHANGE_STATUS, { id: c.id, status }).subscribe({
      next: () => {
        this.message.success(this.i18n.updateSuccess());
        this.reloadPlanData();
        if (status === 'HIRED' && !c.employeeId) {
          this.openCreateEmployee(c);
        }
      },
      error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
    });
  }

  openCreateEmployee(c: Candidate): void {
    if (!this.permissionSvc.has(PERMISSION_CODES.HR_EMPLOYEE_CREATE)) return;
    this.router.navigate(
      [ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.ADD_EMPLOYEE.path],
      { queryParams: { candidateId: c.id } },
    );
  }

  labelStatus(status: string): string {
    return candidateStatusLabel((k) => this.i18n.instant(k), status);
  }

  labelInterviewStatus(status: string): string {
    return interviewStatusLabel((k) => this.i18n.instant(k), status);
  }

  orgLabel(): string {
    const c = this.companies.find((x) => x.id === this.companyId);
    const b = this.branches.find((x) => x.id === this.branchId);
    const parts = [c?.name || c?.code, b ? b.name || b.code : null].filter(Boolean);
    return parts.join(' / ');
  }

  activeCandidates(): Candidate[] {
    return this.candidates.filter((c) => ['NEW', 'SCREENING', 'INTERVIEW'].includes(c.status));
  }

  candidateInterviews(): InterviewSchedule[] {
    if (!this.selectedCandidateId) return this.interviews;
    return this.interviews.filter((i) => i.candidateId === this.selectedCandidateId);
  }
}
