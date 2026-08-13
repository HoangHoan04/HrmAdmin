import { enumData } from '@/app/core/constants/enums';
import { EmployeeSelectBoxDto, PagedResult, PayrollSlip } from '@/app/core/models';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

type SlipKind =
  | typeof enumData.SLIP_KIND.DEDUCTION.value
  | typeof enumData.SLIP_KIND.ADDITION.value;
type SlipRow = PayrollSlip & { employeeDisplay?: string; statusLabel?: string };

@Component({
  standalone: false,
  selector: 'app-payroll-adjustment-manager',
  templateUrl: './payroll-adjustment-manager.component.html',
  styleUrls: [],
})
export class PayrollAdjustmentManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'adjustment.entityName';
  private readonly REVIEWABLE = [
    enumData.SLIP_STATUS.DRAFT.value,
    enumData.SLIP_STATUS.PENDING.value,
  ];

  activeKind: SlipKind = enumData.SLIP_KIND.DEDUCTION.value;
  data: SlipRow[] = [];
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

  sortField = 'slipDate';
  sortOrder = 'desc';
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [CommonActions.create(() => this.openCreate())];

  filters: Record<string, any> = {
    employeeId: null,
    status: null,
    applyYear: null,
    applyMonth: null,
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
      label: 'adjustment.employee',
      type: 'select',
      placeholder: 'adjustment.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'status',
      label: 'adjustment.status',
      type: 'select',
      placeholder: 'adjustment.filterStatus',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.SLIP_STATUS).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'applyYear',
      label: 'adjustment.applyYear',
      type: 'number',
      placeholder: 'adjustment.filterYear',
      col: 6,
      allowClear: true,
    },
    {
      key: 'applyMonth',
      label: 'adjustment.applyMonth',
      type: 'select',
      placeholder: 'adjustment.filterMonth',
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
    { field: 'employeeDisplay', header: 'adjustment.employee', type: 'text' },
    { field: 'amount', header: 'adjustment.amount', type: 'currency' },
    { field: 'slipDate', header: 'adjustment.slipDate', type: 'date' },
    { field: 'slipType', header: 'adjustment.slipType', type: 'text' },
    { field: 'applyMonth', header: 'adjustment.applyMonth', type: 'text' },
    { field: 'applyYear', header: 'adjustment.applyYear', type: 'text' },
    { field: 'statusLabel', header: 'adjustment.status', type: 'text' },
    { field: 'reason', header: 'adjustment.reason', type: 'text' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'approve',
      icon: 'check-circle',
      tooltip: 'adjustment.approve',
      severity: 'success',
      visible: (record) => this.REVIEWABLE.includes(record.status),
      onClick: (record) => this.approve(record),
    },
    {
      key: 'reject',
      icon: 'close-circle',
      tooltip: 'adjustment.reject',
      severity: 'danger',
      visible: (record) => this.REVIEWABLE.includes(record.status),
      onClick: (record) => this.reject(record),
    },
  ];

  constructor(
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly actionConfirm: ActionConfirmService,
    private readonly fb: FormBuilder,
  ) {
    const now = new Date();
    this.createForm = this.fb.group({
      employeeId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      slipDate: [now],
      slipType: [null],
      applyMonth: [now.getMonth() + 1, Validators.required],
      applyYear: [now.getFullYear(), Validators.required],
      reason: [null],
      note: [null],
      autoApprove: [true],
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadData();
  }

  get selectedTabIndex(): number {
    return this.activeKind === enumData.SLIP_KIND.ADDITION.value ? 1 : 0;
  }

  get createTitle(): string {
    return this.activeKind === enumData.SLIP_KIND.ADDITION.value
      ? 'adjustment.createTitleAddition'
      : 'adjustment.createTitleDeduction';
  }

  onTabChange(index: number): void {
    this.activeKind =
      index === 1
        ? enumData.SLIP_KIND.ADDITION.value
        : enumData.SLIP_KIND.DEDUCTION.value;
    this.pagination.current = 1;
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
      kind: this.activeKind,
      pageIndex: this.pagination.current,
      pageSize: this.pagination.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
    };
    if (this.filters['employeeId']) payload['employeeId'] = this.filters['employeeId'];
    if (this.filters['status']) payload['status'] = this.filters['status'];
    if (this.filters['applyYear']) payload['applyYear'] = this.filters['applyYear'];
    if (this.filters['applyMonth']) payload['applyMonth'] = this.filters['applyMonth'];

    this.apiService
      .post<PagedResult<PayrollSlip>>(this.apiService.PAYROLL_SLIP.PAGINATION, payload)
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
    this.filters = { employeeId: null, status: null, applyYear: null, applyMonth: null };
    this.pagination.current = 1;
    this.loadData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.current = event.page;
    this.pagination.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(event: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    this.sortField = event.sortField || 'slipDate';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }

  openCreate(): void {
    const now = new Date();
    this.createForm.reset({
      employeeId: null,
      amount: null,
      slipDate: now,
      slipType: null,
      applyMonth: now.getMonth() + 1,
      applyYear: now.getFullYear(),
      reason: null,
      note: null,
      autoApprove: true,
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
      kind: this.activeKind,
      employeeId: raw.employeeId,
      amount: Number(raw.amount),
      slipDate: raw.slipDate || null,
      slipType: raw.slipType || null,
      applyMonth: Number(raw.applyMonth),
      applyYear: Number(raw.applyYear),
      reason: raw.reason || null,
      note: raw.note || null,
      autoApprove: !!raw.autoApprove,
    };

    this.submitting = true;
    this.apiService.post<string>(this.apiService.PAYROLL_SLIP.CREATE, payload).subscribe({
      next: () => {
        this.message.success(this.i18n.instant('adjustment.createSuccess'));
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

  async approve(item: SlipRow): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('adjustment.approveConfirmTitle'),
      content: this.i18n.instant('adjustment.approveConfirmContent', {
        name: item.employeeName || item.employeeCode || '',
      }),
      okText: this.i18n.instant('adjustment.approve'),
      okType: 'primary',
      icon: 'confirm',
    });
    if (!confirmed) return;
    this.apiService
      .post<boolean>(this.apiService.PAYROLL_SLIP.APPROVE, {
        id: item.id,
        kind: this.activeKind,
      })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.instant('adjustment.approveSuccess'));
            this.loadData();
          } else {
            this.message.error(this.i18n.genericError());
          }
        },
        error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
      });
  }

  async reject(item: SlipRow): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('adjustment.rejectConfirmTitle'),
      content: this.i18n.instant('adjustment.rejectConfirmContent', {
        name: item.employeeName || item.employeeCode || '',
      }),
      okText: this.i18n.instant('adjustment.reject'),
      okType: 'primary',
      icon: 'warning',
    });
    if (!confirmed) return;
    this.apiService
      .post<boolean>(this.apiService.PAYROLL_SLIP.REJECT, {
        id: item.id,
        kind: this.activeKind,
      })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.instant('adjustment.rejectSuccess'));
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
