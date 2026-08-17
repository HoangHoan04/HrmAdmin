import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { toUtcDateIso } from '@/app/core/constants/helpers';
import { EmployeeSelectBoxDto, PagedResult, TransferEmployee } from '@/app/core/models';
import { ApiService, I18nMessageService, PermissionService } from '@/app/core/services';
import { StaticTranslateService } from '@/app/core/services/static-translate.service';
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

type TransferRow = TransferEmployee & {
  statusLabel?: string;
  transferTypeLabel?: string;
};

@Component({
  standalone: false,
  selector: 'app-transfer-manager',
  templateUrl: './transfer-manager.component.html',
  styleUrls: [],
})
export class TransferManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'transfer.entityName';

  data: TransferRow[] = [];
  loading = false;
  enumData = enumData;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = enumData.PAGE.SORT_FIELD.CREATED_AT;
  sortOrder = enumData.PAGE.SORT_ORDER.DESC;
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [
    {
      ...CommonActions.create(() => this.openCreate()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.HR_TRANSFER_CREATE),
    },
  ];

  filters: Record<string, any> = {
    code: '',
    employeeId: null,
    transferType: null,
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
      key: 'code',
      label: 'transfer.code',
      type: 'input',
      placeholder: 'transfer.searchCode',
      col: 6,
      allowClear: true,
    },
    {
      key: 'employeeId',
      label: 'transfer.employeeName',
      type: 'select',
      placeholder: 'transfer.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'transferType',
      label: 'transfer.transferType',
      type: 'select',
      placeholder: 'transfer.filterTransferType',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.TRANSFER_TYPE).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'status',
      label: 'transfer.status',
      type: 'select',
      placeholder: 'transfer.filterStatus',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.TRANSFER_STATUS).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'dateRange',
      label: 'transfer.effectiveDate',
      type: 'dateRange',
      placeholder: 'transfer.filterEffectiveDate',
      col: 8,
      allowClear: true,
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'code', header: 'transfer.code', type: 'text', sortable: true },
    { field: 'employeeName', header: 'transfer.employeeName', type: 'text' },
    {
      field: 'transferType',
      header: 'transfer.transferType',
      type: 'badge',
      sortable: true,
      render: (value: string) => {
        const meta = Object.values(enumData.TRANSFER_TYPE).find((x) => x.value === value);
        return meta ? StaticTranslateService.instant(meta.labelKey) : value;
      },
      badgeColor: (value: string) => {
        const meta = Object.values(enumData.TRANSFER_TYPE).find((x) => x.value === value);
        return meta?.color || '#8c8c8c';
      },
    },
    { field: 'effectiveDate', header: 'transfer.effectiveDate', type: 'date', sortable: true },
    {
      field: 'status',
      header: 'transfer.status',
      type: 'badge',
      sortable: true,
      render: (value: string) => {
        const meta = Object.values(enumData.TRANSFER_STATUS).find((x) => x.value === value);
        return meta ? StaticTranslateService.instant(meta.labelKey) : value;
      },
      badgeColor: (value: string) => {
        const meta = Object.values(enumData.TRANSFER_STATUS).find((x) => x.value === value);
        return meta?.color || '#8c8c8c';
      },
    },
    { field: 'approvedBy', header: 'transfer.approvedBy', type: 'text' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'table.action.viewDetail',
      severity: 'primary',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.HR_TRANSFER_VIEW),
      onClick: (record) => this.openDetail(record),
    },
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'table.action.edit',
      severity: 'info',
      visible: (record) =>
        record.status === enumData.TRANSFER_STATUS.PENDING.value &&
        this.permissionSvc.has(PERMISSION_CODES.HR_TRANSFER_UPDATE),
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'approve',
      icon: 'check',
      tooltip: 'table.action.approve',
      severity: 'success',
      visible: (record) =>
        record.status === enumData.TRANSFER_STATUS.PENDING.value &&
        this.permissionSvc.has(PERMISSION_CODES.HR_TRANSFER_APPROVE),
      onClick: (record) => this.approve(record),
    },
    {
      key: 'reject',
      icon: 'close',
      tooltip: 'table.action.reject',
      severity: 'danger',
      visible: (record) =>
        record.status === enumData.TRANSFER_STATUS.PENDING.value &&
        this.permissionSvc.has(PERMISSION_CODES.HR_TRANSFER_REJECT),
      onClick: (record) => this.reject(record),
    },
    {
      key: 'apply',
      icon: 'play-circle',
      tooltip: 'table.action.apply',
      severity: 'success',
      visible: (record) =>
        record.status === enumData.TRANSFER_STATUS.APPROVED.value &&
        this.permissionSvc.has(PERMISSION_CODES.HR_TRANSFER_APPLY),
      onClick: (record) => this.apply(record),
    },
    {
      key: 'cancel',
      icon: 'stop',
      tooltip: 'table.action.cancel',
      severity: 'warning',
      visible: (record) =>
        (record.status === enumData.TRANSFER_STATUS.PENDING.value ||
          record.status === enumData.TRANSFER_STATUS.APPROVED.value) &&
        this.permissionSvc.has(PERMISSION_CODES.HR_TRANSFER_CANCEL),
      onClick: (record) => this.cancel(record),
    },
  ];

  private statusLabelMap = new Map<string, string>();

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly modal: NzModalService,
    readonly permissionSvc: PermissionService,
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
      code: (this.filters['code'] || '').trim() || undefined,
    };
    if (this.filters['employeeId']) payload['employeeId'] = this.filters['employeeId'];
    if (this.filters['transferType']) payload['transferType'] = this.filters['transferType'];
    if (this.filters['status']) payload['status'] = this.filters['status'];

    const range = this.filters['dateRange'] as Date[] | null;
    if (range?.length === 2 && range[0] && range[1]) {
      payload['effectiveDateFrom'] = toUtcDateIso(range[0]);
      payload['effectiveDateTo'] = toUtcDateIso(range[1]);
    }

    this.apiService
      .post<PagedResult<TransferEmployee>>(this.apiService.TRANSFER_EMPLOYEE.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.statusLabelMap.clear();
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
    this.filters = {
      code: '',
      employeeId: null,
      transferType: null,
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

  openCreate(): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.TRANSFER_MANAGER.children.ADD_TRANSFER.path,
    ]);
  }

  openEdit(item: TransferEmployee): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.TRANSFER_MANAGER.children.EDIT_TRANSFER.path,
      item.id,
    ]);
  }

  openDetail(item: TransferEmployee): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.TRANSFER_MANAGER.children.DETAIL_TRANSFER.path,
      item.id,
    ]);
  }

  approve(item: TransferRow): void {
    this.promptNote('transfer.approve').then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.TRANSFER_EMPLOYEE.APPROVE, {
          id: item.id,
          note: note || null,
        })
        .subscribe({
          next: (success) => {
            if (success) {
              this.message.success(this.i18n.instant('transfer.approveSuccess'));
              this.loadData();
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  reject(item: TransferRow): void {
    this.promptNote('transfer.reject').then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.TRANSFER_EMPLOYEE.REJECT, {
          id: item.id,
          note: note || null,
        })
        .subscribe({
          next: (success) => {
            if (success) {
              this.message.success(this.i18n.instant('transfer.rejectSuccess'));
              this.loadData();
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  apply(item: TransferRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('transfer.applyConfirmTitle'),
      nzContent: this.i18n.instant('transfer.applyConfirmContent', { code: item.code || '' }),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.TRANSFER_EMPLOYEE.APPLY, { id: item.id })
            .subscribe({
              next: (success) => {
                if (success) {
                  this.message.success(this.i18n.instant('transfer.applySuccess'));
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

  cancel(item: TransferRow): void {
    this.promptNote('transfer.cancelConfirmTitle').then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.TRANSFER_EMPLOYEE.CANCEL, {
          id: item.id,
          note: note || null,
        })
        .subscribe({
          next: (success) => {
            if (success) {
              this.message.success(this.i18n.instant('transfer.cancelSuccess'));
              this.loadData();
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  private promptNote(titleKey: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      this.modal.confirm({
        nzTitle: this.i18n.instant(titleKey),
        nzContent: `<textarea id="transfer-note" class="ant-input" rows="3" placeholder="${this.i18n.instant(
          'transfer.notePlaceholder',
        )}"></textarea>`,
        nzOnOk: () => {
          const el = document.getElementById('transfer-note') as HTMLTextAreaElement | null;
          resolve(el?.value?.trim() || '');
        },
        nzOnCancel: () => resolve(undefined),
      });
    });
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
