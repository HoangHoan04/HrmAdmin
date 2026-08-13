import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import { enumData } from '../../../../../core/constants/enums/enumData';
import {
  Employee,
  EmployeeCertificate,
  EmployeeChangeTimelineItem,
  EmployeeDependent,
  EmployeeEducation,
  EmployeeFile,
  EmployeeSalaryHistory,
  TransferEmployee,
} from '../../../../../core/models';
import { ApiService } from '../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../core/services/i18n-message.service';
import {
  RowAction,
  TableColumn,
} from '../../../../../shared/components/table-custom/table-custom.types';
import { ActionConfirmService } from '../../../../../shared/services/action-confirm.service';

type ChildType = 'dependent' | 'education' | 'certificate' | 'file' | 'salaryHistory';
type TransferHistoryRow = TransferEmployee & {
  transferTypeLabel?: string;
  statusLabel?: string;
};

@Component({
  standalone: false,
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
})
export class EmployeeDetailComponent implements OnInit {
  private readonly ENTITY_KEY = 'humanResource.employee.entityName';

  id: string | null = null;
  loading = false;
  employee: Employee | null = null;
  selectedTabIndex = 0;
  transferHistories: TransferHistoryRow[] = [];
  transferHistoryLoading = false;

  changeTimeline: EmployeeChangeTimelineItem[] = [];
  changeTimelineLoading = false;

  workStatusOptions = Object.values(enumData.WORK_STATUS);

  childModalVisible = false;
  childModalSubmitting = false;
  childType: ChildType = 'dependent';
  childIsEdit = false;
  childForm!: FormGroup;

  resignationModalVisible = false;
  resignationSubmitting = false;
  resignationForm!: FormGroup;
  pendingLifecycleStatus: string | null = null;

  dependentColumns: TableColumn[] = [
    { field: 'fullName', header: 'humanResource.employee.dependent.fullName', type: 'text' },
    {
      field: 'relationship',
      header: 'humanResource.employee.dependent.relationship',
      type: 'text',
    },
    { field: 'dayOfBirth', header: 'humanResource.employee.dependent.dayOfBirth', type: 'date' },
    { field: 'gender', header: 'humanResource.employee.dependent.gender', type: 'text' },
    {
      field: 'identityNumber',
      header: 'humanResource.employee.dependent.identityNumber',
      type: 'text',
    },
    { field: 'status', header: 'humanResource.employee.dependent.status', type: 'text' },
  ];

  educationColumns: TableColumn[] = [
    { field: 'schoolName', header: 'humanResource.employee.education.schoolName', type: 'text' },
    { field: 'degree', header: 'humanResource.employee.education.degree', type: 'text' },
    { field: 'major', header: 'humanResource.employee.education.major', type: 'text' },
    { field: 'startDate', header: 'humanResource.employee.education.startDate', type: 'date' },
    { field: 'endDate', header: 'humanResource.employee.education.endDate', type: 'date' },
    { field: 'gpa', header: 'humanResource.employee.education.gpa', type: 'text' },
  ];

  certificateColumns: TableColumn[] = [
    { field: 'name', header: 'humanResource.employee.certificate.name', type: 'text' },
    {
      field: 'issuingOrganization',
      header: 'humanResource.employee.certificate.issuingOrganization',
      type: 'text',
    },
    { field: 'issueDate', header: 'humanResource.employee.certificate.issueDate', type: 'date' },
    { field: 'expiryDate', header: 'humanResource.employee.certificate.expiryDate', type: 'date' },
    {
      field: 'credentialId',
      header: 'humanResource.employee.certificate.credentialId',
      type: 'text',
    },
    {
      field: 'imageUrl',
      header: 'humanResource.employee.certificate.imageUrl',
      type: 'image',
    },
  ];

  fileColumns: TableColumn[] = [
    {
      field: 'fileCategory',
      header: 'humanResource.employee.file.fileCategory',
      type: 'text',
    },
    { field: 'fileName', header: 'humanResource.employee.file.fileName', type: 'text' },
    { field: 'expiryDate', header: 'humanResource.employee.file.expiryDate', type: 'date' },
    { field: 'versionNo', header: 'humanResource.employee.file.versionNo', type: 'number' },
    {
      field: 'isCurrent',
      header: 'humanResource.employee.file.isCurrent',
      type: 'boolean',
    },
    {
      field: 'isExpired',
      header: 'humanResource.employee.file.isExpired',
      type: 'boolean',
    },
    {
      field: 'description',
      header: 'humanResource.employee.file.description',
      type: 'text',
    },
  ];

  salaryHistoryColumns: TableColumn[] = [
    {
      field: 'effectiveDate',
      header: 'humanResource.employee.salaryHistory.effectiveDate',
      type: 'date',
    },
    {
      field: 'oldBasicSalary',
      header: 'humanResource.employee.salaryHistory.oldBasicSalary',
      type: 'text',
    },
    {
      field: 'newBasicSalary',
      header: 'humanResource.employee.salaryHistory.newBasicSalary',
      type: 'text',
    },
    { field: 'allowance', header: 'humanResource.employee.salaryHistory.allowance', type: 'text' },
    {
      field: 'changeType',
      header: 'humanResource.employee.salaryHistory.changeType',
      type: 'text',
    },
    { field: 'reason', header: 'humanResource.employee.salaryHistory.reason', type: 'text' },
  ];

  transferHistoryColumns: TableColumn[] = [
    { field: 'code', header: 'transfer.code', type: 'text' },
    { field: 'transferTypeLabel', header: 'transfer.transferType', type: 'text' },
    { field: 'effectiveDate', header: 'transfer.effectiveDate', type: 'date' },
    { field: 'statusLabel', header: 'transfer.status', type: 'text' },
    { field: 'reason', header: 'transfer.reason', type: 'text' },
  ];

  dependentRowActions: RowAction[] = this.buildChildRowActions('dependent');
  educationRowActions: RowAction[] = this.buildChildRowActions('education');
  certificateRowActions: RowAction[] = this.buildChildRowActions('certificate');
  fileRowActions: RowAction[] = this.buildChildRowActions('file');
  salaryHistoryRowActions: RowAction[] = this.buildChildRowActions('salaryHistory');

  detailFields: { key: string; label: string; type?: 'date' | 'boolean' | 'text' }[] = [
    { key: 'code', label: 'humanResource.employee.code' },
    { key: 'firstName', label: 'humanResource.employee.firstName' },
    { key: 'lastName', label: 'humanResource.employee.lastName' },
    { key: 'fullName', label: 'humanResource.employee.fullName' },
    { key: 'gender', label: 'humanResource.employee.gender' },
    { key: 'phone', label: 'humanResource.employee.phone' },
    { key: 'secondaryPhone', label: 'humanResource.employee.secondaryPhone' },
    { key: 'email', label: 'humanResource.employee.email' },
    { key: 'companyEmail', label: 'humanResource.employee.companyEmail' },
    { key: 'dayOfBirth', label: 'humanResource.employee.dayOfBirth', type: 'date' },
    { key: 'nationality', label: 'humanResource.employee.nationality' },
    { key: 'ethnicity', label: 'humanResource.employee.ethnicity' },
    { key: 'religion', label: 'humanResource.employee.religion' },
    { key: 'identityCard', label: 'humanResource.employee.identityCard' },
    { key: 'placeOfIsssuance', label: 'humanResource.employee.placeOfIsssuance' },
    { key: 'issuanceDate', label: 'humanResource.employee.issuanceDate', type: 'date' },
    { key: 'permanentAddress', label: 'humanResource.employee.permanentAddress' },
    { key: 'nowAddress', label: 'humanResource.employee.nowAddress' },
    { key: 'currentCity', label: 'humanResource.employee.currentCity' },
    { key: 'currentWard', label: 'humanResource.employee.currentWard' },
    { key: 'bankAccountNumber', label: 'humanResource.employee.bankAccountNumber' },
    { key: 'bankname', label: 'humanResource.employee.bankname' },
    { key: 'bankBranchName', label: 'humanResource.employee.bankBranchName' },
    { key: 'bankAccountHolder', label: 'humanResource.employee.bankAccountHolder' },
    { key: 'taxCode', label: 'humanResource.employee.taxCode' },
    { key: 'socialInsuranceNumber', label: 'humanResource.employee.socialInsuranceNumber' },
    { key: 'healthInsuranceNumber', label: 'humanResource.employee.healthInsuranceNumber' },
    { key: 'level', label: 'humanResource.employee.level' },
    { key: 'workingMode', label: 'humanResource.employee.workingMode' },
    { key: 'contractType', label: 'humanResource.employee.contractType' },
    { key: 'status', label: 'humanResource.employee.status' },
    { key: 'directManagerName', label: 'humanResource.employee.directManager' },
    { key: 'joinDate', label: 'humanResource.employee.joinDate', type: 'date' },
    { key: 'resignationDate', label: 'humanResource.employee.resignationDate', type: 'date' },
    { key: 'resignationReason', label: 'humanResource.employee.resignationReason' },
    { key: 'createdAt', label: 'humanResource.employee.createdAt', type: 'date' },
    { key: 'updatedAt', label: 'humanResource.employee.updatedAt', type: 'date' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly actionConfirm: ActionConfirmService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.initChildForm();
    this.resignationForm = this.fb.group({
      resignationDate: [new Date(), [Validators.required]],
      resignationReason: ['', [Validators.maxLength(500)]],
      note: ['', [Validators.maxLength(500)]],
    });
    if (this.id) {
      this.loadEmployeeDetail(this.id);
    }
  }

  get childModalTitle(): string {
    const map: Record<ChildType, { add: string; edit: string }> = {
      dependent: {
        add: 'humanResource.employee.addDependent',
        edit: 'humanResource.employee.editDependent',
      },
      education: {
        add: 'humanResource.employee.addEducation',
        edit: 'humanResource.employee.editEducation',
      },
      certificate: {
        add: 'humanResource.employee.addCertificate',
        edit: 'humanResource.employee.editCertificate',
      },
      file: {
        add: 'humanResource.employee.addFile',
        edit: 'humanResource.employee.editFile',
      },
      salaryHistory: {
        add: 'humanResource.employee.addSalaryHistory',
        edit: 'humanResource.employee.editSalaryHistory',
      },
    };
    return this.childIsEdit ? map[this.childType].edit : map[this.childType].add;
  }

  get dependents(): EmployeeDependent[] {
    return this.employee?.dependents ?? [];
  }

  get educations(): EmployeeEducation[] {
    return this.employee?.educations ?? [];
  }

  get certificates(): EmployeeCertificate[] {
    return this.employee?.certificates ?? [];
  }

  get files(): EmployeeFile[] {
    return this.employee?.files ?? [];
  }

  get salaryHistories(): EmployeeSalaryHistory[] {
    return this.employee?.salaryHistories ?? [];
  }

  loadEmployeeDetail(id: string): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.apiService.post<Employee>(this.apiService.EMPLOYEE.DETAIL, { id }).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.loading = false;
        this.loadTransferHistory(id);
        this.loadChangeTimeline(id);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.message.error(err.error || this.i18n.loadDetailFailed(err.error));
        this.loading = false;
        this.cdr.detectChanges();
        this.goBack();
      },
    });
  }

  loadChangeTimeline(employeeId: string): void {
    this.changeTimelineLoading = true;
    this.apiService
      .post<EmployeeChangeTimelineItem[]>(this.apiService.EMPLOYEE.CHANGE_TIMELINE, {
        employeeId,
        take: 50,
      })
      .subscribe({
        next: (items) => {
          this.changeTimeline = items || [];
          this.changeTimelineLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.changeTimeline = [];
          this.changeTimelineLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  loadTransferHistory(employeeId: string): void {
    this.transferHistoryLoading = true;
    this.apiService
      .post<TransferEmployee[]>(this.apiService.TRANSFER_EMPLOYEE.HISTORY, { employeeId })
      .subscribe({
        next: (items) => {
          this.transferHistories = [...(items || [])]
            .sort((a, b) => {
              const aTime = a.effectiveDate ? new Date(a.effectiveDate).getTime() : 0;
              const bTime = b.effectiveDate ? new Date(b.effectiveDate).getTime() : 0;
              return bTime - aTime;
            })
            .map((item) => ({
              ...item,
              transferTypeLabel: this.resolveTransferTypeLabel(item.transferType),
              statusLabel: this.resolveTransferStatusLabel(item.status),
            }));
          this.transferHistoryLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.transferHistories = [];
          this.transferHistoryLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private resolveTransferStatusLabel(status?: string): string {
    if (!status) return '-';
    const meta = Object.values(enumData.TRANSFER_STATUS).find((x) => x.value === status);
    return meta ? this.i18n.instant(meta.labelKey) : status;
  }

  private resolveTransferTypeLabel(type?: string): string {
    if (!type) return '-';
    const meta = Object.values(enumData.TRANSFER_TYPE).find((x) => x.value === type);
    return meta ? this.i18n.instant(meta.labelKey) : type;
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  getFieldValue(field: { key: string; type?: string }): string {
    if (!this.employee) return '---';
    const value = (this.employee as any)[field.key];

    if (value === null || value === undefined || value === '') return '---';

    if (field.type === 'boolean') {
      return value ? this.i18n.instant('common.yes') : this.i18n.instant('common.no');
    }

    if (field.type === 'date') {
      return new Date(value).toLocaleDateString('vi-VN');
    }

    if (field.key === 'status') {
      const meta = Object.values(enumData.WORK_STATUS).find((x) => x.value === value);
      return meta ? this.i18n.instant(meta.labelKey) : String(value);
    }

    return String(value);
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.path]);
  }

  goEdit(): void {
    if (!this.id) return;
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.EDIT_EMPLOYEE.path,
      this.id,
    ]);
  }

  async toggleStatus(): Promise<void> {
    if (!this.employee?.id) return;

    const displayName = this.employee.fullName || this.employee.code;
    const confirmed = this.employee.isDeleted
      ? await this.actionConfirm.confirmActivate(this.ENTITY_KEY, displayName)
      : await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, displayName);

    if (!confirmed) return;

    const endpoint = this.employee.isDeleted
      ? this.apiService.EMPLOYEE.ACTIVATE
      : this.apiService.EMPLOYEE.DEACTIVATE;

    this.apiService.post<boolean>(endpoint, { id: this.employee.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(
            this.employee!.isDeleted
              ? this.i18n.activateSuccess(this.ENTITY_KEY, displayName)
              : this.i18n.deactivateSuccess(this.ENTITY_KEY, displayName),
          );
          this.loadEmployeeDetail(this.employee!.id!);
        }
      },
      error: (err: any) => {
        this.message.error(err.error || this.i18n.genericError());
      },
    });
  }

  async onLifecycleStatusClick(status: string): Promise<void> {
    if (!this.employee?.id || this.employee.status === status) return;

    if (status === enumData.WORK_STATUS.RESIGNED.value || status === enumData.WORK_STATUS.RETIRED.value) {
      this.pendingLifecycleStatus = status;
      this.resignationForm.reset({
        resignationDate: this.employee.resignationDate
          ? new Date(this.employee.resignationDate)
          : new Date(),
        resignationReason: this.employee.resignationReason || '',
        note: '',
      });
      this.resignationModalVisible = true;
      return;
    }

    const statusLabel = this.resolveWorkStatusLabel(status);
    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('common.messages.confirm'),
      content: this.i18n.instant('humanResource.employee.lifecycleConfirm', {
        status: statusLabel,
      }),
      okText: this.i18n.instant('common.messages.confirm'),
      okType: 'primary',
      icon: 'confirm',
    });
    if (!confirmed) return;

    this.submitLifecycleStatus(status);
  }

  closeResignationModal(): void {
    this.resignationModalVisible = false;
    this.resignationSubmitting = false;
    this.pendingLifecycleStatus = null;
  }

  submitResignationLifecycle(): void {
    if (!this.pendingLifecycleStatus) return;
    if (this.resignationForm.invalid) {
      this.resignationForm.markAllAsTouched();
      return;
    }
    const raw = this.resignationForm.getRawValue();
    this.resignationSubmitting = true;
    this.submitLifecycleStatus(this.pendingLifecycleStatus, {
      resignationDate: raw.resignationDate ? new Date(raw.resignationDate).toISOString() : null,
      resignationReason: raw.resignationReason || undefined,
      note: raw.note || undefined,
    });
  }

  private submitLifecycleStatus(
    status: string,
    extra?: {
      resignationDate?: string | null;
      resignationReason?: string;
      note?: string;
    },
  ): void {
    if (!this.employee?.id) return;

    this.apiService
      .post<boolean>(this.apiService.EMPLOYEE.SET_LIFECYCLE_STATUS, {
        id: this.employee.id,
        status,
        ...extra,
      })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.instant('humanResource.employee.lifecycleSuccess'));
            this.closeResignationModal();
            this.loadEmployeeDetail(this.employee!.id!);
          } else {
            this.message.error(this.i18n.genericError());
            this.resignationSubmitting = false;
          }
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.resignationSubmitting = false;
        },
      });
  }

  private resolveWorkStatusLabel(status: string): string {
    const meta = Object.values(enumData.WORK_STATUS).find((x) => x.value === status);
    return meta ? this.i18n.instant(meta.labelKey) : status;
  }

  openChildCreate(type: ChildType): void {
    this.childType = type;
    this.childIsEdit = false;
    this.initChildForm();
    this.childModalVisible = true;
  }

  openChildEdit(type: ChildType, record: any): void {
    this.childType = type;
    this.childIsEdit = true;
    this.initChildForm();
    this.patchChildForm(type, record);
    this.childModalVisible = true;
  }

  closeChildModal(): void {
    this.childModalVisible = false;
    this.childModalSubmitting = false;
    this.cdr.detectChanges();
  }

  submitChildForm(): void {
    if (this.childForm.invalid) {
      Object.values(this.childForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    if (!this.id) return;

    this.childModalSubmitting = true;
    const payload = this.buildChildPayload();
    const endpoint = this.resolveChildEndpoint(true);

    this.apiService.post<any>(endpoint, payload).subscribe({
      next: () => {
        this.message.success(
          this.childIsEdit ? this.i18n.updateSuccess() : this.i18n.createSuccess(),
        );
        this.closeChildModal();
        this.loadEmployeeDetail(this.id!);
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.childModalSubmitting = false;
      },
    });
  }

  async deleteChild(type: ChildType, record: any): Promise<void> {
    if (!record?.id) return;

    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('common.messages.confirm'),
      content: this.i18n.instant('humanResource.employee.confirmDeleteChild'),
      okText: this.i18n.instant('common.actions.delete'),
      okType: 'primary',
      icon: 'warning',
    });
    if (!confirmed) return;

    this.childType = type;
    const endpoint = this.resolveChildEndpoint(false);
    this.apiService.post<boolean>(endpoint, { id: record.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.instant('humanResource.employee.deleteSuccess'));
          if (this.id) this.loadEmployeeDetail(this.id);
        } else {
          this.message.error(this.i18n.genericError());
        }
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
      },
    });
  }

  private buildChildRowActions(type: ChildType): RowAction[] {
    return [
      {
        key: 'edit',
        icon: 'edit',
        tooltip: 'common.actions.update',
        severity: 'info',
        onClick: (record) => this.openChildEdit(type, record),
      },
      {
        key: 'delete',
        icon: 'delete',
        tooltip: 'common.actions.delete',
        severity: 'danger',
        onClick: (record) => this.deleteChild(type, record),
      },
    ];
  }

  private initChildForm(): void {
    switch (this.childType) {
      case 'dependent':
        this.childForm = this.fb.group({
          id: [null],
          fullName: ['', [Validators.required, Validators.maxLength(250)]],
          relationship: ['', [Validators.required, Validators.maxLength(100)]],
          dayOfBirth: [null],
          gender: ['', [Validators.maxLength(50)]],
          identityNumber: ['', [Validators.maxLength(50)]],
          taxCode: ['', [Validators.maxLength(50)]],
          dependentFromDate: [null],
          dependentToDate: [null],
          status: ['', [Validators.maxLength(100)]],
          note: ['', [Validators.maxLength(500)]],
        });
        break;
      case 'education':
        this.childForm = this.fb.group({
          id: [null],
          schoolName: ['', [Validators.required, Validators.maxLength(250)]],
          degree: ['', [Validators.maxLength(100)]],
          major: ['', [Validators.maxLength(250)]],
          startDate: [null],
          endDate: [null],
          gpa: ['', [Validators.maxLength(50)]],
        });
        break;
      case 'certificate':
        this.childForm = this.fb.group({
          id: [null],
          name: ['', [Validators.required, Validators.maxLength(250)]],
          issuingOrganization: ['', [Validators.maxLength(250)]],
          issueDate: [null],
          expiryDate: [null],
          credentialId: ['', [Validators.maxLength(100)]],
          imageUrl: [null],
        });
        break;
      case 'file':
        this.childForm = this.fb.group({
          id: [null],
          fileCategory: ['', [Validators.required, Validators.maxLength(100)]],
          fileName: ['', [Validators.required, Validators.maxLength(250)]],
          fileUrl: ['', [Validators.required, Validators.maxLength(1000)]],
          expiryDate: [null],
          description: ['', [Validators.maxLength(500)]],
        });
        break;
      case 'salaryHistory':
        this.childForm = this.fb.group({
          id: [null],
          effectiveDate: [null, [Validators.required]],
          oldBasicSalary: [null],
          newBasicSalary: [null, [Validators.required]],
          allowance: [null],
          changeType: ['', [Validators.maxLength(100)]],
          reason: ['', [Validators.maxLength(500)]],
          decisionNumber: ['', [Validators.maxLength(100)]],
          approvedBy: ['', [Validators.maxLength(250)]],
          note: ['', [Validators.maxLength(500)]],
        });
        break;
    }
  }

  private patchChildForm(type: ChildType, record: any): void {
    const toDate = (value: any) => (value ? new Date(value) : null);

    switch (type) {
      case 'dependent':
        this.childForm.patchValue({
          id: record.id,
          fullName: record.fullName,
          relationship: record.relationship,
          dayOfBirth: toDate(record.dayOfBirth),
          gender: record.gender,
          identityNumber: record.identityNumber,
          taxCode: record.taxCode,
          dependentFromDate: toDate(record.dependentFromDate),
          dependentToDate: toDate(record.dependentToDate),
          status: record.status,
          note: record.note,
        });
        break;
      case 'education':
        this.childForm.patchValue({
          id: record.id,
          schoolName: record.schoolName,
          degree: record.degree,
          major: record.major,
          startDate: toDate(record.startDate),
          endDate: toDate(record.endDate),
          gpa: record.gpa,
        });
        break;
      case 'certificate':
        this.childForm.patchValue({
          id: record.id,
          name: record.name,
          issuingOrganization: record.issuingOrganization,
          issueDate: toDate(record.issueDate),
          expiryDate: toDate(record.expiryDate),
          credentialId: record.credentialId,
          imageUrl: record.imageUrl,
        });
        break;
      case 'file':
        this.childForm.patchValue({
          id: record.id,
          fileCategory: record.fileCategory,
          fileName: record.fileName,
          fileUrl: record.fileUrl,
          expiryDate: toDate(record.expiryDate),
          description: record.description,
        });
        break;
      case 'salaryHistory':
        this.childForm.patchValue({
          id: record.id,
          effectiveDate: toDate(record.effectiveDate),
          oldBasicSalary: record.oldBasicSalary,
          newBasicSalary: record.newBasicSalary,
          allowance: record.allowance,
          changeType: record.changeType,
          reason: record.reason,
          decisionNumber: record.decisionNumber,
          approvedBy: record.approvedBy,
          note: record.note,
        });
        break;
    }
  }

  private buildChildPayload(): Record<string, any> {
    const raw = this.childForm.getRawValue();
    const toIso = (value: any) => (value ? new Date(value).toISOString() : null);

    const base = { ...raw, employeeId: this.id };

    switch (this.childType) {
      case 'dependent':
        return {
          ...base,
          dayOfBirth: toIso(raw.dayOfBirth),
          dependentFromDate: toIso(raw.dependentFromDate),
          dependentToDate: toIso(raw.dependentToDate),
        };
      case 'education':
        return {
          ...base,
          startDate: toIso(raw.startDate),
          endDate: toIso(raw.endDate),
        };
      case 'certificate':
        return {
          ...base,
          issueDate: toIso(raw.issueDate),
          expiryDate: toIso(raw.expiryDate),
        };
      case 'file':
        return {
          ...base,
          expiryDate: toIso(raw.expiryDate),
        };
      case 'salaryHistory':
        return {
          ...base,
          effectiveDate: toIso(raw.effectiveDate),
          oldBasicSalary: raw.oldBasicSalary ?? null,
          newBasicSalary: raw.newBasicSalary,
          allowance: raw.allowance ?? null,
        };
      default:
        return base;
    }
  }

  private resolveChildEndpoint(isSave: boolean): string {
    const e = this.apiService.EMPLOYEE;
    if (!isSave) {
      switch (this.childType) {
        case 'dependent':
          return e.DEPENDENT_DELETE;
        case 'education':
          return e.EDUCATION_DELETE;
        case 'certificate':
          return e.CERTIFICATE_DELETE;
        case 'file':
          return e.FILE_DELETE;
        case 'salaryHistory':
          return e.SALARY_HISTORY_DELETE;
      }
    }

    if (this.childIsEdit) {
      switch (this.childType) {
        case 'dependent':
          return e.DEPENDENT_UPDATE;
        case 'education':
          return e.EDUCATION_UPDATE;
        case 'certificate':
          return e.CERTIFICATE_UPDATE;
        case 'file':
          return e.FILE_UPDATE;
        case 'salaryHistory':
          return e.SALARY_HISTORY_UPDATE;
      }
    }

    switch (this.childType) {
      case 'dependent':
        return e.DEPENDENT_CREATE;
      case 'education':
        return e.EDUCATION_CREATE;
      case 'certificate':
        return e.CERTIFICATE_CREATE;
      case 'file':
        return e.FILE_CREATE;
      case 'salaryHistory':
        return e.SALARY_HISTORY_CREATE;
    }
  }
}
