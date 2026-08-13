import { enumData } from '@/app/core/constants/enums/enumData';
import { toDateOnly } from '@/app/core/constants/helpers';
import { EmployeeSelectBoxDto, OvertimeRequest, PagedResult } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import {
  CommonFilterActions,
  CommonFilterFields,
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
import { NzModalService } from 'ng-zorro-antd/modal';

type OvertimeRequestRow = OvertimeRequest & {
  employeeLabel?: string;
  statusLabel?: string;
  otTypeLabel?: string;
  fromTimeLabel?: string;
  toTimeLabel?: string;
};

@Component({
  standalone: false,
  selector: 'app-overtime-request-manager',
  templateUrl: './overtime-request-manager.component.html',
  styleUrls: [],
})
export class OvertimeRequestManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'overtimeRequest.entityName';
  readonly statuses = Object.values(enumData.OVERTIME_REQUEST_STATUS);
  readonly otTypes = Object.values(enumData.OVERTIME_TYPE);

  data: OvertimeRequestRow[] = [];
  loading = false;
  submitting = false;
  bulkApproving = false;
  selectedRows: OvertimeRequestRow[] = [];

  drawerVisible = false;
  drawerLoading = false;
  selected: OvertimeRequest | null = null;

  createVisible = false;
  createForm: FormGroup;
  employeeOptions: { label: string; value: string }[] = [];

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = 'createdAt';
  sortOrder = 'desc';
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [
    CommonActions.create(() => this.openCreate()),
    {
      key: 'bulkApprove',
      label: 'overtimeRequest.bulkApprove',
      icon: 'check-circle',
      severity: 'success',
      loading: false,
      disabled: false,
      onClick: () => this.bulkApprove(),
    },
  ];

  filters: Record<string, any> = {
    search: '',
    status: null,
    otType: null,
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
      label: 'overtimeRequest.search',
      placeholder: 'overtimeRequest.searchPlaceholder',
      col: 6,
    }),
    {
      key: 'status',
      label: 'overtimeRequest.status',
      type: 'select',
      placeholder: 'overtimeRequest.filterStatus',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.OVERTIME_REQUEST_STATUS).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'otType',
      label: 'overtimeRequest.otType',
      type: 'select',
      placeholder: 'overtimeRequest.filterOtType',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.OVERTIME_TYPE).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'dateRange',
      label: 'overtimeRequest.filterDateRange',
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
    { field: 'code', header: 'overtimeRequest.code', type: 'text' },
    { field: 'employeeLabel', header: 'overtimeRequest.employee', type: 'text' },
    { field: 'workDate', header: 'overtimeRequest.workDate', type: 'date' },
    { field: 'fromTimeLabel', header: 'overtimeRequest.fromTime', type: 'text' },
    { field: 'toTimeLabel', header: 'overtimeRequest.toTime', type: 'text' },
    { field: 'requestedMinutes', header: 'overtimeRequest.requestedMinutes', type: 'text' },
    { field: 'otTypeLabel', header: 'overtimeRequest.otType', type: 'text' },
    { field: 'statusLabel', header: 'overtimeRequest.status', type: 'text' },
    { field: 'createdAt', header: 'overtimeRequest.createdAt', type: 'datetime' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'detail',
      icon: 'eye',
      tooltip: 'common.actions.view',
      severity: 'info',
      onClick: (record) => this.openDetail(record),
    },
  ];

  constructor(
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly modal: NzModalService,
    private readonly fb: FormBuilder,
  ) {
    this.createForm = this.fb.group({
      employeeId: [null, Validators.required],
      workDate: [null, Validators.required],
      fromTime: [null, Validators.required],
      toTime: [null, Validators.required],
      otType: [enumData.OVERTIME_TYPE.AFTER_SHIFT.value, Validators.required],
      reason: [null, Validators.required],
      attachmentUrl: [null],
      submit: [false],
    });
  }

  ngOnInit(): void {
    this.loadEmployeeOptions();
    this.loadData();
  }

  loadEmployeeOptions(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          this.employeeOptions = items.map((item) => ({
            label: item.code ? `${item.code} - ${item.name}` : item.name,
            value: item.id,
          }));
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

    const search = (this.filters['search'] || '').toString().trim();
    if (search) payload['search'] = search;
    if (this.filters['status']) payload['status'] = this.filters['status'];
    if (this.filters['otType']) payload['otType'] = this.filters['otType'];

    const range = this.filters['dateRange'] as Date[] | null;
    if (range?.length === 2 && range[0] && range[1]) {
      payload['fromDate'] = toDateOnly(range[0]);
      payload['toDate'] = toDateOnly(range[1]);
    }

    this.apiService
      .post<PagedResult<OvertimeRequest>>(this.apiService.OVERTIME_REQUEST.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items.map((item) => ({
            ...item,
            employeeLabel: this.formatEmployee(item.employeeCode, item.employeeName),
            statusLabel: this.getStatusLabel(item.status),
            otTypeLabel: this.getOtTypeLabel(item.otType),
            fromTimeLabel: this.formatTime(item.fromTime),
            toTimeLabel: this.formatTime(item.toTime),
          }));
          this.pagination.total = res.totalCount;
          this.selectedRows = [];
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
      otType: null,
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

  onSelectionChange(rows: OvertimeRequestRow[]): void {
    this.selectedRows = rows || [];
  }

  openDetail(record: OvertimeRequest): void {
    this.drawerVisible = true;
    this.drawerLoading = true;
    this.selected = null;
    this.apiService
      .post<OvertimeRequest>(this.apiService.OVERTIME_REQUEST.DETAIL, { id: record.id })
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

  openCreate(): void {
    this.createForm.reset({
      employeeId: null,
      workDate: null,
      fromTime: null,
      toTime: null,
      otType: enumData.OVERTIME_TYPE.AFTER_SHIFT.value,
      reason: null,
      attachmentUrl: null,
      submit: false,
    });
    this.createVisible = true;
  }

  closeCreate(): void {
    this.createVisible = false;
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const value = this.createForm.getRawValue();
    this.submitting = true;
    const payload = {
      employeeId: value.employeeId,
      workDate: toDateOnly(value.workDate),
      fromTime: this.formatTimeForApi(value.fromTime),
      toTime: this.formatTimeForApi(value.toTime),
      otType: value.otType,
      reason: (value.reason || '').trim(),
      attachmentUrl: (value.attachmentUrl || '').trim() || null,
      submit: !!value.submit,
    };

    this.apiService.post<string>(this.apiService.OVERTIME_REQUEST.CREATE, payload).subscribe({
      next: () => {
        this.message.success(this.i18n.createSuccess());
        this.createVisible = false;
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

  submit(item: OvertimeRequest): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('overtimeRequest.submit'),
      nzContent: this.i18n.instant('overtimeRequest.submitConfirm'),
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.OVERTIME_REQUEST.SUBMIT, { id: item.id })
            .subscribe({
              next: (success) => {
                if (success) {
                  this.message.success(this.i18n.updateSuccess());
                  this.closeDrawer();
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
        });
      },
    });
  }

  approve(item: OvertimeRequest): void {
    this.promptNote('overtimeRequest.approve', false).then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.OVERTIME_REQUEST.APPROVE, {
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

  reject(item: OvertimeRequest): void {
    this.promptNote('overtimeRequest.reject', true).then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.OVERTIME_REQUEST.REJECT, {
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

  cancel(item: OvertimeRequest): void {
    this.promptNote(
      'overtimeRequest.cancel',
      true,
      'overtimeRequest.cancelReasonPlaceholder',
      'overtimeRequest.cancelReasonRequired',
    ).then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.OVERTIME_REQUEST.CANCEL, {
          id: item.id,
          reason: note,
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

  bulkApprove(): void {
    const ids = this.selectedRows
      .filter((row) => row.status === enumData.OVERTIME_REQUEST_STATUS.SUBMITTED.value)
      .map((row) => row.id)
      .filter((id): id is string => !!id);

    if (ids.length === 0) {
      this.message.warning(this.i18n.instant('overtimeRequest.bulkApproveEmpty'));
      return;
    }

    this.promptNote('overtimeRequest.bulkApprove', false).then((note) => {
      if (note === undefined) return;
      this.bulkApproving = true;
      this.syncBulkApproveLoading();
      this.apiService
        .post<number>(this.apiService.OVERTIME_REQUEST.BULK_APPROVE, {
          ids,
          approverNote: note || null,
        })
        .subscribe({
          next: (count) => {
            this.message.success(
              this.i18n.instant('overtimeRequest.bulkApproveSuccess', { count: String(count ?? 0) }),
            );
            this.bulkApproving = false;
            this.syncBulkApproveLoading();
            this.selectedRows = [];
            this.loadData();
            this.cdr.markForCheck();
          },
          error: (err: any) => {
            this.message.error(this.i18n.genericError(err.error));
            this.bulkApproving = false;
            this.syncBulkApproveLoading();
            this.cdr.markForCheck();
          },
        });
    });
  }

  private promptNote(
    titleKey: string,
    required: boolean,
    placeholderKey = '',
    requiredMessageKey = '',
  ): Promise<string | undefined> {
    return new Promise((resolve) => {
      let note = '';
      const placeholder = this.i18n.instant(
        placeholderKey ||
          (required
            ? 'overtimeRequest.rejectNotePlaceholder'
            : 'overtimeRequest.approverNotePlaceholder'),
      );
      this.modal.confirm({
        nzTitle: this.i18n.instant(titleKey),
        nzContent: `<textarea id="overtime-request-approver-note" class="ant-input" rows="3" placeholder="${placeholder}"></textarea>`,
        nzOnOk: () => {
          const el = document.getElementById(
            'overtime-request-approver-note',
          ) as HTMLTextAreaElement | null;
          note = el?.value?.trim() || '';
          if (required && !note) {
            this.message.error(
              this.i18n.instant(requiredMessageKey || 'overtimeRequest.rejectNoteRequired'),
            );
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

  getOtTypeLabel(type?: string | null): string {
    if (!type) return '-';
    const meta = this.otTypes.find((item) => item.value === type);
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

  private formatTimeForApi(value: Date | null): string | null {
    if (!value) return null;
    const hh = String(value.getHours()).padStart(2, '0');
    const mm = String(value.getMinutes()).padStart(2, '0');
    const ss = String(value.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }

  private syncBulkApproveLoading(): void {
    const action = this.toolbarActions.find((a) => a.key === 'bulkApprove');
    if (action) action.loading = this.bulkApproving;
  }
}
