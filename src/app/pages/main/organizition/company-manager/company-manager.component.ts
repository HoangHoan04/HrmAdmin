import { PERMISSION_CODES } from '@/app/core/constants/common/permission-codes';
import { enumData } from '@/app/core/constants/enums/enumData';
import { Company } from '@/app/core/models/organization/company.models';
import { PermissionService } from '@/app/core/services/permission.service';
import { StaticTranslateService } from '@/app/core/services/static-translate.service';
import { ActionConfirmService } from '@/app/shared/services/action-confirm.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../core/constants/common/routes.config';
import { ImportResult, PagedResult } from '../../../../core/models/common.models';
import { ApiService } from '../../../../core/services/api.service';
import { I18nMessageService } from '../../../../core/services/i18n-message.service';
import { downloadBlob, extractFileName } from '../../../../core/utils/file.util';
import {
  CommonFilterActions,
  FilterAction,
  FilterConfig,
  FilterField,
} from '../../../../shared/components/filter-custom/filter-custom.types';
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
  selector: 'app-company-manager',
  templateUrl: './company-manager.component.html',
  styleUrls: ['./company-manager.component.scss'],
})
export class CompanyManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.company.entityName';

  data: (Company & { status?: boolean })[] = [];
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

  toolbar: ToolbarConfig = {
    show: true,
  };

  toolbarActions: TableAction[] = [
    {
      ...CommonActions.create(() => this.openCreateModal()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_COMPANY_CREATE),
    },
    {
      ...CommonActions.uploadExcel(
        () => this.downloadTemplate(),
        (file) => this.uploadFile(file),
      ),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_COMPANY_IMPORT_EXCEL),
    },
    {
      ...CommonActions.exportExcel(() => this.exportExcel()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_COMPANY_EXPORT_EXCEL),
    },
  ];

  filters: Record<string, any> = {
    code: '',
    name: '',
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
      label: 'organization.company.code',
      type: 'input',
      placeholder: 'organization.company.searchCode',
      col: 8,
      allowClear: true,
    },
    {
      key: 'name',
      label: 'organization.company.name',
      type: 'input',
      placeholder: 'organization.company.searchName',
      col: 8,
      allowClear: true,
    },
    {
      key: 'isDeleted',
      label: 'organization.company.status',
      type: 'select',
      placeholder: 'organization.company.filterStatus',
      col: 8,
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
    { field: 'code', header: 'organization.company.code', type: 'text', sortable: true },
    { field: 'name', header: 'organization.company.name', type: 'text', sortable: true },
    { field: 'address', header: 'organization.company.address', type: 'text', sortable: true },
    { field: 'hotline', header: 'organization.company.hotline', type: 'text' },
    { field: 'taxCode', header: 'organization.company.taxCode', type: 'text' },
    {
      field: 'isDeleted',
      header: 'organization.company.status',
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
      tooltip: 'organization.company.viewDetail',
      severity: 'primary',
      onClick: (record) => this.viewDetail(record),
    },
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'organization.company.edit',
      severity: 'info',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_COMPANY_UPDATE),
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'organization.company.activate',
      severity: 'success',
      visible: (record) =>
        record.isDeleted === true && this.permissionSvc.has(PERMISSION_CODES.ORG_COMPANY_ACTIVATE),
      onClick: (record) => this.activateCompany(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'organization.company.deactivate',
      severity: 'danger',
      visible: (record) =>
        record.isDeleted === false &&
        this.permissionSvc.has(PERMISSION_CODES.ORG_COMPANY_DEACTIVATE),
      onClick: (record) => this.deactivateCompany(record),
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
    this.loadData();
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

    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService
      .post<PagedResult<Company>>(this.apiService.COMPANY.PAGINATION, payload)
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
    this.filters = { code: '', name: '', isDeleted: null };
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

  async activateCompany(company: Company): Promise<void> {
    if (!company.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const confirmed = await this.actionConfirm.confirmActivate(this.ENTITY_KEY, company.name);
    if (!confirmed) return;

    this.apiService.post<boolean>(this.apiService.COMPANY.ACTIVATE, { id: company.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.activateSuccess(this.ENTITY_KEY, company.name));
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

  async deactivateCompany(company: Company): Promise<void> {
    if (!company.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const confirmed = await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, company.name);
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.COMPANY.DEACTIVATE, { id: company.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.deactivateSuccess(this.ENTITY_KEY, company.name));
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

  async toggleStatus(company: Company): Promise<void> {
    if (company.isDeleted) {
      await this.activateCompany(company);
    } else {
      await this.deactivateCompany(company);
    }
  }

  openCreateModal(): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.COMPANY_MANAGER.children.ADD_COMPANY.path,
    ]);
  }

  openEdit(company: Company): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.COMPANY_MANAGER.children.EDIT_COMPANY.path,
      company.id,
    ]);
  }

  viewDetail(company: Company): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.COMPANY_MANAGER.children.DETAIL_COMPANY.path,
      company.id,
    ]);
  }

  downloadTemplate(): void {
    this.excelLoading = true;
    this.apiService.postBlob(this.apiService.COMPANY.EXCEL_TEMPLATE).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelTemplateFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          'Mau_Import_Cong_Ty.xlsx',
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
    this.apiService.uploadFile<ImportResult>(this.apiService.COMPANY.EXCEL_IMPORT, file).subscribe({
      next: (result) => {
        this.excelLoading = false;
        if (result.errorCount > 0) {
          this.message.warning(
            this.i18n.excelImportPartial(result.successCount, result.totalRows, result.errorCount),
          );
          if (result.errors?.length) {
            console.warn('Company import errors:', result.errors);
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

    this.apiService.postBlob(this.apiService.COMPANY.EXCEL_EXPORT, payload).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelExportFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          `Danh_Sach_Cong_Ty_${new Date().getTime()}.xlsx`,
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

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((action) => action.key === 'search');
    if (searchAction) {
      searchAction.loading = this.loading;
    }
  }
}
