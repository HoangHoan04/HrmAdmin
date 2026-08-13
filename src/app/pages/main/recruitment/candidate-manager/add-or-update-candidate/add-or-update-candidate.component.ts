import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { Candidate, HiringPlan, HiringSource, PagedResult } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-candidate',
  templateUrl: './add-or-update-candidate.component.html',
  styleUrls: [],
})
export class AddOrUpdateCandidateComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  isDetail = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  genderOptions = Object.values(enumData.GENDER);
  statusOptions = Object.values(enumData.CANDIDATE_STATUS);
  hiringPlans: HiringPlan[] = [];
  hiringSources: HiringSource[] = [];

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
      fullName: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.email]],
      phone: [''],
      gender: [null],
      dateOfBirth: [null],
      cvUrl: [''],
      hiringPlanId: [null],
      hiringSourceId: [null],
      status: ['NEW'],
      notes: [''],
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isDetail = this.router.url.includes('/detail');
    this.isEdit = !!this.id && !this.isDetail;

    this.apiService
      .post<PagedResult<HiringPlan>>(this.apiService.HIRING_PLAN.PAGINATION, {
        pageIndex: 1,
        pageSize: 200,
      })
      .subscribe({ next: (res) => (this.hiringPlans = res.items) });
    this.apiService
      .post<HiringSource[]>(this.apiService.HIRING_SOURCE.LIST, { isActive: true })
      .subscribe({ next: (res) => (this.hiringSources = res) });

    if (this.id) this.loadDetail(this.id);
    if (this.isDetail) this.validateForm.disable();
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Candidate>(this.apiService.CANDIDATE.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue({
          ...item,
          dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : null,
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
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_LIST.path,
    ]);
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
      dateOfBirth: value.dateOfBirth
        ? new Date(value.dateOfBirth).toISOString().slice(0, 10)
        : null,
    };
    const endpoint = this.isEdit
      ? this.apiService.CANDIDATE.UPDATE
      : this.apiService.CANDIDATE.CREATE;
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
