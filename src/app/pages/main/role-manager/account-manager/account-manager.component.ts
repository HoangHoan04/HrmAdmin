import { PERMISSION_CODES } from '@/app/core/constants/common/permission-codes';
import { enumData } from '@/app/core/constants/enums/enumData';
import {
  AdminUserDto,
  CompanySelectBoxDto,
  CreateUserRequest,
  EmployeeSelectBoxDto,
  PagedResult,
  UpdateUserRequest,
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
  selector: 'app-account-manager',
  templateUrl: './account-manager.component.html',
  styleUrls: ['./account-manager.component.scss'],
})
export class AccountManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'role.userEntityName';

  data: AdminUserDto[] = [];
  loading = false;
  companies: CompanySelectBoxDto[] = [];
  employees: EmployeeSelectBoxDto[] = [];
  selectedCompanyCode: string | null = null;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = 'username';
  sortOrder = 'asc';

  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [
    {
      ...CommonActions.create(() => this.openCreateModal()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.USER_CREATE),
    },
  ];

  filters: Record<string, any> = {
    username: '',
    employeeCode: '',
    companyId: null,
    type: null,
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
      key: 'username',
      label: 'role.username',
      type: 'input',
      placeholder: 'role.usernamePlaceholder',
      col: 6,
      allowClear: true,
    },
    {
      key: 'employeeCode',
      label: 'role.employeeCode',
      type: 'input',
      placeholder: 'role.employeeCodePlaceholder',
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
      key: 'type',
      label: 'role.userType',
      type: 'select',
      placeholder: 'role.filterUserType',
      col: 6,
      allowClear: true,
      options: [
        { label: 'role.userTypeAdmin', value: 'ADMIN' },
        { label: 'role.userTypeEmployee', value: 'EMPLOYEE' },
        { label: 'role.userTypeHr', value: 'HR' },
        { label: 'role.userTypeManager', value: 'MANAGER' },
      ],
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
    { field: 'username', header: 'role.username', type: 'text', sortable: true },
    { field: 'employeeCode', header: 'role.employeeCode', type: 'text' },
    { field: 'employeeName', header: 'role.employeeName', type: 'text' },
    { field: 'companyCode', header: 'role.companyCode', type: 'text' },
    { field: 'type', header: 'role.userType', type: 'text' },
    { field: 'email', header: 'role.email', type: 'text' },
    { field: 'roleCodesText', header: 'role.roleCodes', type: 'text' },
    { field: 'isActive', header: 'role.isActive', type: 'boolean' },
    { field: 'isLocked', header: 'role.isLocked', type: 'boolean' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'common.actions.edit',
      severity: 'info',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.USER_UPDATE),
      onClick: (record) => this.openEditModal(record),
    },
    {
      key: 'reset',
      icon: 'key',
      tooltip: 'role.resetPassword',
      severity: 'warning',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.USER_RESET_PASSWORD),
      onClick: (record) => this.resetPassword(record),
    },
    {
      key: 'delete',
      icon: 'delete',
      tooltip: 'common.actions.delete',
      severity: 'danger',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.USER_DELETE),
      onClick: (record) => this.deleteAccount(record),
    },
  ];

  modalVisible = false;
  modalSaving = false;
  editingId: string | null = null;
  formModel: CreateUserRequest & {
    id?: string;
    isLocked?: boolean;
  } = this.emptyForm();

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
    this.loadEmployees();
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
      username: (this.filters['username'] || '').trim() || undefined,
      employeeCode: (this.filters['employeeCode'] || '').trim() || undefined,
      companyId: this.filters['companyId'] || undefined,
      companyCode: this.selectedCompanyCode || undefined,
      type: this.filters['type'] || undefined,
      isActive: this.filters['isActive'] ?? undefined,
    };

    this.apiService
      .post<PagedResult<AdminUserDto>>(this.apiService.USER.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = (res.items || []).map((item) => ({
            ...item,
            roleCodesText: (item.roleCodes || []).join(', '),
          }));
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
    this.filters = {
      username: '',
      employeeCode: '',
      companyId: null,
      type: null,
      isActive: null,
    };
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
    this.sortField = event.sortField || 'username';
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

  openEditModal(record: AdminUserDto): void {
    this.editingId = record.id;
    this.formModel = {
      id: record.id,
      username: record.username,
      type: record.type,
      email: record.email || '',
      phoneNumber: record.phoneNumber || '',
      employeeId: record.employeeId || null,
      companyId: record.companyId || null,
      isActive: record.isActive,
      isLocked: !!record.isLocked,
    };
    this.modalVisible = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.modalVisible = false;
    this.cdr.markForCheck();
  }

  onEmployeeChange(employeeId: string | null): void {
    this.formModel.employeeId = employeeId;
    if (!employeeId || this.isEdit) return;
    const emp = this.employees.find((e) => e.id === employeeId);
    if (!emp) return;
    if (!this.formModel.username) {
      this.formModel.username = emp.code || '';
    }
  }

  saveModal(): void {
    const username = (this.formModel.username || '').trim();
    if (!this.isEdit && !username) {
      this.message.error(this.i18n.instant('role.usernameRequired'));
      return;
    }

    this.modalSaving = true;
    if (this.isEdit) {
      this.apiService
        .post<boolean>(this.apiService.USER.UPDATE, {
          id: this.editingId!,
          email: this.formModel.email || null,
          phoneNumber: this.formModel.phoneNumber || null,
          type: this.formModel.type || 'EMPLOYEE',
          employeeId: this.formModel.employeeId || null,
          companyId: this.formModel.companyId || null,
          isActive: this.formModel.isActive ?? true,
          isLocked: this.formModel.isLocked ?? false,
        } as UpdateUserRequest)
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
      .post<string>(this.apiService.USER.CREATE, {
        username,
        password: this.formModel.password || null,
        type: this.formModel.type || 'EMPLOYEE',
        email: this.formModel.email || null,
        phoneNumber: this.formModel.phoneNumber || null,
        employeeId: this.formModel.employeeId || null,
        companyId: this.formModel.companyId || null,
        isActive: this.formModel.isActive ?? true,
        mustChangePassword: true,
      } as CreateUserRequest)
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

  async resetPassword(record: AdminUserDto): Promise<void> {
    const ok = await this.actionConfirm.confirm({
      title: this.i18n.instant('role.confirmResetPasswordTitle'),
      content: this.i18n.instant('role.confirmResetPasswordContent', { name: record.username }),
      okText: this.i18n.instant('common.messages.confirm'),
      okType: 'primary',
      icon: 'warning',
    });
    if (!ok) return;

    this.apiService
      .post<boolean>(this.apiService.USER.RESET_PASSWORD, {
        id: record.id,
        mustChangePassword: true,
      })
      .subscribe({
        next: (success) => {
          if (success === false) {
            this.message.error(this.i18n.genericError());
            return;
          }
          this.message.success(this.i18n.instant('role.resetPasswordSuccess'));
        },
        error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
      });
  }

  async deleteAccount(record: AdminUserDto): Promise<void> {
    const ok = await this.actionConfirm.confirm({
      title: this.i18n.instant('role.confirmDeleteUserTitle'),
      content: this.i18n.instant('role.confirmDeleteUserContent', { name: record.username }),
      okText: this.i18n.instant('common.actions.delete'),
      okType: 'primary',
      icon: 'warning',
    });
    if (!ok) return;

    this.apiService.post<boolean>(this.apiService.USER.DELETE, { id: record.id }).subscribe({
      next: (success) => {
        if (success === false) {
          this.message.error(this.i18n.genericError());
          return;
        }
        this.message.success(this.i18n.instant('role.deleteUserSuccess'));
        this.loadData();
      },
      error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
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

  private loadEmployees(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (res) => {
          this.employees = res || [];
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

  private emptyForm(): CreateUserRequest & { id?: string; isLocked?: boolean } {
    return {
      username: '',
      password: '',
      type: 'EMPLOYEE',
      email: '',
      phoneNumber: '',
      employeeId: null,
      companyId: null,
      isActive: true,
      isLocked: false,
    };
  }
}
