import { PERMISSION_CODES } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import { toDateOnly } from '@/app/core/constants/helpers';
import { AttendanceComplaint, PagedResult } from '@/app/core/models';
import { ApiService, I18nMessageService, PermissionService } from '@/app/core/services';
import {
  CommonFilterActions,
  CommonFilterFields,
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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

type AttendanceComplaintRow = AttendanceComplaint & {
  employeeLabel?: string;
  statusLabel?: string;
  complaintTypeLabelResolved?: string;
  requestedCheckInLabel?: string;
  requestedCheckOutLabel?: string;
};

@Component({
  standalone: false,
  selector: 'app-attendance-complaint-manager',
  templateUrl: './attendance-complaint-manager.component.html',
  styleUrls: [],
})
export class AttendanceComplaintManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'attendanceComplaint.entityName';
  readonly statuses = Object.values(enumData.ATTENDANCE_COMPLAINT_STATUS);
  readonly complaintTypes = Object.values(enumData.ATTENDANCE_COMPLAINT_TYPE);

  data: AttendanceComplaintRow[] = [];
  loading = false;

  drawerVisible = false;
  drawerLoading = false;
  selected: AttendanceComplaint | null = null;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = enumData.PAGE.SORT_FIELD.CREATED_AT;
  sortOrder = enumData.PAGE.SORT_ORDER.DESC;
  toolbar: ToolbarConfig = { show: true };

  filters: Record<string, any> = {
    search: '',
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
    CommonFilterFields.searchText({
      key: 'search',
      label: 'attendanceComplaint.search',
      placeholder: 'attendanceComplaint.searchPlaceholder',
      col: 6,
    }),
    {
      key: 'status',
      label: 'attendanceComplaint.status',
      type: 'select',
      placeholder: 'attendanceComplaint.filterStatus',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.ATTENDANCE_COMPLAINT_STATUS).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'dateRange',
      label: 'attendanceComplaint.filterDateRange',
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
    { field: 'employeeLabel', header: 'attendanceComplaint.employee', type: 'text' },
    { field: 'workDate', header: 'attendanceComplaint.workDate', type: 'date' },
    {
      field: 'complaintTypeLabelResolved',
      header: 'attendanceComplaint.complaintType',
      type: 'text',
    },
    {
      field: 'requestedCheckInLabel',
      header: 'attendanceComplaint.requestedCheckIn',
      type: 'text',
    },
    {
      field: 'requestedCheckOutLabel',
      header: 'attendanceComplaint.requestedCheckOut',
      type: 'text',
    },
    { field: 'statusLabel', header: 'attendanceComplaint.status', type: 'text' },
    { field: 'createdAt', header: 'attendanceComplaint.createdAt', type: 'datetime' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'detail',
      icon: 'eye',
      tooltip: 'common.actions.view',
      severity: 'info',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.OPERATE_ATTENDANCE_COMPLAINT_VIEW),
      onClick: (record) => this.openDetail(record),
    },
  ];

  constructor(
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly modal: NzModalService,
    readonly permissionSvc: PermissionService,
  ) {}

  ngOnInit(): void {
    this.loadData();
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

    const search = (this.filters['search'] || '').toString().trim();
    if (search) payload['search'] = search;
    if (this.filters['status']) payload['status'] = this.filters['status'];

    const range = this.filters['dateRange'] as Date[] | null;
    if (range?.length === 2 && range[0] && range[1]) {
      payload['fromDate'] = toDateOnly(range[0]);
      payload['toDate'] = toDateOnly(range[1]);
    }

    this.apiService
      .post<PagedResult<AttendanceComplaint>>(
        this.apiService.ATTENDANCE_COMPLAINT.PAGINATION,
        payload,
      )
      .subscribe({
        next: (res) => {
          this.data = res.items.map((item) => ({
            ...item,
            employeeLabel: this.formatEmployee(item.employeeCode, item.employeeName),
            statusLabel: this.getStatusLabel(item.status),
            complaintTypeLabelResolved: this.getComplaintTypeLabel(item.complaintType),
            requestedCheckInLabel: this.formatTime(item.requestedCheckInTime),
            requestedCheckOutLabel: this.formatTime(item.requestedCheckOutTime),
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

  onFiltersChange(filters: Record<string, any>): void {
    this.filters = filters;
  }

  onFilterSearch(): void {
    this.pagination.current = 1;
    this.loadData();
  }

  onFilterClear(): void {
    this.filters = {
      search: '',
      status: null,
      dateRange: null,
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
    this.sortField = event.sortField || 'createdAt';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }

  openDetail(record: AttendanceComplaint): void {
    this.drawerVisible = true;
    this.drawerLoading = true;
    this.selected = null;
    this.apiService
      .post<AttendanceComplaint>(this.apiService.ATTENDANCE_COMPLAINT.DETAIL, { id: record.id })
      .subscribe({
        next: (item) => {
          this.selected = item;
          this.drawerLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadDetailFailed(err.error));
          this.drawerVisible = false;
          this.drawerLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selected = null;
  }

  approve(item: AttendanceComplaint): void {
    this.promptNote('attendanceComplaint.approve', false).then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.ATTENDANCE_COMPLAINT.APPROVE, {
          id: item.id,
          approve: true,
          approverNote: note || null,
        })
        .subscribe({
          next: (success) => {
            if (success) {
              this.message.success(this.i18n.updateSuccess());
              this.closeDrawer();
              this.loadData();
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  reject(item: AttendanceComplaint): void {
    this.promptNote('attendanceComplaint.reject', true).then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.ATTENDANCE_COMPLAINT.REJECT, {
          id: item.id,
          approve: false,
          approverNote: note,
        })
        .subscribe({
          next: (success) => {
            if (success) {
              this.message.success(this.i18n.updateSuccess());
              this.closeDrawer();
              this.loadData();
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  private promptNote(titleKey: string, required: boolean): Promise<string | undefined> {
    return new Promise((resolve) => {
      let note = '';
      const placeholder = this.i18n.instant(
        required
          ? 'attendanceComplaint.rejectNotePlaceholder'
          : 'attendanceComplaint.approverNotePlaceholder',
      );
      this.modal.confirm({
        nzTitle: this.i18n.instant(titleKey),
        nzContent: `<textarea id="attendance-complaint-approver-note" class="ant-input" rows="3" placeholder="${placeholder}"></textarea>`,
        nzOnOk: () => {
          const el = document.getElementById(
            'attendance-complaint-approver-note',
          ) as HTMLTextAreaElement | null;
          note = el?.value?.trim() || '';
          if (required && !note) {
            this.message.error(this.i18n.instant('attendanceComplaint.rejectNoteRequired'));
            return false;
          }
          resolve(note);
          return true;
        },
        nzOnCancel: () => resolve(undefined),
      });
    });
  }

  getStatusLabel(status?: string | null): string {
    if (!status) return '-';
    const meta = this.statuses.find((item) => item.value === status);
    return meta ? this.i18n.instant(meta.labelKey) : status;
  }

  getComplaintTypeLabel(type?: string | null): string {
    if (!type) return '-';
    const meta = this.complaintTypes.find((item) => item.value === type);
    return meta ? this.i18n.instant(meta.labelKey) : type;
  }

  formatTime(value?: string | null): string {
    if (!value) return '-';
    const parts = value.toString().split(':');
    if (parts.length >= 2) {
      const h = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      return `${h}:${m}`;
    }
    return value;
  }

  formatDateTime(value?: string | null): string {
    if (!value) return '-';
    return value;
  }

  formatEmployee(code?: string | null, name?: string | null): string {
    if (code && name) return `${code} - ${name}`;
    return name || code || '-';
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
