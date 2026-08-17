import { enumData } from '@/app/core/constants/enums/enumData';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  DayOffConfigSelectBoxDto,
  EmployeeSelectBoxDto,
  LeaveBalanceReport,
  PagedResult,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import {
  CommonFilterActions,
  FilterAction,
  FilterConfig,
  FilterField,
} from '@/app/shared/components/filter-custom/filter-custom.types';
import {
  PaginationConfig,
  TableAction,
  TableColumn,
  ToolbarConfig,
} from '@/app/shared/components/table-custom/table-custom.types';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

type LeaveBalanceRow = LeaveBalanceReport & {
  employeeDisplay?: string;
};

@Component({
  standalone: false,
  selector: 'app-leave-balance-report',
  templateUrl: './leave-balance-report.component.html',
  styleUrls: [],
})
export class LeaveBalanceReportComponent implements OnInit {
  private readonly ENTITY_KEY = 'leaveBalanceReport.entityName';

  data: LeaveBalanceRow[] = [];
  loading = false;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = enumData.PAGE.SORT_FIELD.REMAINING_DAYS;
  sortOrder = enumData.PAGE.SORT_ORDER.DESC;
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [
    {
      key: 'export-csv',
      label: 'leaveBalanceReport.exportCsv',
      icon: 'download',
      severity: 'primary',
      onClick: () => this.exportCsv(),
    },
  ];

  filters: Record<string, any> = {
    year: new Date().getFullYear(),
    companyId: null,
    branchId: null,
    dayOffConfigId: null,
    employeeId: null,
    onlyWithRemaining: null,
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
      key: 'year',
      label: 'leaveBalanceReport.year',
      type: 'number',
      placeholder: 'leaveBalanceReport.filterYear',
      col: 4,
      allowClear: true,
      defaultValue: new Date().getFullYear(),
    },
    {
      key: 'companyId',
      label: 'leaveBalanceReport.company',
      type: 'select',
      placeholder: 'leaveBalanceReport.filterCompany',
      col: 4,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'leaveBalanceReport.branch',
      type: 'select',
      placeholder: 'leaveBalanceReport.filterBranch',
      col: 4,
      allowClear: true,
      options: [],
    },
    {
      key: 'dayOffConfigId',
      label: 'leaveBalanceReport.configName',
      type: 'select',
      placeholder: 'leaveBalanceReport.filterConfig',
      col: 4,
      allowClear: true,
      options: [],
    },
    {
      key: 'employeeId',
      label: 'leaveBalanceReport.employee',
      type: 'select',
      placeholder: 'leaveBalanceReport.filterEmployee',
      col: 4,
      allowClear: true,
      options: [],
    },
    {
      key: 'onlyWithRemaining',
      label: 'leaveBalanceReport.onlyWithRemaining',
      type: 'select',
      col: 4,
      allowClear: true,
      options: Object.values(enumData.YES_NO_FILTER)
        .filter((s) => s.value !== null)
        .map((s) => ({ label: s.labelKey, value: s.value })),
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'employeeDisplay', header: 'leaveBalanceReport.employee', type: 'text' },
    { field: 'branchName', header: 'leaveBalanceReport.branch', type: 'text' },
    { field: 'departmentName', header: 'leaveBalanceReport.department', type: 'text' },
    { field: 'dayOffConfigName', header: 'leaveBalanceReport.configName', type: 'text' },
    { field: 'year', header: 'leaveBalanceReport.year', type: 'text', sortable: true },
    { field: 'allocatedDays', header: 'leaveBalanceReport.allocatedDays', type: 'text' },
    { field: 'usedDays', header: 'leaveBalanceReport.usedDays', type: 'text' },
    { field: 'pendingDays', header: 'leaveBalanceReport.pendingDays', type: 'text' },
    {
      field: 'remainingDays',
      header: 'leaveBalanceReport.remainingDays',
      type: 'text',
      sortable: true,
    },
    { field: 'expiresOn', header: 'leaveBalanceReport.expiresOn', type: 'text' },
    {
      field: 'isExpiringSoon',
      header: 'leaveBalanceReport.isExpiringSoon',
      type: 'boolean',
    },
  ];

  constructor(
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSelectBoxes();
    this.loadData();
  }

  loadSelectBoxes(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (items) => {
        const field = this.filterFields.find((f) => f.key === 'companyId');
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

    this.apiService
      .post<DayOffConfigSelectBoxDto[]>(this.apiService.DAY_OFF_CONFIG.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          const field = this.filterFields.find((f) => f.key === 'dayOffConfigId');
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
  }

  loadData(): void {
    this.loading = true;
    this.syncFilterActionsLoading();
    this.cdr.markForCheck();

    const payload = this.buildPayload();

    this.apiService
      .post<PagedResult<LeaveBalanceReport>>(
        this.apiService.DAY_OFF_ALLOCATION.BALANCE_REPORT,
        payload,
      )
      .subscribe({
        next: (res) => {
          this.data = res.items.map((item) => this.mapRow(item));
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
    this.filters = {
      year: new Date().getFullYear(),
      companyId: null,
      branchId: null,
      dayOffConfigId: null,
      employeeId: null,
      onlyWithRemaining: null,
    };
    this.pagination.current = 1;
    this.loadData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.current = event.page;
    this.pagination.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(event: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    this.sortField = event.sortField || 'remainingDays';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }

  exportCsv(): void {
    if (!this.data.length) return;

    const headers = [
      'employeeCode',
      'employeeName',
      'branchName',
      'departmentName',
      'dayOffConfigName',
      'year',
      'allocatedDays',
      'usedDays',
      'pendingDays',
      'remainingDays',
      'expiresOn',
      'isExpiringSoon',
      'note',
    ];

    const escape = (value: unknown): string => {
      const raw = value == null ? '' : String(value);
      if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
      return raw;
    };

    const lines = [
      headers.join(','),
      ...this.data.map((row) =>
        headers.map((key) => escape((row as unknown as Record<string, unknown>)[key])).join(','),
      ),
    ];

    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leave-balance-report-${this.filters['year'] || 'all'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private mapRow(item: LeaveBalanceReport): LeaveBalanceRow {
    return {
      ...item,
      employeeDisplay: item.employeeCode
        ? `${item.employeeCode} - ${item.employeeName || ''}`
        : item.employeeName || '-',
    };
  }

  private buildPayload(): Record<string, any> {
    const payload: Record<string, any> = {
      pageIndex: this.pagination.current,
      pageSize: this.pagination.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
    };

    if (
      this.filters['year'] !== null &&
      this.filters['year'] !== undefined &&
      this.filters['year'] !== ''
    ) {
      payload['year'] = Number(this.filters['year']);
    }
    if (this.filters['companyId']) payload['companyId'] = this.filters['companyId'];
    if (this.filters['branchId']) payload['branchId'] = this.filters['branchId'];
    if (this.filters['dayOffConfigId']) payload['dayOffConfigId'] = this.filters['dayOffConfigId'];
    if (this.filters['employeeId']) payload['employeeId'] = this.filters['employeeId'];
    if (this.filters['onlyWithRemaining'] === true || this.filters['onlyWithRemaining'] === false) {
      payload['onlyWithRemaining'] = this.filters['onlyWithRemaining'];
    }

    return payload;
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
