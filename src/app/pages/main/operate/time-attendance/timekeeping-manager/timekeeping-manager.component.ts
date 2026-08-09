import { enumData } from '@/app/core/constants/enums/enumData';
import {
  BranchSelectBoxDto,
  EmployeeSelectBoxDto,
  ManualAdjustTimekeepingRequest,
  PagedResult,
  Timekeeping,
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
  TableColumn,
  ToolbarConfig,
} from '@/app/shared/components/table-custom/table-custom.types';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-timekeeping-manager',
  templateUrl: './timekeeping-manager.component.html',
  styleUrls: [],
})
export class TimekeepingManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'timeAttendance.timekeeping.entityName';

  data: Timekeeping[] = [];
  loading = false;
  drawerVisible = false;
  drawerLoading = false;
  submitting = false;
  selected: Timekeeping | null = null;
  adjustForm!: FormGroup;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = 'workDate';
  sortOrder = 'desc';
  toolbar: ToolbarConfig = { show: true };

  filters: Record<string, any> = {
    employeeId: null,
    branchId: null,
    status: null,
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
      label: 'timeAttendance.timekeeping.employee',
      type: 'select',
      placeholder: 'timeAttendance.timekeeping.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'timeAttendance.timekeeping.branch',
      type: 'select',
      placeholder: 'timeAttendance.timekeeping.filterBranch',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'status',
      label: 'timeAttendance.timekeeping.status',
      type: 'select',
      placeholder: 'timeAttendance.timekeeping.filterStatus',
      col: 6,
      allowClear: true,
      options: [
        { label: 'timeAttendance.timekeeping.statusOnTime', value: 'ON_TIME' },
        { label: 'timeAttendance.timekeeping.statusLate', value: 'LATE' },
        { label: 'timeAttendance.timekeeping.statusEarly', value: 'EARLY' },
        { label: 'timeAttendance.timekeeping.statusAbsent', value: 'ABSENT' },
        { label: 'timeAttendance.timekeeping.statusLeave', value: 'LEAVE' },
        { label: 'timeAttendance.timekeeping.statusIncomplete', value: 'INCOMPLETE' },
      ],
    },
    {
      key: 'dateRange',
      label: 'timeAttendance.timekeeping.filterDateRange',
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
    { field: 'employeeCode', header: 'timeAttendance.timekeeping.employeeCode', type: 'text' },
    { field: 'employeeName', header: 'timeAttendance.timekeeping.employee', type: 'text' },
    {
      field: 'workDate',
      header: 'timeAttendance.timekeeping.workDate',
      type: 'date',
      sortable: true,
    },
    { field: 'shiftMasterName', header: 'timeAttendance.timekeeping.shiftMaster', type: 'text' },
    { field: 'checkInAt', header: 'timeAttendance.timekeeping.checkInAt', type: 'datetime' },
    { field: 'checkOutAt', header: 'timeAttendance.timekeeping.checkOutAt', type: 'datetime' },
    { field: 'status', header: 'timeAttendance.timekeeping.status', type: 'text' },
    { field: 'lateMinutes', header: 'timeAttendance.timekeeping.lateMinutes', type: 'text' },
    { field: 'workedMinutes', header: 'timeAttendance.timekeeping.workedMinutes', type: 'text' },
    { field: 'branchName', header: 'timeAttendance.timekeeping.branch', type: 'text' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'edit',
      tooltip: 'timeAttendance.timekeeping.viewDetail',
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
    if (this.filters['branchId']) payload['branchId'] = this.filters['branchId'];
    if (this.filters['status']) payload['status'] = this.filters['status'];

    const range = this.filters['dateRange'] as Date[] | null;
    if (range?.length === 2 && range[0] && range[1]) {
      payload['fromDate'] = this.toDateOnly(range[0]);
      payload['toDate'] = this.toDateOnly(range[1]);
    }

    this.apiService
      .post<PagedResult<Timekeeping>>(this.apiService.TIMEKEEPING.PAGINATION, payload)
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
    this.filters = { employeeId: null, branchId: null, status: null, dateRange: null };
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
