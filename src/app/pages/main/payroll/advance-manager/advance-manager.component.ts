import { PERMISSION_CODES } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { Advance, EmployeeSelectBoxDto, PagedResult } from '@/app/core/models';
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
import { ActionConfirmService } from '@/app/shared/services/action-confirm.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

type AdvanceRow = Advance & { employeeDisplay?: string; statusLabel?: string };

@Component({
  standalone: false,
  selector: 'app-advance-manager',
  templateUrl: './advance-manager.component.html',
  styleUrls: [],
})
export class AdvanceManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'advance.entityName';
  private readonly REVIEWABLE = [
    enumData.SLIP_STATUS.DRAFT.value,
    enumData.SLIP_STATUS.PENDING.value,
  ];
  private readonly CANCELLABLE = [
    enumData.SLIP_STATUS.DRAFT.value,
    enumData.SLIP_STATUS.PENDING.value,
    enumData.SLIP_STATUS.APPROVED.value,
  ];

  data: AdvanceRow[] = [];
  loading = false;
  submitting = false;

  createVisible = false;
  createForm: FormGroup;
  employeeOptions: { label: string; value: string }[] = [];

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = enumData.PAGE.SORT_FIELD.REQUEST_DATE;
  sortOrder = enumData.PAGE.SORT_ORDER.DESC;

  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [
    {
      ...CommonActions.create(() => this.openCreate()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.PAYROLL_ADVANCE_CREATE),
    },
  ];

  filters: Record<string, any> = {
    employeeId: null,
    status: null,
    deductYear: null,
    deductMonth: null,
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
      label: 'advance.employee',
      type: 'select',
      placeholder: 'advance.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'status',
      label: 'advance.status',
      type: 'select',
      placeholder: 'advance.filterStatus',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.SLIP_STATUS).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'deductYear',
      label: 'advance.deductYear',
      type: 'number',
      placeholder: 'advance.filterYear',
      col: 6,
      allowClear: true,
    },
    {
      key: 'deductMonth',
      label: 'advance.deductMonth',
      type: 'select',
      placeholder: 'advance.filterMonth',
      col: 6,
      allowClear: true,
      options: Array.from({ length: 12 }, (_, i) => ({
        label: String(i + 1),
        value: i + 1,
      })),
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'employeeDisplay', header: 'advance.employee', type: 'text' },
    { field: 'amount', header: 'advance.amount', type: 'currency' },
    { field: 'requestDate', header: 'advance.requestDate', type: 'date' },
    { field: 'deductMonth', header: 'advance.deductMonth', type: 'text' },
    { field: 'deductYear', header: 'advance.deductYear', type: 'text' },
    { field: 'statusLabel', header: 'advance.status', type: 'text' },
    { field: 'reason', header: 'advance.reason', type: 'text' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'approve',
      icon: 'check-circle',
      tooltip: 'advance.approve',
      severity: 'success',
      visible: (record) =>
        this.REVIEWABLE.includes(record.status) &&
        this.permissionSvc.has(PERMISSION_CODES.PAYROLL_ADVANCE_APPROVE),
      onClick: (record) => this.approve(record),
    },
    {
      key: 'reject',
      icon: 'close-circle',
      tooltip: 'advance.reject',
      severity: 'danger',
      visible: (record) =>
        this.REVIEWABLE.includes(record.status) &&
        this.permissionSvc.has(PERMISSION_CODES.PAYROLL_ADVANCE_APPROVE),
      onClick: (record) => this.reject(record),
    },
    {
      key: 'cancel',
      icon: 'stop',
      tooltip: 'advance.cancel',
      severity: 'warning',
      visible: (record) =>
        this.CANCELLABLE.includes(record.status) &&
        this.permissionSvc.has(PERMISSION_CODES.PAYROLL_ADVANCE_MANAGE),
      onClick: (record) => this.cancel(record),
    },
  ];

  constructor(
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly actionConfirm: ActionConfirmService,
    private readonly fb: FormBuilder,
    readonly permissionSvc: PermissionService,
  ) {
    const now = new Date();
    this.createForm = this.fb.group({
      employeeId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      requestDate: [now],
      deductMonth: [now.getMonth() + 1, Validators.required],
      deductYear: [now.getFullYear(), Validators.required],
      reason: [null],
      note: [null],
      submit: [true],
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadData();
  }

  loadEmployees(): void {
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
    if (this.filters['status']) payload['status'] = this.filters['status'];
    if (this.filters['deductYear']) payload['deductYear'] = this.filters['deductYear'];
    if (this.filters['deductMonth']) payload['deductMonth'] = this.filters['deductMonth'];

    this.apiService
      .post<PagedResult<Advance>>(this.apiService.ADVANCE.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items.map((item) => ({
            ...item,
            employeeDisplay: item.employeeCode
              ? `${item.employeeCode} - ${item.employeeName || ''}`
              : item.employeeName || '-',
            statusLabel: this.resolveStatusLabel(item.status),
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
    this.filters = { employeeId: null, status: null, deductYear: null, deductMonth: null };
    this.pagination.current = 1;
    this.loadData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.current = event.page;
    this.pagination.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(event: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    this.sortField = event.sortField || 'requestDate';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }

  openCreate(): void {
    const now = new Date();
    this.createForm.reset({
      employeeId: null,
      amount: null,
      requestDate: now,
      deductMonth: now.getMonth() + 1,
      deductYear: now.getFullYear(),
      reason: null,
      note: null,
      submit: true,
    });
    this.createVisible = true;
  }

  closeCreate(): void {
    this.createVisible = false;
    this.submitting = false;
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const raw = this.createForm.getRawValue();
    const payload = {
      employeeId: raw.employeeId,
      amount: Number(raw.amount),
      requestDate: raw.requestDate || null,
      deductMonth: Number(raw.deductMonth),
      deductYear: Number(raw.deductYear),
      reason: raw.reason || null,
      note: raw.note || null,
      submit: !!raw.submit,
    };

    this.submitting = true;
    this.apiService.post<string>(this.apiService.ADVANCE.CREATE, payload).subscribe({
      next: () => {
        this.message.success(this.i18n.instant('advance.createSuccess'));
        this.closeCreate();
        this.loadData();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  async approve(item: AdvanceRow): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('advance.approveConfirmTitle'),
      content: this.i18n.instant('advance.approveConfirmContent', {
        name: item.employeeName || item.employeeCode || '',
      }),
      okText: this.i18n.instant('advance.approve'),
      okType: 'primary',
      icon: 'confirm',
    });
    if (!confirmed) return;
    this.apiService.post<boolean>(this.apiService.ADVANCE.APPROVE, { id: item.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.instant('advance.approveSuccess'));
          this.loadData();
        } else {
          this.message.error(this.i18n.genericError());
        }
      },
      error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
    });
  }

  async reject(item: AdvanceRow): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('advance.rejectConfirmTitle'),
      content: this.i18n.instant('advance.rejectConfirmContent', {
        name: item.employeeName || item.employeeCode || '',
      }),
      okText: this.i18n.instant('advance.reject'),
      okType: 'primary',
      icon: 'warning',
    });
    if (!confirmed) return;
    this.apiService.post<boolean>(this.apiService.ADVANCE.REJECT, { id: item.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.instant('advance.rejectSuccess'));
          this.loadData();
        } else {
          this.message.error(this.i18n.genericError());
        }
      },
      error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
    });
  }

  async cancel(item: AdvanceRow): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('advance.cancelConfirmTitle'),
      content: this.i18n.instant('advance.cancelConfirmContent', {
        name: item.employeeName || item.employeeCode || '',
      }),
      okText: this.i18n.instant('advance.cancel'),
      okType: 'primary',
      icon: 'warning',
    });
    if (!confirmed) return;
    this.apiService.post<boolean>(this.apiService.ADVANCE.CANCEL, { id: item.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.instant('advance.cancelSuccess'));
          this.loadData();
        } else {
          this.message.error(this.i18n.genericError());
        }
      },
      error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
    });
  }

  private resolveStatusLabel(status?: string): string {
    if (!status) return '-';
    const meta = Object.values(enumData.SLIP_STATUS).find((x) => x.value === status);
    return meta ? this.i18n.instant(meta.labelKey) : status;
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
