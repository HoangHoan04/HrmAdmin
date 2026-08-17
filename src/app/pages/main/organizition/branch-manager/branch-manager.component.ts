import { enumData } from '@/app/core/constants/enums/enumData';
import { Branch, CompanySelectBoxDto } from '@/app/core/models';
import { StaticTranslateService } from '@/app/core/services/static-translate.service';
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
  selector: 'app-branch-manager',
  templateUrl: './branch-manager.component.html',
  styleUrls: ['./branch-manager.component.scss'],
})
export class BranchManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.branch.entityName';

  data: (Branch & { status?: boolean })[] = [];
  loading = false;
  excelLoading = false;
  companies: CompanySelectBoxDto[] = [];
  selectedCompanyCode: string | null = null;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = enumData.PAGE.SORT_FIELD.CREATED_AT;
  sortOrder = enumData.PAGE.SORT_ORDER.DESC;

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
      label: 'organization.branch.code',
      type: 'input',
      placeholder: 'organization.branch.searchCode',
      col: 6,
      allowClear: true,
    },
    {
      key: 'name',
      label: 'organization.branch.name',
      type: 'input',
      placeholder: 'organization.branch.searchName',
      col: 6,
      allowClear: true,
    },
    {
      key: 'companyId',
      label: 'organization.branch.companyName',
      type: 'select',
      placeholder: 'organization.branch.filterCompany',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'isDeleted',
      label: 'organization.branch.status',
      type: 'select',
      placeholder: 'organization.branch.filterStatus',
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
    { field: 'code', header: 'organization.branch.code', type: 'text', sortable: true },
    { field: 'name', header: 'organization.branch.name', type: 'text', sortable: true },
    { field: 'address', header: 'organization.branch.address', type: 'text', sortable: true },
    { field: 'ipAddress', header: 'organization.branch.ipAddress', type: 'text' },
    {
      field: 'companyName',
      header: 'organization.branch.companyName',
      type: 'text',
      sortable: true,
    },
    {
      field: 'managerName',
      header: 'organization.branch.managerName',
      type: 'text',
      sortable: false,
    },
    {
      field: 'isDeleted',
      header: 'organization.branch.status',
      type: 'boolean',
      sortable: true,
      renderBoolean: (value: boolean) =>
        StaticTranslateService.instant(value ? 'common.statusInactive' : 'common.statusActive'),
      badgeSeverity: (value: boolean) => (value ? 'danger' : 'success'),
    },
  ];

  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'organization.branch.viewDetail',
      severity: 'primary',
      onClick: (record) => this.viewDetail(record),
    },
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'organization.branch.edit',
      severity: 'info',
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'organization.branch.activate',
      severity: 'success',
      visible: (record) => record.isDeleted === true,
      onClick: (record) => this.activateBranch(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'organization.branch.deactivate',
      severity: 'danger',
      visible: (record) => record.isDeleted === false,
      onClick: (record) => this.deactivateBranch(record),
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
      this.applyCompanyCodeFilter();
      this.loadData();
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
        if (this.selectedCompanyCode) {
          this.loadData();
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

    if (this.filters['companyId']) {
      payload['companyId'] = this.filters['companyId'];
    }

    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService
      .post<PagedResult<Branch>>(this.apiService.BRANCH.PAGINATION, payload)
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
    this.selectedCompanyCode = null;
    this.filters = { code: '', name: '', companyId: null, isDeleted: null };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { companyCode: null },
      queryParamsHandling: 'merge',
    });
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

  async activateBranch(branch: Branch): Promise<void> {
    if (!branch.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const confirmed = await this.actionConfirm.confirmActivate(this.ENTITY_KEY, branch.name);
    if (!confirmed) return;

    this.apiService.post<boolean>(this.apiService.BRANCH.ACTIVATE, { id: branch.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.activateSuccess(this.ENTITY_KEY, branch.name));
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

  async deactivateBranch(branch: Branch): Promise<void> {
    if (!branch.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const confirmed = await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, branch.name);
    if (!confirmed) return;

    this.apiService.post<boolean>(this.apiService.BRANCH.DEACTIVATE, { id: branch.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.deactivateSuccess(this.ENTITY_KEY, branch.name));
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

  async toggleStatus(branch: Branch): Promise<void> {
    if (branch.isDeleted) {
      await this.activateBranch(branch);
    } else {
      await this.deactivateBranch(branch);
    }
  }

  openCreateModal(): void {
    const queryParams = this.selectedCompanyCode
      ? { companyCode: this.selectedCompanyCode }
      : undefined;
    this.router.navigate(
      [ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.children.ADD_BRANCH.path],
      { queryParams },
    );
  }

  openEdit(branch: Branch): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.children.EDIT_BRANCH.path,
      branch.id,
    ]);
  }

  viewDetail(branch: Branch): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.children.DETAIL_BRANCH.path,
      branch.id,
    ]);
  }

  downloadTemplate(): void {
    this.excelLoading = true;
    this.apiService.postBlob(this.apiService.BRANCH.EXCEL_TEMPLATE).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelTemplateFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          'Mau_Import_Chi_Nhanh.xlsx',
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
    this.apiService.uploadFile<ImportResult>(this.apiService.BRANCH.EXCEL_IMPORT, file).subscribe({
      next: (result) => {
        this.excelLoading = false;
        if (result.errorCount > 0) {
          this.message.warning(
            this.i18n.excelImportPartial(result.successCount, result.totalRows, result.errorCount),
          );
          if (result.errors?.length) {
            console.warn('Branch import errors:', result.errors);
          }
        } else {
          this.message.success(this.i18n.excelImportSuccess(result.successCount, this.ENTITY_KEY));
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
    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService.postBlob(this.apiService.BRANCH.EXCEL_EXPORT, payload).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelExportFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          `Danh_Sach_Chi_Nhanh_${new Date().getTime()}.xlsx`,
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

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((action) => action.key === 'search');
    if (searchAction) {
      searchAction.loading = this.loading;
    }
  }
}
