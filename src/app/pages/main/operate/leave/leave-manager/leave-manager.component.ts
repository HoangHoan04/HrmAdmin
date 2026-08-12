import { enumData } from '@/app/core/constants/enums/enumData';
import { toDateOnly } from '@/app/core/constants/helpers';
import {
  BranchSelectBoxDto,
  DayOffConfigSelectBoxDto,
  EmployeeSelectBoxDto,
  PagedResult,
  PreviewLeaveDays,
  RegisterDayOff,
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
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

type LeaveRow = RegisterDayOff & {
  statusLabel?: string;
  dayOffTypeLabel?: string;
  sessionLabel?: string;
};

@Component({
  standalone: false,
  selector: 'app-leave-manager',
  templateUrl: './leave-manager.component.html',
  styleUrls: [],
})
export class LeaveManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'leave.entityName';
  readonly dayOffStatuses = Object.values(enumData.DAY_OFF_STATUS);
  readonly dayOffTypes = Object.values(enumData.DAY_OFF_CONFIG_TYPE);
  readonly leaveSessions = Object.values(enumData.LEAVE_SESSION);

  data: LeaveRow[] = [];
  loading = false;
  submitting = false;
  previewLoading = false;
  previewTotalDays: number | null = null;

  drawerVisible = false;
  drawerLoading = false;
  selected: RegisterDayOff | null = null;

  createVisible = false;
  createForm: FormGroup;
  dayOffConfigOptions: { label: string; value: string; dayOffType?: string }[] = [];
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
  toolbarActions: TableAction[] = [CommonActions.create(() => this.openCreate())];

  filters: Record<string, any> = {
    employeeId: null,
    branchId: null,
    status: null,
    dayOffType: null,
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
      label: 'leave.employee',
      type: 'select',
      placeholder: 'leave.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'leave.branch',
      type: 'select',
      placeholder: 'leave.filterBranch',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'status',
      label: 'leave.status',
      type: 'select',
      placeholder: 'leave.filterStatus',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.DAY_OFF_STATUS).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'dayOffType',
      label: 'leave.dayOffType',
      type: 'select',
      placeholder: 'leave.filterDayOffType',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.DAY_OFF_CONFIG_TYPE).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'dateRange',
      label: 'leave.filterDateRange',
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
    { field: 'employeeCode', header: 'leave.employeeCode', type: 'text' },
    { field: 'employeeName', header: 'leave.employee', type: 'text' },
    { field: 'dayOffTypeLabel', header: 'leave.dayOffType', type: 'text' },
    { field: 'dayOffConfigName', header: 'leave.dayOffConfig', type: 'text' },
    { field: 'fromDate', header: 'leave.fromDate', type: 'date' },
    { field: 'toDate', header: 'leave.toDate', type: 'date' },
    { field: 'sessionLabel', header: 'leave.session', type: 'text' },
    { field: 'totalDays', header: 'leave.totalDays', type: 'text' },
    { field: 'statusLabel', header: 'leave.status', type: 'text' },
    { field: 'branchName', header: 'leave.branch', type: 'text' },
    { field: 'approverName', header: 'leave.approverName', type: 'text' },
    { field: 'requestedApproverName', header: 'leave.requestedApprover', type: 'text' },
    { field: 'reason', header: 'leave.reason', type: 'text' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'detail',
      icon: 'eye',
      tooltip: 'common.actions.view',
      severity: 'info',
      onClick: (record) => this.openDetail(record),
    },
    {
      key: 'approve',
      icon: 'check-circle',
      tooltip: 'leave.approve',
      severity: 'success',
      visible: (record) => record.status === enumData.DAY_OFF_STATUS.PENDING.value,
      onClick: (record) => this.approve(record),
    },
    {
      key: 'reject',
      icon: 'close-circle',
      tooltip: 'leave.reject',
      severity: 'danger',
      visible: (record) => record.status === enumData.DAY_OFF_STATUS.PENDING.value,
      onClick: (record) => this.reject(record),
    },
    {
      key: 'cancel',
      icon: 'stop',
      tooltip: 'leave.cancel',
      severity: 'warning',
      visible: (record) =>
        record.status === enumData.DAY_OFF_STATUS.PENDING.value ||
        record.status === enumData.DAY_OFF_STATUS.APPROVED.value,
      onClick: (record) => this.cancel(record),
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
      dayOffConfigId: [null, Validators.required],
      dayOffType: [enumData.DAY_OFF_CONFIG_TYPE.ANNUAL.value, Validators.required],
      dateRange: [null, Validators.required],
      session: [enumData.LEAVE_SESSION.FULL.value, Validators.required],
      reason: [null, Validators.required],
      attachmentUrl: [null],
    });
  }

  ngOnInit(): void {
    this.createForm.get('dayOffConfigId')?.valueChanges.subscribe((configId) => {
      this.onConfigChange(configId);
    });
    this.createForm.get('dateRange')?.valueChanges.subscribe(() => this.previewDays());
    this.createForm.get('session')?.valueChanges.subscribe(() => this.previewDays());
    this.createForm.get('employeeId')?.valueChanges.subscribe(() => this.previewDays());
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
          this.dayOffConfigOptions = items.map((item) => ({
            label: item.code ? `${item.code} - ${item.name}` : item.name,
            value: item.id,
            dayOffType: item.dayOffType,
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
    if (this.filters['employeeId']) payload['employeeId'] = this.filters['employeeId'];
    if (this.filters['branchId']) payload['branchId'] = this.filters['branchId'];
    if (this.filters['status']) payload['status'] = this.filters['status'];
    if (this.filters['dayOffType']) payload['dayOffType'] = this.filters['dayOffType'];

    const range = this.filters['dateRange'] as Date[] | null;
    if (range?.length === 2 && range[0] && range[1]) {
      payload['fromDate'] = toDateOnly(range[0]);
      payload['toDate'] = toDateOnly(range[1]);
    }

    this.apiService
      .post<PagedResult<RegisterDayOff>>(this.apiService.REGISTER_DAY_OFF.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items.map((item) => ({
            ...item,
            statusLabel: this.getDayOffStatusLabel(item.status),
            dayOffTypeLabel: this.getDayOffTypeLabel(item.dayOffType),
            sessionLabel: this.getLeaveSessionLabel(item.session),
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
      employeeId: null,
      branchId: null,
      status: null,
      dayOffType: null,
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

  openDetail(record: RegisterDayOff): void {
    this.drawerVisible = true;
    this.drawerLoading = true;
    this.selected = null;
    this.apiService
      .post<RegisterDayOff>(this.apiService.REGISTER_DAY_OFF.DETAIL, { id: record.id })
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
    this.previewTotalDays = null;
    this.createForm.reset({
      employeeId: null,
      dayOffConfigId: null,
      dayOffType: enumData.DAY_OFF_CONFIG_TYPE.ANNUAL.value,
      dateRange: null,
      session: enumData.LEAVE_SESSION.FULL.value,
      reason: null,
      attachmentUrl: null,
    });
    this.createVisible = true;
  }

  closeCreate(): void {
    this.createVisible = false;
    this.previewTotalDays = null;
  }

  onConfigChange(configId: string | null): void {
    if (!configId) return;
    const found = this.dayOffConfigOptions.find((x) => x.value === configId);
    if (found?.dayOffType) {
      this.createForm.patchValue({ dayOffType: found.dayOffType });
    }
  }

  previewDays(): void {
    if (!this.createVisible) return;
    const value = this.createForm.getRawValue();
    const range = value.dateRange as Date[] | null;
    if (!range?.length || range.length < 2 || !range[0] || !range[1]) {
      this.previewTotalDays = null;
      this.cdr.markForCheck();
      return;
    }

    this.previewLoading = true;
    this.apiService
      .post<PreviewLeaveDays>(this.apiService.REGISTER_DAY_OFF.PREVIEW_DAYS, {
        employeeId: value.employeeId || null,
        fromDate: toDateOnly(range[0]),
        toDate: toDateOnly(range[1]),
        session: value.session || enumData.LEAVE_SESSION.FULL.value,
      })
      .subscribe({
        next: (res) => {
          this.previewTotalDays = res.totalDays;
          this.previewLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.previewTotalDays = null;
          this.previewLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const value = this.createForm.getRawValue();
    const range = value.dateRange as Date[] | null;
    if (!range?.length || range.length < 2 || !range[0] || !range[1]) {
      this.message.error(this.i18n.instant('leave.validationDateRange'));
      return;
    }

    this.submitting = true;
    const payload = {
      employeeId: value.employeeId,
      dayOffConfigId: value.dayOffConfigId || null,
      dayOffType: value.dayOffType,
      fromDate: toDateOnly(range[0]),
      toDate: toDateOnly(range[1]),
      session: value.session || enumData.LEAVE_SESSION.FULL.value,
      reason: (value.reason || '').trim() || null,
      attachmentUrl: (value.attachmentUrl || '').trim() || null,
    };

    this.apiService.post<string>(this.apiService.REGISTER_DAY_OFF.CREATE, payload).subscribe({
      next: () => {
        this.message.success(this.i18n.createSuccess());
        this.createVisible = false;
        this.submitting = false;
        this.previewTotalDays = null;
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

  approve(item: RegisterDayOff): void {
    this.promptNote('leave.approve', false).then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.REGISTER_DAY_OFF.APPROVE, {
          id: item.id,
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

  reject(item: RegisterDayOff): void {
    this.promptNote('leave.reject', true).then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.REGISTER_DAY_OFF.REJECT, {
          id: item.id,
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

  cancel(item: RegisterDayOff): void {
    this.promptNote(
      'leave.cancel',
      true,
      'leave.cancelReasonPlaceholder',
      'leave.cancelReasonRequired',
    ).then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.REGISTER_DAY_OFF.CANCEL, {
          id: item.id,
          cancelReason: note,
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
          (required ? 'leave.rejectNotePlaceholder' : 'leave.approverNotePlaceholder'),
      );
      this.modal.confirm({
        nzTitle: this.i18n.instant(titleKey),
        nzContent: `<textarea id="leave-approver-note" class="ant-input" rows="3" placeholder="${placeholder}"></textarea>`,
        nzOnOk: () => {
          const el = document.getElementById('leave-approver-note') as HTMLTextAreaElement | null;
          note = el?.value?.trim() || '';
          if (required && !note) {
            this.message.error(this.i18n.instant(requiredMessageKey || 'leave.rejectNoteRequired'));
            return false;
          }
          resolve(note);
          return true;
        },
        nzOnCancel: () => resolve(undefined),
      });
    });
  }

  getDayOffStatusLabel(status?: string | null): string {
    if (!status) return '-';
    const meta = this.dayOffStatuses.find((item) => item.value === status);
    return meta ? this.i18n.instant(meta.labelKey) : status;
  }

  getDayOffTypeLabel(type?: string | null): string {
    if (!type) return '-';
    const meta = this.dayOffTypes.find((item) => item.value === type);
    return meta ? this.i18n.instant(meta.labelKey) : type;
  }

  getLeaveSessionLabel(session?: string | null): string {
    if (!session) return '-';
    const meta = this.leaveSessions.find((item) => item.value === session);
    return meta ? this.i18n.instant(meta.labelKey) : session;
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
