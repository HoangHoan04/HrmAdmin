import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import { toUtcDateIso } from '@/app/core/constants/helpers';
import {
  EmployeeSelectBoxDto,
  SelectBoxDto,
  TransferEmployee,
  TransferEmployeePosition,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-add-or-update-transfer',
  templateUrl: './add-or-update-transfer.component.html',
  styleUrls: [],
})
export class AddOrUpdateTransferComponent implements OnInit, OnDestroy {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  employees: EmployeeSelectBoxDto[] = [];
  companies: SelectBoxDto[] = [];
  branches: SelectBoxDto[] = [];
  departments: SelectBoxDto[] = [];
  parts: SelectBoxDto[] = [];
  positions: SelectBoxDto[] = [];
  transferTypeOptions = Object.values(enumData.TRANSFER_TYPE);
  enumData = enumData;

  private readonly destroy$ = new Subject<void>();
  private suppressCascade = false;
  private suppressEmployeeSnapshot = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.loadSelectBoxes();
    if (this.isEdit && this.id) {
      this.loadDetail(this.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get detailGroup(): FormGroup {
    return this.validateForm.get('detail') as FormGroup;
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      employeeId: [null, [Validators.required]],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      transferType: [null, [Validators.required]],
      requestDate: [new Date()],
      effectiveDate: [null, [Validators.required]],
      expectedEndDate: [null],
      reason: [''],
      decisionNumber: [''],
      decisionDate: [null],
      note: [''],
      detail: this.fb.group({
        oldCompanyId: [{ value: null, disabled: true }],
        oldCompanyName: [{ value: '', disabled: true }],
        oldBranchId: [{ value: null, disabled: true }],
        oldBranchName: [{ value: '', disabled: true }],
        oldDepartmentId: [{ value: null, disabled: true }],
        oldDepartmentName: [{ value: '', disabled: true }],
        oldPartId: [{ value: null, disabled: true }],
        oldPartName: [{ value: '', disabled: true }],
        oldPositionId: [{ value: null, disabled: true }],
        oldPositionName: [{ value: '', disabled: true }],
        newCompanyId: [null],
        newBranchId: [null],
        newDepartmentId: [null],
        newPartId: [null],
        newPositionId: [null],
        note: [''],
      }),
    });

    this.validateForm
      .get('employeeId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((employeeId) => {
        if (this.suppressEmployeeSnapshot) return;
        if (employeeId) {
          this.loadEmployeeOrgSnapshot(employeeId);
        } else {
          this.clearOldOrg();
        }
      });

    this.detailGroup
      .get('newCompanyId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((companyId) => {
        if (this.suppressCascade) return;
        this.branches = [];
        this.departments = [];
        this.parts = [];
        this.positions = [];
        this.detailGroup.patchValue(
          { newBranchId: null, newDepartmentId: null, newPartId: null, newPositionId: null },
          { emitEvent: false },
        );
        if (companyId) this.loadBranches(companyId);
      });

    this.detailGroup
      .get('newBranchId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((branchId) => {
        if (this.suppressCascade) return;
        this.departments = [];
        this.parts = [];
        this.positions = [];
        this.detailGroup.patchValue(
          { newDepartmentId: null, newPartId: null, newPositionId: null },
          { emitEvent: false },
        );
        if (branchId) this.loadDepartments(branchId);
      });

    this.detailGroup
      .get('newDepartmentId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((departmentId) => {
        if (this.suppressCascade) return;
        this.parts = [];
        this.positions = [];
        this.detailGroup.patchValue({ newPartId: null, newPositionId: null }, { emitEvent: false });
        if (departmentId) {
          this.loadParts(departmentId);
          this.loadPositions(departmentId);
        }
      });
  }

  loadSelectBoxes(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (res) => (this.employees = res),
        error: () => this.message.error(this.i18n.genericError()),
      });
    this.apiService.post<SelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => (this.companies = res),
      error: () => this.message.error(this.i18n.genericError()),
    });
  }

  loadEmployeeOrgSnapshot(employeeId: string): void {
    this.apiService
      .post<TransferEmployeePosition>(this.apiService.TRANSFER_EMPLOYEE.EMPLOYEE_ORG_SNAPSHOT, {
        employeeId,
      })
      .subscribe({
        next: (snap) => {
          this.suppressCascade = true;
          this.detailGroup.patchValue({
            oldCompanyId: snap.oldCompanyId || null,
            oldCompanyName: snap.oldCompanyName || '',
            oldBranchId: snap.oldBranchId || null,
            oldBranchName: snap.oldBranchName || '',
            oldDepartmentId: snap.oldDepartmentId || null,
            oldDepartmentName: snap.oldDepartmentName || '',
            oldPartId: snap.oldPartId || null,
            oldPartName: snap.oldPartName || '',
            oldPositionId: snap.oldPositionId || null,
            oldPositionName: snap.oldPositionName || '',
            newCompanyId: snap.newCompanyId || snap.oldCompanyId || null,
            newBranchId: snap.newBranchId || snap.oldBranchId || null,
            newDepartmentId: snap.newDepartmentId || snap.oldDepartmentId || null,
            newPartId: snap.newPartId || snap.oldPartId || null,
            newPositionId: snap.newPositionId || snap.oldPositionId || null,
          });
          const companyId = snap.newCompanyId || snap.oldCompanyId;
          const branchId = snap.newBranchId || snap.oldBranchId;
          const departmentId = snap.newDepartmentId || snap.oldDepartmentId;
          if (companyId) this.loadBranches(companyId);
          if (branchId) this.loadDepartments(branchId);
          if (departmentId) {
            this.loadParts(departmentId);
            this.loadPositions(departmentId);
          }
          this.suppressCascade = false;
        },
        error: () => {
          this.message.error(this.i18n.instant('transfer.loadSnapshotFailed'));
          this.clearOldOrg();
        },
      });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService
      .post<TransferEmployee>(this.apiService.TRANSFER_EMPLOYEE.DETAIL, { id })
      .subscribe({
        next: (item) => {
          const detail = item.details?.[0];
          this.suppressCascade = true;
          this.suppressEmployeeSnapshot = true;
          this.validateForm.patchValue({
            employeeId: item.employeeId,
            code: item.code,
            transferType: item.transferType,
            requestDate: item.requestDate ? new Date(item.requestDate) : null,
            effectiveDate: item.effectiveDate ? new Date(item.effectiveDate) : null,
            expectedEndDate: item.expectedEndDate ? new Date(item.expectedEndDate) : null,
            reason: item.reason,
            decisionNumber: item.decisionNumber,
            decisionDate: item.decisionDate ? new Date(item.decisionDate) : null,
            note: item.note,
          });
          if (detail) {
            this.detailGroup.patchValue({
              oldCompanyId: detail.oldCompanyId || null,
              oldCompanyName: detail.oldCompanyName || '',
              oldBranchId: detail.oldBranchId || null,
              oldBranchName: detail.oldBranchName || '',
              oldDepartmentId: detail.oldDepartmentId || null,
              oldDepartmentName: detail.oldDepartmentName || '',
              oldPartId: detail.oldPartId || null,
              oldPartName: detail.oldPartName || '',
              oldPositionId: detail.oldPositionId || null,
              oldPositionName: detail.oldPositionName || '',
              newCompanyId: detail.newCompanyId || null,
              newBranchId: detail.newBranchId || null,
              newDepartmentId: detail.newDepartmentId || null,
              newPartId: detail.newPartId || null,
              newPositionId: detail.newPositionId || null,
              note: detail.note || '',
            });
            if (detail.newCompanyId) this.loadBranches(detail.newCompanyId);
            if (detail.newBranchId) this.loadDepartments(detail.newBranchId);
            if (detail.newDepartmentId) {
              this.loadParts(detail.newDepartmentId);
              this.loadPositions(detail.newDepartmentId);
            }
          }
          if (this.isEdit) {
            this.validateForm.get('employeeId')?.disable();
            this.validateForm.get('code')?.disable();
          }
          this.suppressCascade = false;
          this.suppressEmployeeSnapshot = false;
          this.loading = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadDetailFailed(err.error));
          this.goBack();
        },
      });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.HUMAN_RESOURCE.children.TRANSFER_MANAGER.path]);
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      Object.values(this.detailGroup.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting = true;
    const value = this.validateForm.getRawValue();
    const detail = value.detail;
    const payload: Record<string, any> = {
      employeeId: value.employeeId,
      code: value.code,
      transferType: value.transferType,
      requestDate: value.requestDate ? toUtcDateIso(value.requestDate) : null,
      effectiveDate: toUtcDateIso(value.effectiveDate),
      expectedEndDate: value.expectedEndDate ? toUtcDateIso(value.expectedEndDate) : null,
      clearExpectedEndDate: !value.expectedEndDate,
      reason: value.reason || null,
      decisionNumber: value.decisionNumber || null,
      decisionDate: value.decisionDate ? toUtcDateIso(value.decisionDate) : null,
      clearDecisionDate: !value.decisionDate,
      note: value.note || null,
      details: [
        {
          oldCompanyId: detail.oldCompanyId || null,
          newCompanyId: detail.newCompanyId || null,
          oldBranchId: detail.oldBranchId || null,
          newBranchId: detail.newBranchId || null,
          oldDepartmentId: detail.oldDepartmentId || null,
          newDepartmentId: detail.newDepartmentId || null,
          oldPartId: detail.oldPartId || null,
          newPartId: detail.newPartId || null,
          oldPositionId: detail.oldPositionId || null,
          newPositionId: detail.newPositionId || null,
          note: detail.note || null,
          effectiveDate: toUtcDateIso(value.effectiveDate),
        },
      ],
    };

    const endpoint = this.isEdit
      ? this.apiService.TRANSFER_EMPLOYEE.UPDATE
      : this.apiService.TRANSFER_EMPLOYEE.CREATE;
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

  private loadBranches(companyId: string): void {
    this.apiService
      .post<SelectBoxDto[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, { companyId })
      .subscribe({ next: (res) => (this.branches = res || []) });
  }

  private loadDepartments(branchId: string): void {
    this.apiService
      .post<SelectBoxDto[]>(this.apiService.DEPARTMENT.LOAD_BY_BRANCH, { branchId })
      .subscribe({ next: (res) => (this.departments = res || []) });
  }

  private loadParts(departmentId: string): void {
    this.apiService
      .post<SelectBoxDto[]>(this.apiService.PART.LOAD_BY_DEPARTMENT, { departmentId })
      .subscribe({ next: (res) => (this.parts = res || []) });
  }

  private loadPositions(departmentId: string): void {
    this.apiService
      .post<SelectBoxDto[]>(this.apiService.POSITION.SELECT_BOX, { departmentId })
      .subscribe({ next: (res) => (this.positions = res || []) });
  }

  private clearOldOrg(): void {
    this.detailGroup.patchValue({
      oldCompanyId: null,
      oldCompanyName: '',
      oldBranchId: null,
      oldBranchName: '',
      oldDepartmentId: null,
      oldDepartmentName: '',
      oldPartId: null,
      oldPartName: '',
      oldPositionId: null,
      oldPositionName: '',
    });
  }
}
