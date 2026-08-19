import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import { toDateOnly } from '@/app/core/constants/helpers';
import {
  BranchSelectBoxDto,
  EmployeeSelectBoxDto,
  PagedResult,
  ShiftMasterSelectBoxDto,
  WorkSchedule,
} from '@/app/core/models';
import { ApiService, I18nMessageService, PermissionService } from '@/app/core/services';
import { downloadBlob, extractFileName } from '@/app/core/utils/file.util';
import {
  CommonFilterActions,
  FilterAction,
  FilterConfig,
  FilterField,
} from '@/app/shared/components/filter-custom/filter-custom.types';
import {
  CommonActions,
  PaginationConfig,
  RowAction,
  TableAction,
  TableColumn,
  ToolbarConfig,
} from '@/app/shared/components/table-custom/table-custom.types';
import { ActionConfirmService } from '@/app/shared/services/action-confirm.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { tap } from 'rxjs/internal/operators/tap';

interface BulkWorkScheduleResult {
  created: number;
  updated: number;
  skipped: number;
}

@Component({
  standalone: false,
  selector: 'app-work-schedule-manager',
  templateUrl: './work-schedule-manager.component.html',
  styleUrls: [],
})
export class WorkScheduleManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'workSchedule.entityName';

  data: WorkSchedule[] = [];
  loading = false;
  bulkSubmitting = false;
  copySubmitting = false;
  excelLoading = false;

  bulkVisible = false;
  copyVisible = false;
  bulkForm: FormGroup;
  copyForm: FormGroup;

  employeeOptions: { label: string; value: string }[] = [];
  shiftOptions: { label: string; value: string }[] = [];

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = enumData.PAGE.SORT_FIELD.WORK_DATE;
  sortOrder = enumData.PAGE.SORT_ORDER.DESC;

  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [
    {
      ...CommonActions.create(() => this.openCreate()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.OPERATE_WORK_SCHEDULE_CREATE),
    },
    {
      key: 'bulk-create',
      label: 'workSchedule.bulkCreate',
      icon: 'calendar',
      severity: 'primary',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.OPERATE_WORK_SCHEDULE_CREATE),
      onClick: () => this.openBulk(),
    },
    {
      key: 'copy-week',
      label: 'workSchedule.copyWeek',
      icon: 'copy',
      severity: 'info',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.OPERATE_WORK_SCHEDULE_CREATE),
      onClick: () => this.openCopyWeek(),
    },
    {
      ...CommonActions.uploadExcel({
        templateUrl: () => this.apiService.WORK_SCHEDULE.EXCEL_TEMPLATE,
        importUrl: () => this.apiService.WORK_SCHEDULE.EXCEL_IMPORT,
        entityName: this.ENTITY_KEY,
        onSuccess: () => this.loadData(),
      }),
      visible: () =>
        this.permissionSvc.has(PERMISSION_CODES.OPERATE_WORK_SCHEDULE_IMPORT_EXCEL) ||
        this.permissionSvc.has(PERMISSION_CODES.OPERATE_WORK_SCHEDULE_CREATE),
    },
    {
      ...CommonActions.exportExcel(() => this.exportExcel()),
      visible: () =>
        this.permissionSvc.has(PERMISSION_CODES.OPERATE_WORK_SCHEDULE_EXPORT_EXCEL) ||
        this.permissionSvc.has(PERMISSION_CODES.OPERATE_WORK_SCHEDULE_VIEW),
    },
  ];

  filters: Record<string, any> = {
    employeeId: null,
    shiftMasterId: null,
    branchId: null,
    dateRange: null,
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
      key: 'employeeId',
      label: 'workSchedule.employee',
      type: 'select',
      placeholder: 'workSchedule.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'shiftMasterId',
      label: 'workSchedule.shiftMaster',
      type: 'select',
      placeholder: 'workSchedule.filterShift',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'workSchedule.branch',
      type: 'select',
      placeholder: 'workSchedule.filterBranch',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'dateRange',
      label: 'workSchedule.filterDateRange',
      type: 'dateRange',
      col: 6,
      allowClear: true,
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'employeeCode', header: 'workSchedule.employeeCode', type: 'text' },
    { field: 'employeeName', header: 'workSchedule.employee', type: 'text' },
    { field: 'shiftMasterName', header: 'workSchedule.shiftMaster', type: 'text' },
    {
      field: 'workDate',
      header: 'workSchedule.workDate',
      type: 'date',
      sortable: true,
    },
    { field: 'branchName', header: 'workSchedule.branch', type: 'text' },
    { field: 'note', header: 'workSchedule.note', type: 'text' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'table.action.edit',
      severity: 'info',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.OPERATE_WORK_SCHEDULE_UPDATE),
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'deactivate',
      icon: 'delete',
      tooltip: 'table.action.deactivate',
      severity: 'danger',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.OPERATE_WORK_SCHEDULE_DEACTIVATE),
      onClick: (record) => this.deactivate(record),
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
  ) {
    this.bulkForm = this.fb.group({
      employeeIds: [[], Validators.required],
      dateRange: [null, Validators.required],
      shiftMasterId: [null, Validators.required],
      skipWeekends: [true],
      overwriteExisting: [false],
      note: [null],
    });
    this.copyForm = this.fb.group({
      employeeIds: [[], Validators.required],
      sourceWeekStart: [null, Validators.required],
      targetWeekStart: [null, Validators.required],
      overwriteExisting: [false],
    });
  }

  ngOnInit(): void {
    this.loadSelectBoxes();
    this.loadData();
  }

  loadSelectBoxes(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          this.employeeOptions = items.map((item) => ({
            label: item.code ? `${item.code} - ${item.name}` : item.name,
            value: item.id,
          }));
          const field = this.filterFields.find((f) => f.key === 'employeeId');
          if (field) field.options = this.employeeOptions;
          this.cdr.markForCheck();
        },
      });

    this.apiService
      .post<ShiftMasterSelectBoxDto[]>(this.apiService.SHIFT_MASTER.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          this.shiftOptions = items.map((item) => ({
            label: item.code ? `${item.code} - ${item.name}` : item.name,
            value: item.id,
          }));
          const field = this.filterFields.find((f) => f.key === 'shiftMasterId');
          if (field) field.options = this.shiftOptions;
          this.cdr.markForCheck();
        },
      });

    this.apiService.post<BranchSelectBoxDto[]>(this.apiService.BRANCH.SELECT_BOX, {}).subscribe({
      next: (items) => {
        const field = this.filterFields.find((f) => f.key === 'branchId');
        if (field) {
          field.options = items.map((item) => ({
            label: item.code ? `${item.code} - ${item.name}` : item.name,
            value: item.id,
          }));
        }
        this.cdr.markForCheck();
      },
    });
  }

  loadData(): void {
    this.loading = true;
    this.syncFilterActionsLoading();
    this.cdr.markForCheck();

    const payload: Record<string, any> = {
      pageIndex: this.pagination.current,
      pageSize: this.pagination.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
    };
    if (this.filters['employeeId']) payload['employeeId'] = this.filters['employeeId'];
    if (this.filters['shiftMasterId']) payload['shiftMasterId'] = this.filters['shiftMasterId'];
    if (this.filters['branchId']) payload['branchId'] = this.filters['branchId'];

    const range = this.filters['dateRange'] as Date[] | null;
    if (range?.length === 2 && range[0] && range[1]) {
      payload['fromDate'] = toDateOnly(range[0]);
      payload['toDate'] = toDateOnly(range[1]);
    }

    this.apiService
      .post<PagedResult<WorkSchedule>>(this.apiService.WORK_SCHEDULE.PAGINATION, payload)
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
    this.filters = { employeeId: null, shiftMasterId: null, branchId: null, dateRange: null };
    this.pagination.current = 1;
    this.loadData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.current = event.page;
    this.pagination.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(event: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    this.sortField = event.sortField || 'workDate';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }

  openCreate(): void {
    this.router.navigate([
      ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.children.ADD_WORK_SCHEDULE.path,
    ]);
  }

  openEdit(item: WorkSchedule): void {
    this.router.navigate([
      ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.children.EDIT_WORK_SCHEDULE.path,
      item.id,
    ]);
  }

  openBulk(): void {
    this.bulkForm.reset({
      employeeIds: [],
      dateRange: null,
      shiftMasterId: null,
      skipWeekends: true,
      overwriteExisting: false,
      note: null,
    });
    this.bulkVisible = true;
  }

  closeBulk(): void {
    this.bulkVisible = false;
  }

  submitBulk(): void {
    if (this.bulkForm.invalid) {
      this.bulkForm.markAllAsTouched();
      return;
    }
    const value = this.bulkForm.getRawValue();
    const range = value.dateRange as Date[] | null;
    if (!range?.length || range.length < 2 || !range[0] || !range[1]) {
      this.message.error(this.i18n.instant('workSchedule.validationDateRange'));
      return;
    }
    if (!value.employeeIds?.length) {
      this.message.error(this.i18n.instant('workSchedule.employeeRequired'));
      return;
    }

    this.bulkSubmitting = true;
    this.apiService
      .post<BulkWorkScheduleResult>(this.apiService.WORK_SCHEDULE.BULK_CREATE, {
        employeeIds: value.employeeIds,
        fromDate: toDateOnly(range[0]),
        toDate: toDateOnly(range[1]),
        shiftMasterId: value.shiftMasterId,
        skipWeekends: !!value.skipWeekends,
        overwriteExisting: !!value.overwriteExisting,
        note: (value.note || '').trim() || null,
      })
      .subscribe({
        next: (res) => {
          this.message.success(
            this.i18n.instant('workSchedule.bulkResult', {
              created: res.created,
              updated: res.updated,
              skipped: res.skipped,
            }),
          );
          this.bulkVisible = false;
          this.bulkSubmitting = false;
          this.loadData();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.bulkSubmitting = false;
          this.cdr.markForCheck();
        },
      });
  }

  openCopyWeek(): void {
    this.copyForm.reset({
      employeeIds: [],
      sourceWeekStart: null,
      targetWeekStart: null,
      overwriteExisting: false,
    });
    this.copyVisible = true;
  }

  closeCopyWeek(): void {
    this.copyVisible = false;
  }

  submitCopyWeek(): void {
    if (this.copyForm.invalid) {
      this.copyForm.markAllAsTouched();
      return;
    }
    const value = this.copyForm.getRawValue();
    if (!value.employeeIds?.length) {
      this.message.error(this.i18n.instant('workSchedule.employeeRequired'));
      return;
    }

    this.copySubmitting = true;
    this.apiService
      .post<BulkWorkScheduleResult>(this.apiService.WORK_SCHEDULE.COPY_WEEK, {
        employeeIds: value.employeeIds,
        sourceWeekStart: toDateOnly(value.sourceWeekStart),
        targetWeekStart: toDateOnly(value.targetWeekStart),
        overwriteExisting: !!value.overwriteExisting,
      })
      .subscribe({
        next: (res) => {
          this.message.success(
            this.i18n.instant('workSchedule.bulkResult', {
              created: res.created,
              updated: res.updated,
              skipped: res.skipped,
            }),
          );
          this.copyVisible = false;
          this.copySubmitting = false;
          this.loadData();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.copySubmitting = false;
          this.cdr.markForCheck();
        },
      });
  }

  async deactivate(item: WorkSchedule): Promise<void> {
    if (!item.id) return;
    const label = `${item.employeeName || item.employeeCode || ''} ${item.workDate}`.trim();
    const confirmed = await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, label);
    if (!confirmed) return;
    this.apiService
      .post<boolean>(this.apiService.WORK_SCHEDULE.DEACTIVATE, { id: item.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.deactivateSuccess(this.ENTITY_KEY, label));
            this.loadData();
          } else {
            this.message.error(this.i18n.deactivateFailed(this.ENTITY_KEY));
          }
        },
        error: (err: any) =>
          this.message.error(this.i18n.deactivateError(this.ENTITY_KEY, err.error)),
      });
  }

  exportExcel() {
    this.excelLoading = true;
    const payload: Record<string, any> = {};
    if (this.filters['employeeId']) payload['employeeId'] = this.filters['employeeId'];
    if (this.filters['shiftMasterId']) payload['shiftMasterId'] = this.filters['shiftMasterId'];
    if (this.filters['branchId']) payload['branchId'] = this.filters['branchId'];
    if (this.filters['dateRange'] && this.filters['dateRange'].length === 2) {
      payload['fromDate'] = toDateOnly(this.filters['dateRange'][0]);
      payload['toDate'] = toDateOnly(this.filters['dateRange'][1]);
    }

    return this.apiService.postBlob(this.apiService.WORK_SCHEDULE.EXCEL_EXPORT, payload).pipe(
      tap({
        next: (response) => {
          this.excelLoading = false;
          const blob = response.body;
          if (!blob) {
            this.message.error(this.i18n.excelExportFailed());
            return;
          }
          const fileName = extractFileName(
            response.headers.get('content-disposition'),
            `Danh_Sach_Lich_Lam_Viec_${new Date().getTime()}.xlsx`,
          );
          downloadBlob(blob, fileName);
          this.message.success(this.i18n.excelExportSuccess());
        },
        error: () => {
          this.excelLoading = false;
          this.message.error(this.i18n.excelExportFailed());
        },
      }),
    );
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
