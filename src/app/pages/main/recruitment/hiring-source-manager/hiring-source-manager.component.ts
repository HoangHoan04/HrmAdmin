import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { HiringSource } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
import { StaticTranslateService } from '@/app/core/services/static-translate.service';
import { hiringSourceChannelLabel } from '@/app/core/utils/recruitment-label.util';
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

type HiringSourceRow = HiringSource & { channelLabel?: string };

@Component({
  standalone: false,
  selector: 'app-hiring-source-manager',
  templateUrl: './hiring-source-manager.component.html',
  styleUrls: [],
})
export class HiringSourceManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'recruitment.source.entityName';
  data: HiringSourceRow[] = [];
  loading = false;
  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [];
  filters: Record<string, any> = { searchText: '', channelType: '', isActive: null };
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
      label: 'recruitment.source.search',
      type: 'input',
      placeholder: 'recruitment.source.searchPlaceholder',
      col: 8,
      allowClear: true,
    },
    {
      key: 'channelType',
      label: 'recruitment.source.channelType',
      type: 'select',
      placeholder: 'recruitment.source.channelType',
      col: 8,
      allowClear: true,
      options: Object.values(enumData.HIRING_SOURCE_CHANNEL).map((x) => ({
        label: x.labelKey,
        value: x.value,
      })),
    },
    {
      key: 'isActive',
      label: 'recruitment.common.status',
      type: 'select',
      placeholder: 'recruitment.common.filterStatus',
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
    {
      field: 'displayOrder',
      header: 'recruitment.source.displayOrder',
      type: 'number',
      sortable: false,
      width: '100px',
    },
    { field: 'code', header: 'recruitment.source.code', type: 'text' },
    { field: 'name', header: 'recruitment.source.name', type: 'text' },
    { field: 'channelLabel', header: 'recruitment.source.channelType', type: 'text' },
    { field: 'contactEmail', header: 'recruitment.source.contactEmail', type: 'text' },
    { field: 'isSystem', header: 'recruitment.source.isSystem', type: 'boolean' },
    {
      field: 'isActive',
      header: 'recruitment.common.status',
      type: 'boolean',
      sortable: true,
      renderBoolean: (value: boolean) =>
        StaticTranslateService.instant(value ? 'common.statusActive' : 'common.statusInactive'),
      badgeSeverity: (value: boolean) => (value ? 'success' : 'danger'),
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
        visible: () => this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_SOURCE_MANAGE),
      },
    ];
    this.rowActions = [
      {
        key: 'edit',
        icon: 'edit',
        tooltip: 'common.actions.update',
        severity: 'info',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_SOURCE_MANAGE),
        onClick: (r) => this.openEdit(r),
      },
      {
        key: 'delete',
        icon: 'delete',
        tooltip: 'common.actions.delete',
        severity: 'danger',
        visible: (r: HiringSource) =>
          this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_SOURCE_MANAGE) && !r.isSystem,
        onClick: (r) => this.delete(r),
      },
    ];
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    const payload: Record<string, any> = {
      search: (this.filters['searchText'] || '').trim() || undefined,
      channelType: (this.filters['channelType'] || '').trim() || undefined,
    };
    if (this.filters['isActive'] !== null && this.filters['isActive'] !== undefined) {
      payload['isActive'] = this.filters['isActive'];
    }
    this.apiService.post<HiringSource[]>(this.apiService.HIRING_SOURCE.LIST, payload).subscribe({
      next: (res) => {
        this.data = res.map((item) => ({
          ...item,
          channelLabel: hiringSourceChannelLabel((k) => this.i18n.instant(k), item.channelType),
        }));
        this.pagination.total = res.length;
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
    this.filters = { searchText: '', channelType: '', isActive: null };
    this.pagination.current = 1;
    this.loadData();
  }
  onPageChange(e: { page: number; pageSize: number }): void {
    this.pagination.current = e.page;
    this.pagination.pageSize = e.pageSize;
  }
  openCreate(): void {
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.HIRING_SOURCE.children.ADD_HIRING_SOURCE
        .path,
    ]);
  }
  openEdit(item: HiringSource): void {
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.SETUP.children.HIRING_SOURCE.children.EDIT_HIRING_SOURCE
        .path,
      item.id,
    ]);
  }
  delete(item: HiringSource): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('recruitment.source.deleteConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.HIRING_SOURCE.DELETE, { id: item.id })
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
