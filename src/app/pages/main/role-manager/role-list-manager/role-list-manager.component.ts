import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { PERMISSION_CODES } from '@/app/core/constants/common/permission-codes';
import { enumData } from '@/app/core/constants/enums/enumData';
import {
  CompanySelectBoxDto,
  CreateRoleRequest,
  PagedResult,
  RoleDto,
  UpdateRoleRequest,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
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
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-role-list-manager',
  templateUrl: './role-list-manager.component.html',
  styleUrls: ['./role-list-manager.component.scss'],
})
export class RoleListManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'role.entityName';

  data: RoleDto[] = [];
  loading = false;
  companies: CompanySelectBoxDto[] = [];
  selectedCompanyCode: string | null = null;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = 'code';
  sortOrder = 'asc';

  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [
    {
      ...CommonActions.create(() => this.openCreateModal()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ROLE_CREATE),
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
      label: 'role.code',
      type: 'input',
      placeholder: 'role.codePlaceholder',
      col: 6,
      allowClear: true,
    },
    {
      key: 'name',
      label: 'role.name',
      type: 'input',
      placeholder: 'role.namePlaceholder',
      col: 6,
      allowClear: true,
    },
    {
      key: 'companyId',
      label: 'role.company',
      type: 'select',
      placeholder: 'role.filterCompany',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'isActive',
      label: 'role.isActive',
      type: 'select',
      placeholder: 'role.filterActive',
      col: 6,
      allowClear: true,
      options: [
        { label: 'common.statusActive', value: true },
        { label: 'common.statusInactive', value: false },
      ],
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'code', header: 'role.code', type: 'text', sortable: true },
    { field: 'name', header: 'role.name', type: 'text', sortable: true },
    { field: 'companyCode', header: 'role.companyCode', type: 'text' },
    { field: 'companyName', header: 'role.company', type: 'text' },
    { field: 'permissionCount', header: 'role.permissionCount', type: 'text' },
    { field: 'userCount', header: 'role.userCount', type: 'text' },
    { field: 'isSystem', header: 'role.isSystem', type: 'boolean' },
    { field: 'isActive', header: 'role.isActive', type: 'boolean', sortable: true },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'common.actions.edit',
      severity: 'info',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ROLE_UPDATE),
      onClick: (record) => this.openEditModal(record),
    },
    {
      key: 'permissions',
      icon: 'key',
      tooltip: 'role.goAccessControl',
      severity: 'primary',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ROLE_MANAGE),
      onClick: (record) => this.goAccessControl(record),
    },
    {
      key: 'delete',
      icon: 'delete',
      tooltip: 'common.actions.delete',
      severity: 'danger',
      visible: (record) => !record.isSystem && this.permissionSvc.has(PERMISSION_CODES.ROLE_DELETE),
      onClick: (record) => this.deleteRole(record),
    },
  ];

  modalVisible = false;
  modalSaving = false;
  editingId: string | null = null;
  formModel: CreateRoleRequest & { id?: string; isSystem?: boolean } = this.emptyForm();

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly actionConfirm: ActionConfirmService,
    readonly permissionSvc: PermissionService,
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.route.queryParamMap.subscribe((params) => {
      const companyCode = params.get('companyCode');
      this.selectedCompanyCode = companyCode;
      this.applyCompanyCodeFilter();
      this.loadData();
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
      companyId: this.filters['companyId'] || undefined,
      companyCode: this.selectedCompanyCode || undefined,
      isActive: this.filters['isActive'] ?? undefined,
    };

    this.apiService.post<PagedResult<RoleDto>>(this.apiService.ROLE.PAGINATION, payload).subscribe({
      next: (res) => {
        this.data = res.items || [];
        this.pagination = { ...this.pagination, total: res.totalCount || 0 };
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
    this.filters = { ...filters };
  }

  onFilterSearch(): void {
    this.pagination = { ...this.pagination, current: 1 };
    this.selectedCompanyCode = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { companyCode: null },
      queryParamsHandling: 'merge',
    });
    this.loadData();
  }

  onFilterClear(): void {
    this.filters = { code: '', name: '', companyId: null, isActive: null };
    this.selectedCompanyCode = null;
    this.pagination = { ...this.pagination, current: 1 };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { companyCode: null },
      queryParamsHandling: 'merge',
    });
    this.loadData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination = {
      ...this.pagination,
      current: event.page,
      pageSize: event.pageSize,
    };
    this.loadData();
  }

  onSortChange(event: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    this.sortField = event.sortField || 'code';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : event.sortOrder === -1 ? 'desc' : 'asc';
    this.loadData();
  }

  openCreateModal(): void {
    this.editingId = null;
    this.formModel = this.emptyForm();
    if (this.filters['companyId']) {
      this.formModel.companyId = this.filters['companyId'];
    }
    this.modalVisible = true;
    this.cdr.markForCheck();
  }

  openEditModal(record: RoleDto): void {
    this.editingId = record.id;
    this.formModel = {
      id: record.id,
      code: record.code,
      name: record.name,
      description: record.description || '',
      companyId: record.companyId || null,
      isActive: record.isActive,
      isSystem: record.isSystem,
    };
    this.modalVisible = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.modalVisible = false;
    this.cdr.markForCheck();
  }

  saveModal(): void {
    const code = (this.formModel.code || '').trim();
    const name = (this.formModel.name || '').trim();
    if ((!this.editingId && !code) || !name) {
      this.message.error(this.i18n.instant('role.codeNameRequired'));
      return;
    }

    this.modalSaving = true;
    if (this.editingId) {
      this.apiService
        .post<boolean>(this.apiService.ROLE.UPDATE, {
          id: this.editingId,
          name,
          description: this.formModel.description || null,
          companyId: this.formModel.companyId || null,
          isActive: this.formModel.isActive ?? true,
        } as UpdateRoleRequest)
        .subscribe({
          next: (result) => {
            this.modalSaving = false;
            if (result === false) {
              this.message.error(this.i18n.genericError());
              this.cdr.markForCheck();
              return;
            }
            this.message.success(this.i18n.updateSuccess());
            this.modalVisible = false;
            this.loadData();
            this.cdr.markForCheck();
          },
          error: (err: any) => {
            this.modalSaving = false;
            this.message.error(this.i18n.genericError(err.error));
            this.cdr.markForCheck();
          },
        });
      return;
    }

    this.apiService
      .post<string>(this.apiService.ROLE.CREATE, {
        code,
        name,
        description: this.formModel.description || null,
        companyId: this.formModel.companyId || null,
        isActive: this.formModel.isActive ?? true,
      } as CreateRoleRequest)
      .subscribe({
        next: () => {
          this.modalSaving = false;
          this.message.success(this.i18n.createSuccess());
          this.modalVisible = false;
          this.loadData();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.modalSaving = false;
          this.message.error(this.i18n.genericError(err.error));
          this.cdr.markForCheck();
        },
      });
  }

  async deleteRole(record: RoleDto): Promise<void> {
    if (record.isSystem) {
      this.message.warning(this.i18n.instant('role.cannotDeleteSystem'));
      return;
    }
    const ok = await this.actionConfirm.confirm({
      title: this.i18n.instant('role.confirmDeleteTitle'),
      content: this.i18n.instant('role.confirmDeleteContent', { name: record.name }),
      okText: this.i18n.instant('common.actions.delete'),
      okType: 'primary',
      icon: 'warning',
    });
    if (!ok) return;

    this.apiService.post<boolean>(this.apiService.ROLE.DELETE, { id: record.id }).subscribe({
      next: (success) => {
        if (success === false) {
          this.message.error(this.i18n.genericError());
          return;
        }
        this.message.success(this.i18n.instant('role.deleteSuccess'));
        this.loadData();
      },
      error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
    });
  }

  goAccessControl(record: RoleDto): void {
    this.router.navigate([ROUTES_CONFIG.ROLE_MANAGER.children.ACCESS_CONTROL.path], {
      queryParams: { tab: 'role', roleId: record.id },
    });
  }

  get isEdit(): boolean {
    return !!this.editingId;
  }

  private applyCompanyCodeFilter(): void {
    if (!this.selectedCompanyCode || !this.companies.length) return;
    const company = this.companies.find(
      (c) => (c.code || '').toLowerCase() === this.selectedCompanyCode!.toLowerCase(),
    );
    if (company) {
      this.filters = { ...this.filters, companyId: company.id };
    }
  }

  private loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.companies = res || [];
        const field = this.filterFields.find((f) => f.key === 'companyId');
        if (field) {
          field.options = this.companies.map((c) => ({
            label: `${c.code} - ${c.name}`,
            value: c.id,
          }));
        }
        this.applyCompanyCodeFilter();
        this.cdr.markForCheck();
      },
    });
  }

  private syncFilterActionsLoading(): void {
    this.filterActions = [
      CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
      CommonFilterActions.clear(() => this.onFilterClear()),
    ];
  }

  private emptyForm(): CreateRoleRequest & { id?: string; isSystem?: boolean } {
    return { code: '', name: '', description: '', companyId: null, isActive: true };
  }
}
