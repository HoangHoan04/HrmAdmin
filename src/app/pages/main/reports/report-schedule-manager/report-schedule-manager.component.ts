import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { PagedResult, ReportSchedule } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
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
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  standalone: false,
  selector: 'app-report-schedule-manager',
  templateUrl: './report-schedule-manager.component.html',
  styleUrls: [],
})
export class ReportScheduleManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'system.reportSchedule.entityName';
  data: ReportSchedule[] = [];
  loading = false;
  runningDue = false;
  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [];
  filters: Record<string, any> = { search: '', reportType: null, isActive: null };
  filterConfig: FilterConfig = {
    show: true,
    collapsible: true,
    defaultOpen: true,
    title: 'common.filter.title',
    actionsAlign: 'center',
  };
  filterFields: FilterField[] = [
    {
      key: 'search',
      label: 'common.filter.search',
      type: 'input',
      placeholder: 'system.reportSchedule.searchPlaceholder',
      col: 8,
      allowClear: true,
    },
    {
      key: 'reportType',
      label: 'system.reportSchedule.reportType',
      type: 'select',
      col: 8,
      allowClear: true,
      options: [
        { label: 'system.reportSchedule.typeContractExpiry', value: 'CONTRACT_EXPIRY' },
        { label: 'system.reportSchedule.typeLeaveBalance', value: 'LEAVE_BALANCE' },
        { label: 'system.reportSchedule.typePayrollPeriod', value: 'PAYROLL_PERIOD' },
      ],
    },
    {
      key: 'isActive',
      label: 'common.status.label',
      type: 'select',
      col: 8,
      allowClear: true,
      options: [
        { label: 'enums.statusFilter.active', value: true },
        { label: 'enums.statusFilter.inactive', value: false },
      ],
    },
  ];
  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];
  columns: TableColumn[] = [
    { field: 'code', header: 'system.reportSchedule.code', type: 'text', sortable: true },
    { field: 'name', header: 'system.reportSchedule.name', type: 'text', sortable: true },
    { field: 'reportType', header: 'system.reportSchedule.reportType', type: 'text' },
    { field: 'cronHint', header: 'system.reportSchedule.cronHint', type: 'text' },
    { field: 'emailTo', header: 'system.reportSchedule.emailTo', type: 'text' },
    { field: 'lastRunAt', header: 'system.reportSchedule.lastRunAt', type: 'datetime' },
    { field: 'isActive', header: 'common.status.label', type: 'boolean' },
  ];
  rowActions: RowAction[] = [];

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly permissionSvc: PermissionService,
    private readonly modal: NzModalService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.toolbarActions = [
      {
        ...CommonActions.create(() => this.openCreate()),
        visible: () => this.permissionSvc.has(PERMISSION_CODES.REPORT_SCHEDULE_MANAGE),
      },
      {
        key: 'runDue',
        label: 'system.reportSchedule.runDue',
        icon: 'play-circle',
        severity: 'default',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.REPORT_SCHEDULE_MANAGE),
        onClick: () => this.runDue(),
      },
    ];
    this.rowActions = [
      {
        key: 'edit',
        icon: 'edit',
        tooltip: 'common.actions.update',
        severity: 'info',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.REPORT_SCHEDULE_MANAGE),
        onClick: (r) => this.openEdit(r),
      },
      {
        key: 'delete',
        icon: 'delete',
        tooltip: 'common.actions.delete',
        severity: 'danger',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.REPORT_SCHEDULE_MANAGE),
        onClick: (r) => this.delete(r),
      },
    ];
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    const payload: Record<string, any> = {
      pageIndex: this.pagination.current,
      pageSize: this.pagination.pageSize,
      search: (this.filters['search'] || '').trim() || undefined,
      reportType: this.filters['reportType'] || undefined,
    };
    if (this.filters['isActive'] !== null && this.filters['isActive'] !== undefined) {
      payload['isActive'] = this.filters['isActive'];
    }
    this.apiService
      .post<PagedResult<ReportSchedule>>(this.apiService.REPORT_SCHEDULE.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items;
          this.pagination.total = res.totalCount;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadListFailed(this.ENTITY_KEY, err.error));
          this.loading = false;
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
    this.filters = { search: '', reportType: null, isActive: null };
    this.pagination.current = 1;
    this.loadData();
  }
  onPageChange(e: { page: number; pageSize: number }): void {
    this.pagination.current = e.page;
    this.pagination.pageSize = e.pageSize;
    this.loadData();
  }
  openCreate(): void {
    this.router.navigate([
      ROUTES_CONFIG.REPORTS.children.SCHEDULES.children.ADD_REPORT_SCHEDULE.path,
    ]);
  }
  openEdit(item: ReportSchedule): void {
    this.router.navigate([
      ROUTES_CONFIG.REPORTS.children.SCHEDULES.children.EDIT_REPORT_SCHEDULE.path,
      item.id,
    ]);
  }
  runDue(): void {
    if (this.runningDue) return;
    this.runningDue = true;
    this.apiService.post<any>(this.apiService.REPORT_SCHEDULE.RUN_DUE, {}).subscribe({
      next: () => {
        this.message.success(this.i18n.instant('system.reportSchedule.runDueSuccess'));
        this.runningDue = false;
        this.loadData();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.runningDue = false;
      },
    });
  }
  delete(item: ReportSchedule): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('system.reportSchedule.deleteConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.REPORT_SCHEDULE.DELETE, { id: item.id })
            .subscribe({
              next: (ok) => {
                if (ok) {
                  this.message.success(this.i18n.instant('common.messages.saveSuccess'));
                  this.loadData();
                  resolve();
                } else {
                  this.message.error(this.i18n.genericError());
                  reject();
                }
              },
              error: (err: any) => {
                this.message.error(this.i18n.genericError(err.error));
                reject();
              },
            });
        }),
    });
  }
}
