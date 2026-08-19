import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { AssetTicket, PagedResult } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
import { StaticTranslateService } from '@/app/core/services/static-translate.service';
import { downloadBlob, extractFileName } from '@/app/core/utils/file.util';
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
  selector: 'app-asset-ticket-manager',
  templateUrl: './asset-ticket-manager.component.html',
  styleUrls: [],
})
export class AssetTicketManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'asset.ticket.entityName';
  data: AssetTicket[] = [];
  loading = false;
  excelLoading = false;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
  sortField = enumData.PAGE.SORT_FIELD.CREATED_AT;
  sortOrder = enumData.PAGE.SORT_ORDER.DESC;

  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [];
  filters: Record<string, any> = { searchText: '', ticketType: '', status: '' };
  filterConfig: FilterConfig = {
    show: true,
    collapsible: true,
    defaultOpen: true,
    title: 'common.filter.title',
    actionsAlign: 'center',
  };
  filterFields: FilterField[] = [
    {
      key: 'searchText',
      label: 'asset.ticket.search',
      type: 'input',
      placeholder: 'asset.ticket.searchPlaceholder',
      col: 8,
      allowClear: true,
    },
    {
      key: 'ticketType',
      label: 'asset.ticket.ticketType',
      type: 'select',
      placeholder: 'asset.ticket.ticketType',
      col: 8,
      allowClear: true,
      options: Object.values(enumData.ASSET_TICKET_TYPE).map((x) => ({
        label: x.labelKey,
        value: x.value,
      })),
    },
    {
      key: 'status',
      label: 'asset.ticket.status',
      type: 'select',
      placeholder: 'asset.common.filterStatus',
      col: 8,
      allowClear: true,
      options: Object.values(enumData.ASSET_TICKET_STATUS)
        .filter((x, idx, self) => self.findIndex((s) => s.value === x.value) === idx)
        .map((x) => ({
          label: x.labelKey,
          value: x.value,
        })),
    },
  ];
  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];
  columns: TableColumn[] = [
    { field: 'code', header: 'asset.ticket.code', type: 'text', sortable: true },
    { field: 'assetName', header: 'asset.ticket.asset', type: 'text' },
    {
      field: 'ticketType',
      header: 'asset.ticket.ticketType',
      type: 'text',
      render: (val: string) => {
        const meta = Object.values(enumData.ASSET_TICKET_TYPE).find((x) => x.value === val);
        return meta ? StaticTranslateService.instant(meta.labelKey) : val;
      },
    },
    {
      field: 'employeeName',
      header: 'asset.ticket.employee',
      type: 'text',
      render: (val: any) => val || '—',
    },
    { field: 'companyName', header: 'asset.common.company', type: 'text' },
    { field: 'ticketAt', header: 'asset.ticket.ticketAt', type: 'date' },
    {
      field: 'status',
      header: 'asset.ticket.status',
      type: 'badge',
      sortable: true,
      render: (value: string) => {
        const meta = Object.values(enumData.ASSET_TICKET_STATUS).find((x) => x.value === value);
        return meta ? StaticTranslateService.instant(meta.labelKey) : value;
      },
      badgeColor: (value: string) => {
        const meta = Object.values(enumData.ASSET_TICKET_STATUS).find((x) => x.value === value);
        return meta?.color || '#8c8c8c';
      },
    },
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
        visible: () =>
          this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_CREATE) ||
          this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_MANAGE),
      },
      {
        ...CommonActions.uploadExcel({
          templateUrl: () => this.apiService.ASSET_TICKET.EXCEL_TEMPLATE,
          importUrl: () => this.apiService.ASSET_TICKET.EXCEL_IMPORT,
          entityName: this.ENTITY_KEY,
          onSuccess: () => this.loadData(),
        }),
        visible: () =>
          this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_IMPORT_EXCEL) ||
          this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_MANAGE),
      },
      {
        ...CommonActions.exportExcel(() => this.exportExcel()),
        visible: () =>
          this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_EXPORT_EXCEL) ||
          this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_MANAGE),
      },
    ];
    this.rowActions = [
      {
        key: 'edit',
        icon: 'edit',
        tooltip: 'table.action.edit',
        severity: 'info',
        visible: (r) =>
          (r.status === 'DRAFT' || r.status === 'NEW') &&
          (this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_UPDATE) ||
            this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_MANAGE)),
        onClick: (r) => this.openEdit(r),
      },
      {
        key: 'complete',
        icon: 'check',
        tooltip: 'table.action.complete',
        severity: 'success',
        visible: (r) =>
          (r.status === 'DRAFT' || r.status === 'NEW') &&
          (this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_COMPLETE) ||
            this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_MANAGE)),
        onClick: (r) => this.complete(r),
      },
      {
        key: 'cancel',
        icon: 'close-circle',
        tooltip: 'common.actions.cancel',
        severity: 'warning',
        visible: (r) =>
          r.status !== 'CANCELLED' &&
          (this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_CANCEL) ||
            this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_MANAGE)),
        onClick: (r) => this.cancel(r),
      },
      {
        key: 'delete',
        icon: 'delete',
        tooltip: 'table.action.delete',
        severity: 'danger',
        visible: (r) =>
          r.status !== 'DONE' &&
          this.permissionSvc.has(PERMISSION_CODES.ASSET_TICKET_MANAGE),
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
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: (this.filters['searchText'] || '').trim() || undefined,
      ticketType: this.filters['ticketType'] || undefined,
      status: this.filters['status'] || undefined,
    };
    this.apiService
      .post<PagedResult<AssetTicket>>(this.apiService.ASSET_TICKET.PAGINATION, payload)
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

  exportExcel(): void {
    this.excelLoading = true;
    const payload = {
      search: (this.filters['searchText'] || '').trim() || undefined,
      ticketType: this.filters['ticketType'] || undefined,
      status: this.filters['status'] || undefined,
    };

    this.apiService
      .postBlob(this.apiService.ASSET_TICKET.EXCEL_EXPORT, payload)
      .subscribe({
        next: (response: any) => {
          this.excelLoading = false;
          const blob = response.body;
          if (!blob) {
            this.message.error(this.i18n.excelExportFailed());
            return;
          }
          const fileName = extractFileName(
            response.headers.get('content-disposition'),
            `Danh_Sach_Phieu_Tai_San_${new Date().getTime()}.xlsx`,
          );
          downloadBlob(blob, fileName);
          this.message.success(this.i18n.excelExportSuccess());
        },
        error: () => {
          this.excelLoading = false;
          this.message.error(this.i18n.excelExportFailed());
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
    this.filters = { searchText: '', ticketType: '', status: '' };
    this.pagination.current = 1;
    this.loadData();
  }
  onPageChange(e: { page: number; pageSize: number }): void {
    this.pagination.current = e.page;
    this.pagination.pageSize = e.pageSize;
    this.loadData();
  }
  onSortChange(e: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    this.sortField = e.sortField || 'createdAt';
    this.sortOrder = e.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }
  openCreate(): void {
    this.router.navigate([
      ROUTES_CONFIG.ASSET.children.ASSET_TICKET.children.ADD_ASSET_TICKET.path,
    ]);
  }
  openEdit(item: AssetTicket): void {
    this.router.navigate([
      ROUTES_CONFIG.ASSET.children.ASSET_TICKET.children.EDIT_ASSET_TICKET.path,
      item.id,
    ]);
  }
  complete(item: AssetTicket): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('asset.ticket.completeConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.ASSET_TICKET.COMPLETE, { id: item.id })
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
  cancel(item: AssetTicket): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('asset.ticket.cancelConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.ASSET_TICKET.CANCEL, { id: item.id })
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
  delete(item: AssetTicket): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('asset.ticket.deleteConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.ASSET_TICKET.DELETE, { id: item.id })
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
