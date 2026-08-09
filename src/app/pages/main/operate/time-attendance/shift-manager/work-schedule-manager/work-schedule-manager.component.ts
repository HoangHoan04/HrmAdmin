import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import {
  BranchSelectBoxDto,
  EmployeeSelectBoxDto,
  PagedResult,
  ShiftMasterSelectBoxDto,
  WorkSchedule,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
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
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-work-schedule-manager',
  templateUrl: './work-schedule-manager.component.html',
  styleUrls: [],
})
export class WorkScheduleManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'timeAttendance.workSchedule.entityName';

  data: WorkSchedule[] = [];
  loading = false;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = 'workDate';
  sortOrder = 'desc';
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [CommonActions.create(() => this.openCreate())];

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
      label: 'timeAttendance.workSchedule.employee',
      type: 'select',
      placeholder: 'timeAttendance.workSchedule.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'shiftMasterId',
      label: 'timeAttendance.workSchedule.shiftMaster',
      type: 'select',
      placeholder: 'timeAttendance.workSchedule.filterShift',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'timeAttendance.workSchedule.branch',
      type: 'select',
      placeholder: 'timeAttendance.workSchedule.filterBranch',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'dateRange',
      label: 'timeAttendance.workSchedule.filterDateRange',
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
    { field: 'employeeCode', header: 'timeAttendance.workSchedule.employeeCode', type: 'text' },
    { field: 'employeeName', header: 'timeAttendance.workSchedule.employee', type: 'text' },
    { field: 'shiftMasterName', header: 'timeAttendance.workSchedule.shiftMaster', type: 'text' },
    {
      field: 'workDate',
      header: 'timeAttendance.workSchedule.workDate',
      type: 'date',
      sortable: true,
    },
    { field: 'branchName', header: 'timeAttendance.workSchedule.branch', type: 'text' },
    { field: 'note', header: 'timeAttendance.workSchedule.note', type: 'text' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'timeAttendance.workSchedule.edit',
      severity: 'info',
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'deactivate',
      icon: 'delete',
      tooltip: 'timeAttendance.workSchedule.deactivate',
      severity: 'danger',
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
  ) {}

  ngOnInit(): void {
    this.loadSelectBoxes();
    this.loadData();
  }

  loadSelectBoxes(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          const field = this.filterFields.find((f) => f.key === 'employeeId');
          if (field) {
            field.options = items.map((item) => ({
              label: item.code ? `${item.code} - ${item.name}` : item.name,
              value: item.id,
            }));
          }
          this.cdr.markForCheck();
        },
      });

    this.apiService
      .post<ShiftMasterSelectBoxDto[]>(this.apiService.SHIFT_MASTER.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          const field = this.filterFields.find((f) => f.key === 'shiftMasterId');
          if (field) {
            field.options = items.map((item) => ({
              label: item.code ? `${item.code} - ${item.name}` : item.name,
              value: item.id,
            }));
          }
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
      payload['fromDate'] = this.toDateOnly(range[0]);
      payload['toDate'] = this.toDateOnly(range[1]);
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
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.SHIFT_MANAGER.children
        .ADD_WORK_SCHEDULE.path,
    ]);
  }

  openEdit(item: WorkSchedule): void {
    this.router.navigate([
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.SHIFT_MANAGER.children
        .EDIT_WORK_SCHEDULE.path,
      item.id,
    ]);
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

  private toDateOnly(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
