import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { CompanySelectBoxDto, PagedResult, TimeKeepingStandard } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
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
import { ActionConfirmService } from '@/app/shared/services/action-confirm.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-timekeeping-standard-manager',
  templateUrl: './timekeeping-standard-manager.component.html',
  styleUrls: [],
})
export class TimekeepingStandardManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'timekeepingStandard.entityName';

  data: (TimeKeepingStandard & { status?: boolean })[] = [];
  loading = false;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = enumData.PAGE.SORT_FIELD.CREATED_AT;
  sortOrder = enumData.PAGE.SORT_ORDER.DESC;
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [CommonActions.create(() => this.openCreate())];

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
      label: 'timekeepingStandard.code',
      type: 'input',
      placeholder: 'timekeepingStandard.searchCode',
      col: 6,
      allowClear: true,
    },
    {
      key: 'name',
      label: 'timekeepingStandard.name',
      type: 'input',
      placeholder: 'timekeepingStandard.searchName',
      col: 6,
      allowClear: true,
    },
    {
      key: 'companyId',
      label: 'timekeepingStandard.companyName',
      type: 'select',
      placeholder: 'timekeepingStandard.filterCompany',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'isDeleted',
      label: 'timekeepingStandard.status',
      type: 'select',
      placeholder: 'timekeepingStandard.filterStatus',
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
      header: 'timekeepingStandard.code',
      type: 'text',
      sortable: true,
    },
    {
      field: 'name',
      header: 'timekeepingStandard.name',
      type: 'text',
      sortable: true,
    },
    {
      field: 'companyName',
      header: 'timekeepingStandard.companyName',
      type: 'text',
    },
    {
      field: 'allowedRadiusMeters',
      header: 'timekeepingStandard.allowedRadiusMeters',
      type: 'text',
    },
    {
      field: 'lateGraceMinutes',
      header: 'timekeepingStandard.lateGraceMinutes',
      type: 'text',
    },
    {
      field: 'isDeleted',
      header: 'timekeepingStandard.status',
      type: 'boolean',
      sortable: true,
      renderBoolean: (value: boolean) =>
        StaticTranslateService.instant(value ? 'common.statusInactive' : 'common.statusActive'),
      badgeSeverity: (value: boolean) => (value ? 'danger' : 'success'),
    },
    {
      field: 'createdAt',
      header: 'timekeepingStandard.createdAt',
      type: 'date',
      sortable: true,
    },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'timekeepingStandard.edit',
      severity: 'info',
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'timekeepingStandard.activate',
      severity: 'success',
      visible: (record) => record.isDeleted === true,
      onClick: (record) => this.activate(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'timekeepingStandard.deactivate',
      severity: 'danger',
      visible: (record) => record.isDeleted === false,
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
      .post<PagedResult<TimeKeepingStandard>>(
        this.apiService.TIMEKEEPING_STANDARD.PAGINATION,
        payload,
      )
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
    this.sortField = event.sortField || 'createdAt';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }

  openCreate(): void {
    this.router.navigate([
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.TIMEKEEPING_STANDARD.children
        .ADD_TIMEKEEPING_STANDARD.path,
    ]);
  }

  openEdit(item: TimeKeepingStandard): void {
    this.router.navigate([
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.TIMEKEEPING_STANDARD.children
        .EDIT_TIMEKEEPING_STANDARD.path,
      item.id,
    ]);
  }

  async activate(item: TimeKeepingStandard): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirmActivate(this.ENTITY_KEY, item.name);
    if (!confirmed) return;
    this.apiService
      .post<boolean>(this.apiService.TIMEKEEPING_STANDARD.ACTIVATE, { id: item.id })
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

  async deactivate(item: TimeKeepingStandard): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, item.name);
    if (!confirmed) return;
    this.apiService
      .post<boolean>(this.apiService.TIMEKEEPING_STANDARD.DEACTIVATE, { id: item.id })
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

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
