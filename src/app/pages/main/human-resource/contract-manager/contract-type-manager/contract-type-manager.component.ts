import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { CompanySelectBoxDto, ContractType, PagedResult } from '@/app/core/models';
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
import { ActionConfirmService } from '@/app/shared/services/action-confirm.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-contract-type-manager',
  templateUrl: './contract-type-manager.component.html',
  styleUrls: [],
})
export class ContractTypeManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'contractType.entityName';

  data: ContractType[] = [];
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
  toolbarActions: TableAction[] = [
    {
      ...CommonActions.create(() => this.openCreate()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.HR_CONTRACT_TYPE_CREATE),
    },
  ];

  filters: Record<string, any> = {
    code: '',
    name: '',
    companyId: null,
    isActive: null,
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
      label: 'contractType.code',
      type: 'input',
      placeholder: 'contractType.searchCode',
      col: 6,
      allowClear: true,
    },
    {
      key: 'name',
      label: 'contractType.name',
      type: 'input',
      placeholder: 'contractType.searchName',
      col: 6,
      allowClear: true,
    },
    {
      key: 'companyId',
      label: 'contractType.companyName',
      type: 'select',
      placeholder: 'contractType.filterCompany',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'isActive',
      label: 'contractType.status',
      type: 'select',
      placeholder: 'contractType.filterStatus',
      col: 6,
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
    { field: 'code', header: 'contractType.code', type: 'text', sortable: true },
    { field: 'name', header: 'contractType.name', type: 'text', sortable: true },
    { field: 'companyName', header: 'contractType.companyName', type: 'text' },
    {
      field: 'defaultDurationMonths',
      header: 'contractType.defaultDurationMonths',
      type: 'number',
    },
    { field: 'maxRenewalTimes', header: 'contractType.maxRenewalTimes', type: 'number' },
    {
      field: 'notifyBeforeExpiryDays',
      header: 'contractType.notifyBeforeExpiryDays',
      type: 'number',
    },
    {
      field: 'isActive',
      header: 'contractType.status',
      type: 'boolean',
      sortable: true,
      renderBoolean: (value: boolean) =>
        StaticTranslateService.instant(value ? 'common.statusActive' : 'common.statusInactive'),
      badgeSeverity: (value: boolean) => (value ? 'success' : 'danger'),
    },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'table.action.edit',
      severity: 'info',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.HR_CONTRACT_TYPE_UPDATE),
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'table.action.activate',
      severity: 'success',
      visible: (record) =>
        record.isActive === false &&
        this.permissionSvc.has(PERMISSION_CODES.HR_CONTRACT_TYPE_ACTIVATE),
      onClick: (record) => this.activate(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'table.action.deactivate',
      severity: 'danger',
      visible: (record) =>
        record.isActive === true &&
        this.permissionSvc.has(PERMISSION_CODES.HR_CONTRACT_TYPE_DEACTIVATE),
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
    if (this.filters['isActive'] !== null && this.filters['isActive'] !== undefined) {
      payload['isActive'] = this.filters['isActive'];
    }

    this.apiService
      .post<PagedResult<ContractType>>(this.apiService.CONTRACT_TYPE.PAGINATION, payload)
      .subscribe({
        next: (res) => {
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
    this.filters = { code: '', name: '', companyId: null, isActive: null };
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
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_TYPE.children
        .ADD_CONTRACT_TYPE.path,
    ]);
  }

  openEdit(item: ContractType): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_TYPE.children
        .EDIT_CONTRACT_TYPE.path,
      item.id,
    ]);
  }

  async activate(item: ContractType): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirmActivate(this.ENTITY_KEY, item.name);
    if (!confirmed) return;
    this.apiService
      .post<boolean>(this.apiService.CONTRACT_TYPE.ACTIVATE, { id: item.id })
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

  async deactivate(item: ContractType): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, item.name);
    if (!confirmed) return;
    this.apiService
      .post<boolean>(this.apiService.CONTRACT_TYPE.DEACTIVATE, { id: item.id })
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
