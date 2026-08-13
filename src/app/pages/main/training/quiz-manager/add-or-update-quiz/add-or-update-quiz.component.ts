import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { PagedResult, TrainingCourse, TrainingQuiz } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-quiz',
  templateUrl: './add-or-update-quiz.component.html',
  styleUrls: [],
})
export class AddOrUpdateQuizComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  courses: TrainingCourse[] = [];
  optionChoices = Object.values(enumData.TRAINING_QUIZ_OPTION);

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
      courseId: [null, [Validators.required]],
      question: ['', [Validators.required]],
      optionA: ['', [Validators.required]],
      optionB: ['', [Validators.required]],
      optionC: [''],
      optionD: [''],
      correctOption: ['A', [Validators.required]],
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.apiService
      .post<PagedResult<TrainingCourse>>(this.apiService.TRAINING_COURSE.PAGINATION, {
        pageIndex: 1,
        pageSize: 200,
      })
      .subscribe({ next: (res) => (this.courses = res.items) });
    if (this.isEdit && this.id) this.loadDetail(this.id);
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<TrainingQuiz>(this.apiService.TRAINING_QUIZ.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue(item);
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.TALENT.children.TRAINING.children.TRAINING_QUIZ.path]);
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
      ? this.apiService.TRAINING_QUIZ.UPDATE
      : this.apiService.TRAINING_QUIZ.CREATE;
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
