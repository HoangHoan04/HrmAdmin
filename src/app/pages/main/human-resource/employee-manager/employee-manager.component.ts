import { PERMISSION_CODES } from '@/app/core/constants/common/permission-codes';
import { enumData } from '@/app/core/constants/enums/enumData';
import { SelectBoxDto } from '@/app/core/models/common.models';
import {
  Employee,
  EmployeeExpiringFile,
  EmployeeSelectBoxDto,
} from '@/app/core/models/human-resource/employee.models';
import { PermissionService } from '@/app/core/services/permission.service';
import { StaticTranslateService } from '@/app/core/services/static-translate.service';
import { ActionConfirmService } from '@/app/shared/services/action-confirm.service';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil } from 'rxjs';
import { ROUTES_CONFIG } from '../../../../core/constants/common/routes.config';
import { ImportResult, PagedResult } from '../../../../core/models/common.models';
import { ApiService } from '../../../../core/services/api.service';
import { I18nMessageService } from '../../../../core/services/i18n-message.service';
import { downloadBlob, extractFileName } from '../../../../core/utils/file.util';
import {
  CommonFilterActions,
  FilterAction,
  FilterConfig,
  FilterField,
} from '../../../../shared/components/filter-custom/filter-custom.types';
import {
  CommonActions,
  PaginationConfig,
  RowAction,
  TableAction,
  TableColumn,
  ToolbarConfig,
} from '../../../../shared/components/table-custom/table-custom.types';

@Component({
  standalone: false,
  selector: 'app-employee-manager',
  templateUrl: './employee-manager.component.html',
  styleUrls: ['./employee-manager.component.scss'],
})
export class EmployeeManagerComponent implements OnInit, OnDestroy {
  private readonly ENTITY_KEY = 'humanResource.employee.entityName';
  private readonly destroy$ = new Subject<void>();

  data: (Employee & { activeStatus?: boolean; statusLabel?: string })[] = [];
  loading = false;
  excelLoading = false;
  selectedRows: Employee[] = [];

  employeeOptions: EmployeeSelectBoxDto[] = [];
  companies: SelectBoxDto[] = [];
  branches: SelectBoxDto[] = [];
  departments: SelectBoxDto[] = [];
  parts: SelectBoxDto[] = [];
  positions: SelectBoxDto[] = [];
  transferTypeOptions = Object.values(enumData.TRANSFER_TYPE);

  bulkManagerVisible = false;
  bulkManagerSubmitting = false;
  bulkManagerForm!: FormGroup;

  bulkTransferVisible = false;
  bulkTransferSubmitting = false;
  bulkTransferForm!: FormGroup;

  expiringVisible = false;
  expiringLoading = false;
  expiringDaysAhead = 30;
  expiringFiles: EmployeeExpiringFile[] = [];

  expiringColumns: TableColumn[] = [
    { field: 'employeeCode', header: 'humanResource.employee.code', type: 'text' },
    { field: 'employeeName', header: 'humanResource.employee.fullName', type: 'text' },
    {
      field: 'fileCategory',
      header: 'humanResource.employee.file.fileCategory',
      type: 'text',
    },
    { field: 'fileName', header: 'humanResource.employee.file.fileName', type: 'text' },
    { field: 'expiryDate', header: 'humanResource.employee.file.expiryDate', type: 'date' },
    { field: 'versionNo', header: 'humanResource.employee.file.versionNo', type: 'number' },
    {
      field: 'daysUntilExpiry',
      header: 'humanResource.employee.daysUntilExpiry',
      type: 'number',
    },
    {
      field: 'isExpired',
      header: 'humanResource.employee.file.isExpired',
      type: 'boolean',
    },
  ];

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = enumData.PAGE.SORT_FIELD.CREATED_AT;
  sortOrder = enumData.PAGE.SORT_ORDER.DESC;

  toolbar: ToolbarConfig = {
    show: true,
  };

  toolbarActions: TableAction[] = [
    {
      ...CommonActions.create(() => this.openCreateModal()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.HR_EMPLOYEE_CREATE),
    },
    {
      key: 'bulk-manager',
      label: 'humanResource.employee.bulkChangeManager',
      icon: 'team',
      severity: 'default',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.HR_EMPLOYEE_UPDATE),
      onClick: () => this.openBulkManagerModal(),
    },
    {
      key: 'bulk-transfer',
      label: 'humanResource.employee.bulkTransfer',
      icon: 'swap',
      severity: 'default',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.HR_EMPLOYEE_UPDATE),
      onClick: () => this.openBulkTransferModal(),
    },
    {
      key: 'expiring-files',
      label: 'humanResource.employee.expiringFiles',
      icon: 'file-exclamation',
      severity: 'warning',
      onClick: () => this.openExpiringFilesModal(),
    },
    {
      ...CommonActions.uploadExcel(
        () => this.downloadTemplate(),
        (file) => this.uploadFile(file),
      ),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.HR_EMPLOYEE_IMPORT_EXCEL),
    },
    {
      ...CommonActions.exportExcel(() => this.exportExcel()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.HR_EMPLOYEE_EXPORT_EXCEL),
    },
  ];

  filters: Record<string, any> = {
    code: '',
    fullName: '',
    phone: '',
    status: null,
    isDeleted: null,
  };

  filterConfig: FilterConfig = {
    show: true,
    collapsible: true,
    defaultOpen: true,
    title: 'common.filter.title',
    actionsAlign: 'center',
  };

  filterFields: FilterField[] = [
    {
      key: 'code',
      label: 'humanResource.employee.code',
      type: 'input',
      placeholder: 'humanResource.employee.searchCode',
      col: 8,
      allowClear: true,
    },
    {
      key: 'fullName',
      label: 'humanResource.employee.fullName',
      type: 'input',
      placeholder: 'humanResource.employee.searchFullName',
      col: 8,
      allowClear: true,
    },
    {
      key: 'phone',
      label: 'humanResource.employee.phone',
      type: 'input',
      placeholder: 'humanResource.employee.searchPhone',
      col: 8,
      allowClear: true,
    },
    {
      key: 'status',
      label: 'humanResource.employee.status',
      type: 'select',
      placeholder: 'humanResource.employee.filterStatus',
      col: 8,
      allowClear: true,
      options: Object.values(enumData.WORK_STATUS).map((s) => ({
        label: s.labelKey,
        value: s.value,
      })),
    },
    {
      key: 'isDeleted',
      label: 'humanResource.employee.recordStatus',
      type: 'select',
      placeholder: 'humanResource.employee.filterRecordStatus',
      col: 8,
      allowClear: true,
      options: Object.values(enumData.STATUS_FILTER_IS_DELETED)
        .filter((s) => s.value !== null)
        .map((s) => ({ label: s.labelKey, value: s.value })),
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'code', header: 'humanResource.employee.code', type: 'text', sortable: true },
    { field: 'fullName', header: 'humanResource.employee.fullName', type: 'text', sortable: true },
    { field: 'phone', header: 'humanResource.employee.phone', type: 'text', sortable: true },
    { field: 'email', header: 'humanResource.employee.email', type: 'text', sortable: true },
    {
      field: 'status',
      header: 'humanResource.employee.status',
      type: 'badge',
      sortable: true,
      render: (value: string) => {
        const meta = Object.values(enumData.WORK_STATUS).find((x) => x.value === value);
        return meta ? StaticTranslateService.instant(meta.labelKey) : value;
      },
      badgeColor: (value: string) => {
        const meta = Object.values(enumData.WORK_STATUS).find((x) => x.value === value);
        return meta?.color || '#8c8c8c';
      },
    },
    {
      field: 'directManagerName',
      header: 'humanResource.employee.directManager',
      type: 'text',
    },
    { field: 'joinDate', header: 'humanResource.employee.joinDate', type: 'date', sortable: true },
    {
      field: 'isDeleted',
      header: 'humanResource.employee.recordStatus',
      type: 'boolean',
      sortable: true,
      renderBoolean: (value: boolean) =>
        StaticTranslateService.instant(value ? 'common.statusInactive' : 'common.statusActive'),
      badgeSeverity: (value: boolean) => (value ? 'danger' : 'success'),
    },
    {
      field: 'createdAt',
      header: 'humanResource.employee.createdAt',
      type: 'date',
      sortable: true,
    },
  ];

  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'table.action.viewDetail',
      severity: 'primary',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.HR_EMPLOYEE_VIEW),
      onClick: (record) => this.viewDetail(record),
    },
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'table.action.edit',
      severity: 'info',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.HR_EMPLOYEE_UPDATE),
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'table.action.activate',
      severity: 'success',
      visible: (record) =>
        record.isDeleted === true && this.permissionSvc.has(PERMISSION_CODES.HR_EMPLOYEE_ACTIVATE),
      onClick: (record) => this.activateEmployee(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'table.action.deactivate',
      severity: 'danger',
      visible: (record) =>
        record.isDeleted === false &&
        this.permissionSvc.has(PERMISSION_CODES.HR_EMPLOYEE_DEACTIVATE),
      onClick: (record) => this.deactivateEmployee(record),
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly actionConfirm: ActionConfirmService,
    private readonly fb: FormBuilder,
    readonly permissionSvc: PermissionService,
  ) {}

  ngOnInit(): void {
    this.initBulkForms();
    this.loadEmployeeOptions();
    this.loadCompanies();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initBulkForms(): void {
    this.bulkManagerForm = this.fb.group({
      employeeIds: [[], [Validators.required]],
      directManagerId: [null],
    });

    this.bulkTransferForm = this.fb.group({
      employeeIds: [[], [Validators.required]],
      codePrefix: [''],
      transferType: [null, [Validators.required]],
      effectiveDate: [null, [Validators.required]],
      reason: [''],
      newCompanyId: [null],
      newBranchId: [null],
      newDepartmentId: [null],
      newPartId: [null],
      newPositionId: [null],
    });

    this.bulkTransferForm
      .get('newCompanyId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((companyId) => {
        this.branches = [];
        this.departments = [];
        this.parts = [];
        this.positions = [];
        this.bulkTransferForm.patchValue(
          { newBranchId: null, newDepartmentId: null, newPartId: null, newPositionId: null },
          { emitEvent: false },
        );
        if (companyId) {
          this.loadBranches(companyId);
          this.loadDepartments(companyId, null);
        }
      });

    this.bulkTransferForm
      .get('newBranchId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((branchId) => {
        this.departments = [];
        this.parts = [];
        this.positions = [];
        this.bulkTransferForm.patchValue(
          { newDepartmentId: null, newPartId: null, newPositionId: null },
          { emitEvent: false },
        );
        const companyId = this.bulkTransferForm.get('newCompanyId')?.value ?? null;
        if (companyId || branchId) {
          this.loadDepartments(companyId, branchId);
        }
      });

    this.bulkTransferForm
      .get('newDepartmentId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((departmentId) => {
        this.parts = [];
        this.positions = [];
        this.bulkTransferForm.patchValue(
          { newPartId: null, newPositionId: null },
          { emitEvent: false },
        );
        if (departmentId) {
          this.loadParts(departmentId);
          this.loadPositions(departmentId);
        }
      });
  }

  private selectedEmployeeIds(): string[] {
    return this.selectedRows.map((r) => r.id).filter((id): id is string => !!id);
  }

  onSelectionChange(rows: Employee[]): void {
    this.selectedRows = rows || [];
  }

  loadEmployeeOptions(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (res) => {
          this.employeeOptions = res || [];
          this.cdr.markForCheck();
        },
      });
  }

  loadCompanies(): void {
    this.apiService.post<SelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => (this.companies = res || []),
    });
  }

  loadBranches(companyId: string): void {
    this.apiService
      .post<SelectBoxDto[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, { companyId })
      .subscribe({
        next: (res) => (this.branches = res || []),
        error: () => (this.branches = []),
      });
  }

  loadDepartments(companyId: string | null, branchId: string | null): void {
    if (!companyId && !branchId) {
      this.departments = [];
      return;
    }
    if (branchId) {
      this.apiService
        .post<SelectBoxDto[]>(this.apiService.DEPARTMENT.LOAD_BY_BRANCH, { branchId })
        .subscribe({
          next: (res) => (this.departments = res || []),
          error: () => (this.departments = []),
        });
      return;
    }
    this.apiService
      .post<SelectBoxDto[]>(this.apiService.DEPARTMENT.LOAD_BY_COMPANY, { companyId })
      .subscribe({
        next: (res) => (this.departments = res || []),
        error: () => (this.departments = []),
      });
  }

  loadParts(departmentId: string): void {
    this.apiService
      .post<SelectBoxDto[]>(this.apiService.PART.LOAD_BY_DEPARTMENT, { departmentId })
      .subscribe({
        next: (res) => (this.parts = res || []),
        error: () => (this.parts = []),
      });
  }

  loadPositions(departmentId: string): void {
    this.apiService
      .post<SelectBoxDto[]>(this.apiService.POSITION.SELECT_BOX, { departmentId })
      .subscribe({
        next: (res) => (this.positions = res || []),
        error: () => (this.positions = []),
      });
  }

  private resolveWorkStatusLabel(status?: string): string {
    if (!status) return '-';
    const meta = Object.values(enumData.WORK_STATUS).find((x) => x.value === status);
    return meta ? this.i18n.instant(meta.labelKey) : status;
  }

  loadData(): void {
    this.loading = true;
    this.syncFilterActionsLoading();
    this.cdr.markForCheck();

    const payload: Record<string, any> = {
      pageIndex: this.pagination.current,
      pageSize: this.pagination.pageSize,
      sortField:
        this.sortField === enumData.PAGE.SORT_FIELD.ACTIVATE_STATUS
          ? enumData.PAGE.SORT_FIELD.IS_DELETED
          : this.sortField === enumData.PAGE.SORT_FIELD.STATUS_LABEL
            ? enumData.PAGE.SORT_FIELD.STATUS
            : this.sortField,
      sortOrder: this.sortOrder,
      code: (this.filters['code'] || '').trim() || undefined,
      fullName: (this.filters['fullName'] || '').trim() || undefined,
      phone: (this.filters['phone'] || '').trim() || undefined,
      status: this.filters['status'] || undefined,
    };

    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService
      .post<PagedResult<Employee>>(this.apiService.EMPLOYEE.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items;
          this.pagination.total = res.totalCount;
          this.loading = false;
          this.syncFilterActionsLoading();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadListFailed(this.ENTITY_KEY, err.error));
          this.loading = false;
          this.syncFilterActionsLoading();
          this.cdr.markForCheck();
        },
      });
  }

  onFiltersChange(filters: Record<string, any>): void {
    this.filters = filters;
  }

  onFilterSearch(): void {
    this.pagination.current = 1;
    this.loadData();
  }

  onFilterClear(): void {
    this.filters = { code: '', fullName: '', phone: '', status: null, isDeleted: null };
    this.pagination.current = 1;
    this.loadData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.current = event.page;
    this.pagination.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(event: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    const field = event.sortField || 'createdAt';
    this.sortField =
      field === 'activeStatus' ? 'isDeleted' : field === 'statusLabel' ? 'status' : field;
    this.sortOrder = event.sortOrder === 1 ? 'asc' : event.sortOrder === -1 ? 'desc' : 'desc';
    this.loadData();
  }

  openBulkManagerModal(): void {
    this.bulkManagerForm.reset({
      employeeIds: this.selectedEmployeeIds(),
      directManagerId: null,
    });
    this.bulkManagerVisible = true;
  }

  closeBulkManagerModal(): void {
    this.bulkManagerVisible = false;
    this.bulkManagerSubmitting = false;
  }

  submitBulkManager(): void {
    if (this.bulkManagerForm.invalid) {
      this.bulkManagerForm.markAllAsTouched();
      this.message.warning(this.i18n.instant('humanResource.employee.selectEmployeesRequired'));
      return;
    }
    const value = this.bulkManagerForm.getRawValue();
    this.bulkManagerSubmitting = true;
    this.apiService
      .post<number>(this.apiService.EMPLOYEE.BULK_CHANGE_MANAGER, {
        employeeIds: value.employeeIds,
        directManagerId: value.directManagerId || null,
      })
      .subscribe({
        next: (count) => {
          this.message.success(
            this.i18n.instant('humanResource.employee.bulkChangeManagerSuccess', {
              count: count ?? value.employeeIds.length,
            }),
          );
          this.closeBulkManagerModal();
          this.selectedRows = [];
          this.loadData();
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.bulkManagerSubmitting = false;
        },
      });
  }

  openBulkTransferModal(): void {
    this.branches = [];
    this.departments = [];
    this.parts = [];
    this.positions = [];
    this.bulkTransferForm.reset({
      employeeIds: this.selectedEmployeeIds(),
      codePrefix: '',
      transferType: null,
      effectiveDate: null,
      reason: '',
      newCompanyId: null,
      newBranchId: null,
      newDepartmentId: null,
      newPartId: null,
      newPositionId: null,
    });
    this.bulkTransferVisible = true;
  }

  closeBulkTransferModal(): void {
    this.bulkTransferVisible = false;
    this.bulkTransferSubmitting = false;
  }

  submitBulkTransfer(): void {
    if (this.bulkTransferForm.invalid) {
      this.bulkTransferForm.markAllAsTouched();
      return;
    }
    const value = this.bulkTransferForm.getRawValue();
    if (
      !value.newCompanyId &&
      !value.newBranchId &&
      !value.newDepartmentId &&
      !value.newPartId &&
      !value.newPositionId
    ) {
      this.message.warning(this.i18n.instant('humanResource.employee.orgTargetRequired'));
      return;
    }

    this.bulkTransferSubmitting = true;
    this.apiService
      .post<string[]>(this.apiService.TRANSFER_EMPLOYEE.BULK_CREATE, {
        employeeIds: value.employeeIds,
        codePrefix: (value.codePrefix || '').trim() || undefined,
        transferType: value.transferType,
        effectiveDate: value.effectiveDate ? new Date(value.effectiveDate).toISOString() : null,
        reason: value.reason || undefined,
        newCompanyId: value.newCompanyId || null,
        newBranchId: value.newBranchId || null,
        newDepartmentId: value.newDepartmentId || null,
        newPartId: value.newPartId || null,
        newPositionId: value.newPositionId || null,
      })
      .subscribe({
        next: (ids) => {
          this.message.success(
            this.i18n.instant('humanResource.employee.bulkTransferSuccess', {
              count: ids?.length ?? value.employeeIds.length,
            }),
          );
          this.closeBulkTransferModal();
          this.selectedRows = [];
          this.loadData();
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.bulkTransferSubmitting = false;
        },
      });
  }

  openExpiringFilesModal(): void {
    this.expiringVisible = true;
    this.expiringLoading = true;
    this.apiService
      .post<EmployeeExpiringFile[]>(this.apiService.EMPLOYEE.FILES_EXPIRING, {
        daysAhead: this.expiringDaysAhead,
        includeExpired: true,
      })
      .subscribe({
        next: (items) => {
          this.expiringFiles = items || [];
          this.expiringLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.expiringLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  closeExpiringFilesModal(): void {
    this.expiringVisible = false;
  }

  async activateEmployee(employee: Employee): Promise<void> {
    if (!employee.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const displayName = employee.fullName || employee.code;
    const confirmed = await this.actionConfirm.confirmActivate(this.ENTITY_KEY, displayName);
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.EMPLOYEE.ACTIVATE, { id: employee.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.activateSuccess(this.ENTITY_KEY, displayName));
            this.loadData();
          } else {
            this.message.error(this.i18n.activateFailed(this.ENTITY_KEY));
          }
        },
        error: (err: any) => {
          this.message.error(this.i18n.activateError(this.ENTITY_KEY, err.error));
        },
      });
  }

  async deactivateEmployee(employee: Employee): Promise<void> {
    if (!employee.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const displayName = employee.fullName || employee.code;
    const confirmed = await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, displayName);
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.EMPLOYEE.DEACTIVATE, { id: employee.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.deactivateSuccess(this.ENTITY_KEY, displayName));
            this.loadData();
          } else {
            this.message.error(this.i18n.deactivateFailed(this.ENTITY_KEY));
          }
        },
        error: (err: any) => {
          this.message.error(this.i18n.deactivateError(this.ENTITY_KEY, err.error));
        },
      });
  }

  openCreateModal(): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.ADD_EMPLOYEE.path,
    ]);
  }

  openEdit(employee: Employee): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.EDIT_EMPLOYEE.path,
      employee.id,
    ]);
  }

  viewDetail(employee: Employee): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.DETAIL_EMPLOYEE.path,
      employee.id,
    ]);
  }

  downloadTemplate(): void {
    this.excelLoading = true;
    this.apiService.postBlob(this.apiService.EMPLOYEE.EXCEL_TEMPLATE).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelTemplateFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          'Mau_Import_Nhan_Vien.xlsx',
        );
        downloadBlob(blob, fileName);
        this.message.success(this.i18n.excelTemplateSuccess());
        this.excelLoading = false;
      },
      error: () => {
        this.message.error(this.i18n.excelTemplateFailed());
        this.excelLoading = false;
      },
    });
  }

  uploadFile(file: File): void {
    this.excelLoading = true;
    this.apiService
      .uploadFile<ImportResult>(this.apiService.EMPLOYEE.EXCEL_IMPORT, file)
      .subscribe({
        next: (result) => {
          this.excelLoading = false;
          if (result.errorCount > 0) {
            this.message.warning(
              this.i18n.excelImportPartial(
                result.successCount,
                result.totalRows,
                result.errorCount,
              ),
            );
            if (result.errors?.length) {
              console.warn('Employee import errors:', result.errors);
            }
          } else {
            this.message.success(
              this.i18n.excelImportSuccess(result.successCount, this.ENTITY_KEY),
            );
          }
          this.loadData();
        },
        error: (err: any) => {
          this.excelLoading = false;
          this.message.error(this.i18n.excelImportFailed(err.error));
        },
      });
  }

  exportExcel(): void {
    this.excelLoading = true;
    const payload: Record<string, any> = {
      code: (this.filters['code'] || '').trim() || undefined,
      fullName: (this.filters['fullName'] || '').trim() || undefined,
      phone: (this.filters['phone'] || '').trim() || undefined,
      status: this.filters['status'] || undefined,
    };
    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService.postBlob(this.apiService.EMPLOYEE.EXCEL_EXPORT, payload).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelExportFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          `Danh_Sach_Nhan_Vien_${new Date().getTime()}.xlsx`,
        );
        downloadBlob(blob, fileName);
        this.message.success(this.i18n.excelExportSuccess());
        this.excelLoading = false;
      },
      error: () => {
        this.message.error(this.i18n.excelExportFailed());
        this.excelLoading = false;
      },
    });
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((action) => action.key === 'search');
    if (searchAction) {
      searchAction.loading = this.loading;
    }
  }
}
