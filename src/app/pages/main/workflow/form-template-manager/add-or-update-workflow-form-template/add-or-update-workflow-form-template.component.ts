import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { WorkflowFormTemplate } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-workflow-form-template',
  templateUrl: './add-or-update-workflow-form-template.component.html',
  styleUrls: [],
})
export class AddOrUpdateWorkflowFormTemplateComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  entityTypeOptions = Object.values(enumData.WORKFLOW_ENTITY_TYPE);

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
      entityType: ['LEAVE', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      schemaJson: ['{}', [Validators.required]],
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    if (this.isEdit && this.id) this.loadDetail(this.id);
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService
      .post<WorkflowFormTemplate>(this.apiService.WORKFLOW_FORM_TEMPLATE.DETAIL, { id })
      .subscribe({
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
    this.router.navigate([ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_FORM_TEMPLATES.path]);
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }
    const payload = this.validateForm.getRawValue();
    try {
      JSON.parse(payload.schemaJson);
    } catch {
      this.message.error(this.i18n.instant('workflow.formTemplate.invalidJson'));
      return;
    }
    this.submitting = true;
    const endpoint = this.isEdit
      ? this.apiService.WORKFLOW_FORM_TEMPLATE.UPDATE
      : this.apiService.WORKFLOW_FORM_TEMPLATE.CREATE;
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
