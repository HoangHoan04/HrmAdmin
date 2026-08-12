import { enumData } from '@/app/core/constants/enums/enumData';
import { BranchSelectBoxDto, CompanySelectBoxDto, Department } from '@/app/core/models';
import { downloadBlob, extractFileName } from '@/app/core/utils/file.util';
import {
  CommonFilterActions,
  FilterAction,
  FilterConfig,
  FilterField,
} from '@/app/shared/components/filter-custom/filter-custom.types';
import { ActionConfirmService } from '@/app/shared/services/action-confirm.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../core/constants/common/routes.config';
import { ImportResult, PagedResult } from '../../../../core/models/common.models';
import { ApiService } from '../../../../core/services/api.service';
import { I18nMessageService } from '../../../../core/services/i18n-message.service';
import {
  CommonActions,
  PaginationConfig,
  RowAction,
  TableAction,
  TableColumn,
  ToolbarConfig,
} from '../../../../shared/components/table-custom/table-custom.types';

@Component({
  standalone: false,
  selector: 'app-department-manager',
  templateUrl: './department-manager.component.html',
  styleUrls: ['./department-manager.component.scss'],
})
export class DepartmentManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.department.entityName';

  data: (Department & { status?: boolean })[] = [];
  loading = false;
  excelLoading = false;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  selectedCompanyCode: string | null = null;
  selectedBranchCode: string | null = null;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = 'createdAt';
  sortOrder = 'desc';

  toolbar: ToolbarConfig = {
    show: true,
  };

  toolbarActions: TableAction[] = [
    CommonActions.create(() => this.openCreateModal()),
    CommonActions.uploadExcel(
      () => this.downloadTemplate(),
      (file) => this.uploadFile(file),
    ),
    CommonActions.exportExcel(() => this.exportExcel()),
  ];

  filters: Record<string, any> = {
    code: '',
    name: '',
    companyId: null,
    branchId: null,
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
      label: 'organization.department.code',
      type: 'input',
      placeholder: 'organization.department.searchCode',
      col: 6,
      allowClear: true,
    },
    {
      key: 'name',
      label: 'organization.department.name',
      type: 'input',
      placeholder: 'organization.department.searchName',
      col: 6,
      allowClear: true,
    },
    {
      key: 'companyId',
      label: 'organization.department.companyName',
      type: 'select',
      placeholder: 'organization.department.filterCompany',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'organization.department.branchName',
      type: 'select',
      placeholder: 'organization.department.filterBranch',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'isDeleted',
      label: 'organization.department.status',
      type: 'select',
      placeholder: 'organization.department.filterStatus',
      col: 6,
      allowClear: true,
      options: [
        { label: 'organization.department.statusActive', value: false },
        { label: 'organization.department.statusInactive', value: true },
      ],
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'code', header: 'organization.department.code', type: 'text', sortable: true },
    { field: 'name', header: 'organization.department.name', type: 'text', sortable: true },
    {
      field: 'companyName',
      header: 'organization.department.companyName',
      type: 'text',
      sortable: true,
    },
    {
      field: 'branchName',
      header: 'organization.department.branchName',
      type: 'text',
      sortable: true,
    },
    {
      field: 'managerName',
      header: 'organization.department.managerName',
      type: 'text',
      sortable: false,
    },
    { field: 'status', header: 'organization.department.status', type: 'boolean', sortable: true },
    {
      field: 'createdAt',
      header: 'organization.department.createdAt',
      type: 'date',
      sortable: true,
    },
  ];

  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'organization.department.viewDetail',
      severity: 'primary',
      onClick: (record) => this.viewDetail(record),
    },
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'organization.department.edit',
      severity: 'info',
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'organization.department.activate',
      severity: 'success',
      visible: (record) => record.isDeleted === true,
      onClick: (record) => this.activateDepartment(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'organization.department.deactivate',
      severity: 'danger',
      visible: (record) => record.isDeleted === false,
      onClick: (record) => this.deactivateDepartment(record),
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly actionConfirm: ActionConfirmService,
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.route.queryParamMap.subscribe((params) => {
      this.selectedCompanyCode = params.get('companyCode');
      this.selectedBranchCode = params.get('branchCode');
      this.applyCompanyCodeFilter();
      this.loadBranchesForFilter(this.filters['companyId'], () => {
        this.applyBranchCodeFilter();
        this.loadData();
      });
    });
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (items) => {
        this.companies = items;
        const companyField = this.filterFields.find((field) => field.key === 'companyId');
        if (companyField) {
          companyField.options = items.map((item) => ({
            label: item.code ? `${item.code} - ${item.name}` : item.name,
            value: item.id,
          }));
        }
        this.applyCompanyCodeFilter();
        if (this.selectedCompanyCode || this.selectedBranchCode) {
          this.loadBranchesForFilter(this.filters['companyId'], () => {
            this.applyBranchCodeFilter();
            this.loadData();
          });
        }
        this.cdr.markForCheck();
      },
    });
  }

  loadBranchesForFilter(companyId: string | null, onComplete?: () => void): void {
    if (!companyId) {
      this.branches = [];
      const branchField = this.filterFields.find((field) => field.key === 'branchId');
      if (branchField) branchField.options = [];
      onComplete?.();
      return;
    }

    this.apiService
      .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, { companyId })
      .subscribe({
        next: (items) => {
          this.branches = items;
          const branchField = this.filterFields.find((field) => field.key === 'branchId');
          if (branchField) {
            branchField.options = items.map((item) => ({
              label: item.code ? `${item.code} - ${item.name}` : item.name,
              value: item.id,
            }));
          }
          onComplete?.();
          this.cdr.markForCheck();
        },
        error: () => {
          this.branches = [];
          onComplete?.();
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

    if (this.filters['companyId']) {
      payload['companyId'] = this.filters['companyId'];
    }

    if (this.filters['branchId']) {
      payload['branchId'] = this.filters['branchId'];
    }

    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService
      .post<PagedResult<Department>>(this.apiService.DEPARTMENT.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items.map((item) => ({
            ...item,
            status: !item.isDeleted,
          }));
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
    const prevCompanyId = this.filters['companyId'];
    this.filters = filters;

    if (filters['companyId'] !== prevCompanyId) {
      this.filters = { ...this.filters, branchId: null };
      this.loadBranchesForFilter(filters['companyId']);
    }
  }

  onFilterSearch(): void {
    this.pagination.current = 1;
    this.loadData();
  }

  onFilterClear(): void {
    this.selectedCompanyCode = null;
    this.selectedBranchCode = null;
    this.filters = {
      code: '',
      name: '',
      companyId: null,
      branchId: null,
      isDeleted: null,
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { companyCode: null, branchCode: null },
      queryParamsHandling: 'merge',
    });
    this.loadBranchesForFilter(null);
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
    this.sortOrder = event.sortOrder === 1 ? 'asc' : event.sortOrder === -1 ? 'desc' : 'desc';
    this.loadData();
  }

  async activateDepartment(department: Department): Promise<void> {
    if (!department.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const confirmed = await this.actionConfirm.confirmActivate(this.ENTITY_KEY, department.name);
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.DEPARTMENT.ACTIVATE, { id: department.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.activateSuccess(this.ENTITY_KEY, department.name));
            this.loadData();
          } else {
            this.message.error(this.i18n.activateFailed(this.ENTITY_KEY));
          }
        },
        error: (err: any) => {
          this.message.error(this.i18n.activateError(this.ENTITY_KEY, err.error));
        },
      });
  }

  async deactivateDepartment(department: Department): Promise<void> {
    if (!department.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const confirmed = await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, department.name);
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.DEPARTMENT.DEACTIVATE, { id: department.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.deactivateSuccess(this.ENTITY_KEY, department.name));
            this.loadData();
          } else {
            this.message.error(this.i18n.deactivateFailed(this.ENTITY_KEY));
          }
        },
        error: (err: any) => {
          this.message.error(this.i18n.deactivateError(this.ENTITY_KEY, err.error));
        },
      });
  }

  async toggleStatus(department: Department): Promise<void> {
    if (department.isDeleted) {
      await this.activateDepartment(department);
    } else {
      await this.deactivateDepartment(department);
    }
  }

  openCreateModal(): void {
    const queryParams: Record<string, string> = {};
    if (this.selectedCompanyCode) {
      queryParams['companyCode'] = this.selectedCompanyCode;
    }
    if (this.selectedBranchCode) {
      queryParams['branchCode'] = this.selectedBranchCode;
    }
    this.router.navigate(
      [ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.children.ADD_DEPARTMENT.path],
      { queryParams: Object.keys(queryParams).length ? queryParams : undefined },
    );
  }

  openEdit(department: Department): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.children.EDIT_DEPARTMENT.path,
      department.id,
    ]);
  }

  viewDetail(department: Department): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.children.DETAIL_DEPARTMENT.path,
      department.id,
    ]);
  }

  downloadTemplate(): void {
    this.excelLoading = true;
    this.apiService.postBlob(this.apiService.DEPARTMENT.EXCEL_TEMPLATE).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelTemplateFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          'Mau_Import_Phong_Ban.xlsx',
        );
        downloadBlob(blob, fileName);
        this.message.success(this.i18n.excelTemplateSuccess());
        this.excelLoading = false;
      },
      error: () => {
        this.message.error(this.i18n.excelTemplateFailed());
        this.excelLoading = false;
      },
    });
  }

  uploadFile(file: File): void {
    this.excelLoading = true;
    this.apiService
      .uploadFile<ImportResult>(this.apiService.DEPARTMENT.EXCEL_IMPORT, file)
      .subscribe({
        next: (result) => {
          this.excelLoading = false;
          if (result.errorCount > 0) {
            this.message.warning(
              this.i18n.excelImportPartial(
                result.successCount,
                result.totalRows,
                result.errorCount,
              ),
            );
            if (result.errors?.length) {
              console.warn('Department import errors:', result.errors);
            }
          } else {
            this.message.success(
              this.i18n.excelImportSuccess(result.successCount, this.ENTITY_KEY),
            );
          }
          this.loadData();
        },
        error: (err: any) => {
          this.excelLoading = false;
          this.message.error(this.i18n.excelImportFailed(err.error));
        },
      });
  }

  exportExcel(): void {
    this.excelLoading = true;
    const payload: Record<string, any> = {
      code: (this.filters['code'] || '').trim() || undefined,
      name: (this.filters['name'] || '').trim() || undefined,
    };

    if (this.filters['companyId']) {
      payload['companyId'] = this.filters['companyId'];
    }

    if (this.filters['branchId']) {
      payload['branchId'] = this.filters['branchId'];
    }

    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService.postBlob(this.apiService.DEPARTMENT.EXCEL_EXPORT, payload).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelExportFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          `Danh_Sach_Phong_Ban_${new Date().getTime()}.xlsx`,
        );
        downloadBlob(blob, fileName);
        this.message.success(this.i18n.excelExportSuccess());
        this.excelLoading = false;
      },
      error: () => {
        this.message.error(this.i18n.excelExportFailed());
        this.excelLoading = false;
      },
    });
  }

  private applyCompanyCodeFilter(): void {
    if (!this.selectedCompanyCode || this.companies.length === 0) return;

    const company = this.companies.find(
      (item) => item.code?.toLowerCase() === this.selectedCompanyCode!.toLowerCase(),
    );
    if (company?.id) {
      this.filters = { ...this.filters, companyId: company.id };
    }
  }

  private applyBranchCodeFilter(): void {
    if (!this.selectedBranchCode || this.branches.length === 0) return;

    const branch = this.branches.find(
      (item) => item.code?.toLowerCase() === this.selectedBranchCode!.toLowerCase(),
    );
    if (branch?.id) {
      this.filters = { ...this.filters, branchId: branch.id };
    }
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((action) => action.key === 'search');
    if (searchAction) {
      searchAction.loading = this.loading;
    }
  }
}
