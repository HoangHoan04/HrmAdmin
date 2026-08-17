import { enumData } from '@/app/core/constants/enums';
import { Allowance, CompanySelectBoxDto, PagedResult } from '@/app/core/models';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-allowance-manager',
  templateUrl: './allowance-manager.component.html',
  styleUrls: [],
})
export class AllowanceManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'allowance.entityName';

  data: Allowance[] = [];
  loading = false;
  submitting = false;

  modalVisible = false;
  editing: Allowance | null = null;
  form: FormGroup;
  companyOptions: { label: string; value: string }[] = [];

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = enumData.PAGE.SORT_FIELD.DISPLAY_ORDER;
  sortOrder = enumData.PAGE.SORT_ORDER.ASC;

  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [CommonActions.create(() => this.openCreate())];

  filters: Record<string, any> = {
    search: '',
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
      key: 'search',
      label: 'allowance.search',
      type: 'input',
      placeholder: 'allowance.searchPlaceholder',
      col: 8,
      allowClear: true,
    },
    {
      key: 'companyId',
      label: 'allowance.companyName',
      type: 'select',
      placeholder: 'allowance.filterCompany',
      col: 8,
      allowClear: true,
      options: [],
    },
    {
      key: 'isActive',
      label: 'allowance.status',
      type: 'select',
      placeholder: 'allowance.filterStatus',
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
    { field: 'code', header: 'allowance.code', type: 'text', sortable: true },
    { field: 'name', header: 'allowance.name', type: 'text', sortable: true },
    { field: 'companyName', header: 'allowance.companyName', type: 'text' },
    { field: 'defaultAmount', header: 'allowance.defaultAmount', type: 'currency' },
    { field: 'isTaxable', header: 'allowance.isTaxable', type: 'boolean' },
    { field: 'isInsurable', header: 'allowance.isInsurable', type: 'boolean' },
    {
      field: 'isActive',
      header: 'allowance.isActive',
      type: 'boolean',
      sortable: true,
      renderBoolean: (value: boolean) =>
        StaticTranslateService.instant(value ? 'common.statusActive' : 'common.statusInactive'),
      badgeSeverity: (value: boolean) => (value ? 'success' : 'danger'),
    },
    { field: 'displayOrder', header: 'allowance.displayOrder', type: 'text' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'allowance.edit',
      severity: 'info',
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'allowance.activate',
      severity: 'success',
      visible: (record) => record.isActive === false,
      onClick: (record) => this.setActive(record, true),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'allowance.deactivate',
      severity: 'danger',
      visible: (record) => record.isActive === true,
      onClick: (record) => this.setActive(record, false),
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
    this.form = this.fb.group({
      code: [null, Validators.required],
      name: [null, Validators.required],
      description: [null],
      companyId: [null],
      defaultAmount: [null],
      isTaxable: [true],
      isInsurable: [false],
      isActive: [true],
      displayOrder: [0],
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
    this.loadData();
  }

  get modalTitle(): string {
    return this.editing ? 'allowance.editTitle' : 'allowance.createTitle';
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (items) => {
        this.companyOptions = items.map((item) => ({
          label: item.code ? `${item.code} - ${item.name}` : item.name,
          value: item.id,
        }));
        const field = this.filterFields.find((f) => f.key === 'companyId');
        if (field) field.options = this.companyOptions;
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
    const search = (this.filters['search'] || '').toString().trim();
    if (search) payload['search'] = search;
    if (this.filters['companyId']) payload['companyId'] = this.filters['companyId'];
    if (this.filters['isActive'] !== null && this.filters['isActive'] !== undefined) {
      payload['isActive'] = this.filters['isActive'];
    }

    this.apiService
      .post<PagedResult<Allowance>>(this.apiService.ALLOWANCE.PAGINATION, payload)
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
    this.filters = { search: '', companyId: null, isActive: null };
    this.pagination.current = 1;
    this.loadData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.current = event.page;
    this.pagination.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(event: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    this.sortField = event.sortField || 'displayOrder';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }

  openCreate(): void {
    this.editing = null;
    this.form.reset({
      code: null,
      name: null,
      description: null,
      companyId: null,
      defaultAmount: null,
      isTaxable: true,
      isInsurable: false,
      isActive: true,
      displayOrder: 0,
    });
    this.modalVisible = true;
  }

  openEdit(item: Allowance): void {
    this.editing = item;
    this.form.reset({
      code: item.code,
      name: item.name,
      description: item.description || null,
      companyId: item.companyId || null,
      defaultAmount: item.defaultAmount ?? null,
      isTaxable: item.isTaxable,
      isInsurable: item.isInsurable,
      isActive: item.isActive,
      displayOrder: item.displayOrder ?? 0,
    });
    this.modalVisible = true;
  }

  closeModal(): void {
    this.modalVisible = false;
    this.submitting = false;
    this.editing = null;
  }

  submitModal(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload = {
      id: this.editing?.id || null,
      code: (raw.code || '').toString().trim(),
      name: (raw.name || '').toString().trim(),
      description: raw.description || null,
      companyId: raw.companyId || null,
      defaultAmount: raw.defaultAmount ?? null,
      isTaxable: !!raw.isTaxable,
      isInsurable: !!raw.isInsurable,
      isActive: !!raw.isActive,
      displayOrder: Number(raw.displayOrder) || 0,
    };

    this.submitting = true;
    this.apiService.post<string>(this.apiService.ALLOWANCE.UPSERT, payload).subscribe({
      next: () => {
        this.message.success(this.i18n.instant('allowance.saveSuccess'));
        this.closeModal();
        this.loadData();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  async setActive(item: Allowance, isActive: boolean): Promise<void> {
    if (!item.id) return;
    const confirmed = isActive
      ? await this.actionConfirm.confirmActivate(this.ENTITY_KEY, item.name)
      : await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, item.name);
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.ALLOWANCE.SET_ACTIVE, { id: item.id, isActive })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(
              this.i18n.instant(
                isActive ? 'allowance.activateSuccess' : 'allowance.deactivateSuccess',
              ),
            );
            this.loadData();
          } else {
            this.message.error(this.i18n.genericError());
          }
        },
        error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
      });
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
