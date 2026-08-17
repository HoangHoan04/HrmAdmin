import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { ApiClientKey, PagedResult } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
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

@Component({
  standalone: false,
  selector: 'app-api-key-manager',
  templateUrl: './api-key-manager.component.html',
  styleUrls: [],
})
export class ApiKeyManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'system.apiKey.entityName';
  data: ApiClientKey[] = [];
  loading = false;
  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [];
  filters: Record<string, any> = { search: '', isActive: null };
  filterConfig: FilterConfig = {
    show: true,
    collapsible: true,
    defaultOpen: true,
    title: 'common.filter.title',
    actionsAlign: 'center',
  };
  filterFields: FilterField[] = [
    {
      key: 'search',
      label: 'common.filter.search',
      type: 'input',
      placeholder: 'system.apiKey.searchPlaceholder',
      col: 8,
      allowClear: true,
    },
    {
      key: 'isActive',
      label: 'common.status.label',
      type: 'select',
      col: 8,
      allowClear: true,
      options: Object.values(enumData.STATUS_FILTER_IS_ACTIVE)
        .filter((s) => s.value !== null)
        .map((s) => ({ label: s.labelKey, value: s.value })),
    },
  ];
  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];
  columns: TableColumn[] = [
    { field: 'name', header: 'system.apiKey.name', type: 'text', sortable: true },
    { field: 'keyPrefix', header: 'system.apiKey.keyPrefix', type: 'text' },
    { field: 'expiresAt', header: 'system.apiKey.expiresAt', type: 'datetime' },
    {
      field: 'isActive',
      header: 'common.status.label',
      type: 'boolean',
      sortable: true,
      renderBoolean: (value: boolean) =>
        StaticTranslateService.instant(value ? 'common.statusActive' : 'common.statusInactive'),
      badgeSeverity: (value: boolean) => (value ? 'success' : 'danger'),
    },
    { field: 'createdAt', header: 'common.fields.createdAt', type: 'datetime' },
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
        visible: () => this.permissionSvc.has(PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE),
      },
    ];
    this.rowActions = [
      {
        key: 'edit',
        icon: 'edit',
        tooltip: 'common.actions.update',
        severity: 'info',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE),
        onClick: (r) => this.openEdit(r),
      },
      {
        key: 'delete',
        icon: 'delete',
        tooltip: 'common.actions.delete',
        severity: 'danger',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE),
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
      search: (this.filters['search'] || '').trim() || undefined,
    };
    if (this.filters['isActive'] !== null && this.filters['isActive'] !== undefined) {
      payload['isActive'] = this.filters['isActive'];
    }
    this.apiService
      .post<PagedResult<ApiClientKey>>(this.apiService.API_CLIENT_KEY.PAGINATION, payload)
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

  onFiltersChange(filters: Record<string, any>): void {
    this.filters = filters;
  }
  onFilterSearch(): void {
    this.pagination.current = 1;
    this.loadData();
  }
  onFilterClear(): void {
    this.filters = { search: '', isActive: null };
    this.pagination.current = 1;
    this.loadData();
  }
  onPageChange(e: { page: number; pageSize: number }): void {
    this.pagination.current = e.page;
    this.pagination.pageSize = e.pageSize;
    this.loadData();
  }
  openCreate(): void {
    this.router.navigate([
      ROUTES_CONFIG.SETTING_SYSTEM.children.API_KEYS.children.ADD_API_KEY.path,
    ]);
  }
  openEdit(item: ApiClientKey): void {
    this.router.navigate([
      ROUTES_CONFIG.SETTING_SYSTEM.children.API_KEYS.children.EDIT_API_KEY.path,
      item.id,
    ]);
  }
  delete(item: ApiClientKey): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('system.apiKey.deleteConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.API_CLIENT_KEY.DELETE, { id: item.id })
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
