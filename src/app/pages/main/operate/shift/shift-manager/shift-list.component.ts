import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import { CompanySelectBoxDto, PagedResult, ShiftMaster } from '@/app/core/models';
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
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-shift-list',
  templateUrl: './shift-list.component.html',
  styleUrls: [],
})
export class ShiftListComponent implements OnInit {
  private readonly ENTITY_KEY = 'shift.entityName';

  data: (ShiftMaster & { status?: boolean })[] = [];
  loading = false;

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
      label: 'shift.code',
      type: 'input',
      placeholder: 'shift.searchCode',
      col: 6,
      allowClear: true,
    },
    {
      key: 'name',
      label: 'shift.name',
      type: 'input',
      placeholder: 'shift.searchName',
      col: 6,
      allowClear: true,
    },
    {
      key: 'companyId',
      label: 'shift.companyName',
      type: 'select',
      placeholder: 'shift.filterCompany',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'isDeleted',
      label: 'shift.status',
      type: 'select',
      placeholder: 'shift.filterStatus',
      col: 6,
      allowClear: true,
      options: [
        { label: 'shift.statusActive', value: false },
        { label: 'shift.statusInactive', value: true },
      ],
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'code', header: 'shift.code', type: 'text', sortable: true },
    { field: 'name', header: 'shift.name', type: 'text', sortable: true },
    { field: 'startTime', header: 'shift.startTime', type: 'text' },
    { field: 'endTime', header: 'shift.endTime', type: 'text' },
    { field: 'breakStartTime', header: 'shift.breakStartTime', type: 'text' },
    { field: 'breakEndTime', header: 'shift.breakEndTime', type: 'text' },
    { field: 'breakMinutes', header: 'shift.breakMinutes', type: 'text' },
    { field: 'workingMinutes', header: 'shift.workingMinutes', type: 'text' },
    { field: 'companyName', header: 'shift.companyName', type: 'text' },
    { field: 'status', header: 'shift.status', type: 'boolean' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'shift.edit',
      severity: 'info',
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'shift.activate',
      severity: 'success',
      visible: (record) => record.isDeleted === true,
      onClick: (record) => this.activate(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'shift.deactivate',
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
      .post<PagedResult<ShiftMaster>>(this.apiService.SHIFT_MASTER.PAGINATION, payload)
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
      ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.children.ADD_SHIFT.path,
    ]);
  }

  openEdit(item: ShiftMaster): void {
    this.router.navigate([
      ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.children.EDIT_SHIFT.path,
      item.id,
    ]);
  }

  async activate(item: ShiftMaster): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirmActivate(this.ENTITY_KEY, item.name);
    if (!confirmed) return;
    this.apiService
      .post<boolean>(this.apiService.SHIFT_MASTER.ACTIVATE, { id: item.id })
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

  async deactivate(item: ShiftMaster): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, item.name);
    if (!confirmed) return;
    this.apiService
      .post<boolean>(this.apiService.SHIFT_MASTER.DEACTIVATE, { id: item.id })
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
