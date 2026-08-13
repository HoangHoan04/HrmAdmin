import { enumData } from '@/app/core/constants/enums/enumData';
import {
  ATTENDANCE_STATUS_OPTIONS,
  resolveAttendanceStatus,
} from '@/app/core/constants/enums/attendance-status';
import { toDateOnly } from '@/app/core/constants/helpers';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  EmployeeSelectBoxDto,
  ManualAdjustTimekeepingRequest,
  PagedResult,
  Timekeeping,
  TimekeepingSummary,
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
  RowAction,
  TableAction,
  TableColumn,
  ToolbarConfig,
} from '@/app/shared/components/table-custom/table-custom.types';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

type TimekeepingRow = Timekeeping & { statusLabel?: string };

@Component({
  standalone: false,
  selector: 'app-timekeeping-manager',
  templateUrl: './timekeeping-manager.component.html',
  styleUrls: [],
})
export class TimekeepingManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'timekeeping.entityName';
  readonly attendanceStatuses = ATTENDANCE_STATUS_OPTIONS;

  activeTab: 'daily' | 'summary' = 'daily';

  data: TimekeepingRow[] = [];
  summaryData: TimekeepingSummary[] = [];
  loading = false;
  summaryLoading = false;
  drawerVisible = false;
  drawerLoading = false;
  submitting = false;
  summarizeVisible = false;
  summarizing = false;
  selected: Timekeeping | null = null;
  adjustForm!: FormGroup;
  summarizeForm!: FormGroup;

  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  summaryPagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = 'workDate';
  sortOrder = 'desc';
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [
    {
      key: 'summarize',
      label: 'timekeeping.summarize',
      icon: 'calculator',
      severity: 'primary',
      onClick: () => this.openSummarize(),
    },
  ];

  filters: Record<string, any> = {
    employeeId: null,
    branchId: null,
    status: null,
    dateRange: null,
  };

  summaryFilters: Record<string, any> = {
    employeeId: null,
    branchId: null,
    companyId: null,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
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
      label: 'timekeeping.employee',
      type: 'select',
      placeholder: 'timekeeping.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'timekeeping.branch',
      type: 'select',
      placeholder: 'timekeeping.filterBranch',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'status',
      label: 'timekeeping.status',
      type: 'select',
      placeholder: 'timekeeping.filterStatus',
      col: 6,
      allowClear: true,
      options: this.attendanceStatuses.map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'dateRange',
      label: 'timekeeping.filterDateRange',
      type: 'dateRange',
      col: 6,
      allowClear: true,
    },
  ];

  summaryFilterFields: FilterField[] = [
    {
      key: 'employeeId',
      label: 'timekeeping.employee',
      type: 'select',
      placeholder: 'timekeeping.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'companyId',
      label: 'timekeeping.company',
      type: 'select',
      placeholder: 'timekeeping.filterCompany',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'timekeeping.branch',
      type: 'select',
      placeholder: 'timekeeping.filterBranch',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'year',
      label: 'timekeeping.year',
      type: 'number',
      placeholder: 'timekeeping.year',
      col: 3,
      allowClear: false,
    },
    {
      key: 'month',
      label: 'timekeeping.month',
      type: 'number',
      placeholder: 'timekeeping.month',
      col: 3,
      allowClear: false,
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  summaryFilterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onSummaryFilterSearch(), this.summaryLoading),
    CommonFilterActions.clear(() => this.onSummaryFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'employeeCode', header: 'timekeeping.employeeCode', type: 'text' },
    { field: 'employeeName', header: 'timekeeping.employee', type: 'text' },
    {
      field: 'workDate',
      header: 'timekeeping.workDate',
      type: 'date',
      sortable: true,
    },
    { field: 'shiftMasterName', header: 'timekeeping.shiftMaster', type: 'text' },
    { field: 'checkInAt', header: 'timekeeping.checkInAt', type: 'datetime' },
    { field: 'checkOutAt', header: 'timekeeping.checkOutAt', type: 'datetime' },
    { field: 'statusLabel', header: 'timekeeping.status', type: 'text' },
    { field: 'lateMinutes', header: 'timekeeping.lateMinutes', type: 'text' },
    { field: 'workedMinutes', header: 'timekeeping.workedMinutes', type: 'text' },
    { field: 'otMinutes', header: 'timekeeping.otMinutes', type: 'text' },
    { field: 'nightMinutes', header: 'timekeeping.nightMinutes', type: 'text' },
    { field: 'branchName', header: 'timekeeping.branch', type: 'text' },
  ];

  summaryColumns: TableColumn[] = [
    { field: 'employeeCode', header: 'timekeeping.employeeCode', type: 'text' },
    { field: 'employeeName', header: 'timekeeping.employee', type: 'text' },
    { field: 'year', header: 'timekeeping.year', type: 'text' },
    { field: 'month', header: 'timekeeping.month', type: 'text' },
    { field: 'workingDays', header: 'timekeeping.workingDays', type: 'text' },
    { field: 'onTimeDays', header: 'timekeeping.onTimeDays', type: 'text' },
    { field: 'lateDays', header: 'timekeeping.lateDays', type: 'text' },
    { field: 'earlyDays', header: 'timekeeping.earlyDays', type: 'text' },
    { field: 'leaveDays', header: 'timekeeping.leaveDays', type: 'text' },
    { field: 'absentDays', header: 'timekeeping.absentDays', type: 'text' },
    { field: 'incompleteDays', header: 'timekeeping.incompleteDays', type: 'text' },
    { field: 'totalOtMinutes', header: 'timekeeping.totalOtMinutes', type: 'text' },
    { field: 'totalNightMinutes', header: 'timekeeping.totalNightMinutes', type: 'text' },
    { field: 'branchName', header: 'timekeeping.branch', type: 'text' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'edit',
      tooltip: 'timekeeping.viewDetail',
      severity: 'primary',
      onClick: (record) => this.openDetail(record),
    },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.adjustForm = this.fb.group({
      checkInAt: [null],
      checkOutAt: [null],
      note: [''],
      status: [null],
    });
    const now = new Date();
    this.summarizeForm = this.fb.group({
      year: [now.getFullYear(), [Validators.required, Validators.min(2000)]],
      month: [now.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      companyId: [null],
      branchId: [null],
    });
    this.loadSelectBoxes();
    this.loadData();
  }

  onTabChange(index: number): void {
    this.activeTab = index === 1 ? 'summary' : 'daily';
    if (this.activeTab === 'summary' && this.summaryData.length === 0) {
      this.loadSummaryData();
    }
  }

  loadSelectBoxes(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          const options = items.map((item) => ({
            label: item.code ? `${item.code} - ${item.name}` : item.name,
            value: item.id,
          }));
          const dailyField = this.filterFields.find((f) => f.key === 'employeeId');
          const summaryField = this.summaryFilterFields.find((f) => f.key === 'employeeId');
          if (dailyField) dailyField.options = options;
          if (summaryField) summaryField.options = options;
          this.cdr.markForCheck();
        },
      });

    this.apiService.post<BranchSelectBoxDto[]>(this.apiService.BRANCH.SELECT_BOX, {}).subscribe({
      next: (items) => {
        this.branches = items;
        const options = items.map((item) => ({
          label: item.code ? `${item.code} - ${item.name}` : item.name,
          value: item.id,
        }));
        const dailyField = this.filterFields.find((f) => f.key === 'branchId');
        const summaryField = this.summaryFilterFields.find((f) => f.key === 'branchId');
        if (dailyField) dailyField.options = options;
        if (summaryField) summaryField.options = options;
        this.cdr.markForCheck();
      },
    });

    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (items) => {
        this.companies = items;
        const field = this.summaryFilterFields.find((f) => f.key === 'companyId');
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
    if (this.filters['branchId']) payload['branchId'] = this.filters['branchId'];
    if (this.filters['status']) payload['status'] = this.filters['status'];

    const range = this.filters['dateRange'] as Date[] | null;
    if (range?.length === 2 && range[0] && range[1]) {
      payload['fromDate'] = toDateOnly(range[0]);
      payload['toDate'] = toDateOnly(range[1]);
    }

    this.apiService
      .post<PagedResult<Timekeeping>>(this.apiService.TIMEKEEPING.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items.map((item) => ({
            ...item,
            statusLabel: this.getAttendanceStatusLabel(item.status),
          }));
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

  loadSummaryData(): void {
    this.summaryLoading = true;
    this.syncSummaryFilterActionsLoading();
    this.cdr.markForCheck();

    const payload: Record<string, any> = {
      pageIndex: this.summaryPagination.current,
      pageSize: this.summaryPagination.pageSize,
    };
    if (this.summaryFilters['employeeId'])
      payload['employeeId'] = this.summaryFilters['employeeId'];
    if (this.summaryFilters['branchId']) payload['branchId'] = this.summaryFilters['branchId'];
    if (this.summaryFilters['companyId']) payload['companyId'] = this.summaryFilters['companyId'];
    if (this.summaryFilters['year']) payload['year'] = Number(this.summaryFilters['year']);
    if (this.summaryFilters['month']) payload['month'] = Number(this.summaryFilters['month']);

    this.apiService
      .post<PagedResult<TimekeepingSummary>>(
        this.apiService.TIMEKEEPING.SUMMARY_PAGINATION,
        payload,
      )
      .subscribe({
        next: (res) => {
          this.summaryData = res.items;
          this.summaryPagination.total = res.totalCount;
          this.summaryLoading = false;
          this.syncSummaryFilterActionsLoading();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadListFailed(this.ENTITY_KEY, err.error));
          this.summaryLoading = false;
          this.syncSummaryFilterActionsLoading();
          this.cdr.markForCheck();
        },
      });
  }

  onFiltersChange(filters: Record<string, any>): void {
    this.filters = filters;
  }

  onSummaryFiltersChange(filters: Record<string, any>): void {
    this.summaryFilters = filters;
  }

  onFilterSearch(): void {
    this.pagination.current = 1;
    this.loadData();
  }

  onFilterClear(): void {
    this.filters = { employeeId: null, branchId: null, status: null, dateRange: null };
    this.pagination.current = 1;
    this.loadData();
  }

  onSummaryFilterSearch(): void {
    this.summaryPagination.current = 1;
    this.loadSummaryData();
  }

  onSummaryFilterClear(): void {
    const now = new Date();
    this.summaryFilters = {
      employeeId: null,
      branchId: null,
      companyId: null,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
    this.summaryPagination.current = 1;
    this.loadSummaryData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.current = event.page;
    this.pagination.pageSize = event.pageSize;
    this.loadData();
  }

  onSummaryPageChange(event: { page: number; pageSize: number }): void {
    this.summaryPagination.current = event.page;
    this.summaryPagination.pageSize = event.pageSize;
    this.loadSummaryData();
  }

  onSortChange(event: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    this.sortField = event.sortField || 'workDate';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }

  openSummarize(): void {
    const now = new Date();
    this.summarizeForm.reset({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      companyId: null,
      branchId: null,
    });
    this.summarizeVisible = true;
  }

  closeSummarize(): void {
    this.summarizeVisible = false;
  }

  submitSummarize(): boolean {
    if (this.summarizeForm.invalid) {
      Object.values(this.summarizeForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return false;
    }

    this.summarizing = true;
    const value = this.summarizeForm.getRawValue();
    const payload = {
      year: Number(value.year),
      month: Number(value.month),
      companyId: value.companyId || null,
      branchId: value.branchId || null,
    };

    this.apiService.post<number>(this.apiService.TIMEKEEPING.SUMMARIZE, payload).subscribe({
      next: (count) => {
        this.message.success(
          this.i18n.instant('timekeeping.summarizeSuccess', { count: String(count ?? 0) }),
        );
        this.summarizing = false;
        this.closeSummarize();
        this.activeTab = 'summary';
        this.summaryFilters = {
          ...this.summaryFilters,
          year: payload.year,
          month: payload.month,
          companyId: payload.companyId,
          branchId: payload.branchId,
        };
        this.summaryPagination.current = 1;
        this.loadSummaryData();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.summarizing = false;
        this.cdr.markForCheck();
      },
    });
    return false;
  }

  openDetail(record: Timekeeping): void {
    this.drawerVisible = true;
    this.drawerLoading = true;
    this.selected = null;
    this.apiService
      .post<Timekeeping>(this.apiService.TIMEKEEPING.DETAIL, { id: record.id })
      .subscribe({
        next: (item) => {
          this.selected = item;
          this.adjustForm.patchValue({
            checkInAt: item.checkInAt ? new Date(item.checkInAt) : null,
            checkOutAt: item.checkOutAt ? new Date(item.checkOutAt) : null,
            note: item.note || '',
            status: item.status || null,
          });
          this.drawerLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadDetailFailed(err.error));
          this.drawerVisible = false;
          this.drawerLoading = false;
        },
      });
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selected = null;
  }

  submitAdjust(): void {
    if (!this.selected?.id) return;
    this.submitting = true;
    const value = this.adjustForm.getRawValue();
    const payload: ManualAdjustTimekeepingRequest = {
      id: this.selected.id,
      checkInAt: value.checkInAt ? new Date(value.checkInAt).toISOString() : null,
      checkOutAt: value.checkOutAt ? new Date(value.checkOutAt).toISOString() : null,
      note: value.note || null,
      status: value.status || null,
    };

    this.apiService.post<boolean>(this.apiService.TIMEKEEPING.ADJUST, payload).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.updateSuccess());
          this.closeDrawer();
          this.loadData();
        } else {
          this.message.error(this.i18n.genericError());
        }
        this.submitting = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
      },
    });
  }

  getAttendanceStatusLabel(status?: string | null): string {
    const meta = resolveAttendanceStatus(status);
    return meta ? this.i18n.instant(meta.labelKey) : status || '-';
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }

  private syncSummaryFilterActionsLoading(): void {
    const searchAction = this.summaryFilterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.summaryLoading;
  }
}
