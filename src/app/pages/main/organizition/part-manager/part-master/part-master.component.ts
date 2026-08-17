import { PERMISSION_CODES } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import { BranchSelectBoxDto, CompanySelectBoxDto, PartMaster } from '@/app/core/models';
import { PermissionService } from '@/app/core/services';
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
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import { ImportResult, PagedResult } from '../../../../../core/models/common.models';
import { ApiService } from '../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../core/services/i18n-message.service';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  standalone: true,
  selector: 'app-part-master',
  templateUrl: './part-master.component.html',
  imports: [CommonModule, SharedModule],
  styleUrls: [],
})
export class PartMasterComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.part.partMaster.entityName';

  data: (PartMaster & { status?: boolean })[] = [];
  loading = false;
  excelLoading = false;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];

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
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_PART_MASTER_CREATE),
    },
    {
      ...CommonActions.uploadExcel(
        () => this.downloadTemplate(),
        (file) => this.uploadFile(file),
      ),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_PART_MASTER_IMPORT_EXCEL),
    },
    {
      ...CommonActions.exportExcel(() => this.exportExcel()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_PART_MASTER_EXPORT_EXCEL),
    },
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
      label: 'organization.partMaster.code',
      type: 'input',
      placeholder: 'organization.partMaster.searchCode',
      col: 6,
      allowClear: true,
    },
    {
      key: 'name',
      label: 'organization.partMaster.name',
      type: 'input',
      placeholder: 'organization.partMaster.searchName',
      col: 6,
      allowClear: true,
    },
    {
      key: 'companyId',
      label: 'organization.partMaster.companyName',
      type: 'select',
      placeholder: 'organization.partMaster.filterCompany',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'organization.partMaster.branchName',
      type: 'select',
      placeholder: 'organization.partMaster.filterBranch',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'isDeleted',
      label: 'organization.partMaster.status',
      type: 'select',
      placeholder: 'organization.partMaster.filterStatus',
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
    { field: 'code', header: 'organization.partMaster.code', type: 'text', sortable: true },
    { field: 'name', header: 'organization.partMaster.name', type: 'text', sortable: true },
    {
      field: 'companyName',
      header: 'organization.partMaster.companyName',
      type: 'text',
      sortable: true,
    },
    {
      field: 'branchName',
      header: 'organization.partMaster.branchName',
      type: 'text',
      sortable: true,
    },
    { field: 'type', header: 'organization.partMaster.type', type: 'text', sortable: true },
    {
      field: 'isDeleted',
      header: 'organization.partMaster.status',
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
      tooltip: 'table.action.viewDetail',
      severity: 'primary',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_PART_MASTER_VIEW),
      onClick: (record) => this.viewDetail(record),
    },
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'table.action.edit',
      severity: 'info',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_PART_MASTER_UPDATE),
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'table.action.activate',
      severity: 'success',
      visible: (record) =>
        record.isDeleted === true &&
        this.permissionSvc.has(PERMISSION_CODES.ORG_PART_MASTER_ACTIVATE),
      onClick: (record) => this.activatePartMaster(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'table.action.deactivate',
      severity: 'danger',
      visible: (record) =>
        record.isDeleted === false &&
        this.permissionSvc.has(PERMISSION_CODES.ORG_PART_MASTER_DEACTIVATE),
      onClick: (record) => this.deactivatePartMaster(record),
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
        this.companies = items;
        this.updateFilterOptions('companyId', items);
        this.cdr.markForCheck();
      },
    });
  }

  loadBranches(companyId: string | null): void {
    if (!companyId) {
      this.branches = [];
      this.updateFilterOptions('branchId', []);
      return;
    }

    this.apiService
      .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.SELECT_BOX, { companyId })
      .subscribe({
        next: (items) => {
          this.branches = items;
          this.updateFilterOptions('branchId', items);
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
    if (this.filters['branchId']) payload['branchId'] = this.filters['branchId'];

    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService
      .post<PagedResult<PartMaster>>(this.apiService.PART_MASTER.PAGINATION, payload)
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
      this.filters = { ...filters, branchId: null };
      this.loadBranches(filters['companyId']);
    }
  }

  onFilterSearch(): void {
    this.pagination.current = 1;
    this.loadData();
  }

  onFilterClear(): void {
    this.filters = {
      code: '',
      name: '',
      companyId: null,
      branchId: null,
      isDeleted: null,
    };
    this.branches = [];
    this.updateFilterOptions('branchId', []);
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

  async activatePartMaster(partMaster: PartMaster): Promise<void> {
    if (!partMaster.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const confirmed = await this.actionConfirm.confirmActivate(this.ENTITY_KEY, partMaster.name);
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.PART_MASTER.ACTIVATE, { id: partMaster.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.activateSuccess(this.ENTITY_KEY, partMaster.name));
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

  async deactivatePartMaster(partMaster: PartMaster): Promise<void> {
    if (!partMaster.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const confirmed = await this.actionConfirm.confirmDeactivate(
      'danh mục bộ phận',
      partMaster.name,
    );
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.PART_MASTER.DEACTIVATE, { id: partMaster.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.deactivateSuccess(this.ENTITY_KEY, partMaster.name));
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

  async toggleStatus(partMaster: PartMaster): Promise<void> {
    if (partMaster.isDeleted) {
      await this.activatePartMaster(partMaster);
    } else {
      await this.deactivatePartMaster(partMaster);
    }
  }

  openCreateModal(): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.ADD_PART_MASTER.path,
    ]);
  }

  openEdit(partMaster: PartMaster): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.EDIT_PART_MASTER.path,
      partMaster.id,
    ]);
  }

  viewDetail(partMaster: PartMaster): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.DETAIL_PART_MASTER.path,
      partMaster.id,
    ]);
  }

  downloadTemplate(): void {
    this.excelLoading = true;
    this.apiService.postBlob(this.apiService.PART_MASTER.EXCEL_TEMPLATE).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelTemplateFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          'Mau_Import_Mau_To_Nhom.xlsx',
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
      .uploadFile<ImportResult>(this.apiService.PART_MASTER.EXCEL_IMPORT, file)
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
              console.warn('PartMaster import errors:', result.errors);
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

    if (this.filters['companyId']) payload['companyId'] = this.filters['companyId'];
    if (this.filters['branchId']) payload['branchId'] = this.filters['branchId'];

    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService.postBlob(this.apiService.PART_MASTER.EXCEL_EXPORT, payload).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelExportFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          `Danh_Sach_Danh_Muc_Bo_Phan_${new Date().getTime()}.xlsx`,
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

  private updateFilterOptions(
    key: string,
    items: { id: string; name: string; code?: string }[],
  ): void {
    const field = this.filterFields.find((item) => item.key === key);
    if (field) {
      field.options = items.map((item) => ({
        label: item.code ? `${item.code} - ${item.name}` : item.name,
        value: item.id,
      }));
    }
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((action) => action.key === 'search');
    if (searchAction) {
      searchAction.loading = this.loading;
    }
  }
}
