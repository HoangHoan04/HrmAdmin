import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { CompanySelectBoxDto, DayOffConfig, PagedResult } from '@/app/core/models';
import { ApiService, I18nMessageService, PermissionService } from '@/app/core/services';
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
import { ActionConfirmService } from '@/app/shared/services/action-confirm.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { tap } from 'rxjs/internal/operators/tap';

@Component({
  standalone: false,
  selector: 'app-day-off-config-manager',
  templateUrl: './day-off-config-manager.component.html',
  styleUrls: [],
})
export class DayOffConfigManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'dayOffConfig.entityName';

  data: (DayOffConfig & { status?: boolean })[] = [];
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
  toolbarActions: TableAction[] = [
    {
      ...CommonActions.create(() => this.openCreate()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.OPERATE_DAY_OFF_CONFIG_CREATE),
    },
    {
      ...CommonActions.uploadExcel({
        templateUrl: () => this.apiService.DAY_OFF_CONFIG.EXCEL_TEMPLATE,
        importUrl: () => this.apiService.DAY_OFF_CONFIG.EXCEL_IMPORT,
        entityName: this.ENTITY_KEY,
        onSuccess: () => this.loadData(),
      }),
      visible: () =>
        this.permissionSvc.has(PERMISSION_CODES.OPERATE_DAY_OFF_CONFIG_IMPORT_EXCEL) ||
        this.permissionSvc.has(PERMISSION_CODES.OPERATE_DAY_OFF_CONFIG_CREATE),
    },
    {
      ...CommonActions.exportExcel(() => this.exportExcel()),
      visible: () =>
        this.permissionSvc.has(PERMISSION_CODES.OPERATE_DAY_OFF_CONFIG_EXPORT_EXCEL) ||
        this.permissionSvc.has(PERMISSION_CODES.OPERATE_DAY_OFF_CONFIG_VIEW),
    },
  ];

  filters: Record<string, any> = {
    code: '',
    name: '',
    companyId: null,
    isDeleted: null,
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
      label: 'dayOffConfig.code',
      type: 'input',
      placeholder: 'dayOffConfig.searchCode',
      col: 6,
      allowClear: true,
    },
    {
      key: 'name',
      label: 'dayOffConfig.name',
      type: 'input',
      placeholder: 'dayOffConfig.searchName',
      col: 6,
      allowClear: true,
    },
    {
      key: 'companyId',
      label: 'dayOffConfig.companyName',
      type: 'select',
      placeholder: 'dayOffConfig.filterCompany',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'isDeleted',
      label: 'dayOffConfig.status',
      type: 'select',
      placeholder: 'dayOffConfig.filterStatus',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.STATUS_FILTER_IS_DELETED)
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
      field: 'code',
      header: 'dayOffConfig.code',
      type: 'text',
      sortable: true,
    },
    {
      field: 'name',
      header: 'dayOffConfig.name',
      type: 'text',
      sortable: true,
    },
    {
      field: 'companyName',
      header: 'dayOffConfig.companyName',
      type: 'text',
    },
    {
      field: 'defaultDaysPerYear',
      header: 'dayOffConfig.defaultDayPerYear',
      type: 'text',
    },
    {
      field: 'deductBalance',
      header: 'dayOffConfig.deductBalance',
      type: 'boolean',
    },
    {
      field: 'requireAttachment',
      header: 'dayOffConfig.requireAttachment',
      type: 'boolean',
    },
    {
      field: 'minNoticeDays',
      header: 'dayOffConfig.minNoticeDays',
      type: 'text',
    },
    {
      field: 'isDeleted',
      header: 'humanResource.employee.recordStatus',
      type: 'boolean',
      sortable: true,
      renderBoolean: (value: boolean) =>
        StaticTranslateService.instant(value ? 'common.statusInactive' : 'common.statusActive'),
      badgeSeverity: (value: boolean) => (value ? 'danger' : 'success'),
    },
    {
      field: 'createdAt',
      header: 'dayOffConfig.createdAt',
      type: 'date',
      sortable: true,
    },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'table.action.edit',
      severity: 'info',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.OPERATE_DAY_OFF_CONFIG_UPDATE),
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'table.action.activate',
      severity: 'success',
      visible: (record) =>
        record.isDeleted === true &&
        this.permissionSvc.has(PERMISSION_CODES.OPERATE_DAY_OFF_CONFIG_ACTIVATE),
      onClick: (record) => this.activate(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'table.action.deactivate',
      severity: 'danger',
      visible: (record) =>
        record.isDeleted === false &&
        this.permissionSvc.has(PERMISSION_CODES.OPERATE_DAY_OFF_CONFIG_DEACTIVATE),
      onClick: (record) => this.deactivate(record),
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly actionConfirm: ActionConfirmService,
    readonly permissionSvc: PermissionService,
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadData();
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (items) => {
        const field = this.filterFields.find((f) => f.key === 'companyId');
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
      name: (this.filters['name'] || '').trim() || undefined,
    };
    if (this.filters['companyId']) payload['companyId'] = this.filters['companyId'];
    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService
      .post<PagedResult<DayOffConfig>>(this.apiService.DAY_OFF_CONFIG.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items.map((item) => ({ ...item, status: !item.isDeleted }));
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
    this.filters = { code: '', name: '', companyId: null, isDeleted: null };
    this.pagination.current = 1;
    this.loadData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.current = event.page;
    this.pagination.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(event: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    this.sortField = event.sortField || enumData.PAGE.SORT_FIELD.CREATED_AT;
    this.sortOrder =
      event.sortOrder === 1 ? enumData.PAGE.SORT_ORDER.ASC : enumData.PAGE.SORT_ORDER.DESC;
    this.loadData();
  }

  openCreate(): void {
    this.router.navigate([
      ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.DAY_OFF_CONFIG.children
        .ADD_DAY_OFF_CONFIG.path,
    ]);
  }

  openEdit(item: DayOffConfig): void {
    this.router.navigate([
      ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.DAY_OFF_CONFIG.children
        .EDIT_DAY_OFF_CONFIG.path,
      item.id,
    ]);
  }

  async activate(item: DayOffConfig): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirmActivate(this.ENTITY_KEY, item.name);
    if (!confirmed) return;
    this.apiService
      .post<boolean>(this.apiService.DAY_OFF_CONFIG.ACTIVATE, { id: item.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.activateSuccess(this.ENTITY_KEY, item.name));
            this.loadData();
          } else {
            this.message.error(this.i18n.activateFailed(this.ENTITY_KEY));
          }
        },
        error: (err: any) =>
          this.message.error(this.i18n.activateError(this.ENTITY_KEY, err.error)),
      });
  }

  async deactivate(item: DayOffConfig): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, item.name);
    if (!confirmed) return;
    this.apiService
      .post<boolean>(this.apiService.DAY_OFF_CONFIG.DEACTIVATE, { id: item.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.deactivateSuccess(this.ENTITY_KEY, item.name));
            this.loadData();
          } else {
            this.message.error(this.i18n.deactivateFailed(this.ENTITY_KEY));
          }
        },
        error: (err: any) =>
          this.message.error(this.i18n.deactivateError(this.ENTITY_KEY, err.error)),
      });
  }

  exportExcel() {
    this.excelLoading = true;
    const payload: Record<string, any> = {
      code: (this.filters['code'] || '').trim() || undefined,
      name: (this.filters['name'] || '').trim() || undefined,
    };
    if (this.filters['companyId']) payload['companyId'] = this.filters['companyId'];
    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    return this.apiService.postBlob(this.apiService.DAY_OFF_CONFIG.EXCEL_EXPORT, payload).pipe(
      tap({
        next: (response) => {
          this.excelLoading = false;
          const blob = response.body;
          if (!blob) {
            this.message.error(this.i18n.excelExportFailed());
            return;
          }
          const fileName = extractFileName(
            response.headers.get('content-disposition'),
            `Danh_Sach_Cau_Hinh_Nghi_Phep_${new Date().getTime()}.xlsx`,
          );
          downloadBlob(blob, fileName);
          this.message.success(this.i18n.excelExportSuccess());
        },
        error: () => {
          this.excelLoading = false;
          this.message.error(this.i18n.excelExportFailed());
        },
      }),
    );
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
