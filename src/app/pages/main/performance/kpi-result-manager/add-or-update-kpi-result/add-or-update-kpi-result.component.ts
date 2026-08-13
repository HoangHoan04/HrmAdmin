import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { EmployeeSelectBoxDto, KpiGoal, KpiResult, PagedResult } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-kpi-result',
  templateUrl: './add-or-update-kpi-result.component.html',
  styleUrls: [],
})
export class AddOrUpdateKpiResultComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  goals: KpiGoal[] = [];
  employees: EmployeeSelectBoxDto[] = [];

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
      goalId: [null, [Validators.required]],
      actualValue: [0, [Validators.required]],
      score: [0, [Validators.required]],
      comment: [''],
      ratedByEmployeeId: [null],
      ratedAt: [null],
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.apiService
      .post<PagedResult<KpiGoal>>(this.apiService.KPI_GOAL.PAGINATION, {
        pageIndex: 1,
        pageSize: 200,
      })
      .subscribe({ next: (res) => (this.goals = res.items) });
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({ next: (res) => (this.employees = res) });
    if (this.isEdit && this.id) this.loadDetail(this.id);
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<KpiResult>(this.apiService.KPI_RESULT.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue({
          ...item,
          ratedAt: item.ratedAt ? new Date(item.ratedAt) : null,
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
    this.router.navigate([ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.KPI_RESULT.path]);
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
    const payload = this.validateForm.getRawValue();
    const endpoint = this.isEdit
      ? this.apiService.KPI_RESULT.UPDATE
      : this.apiService.KPI_RESULT.CREATE;
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
