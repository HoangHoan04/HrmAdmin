import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { WorkflowDefinition, WorkflowStepInput } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-add-or-update-workflow-definition',
  templateUrl: './add-or-update-workflow-definition.component.html',
  styleUrls: [],
})
export class AddOrUpdateWorkflowDefinitionComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  entityTypeOptions = Object.values(enumData.WORKFLOW_ENTITY_TYPE);
  resolverOptions = Object.values(enumData.WORKFLOW_APPROVER_RESOLVER);

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
  ) {}

  get steps(): FormArray {
    return this.validateForm.get('steps') as FormArray;
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      entityType: ['LEAVE', [Validators.required]],
      isActive: [true],
      steps: this.fb.array([]),
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    if (this.isEdit && this.id) {
      this.loadDetail(this.id);
    } else {
      this.addStep(true);
    }
  }

  createStepGroup(step?: Partial<WorkflowStepInput>, forceFinal = false): FormGroup {
    return this.fb.group({
      stepOrder: [step?.stepOrder ?? this.steps.length + 1, [Validators.required, Validators.min(1)]],
      name: [step?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      approverResolver: [step?.approverResolver ?? 'MANAGER', [Validators.required]],
      requiredRoleCode: [step?.requiredRoleCode ?? ''],
      isFinal: [forceFinal ? true : !!step?.isFinal],
    });
  }

  addStep(isFinal = false): void {
    if (isFinal) {
      this.steps.controls.forEach((c) => c.get('isFinal')?.setValue(false));
    }
    this.steps.push(this.createStepGroup(undefined, isFinal));
    this.renumberSteps();
  }

  removeStep(index: number): void {
    if (this.steps.length <= 1) {
      this.message.warning(this.i18n.instant('workflow.definition.minOneStep'));
      return;
    }
    this.steps.removeAt(index);
    this.renumberSteps();
    if (!this.steps.controls.some((c) => c.get('isFinal')?.value)) {
      this.steps.at(this.steps.length - 1).get('isFinal')?.setValue(true);
    }
  }

  onFinalChange(index: number, checked: boolean): void {
    if (checked) {
      this.steps.controls.forEach((c, i) => c.get('isFinal')?.setValue(i === index));
    } else if (!this.steps.controls.some((c) => c.get('isFinal')?.value)) {
      this.steps.at(this.steps.length - 1).get('isFinal')?.setValue(true);
    }
  }

  private renumberSteps(): void {
    this.steps.controls.forEach((c, i) => c.get('stepOrder')?.setValue(i + 1));
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService
      .post<WorkflowDefinition>(this.apiService.WORKFLOW_DEFINITION.DETAIL, { id })
      .subscribe({
        next: (item) => {
          this.validateForm.patchValue({
            code: item.code,
            name: item.name,
            entityType: item.entityType,
            isActive: item.isActive,
          });
          this.validateForm.get('code')?.disable();
          this.steps.clear();
          const sorted = [...(item.steps || [])].sort((a, b) => a.stepOrder - b.stepOrder);
          if (sorted.length === 0) {
            this.addStep(true);
          } else {
            sorted.forEach((s) => this.steps.push(this.createStepGroup(s)));
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadDetailFailed(err.error));
          this.goBack();
        },
      });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_DEFINITIONS.path]);
  }

  private buildStepsPayload(): WorkflowStepInput[] | null {
    const raw = this.steps.getRawValue() as WorkflowStepInput[];
    const ordered = raw
      .map((s, i) => ({
        stepOrder: i + 1,
        name: (s.name || '').trim(),
        approverResolver: (s.approverResolver || '').trim().toUpperCase(),
        requiredRoleCode: (s.requiredRoleCode || '').trim() || null,
        isFinal: !!s.isFinal,
      }))
      .sort((a, b) => a.stepOrder - b.stepOrder);

    if (ordered.length === 0) {
      this.message.error(this.i18n.instant('workflow.definition.minOneStep'));
      return null;
    }
    const finalCount = ordered.filter((s) => s.isFinal).length;
    if (finalCount !== 1) {
      this.message.error(this.i18n.instant('workflow.definition.oneFinalRequired'));
      return null;
    }
    if (!ordered[ordered.length - 1].isFinal) {
      this.message.error(this.i18n.instant('workflow.definition.lastMustBeFinal'));
      return null;
    }
    for (const s of ordered) {
      if (s.approverResolver === 'ROLE' && !s.requiredRoleCode) {
        this.message.error(this.i18n.instant('workflow.definition.roleCodeRequired'));
        return null;
      }
    }
    return ordered;
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      this.steps.controls.forEach((g) => {
        Object.values((g as FormGroup).controls).forEach((c) => {
          c.markAsDirty();
          c.updateValueAndValidity({ onlySelf: true });
        });
      });
      return;
    }
    const steps = this.buildStepsPayload();
    if (!steps) return;

    this.submitting = true;
    const raw = this.validateForm.getRawValue();
    const defBody = this.isEdit
      ? {
          id: this.id,
          name: raw.name,
          entityType: raw.entityType,
          isActive: raw.isActive,
        }
      : {
          code: raw.code,
          name: raw.name,
          entityType: raw.entityType,
          isActive: raw.isActive,
        };

    const save$ = this.isEdit
      ? this.apiService.post<boolean>(this.apiService.WORKFLOW_DEFINITION.UPDATE, defBody).pipe(
          switchMap((ok) => {
            if (!ok) throw new Error('update-failed');
            return of(this.id as string);
          }),
        )
      : this.apiService.post<string>(this.apiService.WORKFLOW_DEFINITION.CREATE, defBody);

    save$
      .pipe(
        switchMap((definitionId) =>
          this.apiService.post<boolean>(this.apiService.WORKFLOW_DEFINITION.SET_STEPS, {
            definitionId,
            steps,
          }),
        ),
      )
      .subscribe({
        next: () => {
          this.message.success(this.isEdit ? this.i18n.updateSuccess() : this.i18n.createSuccess());
          this.goBack();
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err?.error || err?.message));
          this.submitting = false;
        },
      });
  }
}
