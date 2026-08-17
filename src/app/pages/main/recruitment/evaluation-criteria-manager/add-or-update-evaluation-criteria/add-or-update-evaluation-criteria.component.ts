import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { CompanySelectBoxDto, EvaluationCriteria } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-evaluation-criteria',
  templateUrl: './add-or-update-evaluation-criteria.component.html',
  styleUrls: [],
})
export class AddOrUpdateEvaluationCriteriaComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];

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
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      category: [''],
      defaultWeight: [1, [Validators.required, Validators.min(0)]],
      maxScore: [10, [Validators.required, Validators.min(0)]],
      companyId: [null],
      isActive: [true],
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    if (this.isEdit) {
      this.validateForm.get('code')?.disable({ emitEvent: false });
    }
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.companies = res;
        this.cdr.markForCheck();
        if (this.isEdit && this.id) this.loadDetail(this.id);
      },
    });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService
      .post<EvaluationCriteria>(this.apiService.EVALUATION_CRITERIA.DETAIL, { id })
      .subscribe({
        next: (item) => {
          this.validateForm.patchValue(item);
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadDetailFailed(err.error));
          this.goBack();
        },
      });
  }

  goBack(): void {
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.EVALUATION_CRITERIA.path,
    ]);
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
      ? this.apiService.EVALUATION_CRITERIA.UPDATE
      : this.apiService.EVALUATION_CRITERIA.CREATE;
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
