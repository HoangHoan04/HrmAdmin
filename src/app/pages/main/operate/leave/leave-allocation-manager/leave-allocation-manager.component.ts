import { PERMISSION_CODES } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import {
  DayOffAllocation,
  DayOffConfigSelectBoxDto,
  EmployeeSelectBoxDto,
  PagedResult,
} from '@/app/core/models';
import { ApiService, I18nMessageService, PermissionService } from '@/app/core/services';
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
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-leave-allocation-manager',
  templateUrl: './leave-allocation-manager.component.html',
  styleUrls: [],
})
export class LeaveAllocationManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'leaveAllocation.entityName';

  data: DayOffAllocation[] = [];
  loading = false;
  submitting = false;

  upsertVisible = false;
  upsertForm: FormGroup;
  editingId: string | null = null;

  employeeOptions: { label: string; value: string }[] = [];
  dayOffConfigOptions: { label: string; value: string }[] = [];

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = enumData.PAGE.SORT_FIELD.YEAR;
  sortOrder = enumData.PAGE.SORT_ORDER.DESC;
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [
    {
      ...CommonActions.create(() => this.openCreate()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.OPERATE_LEAVE_ALLOCATION_CREATE),
    },
  ];

  filters: Record<string, any> = {
    employeeId: null,
    dayOffConfigId: null,
    year: null,
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
      label: 'leaveAllocation.employee',
      type: 'select',
      placeholder: 'leaveAllocation.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'dayOffConfigId',
      label: 'leaveAllocation.configName',
      type: 'select',
      placeholder: 'leaveAllocation.filterConfig',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'year',
      label: 'leaveAllocation.year',
      type: 'number',
      placeholder: 'leaveAllocation.filterYear',
      col: 6,
      allowClear: true,
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'employeeCode', header: 'leaveAllocation.employeeCode', type: 'text' },
    { field: 'employeeName', header: 'leaveAllocation.employeeName', type: 'text' },
    { field: 'dayOffConfigName', header: 'leaveAllocation.configName', type: 'text' },
    { field: 'year', header: 'leaveAllocation.year', type: 'text', sortable: true },
    { field: 'allocatedDays', header: 'leaveAllocation.allocatedDays', type: 'text' },
    { field: 'usedDays', header: 'leaveAllocation.usedDays', type: 'text' },
    { field: 'pendingDays', header: 'leaveAllocation.pendingDays', type: 'text' },
    { field: 'remainingDays', header: 'leaveAllocation.remainingDays', type: 'text' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'table.action.edit',
      severity: 'info',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.OPERATE_LEAVE_ALLOCATION_UPDATE),
      onClick: (record) => this.openEdit(record),
    },
  ];

  constructor(
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    readonly permissionSvc: PermissionService,
  ) {
    this.upsertForm = this.fb.group({
      employeeId: [null, Validators.required],
      dayOffConfigId: [null, Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
      allocatedDays: [0, [Validators.required, Validators.min(0)]],
      note: [null],
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
      .post<DayOffConfigSelectBoxDto[]>(this.apiService.DAY_OFF_CONFIG.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          this.dayOffConfigOptions = items.map((item) => ({
            label: item.code ? `${item.code} - ${item.name}` : item.name,
            value: item.id,
          }));
          const field = this.filterFields.find((f) => f.key === 'dayOffConfigId');
          if (field) field.options = this.dayOffConfigOptions;
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
    if (this.filters['dayOffConfigId']) payload['dayOffConfigId'] = this.filters['dayOffConfigId'];
    if (
      this.filters['year'] !== null &&
      this.filters['year'] !== undefined &&
      this.filters['year'] !== ''
    ) {
      payload['year'] = Number(this.filters['year']);
    }

    this.apiService
      .post<PagedResult<DayOffAllocation>>(this.apiService.DAY_OFF_ALLOCATION.PAGINATION, payload)
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
    this.filters = { employeeId: null, dayOffConfigId: null, year: null };
    this.pagination.current = 1;
    this.loadData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.current = event.page;
    this.pagination.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(event: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    this.sortField = event.sortField || 'year';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }

  openCreate(): void {
    this.editingId = null;
    this.upsertForm.reset({
      employeeId: null,
      dayOffConfigId: null,
      year: new Date().getFullYear(),
      allocatedDays: 0,
      note: null,
    });
    this.upsertForm.get('employeeId')?.enable();
    this.upsertForm.get('dayOffConfigId')?.enable();
    this.upsertForm.get('year')?.enable();
    this.upsertVisible = true;
  }

  openEdit(record: DayOffAllocation): void {
    this.editingId = record.id;
    this.upsertForm.reset({
      employeeId: record.employeeId,
      dayOffConfigId: record.dayOffConfigId,
      year: record.year,
      allocatedDays: record.allocatedDays,
      note: record.note ?? null,
    });
    this.upsertForm.get('employeeId')?.disable();
    this.upsertForm.get('dayOffConfigId')?.disable();
    this.upsertForm.get('year')?.disable();
    this.upsertVisible = true;
  }

  closeUpsert(): void {
    this.upsertVisible = false;
    this.editingId = null;
  }

  submitUpsert(): void {
    if (this.upsertForm.invalid) {
      this.upsertForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const value = this.upsertForm.getRawValue();
    const payload: Record<string, any> = {
      employeeId: value.employeeId,
      dayOffConfigId: value.dayOffConfigId,
      year: Number(value.year),
      allocatedDays: Number(value.allocatedDays),
      note: (value.note || '').trim() || null,
    };
    if (this.editingId) payload['id'] = this.editingId;

    this.apiService.post<string>(this.apiService.DAY_OFF_ALLOCATION.UPSERT, payload).subscribe({
      next: () => {
        this.message.success(
          this.editingId ? this.i18n.updateSuccess() : this.i18n.createSuccess(),
        );
        this.upsertVisible = false;
        this.submitting = false;
        this.loadData();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
