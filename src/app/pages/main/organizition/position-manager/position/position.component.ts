import { PERMISSION_CODES } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  DepartmentSelectBoxDto,
  PartSelectBoxDto,
  Position,
  PositionMasterSelectBoxDto,
} from '@/app/core/models';
import { PermissionService } from '@/app/core/services';
import { StaticTranslateService } from '@/app/core/services/static-translate.service';
import { downloadBlob, extractFileName } from '@/app/core/utils/file.util';
import {
  CommonFilterActions,
  FilterAction,
  FilterConfig,
  FilterField,
} from '@/app/shared/components/filter-custom/filter-custom.types';
import { ActionConfirmService } from '@/app/shared/services/action-confirm.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { tap } from 'rxjs';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import { ImportResult, PagedResult } from '../../../../../core/models/common.models';
import { ApiService } from '../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../core/services/i18n-message.service';
import {
  CommonActions,
  PaginationConfig,
  RowAction,
  TableAction,
  TableColumn,
  ToolbarConfig,
} from '../../../../../shared/components/table-custom/table-custom.types';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  standalone: true,
  selector: 'app-position',
  templateUrl: './position.component.html',
  imports: [CommonModule, SharedModule],
  styleUrls: [],
})
export class PositionComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.position.entityName';

  data: (Position & { status?: boolean })[] = [];
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
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_POSITION_CREATE),
    },
    {
      ...CommonActions.uploadExcel({
        templateUrl: () => this.apiService.POSITION.EXCEL_TEMPLATE,
        importUrl: () => this.apiService.POSITION.EXCEL_IMPORT,
        entityName: this.ENTITY_KEY,
        onSuccess: () => this.loadData(),
      }),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_POSITION_IMPORT_EXCEL),
    },
    {
      ...CommonActions.exportExcel(() => this.exportExcel()),
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_POSITION_EXPORT_EXCEL),
    },
  ];

  filters: Record<string, any> = {
    companyId: null,
    branchId: null,
    departmentId: null,
    partId: null,
    positionMasterId: null,
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
      key: 'positionMasterId',
      label: 'organization.position.positionMasterName',
      type: 'select',
      placeholder: 'organization.position.filterPositionMaster',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'companyId',
      label: 'organization.position.companyName',
      type: 'select',
      placeholder: 'organization.position.filterCompany',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'organization.position.branchName',
      type: 'select',
      placeholder: 'organization.position.filterBranch',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'departmentId',
      label: 'organization.position.departmentName',
      type: 'select',
      placeholder: 'organization.position.filterDepartment',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'partId',
      label: 'organization.position.partName',
      type: 'select',
      placeholder: 'organization.position.filterPart',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'isDeleted',
      label: 'organization.position.status',
      type: 'select',
      placeholder: 'organization.position.filterStatus',
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
      field: 'positionMasterName',
      header: 'organization.position.positionMasterName',
      type: 'text',
      sortable: true,
    },
    {
      field: 'departmentName',
      header: 'organization.position.departmentName',
      type: 'text',
      sortable: true,
    },
    {
      field: 'companyName',
      header: 'organization.position.companyName',
      type: 'text',
      sortable: true,
    },
    {
      field: 'quantityStandard',
      header: 'organization.position.quantityStandard',
      type: 'text',
      sortable: true,
    },
    {
      field: 'isDeleted',
      header: 'organization.position.status',
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
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_POSITION_VIEW),
      onClick: (record) => this.viewDetail(record),
    },
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'table.action.edit',
      severity: 'info',
      visible: () => this.permissionSvc.has(PERMISSION_CODES.ORG_POSITION_UPDATE),
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'table.action.activate',
      severity: 'success',
      visible: (record) =>
        record.isDeleted === true && this.permissionSvc.has(PERMISSION_CODES.ORG_POSITION_ACTIVATE),
      onClick: (record) => this.activatePosition(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'table.action.deactivate',
      severity: 'danger',
      visible: (record) =>
        record.isDeleted === false &&
        this.permissionSvc.has(PERMISSION_CODES.ORG_POSITION_DEACTIVATE),
      onClick: (record) => this.deactivatePosition(record),
    },
  ];

  private companies: CompanySelectBoxDto[] = [];
  private branches: BranchSelectBoxDto[] = [];
  private departments: DepartmentSelectBoxDto[] = [];
  private parts: PartSelectBoxDto[] = [];
  private positionMasters: PositionMasterSelectBoxDto[] = [];

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
    this.loadFilterOptions();
    this.loadData();
  }

  loadFilterOptions(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (items) => {
        this.companies = items;
        this.updateFilterOptions('companyId', items);
        this.cdr.markForCheck();
      },
    });

    this.apiService.post<BranchSelectBoxDto[]>(this.apiService.BRANCH.SELECT_BOX, {}).subscribe({
      next: (items) => {
        this.branches = items;
        this.updateFilterOptions('branchId', items);
        this.cdr.markForCheck();
      },
    });

    this.apiService
      .post<DepartmentSelectBoxDto[]>(this.apiService.DEPARTMENT.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          this.departments = items;
          this.updateFilterOptions('departmentId', items);
          this.cdr.markForCheck();
        },
      });

    this.apiService.post<PartSelectBoxDto[]>(this.apiService.PART.SELECT_BOX, {}).subscribe({
      next: (items) => {
        this.parts = items;
        this.updateFilterOptions('partId', items);
        this.cdr.markForCheck();
      },
    });

    this.apiService
      .post<PositionMasterSelectBoxDto[]>(this.apiService.POSITION_MASTER.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          this.positionMasters = items;
          this.updateFilterOptions('positionMasterId', items);
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

    ['companyId', 'branchId', 'departmentId', 'partId', 'positionMasterId'].forEach((key) => {
      if (this.filters[key]) {
        payload[key] = this.filters[key];
      }
    });

    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService
      .post<PagedResult<Position>>(this.apiService.POSITION.PAGINATION, payload)
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
    this.filters = filters;
  }

  onFilterSearch(): void {
    this.pagination.current = 1;
    this.loadData();
  }

  onFilterClear(): void {
    this.filters = {
      companyId: null,
      branchId: null,
      departmentId: null,
      partId: null,
      positionMasterId: null,
      isDeleted: null,
    };
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

  async activatePosition(position: Position): Promise<void> {
    if (!position.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const displayName = this.getDisplayName(position);
    const confirmed = await this.actionConfirm.confirmActivate(this.ENTITY_KEY, displayName);
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.POSITION.ACTIVATE, { id: position.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.activateSuccess(this.ENTITY_KEY, displayName));
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

  async deactivatePosition(position: Position): Promise<void> {
    if (!position.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const displayName = this.getDisplayName(position);
    const confirmed = await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, displayName);
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.POSITION.DEACTIVATE, { id: position.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.deactivateSuccess(this.ENTITY_KEY, displayName));
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

  async toggleStatus(position: Position): Promise<void> {
    if (position.isDeleted) {
      await this.activatePosition(position);
    } else {
      await this.deactivatePosition(position);
    }
  }

  openCreateModal(): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.ADD_POSITION.path,
    ]);
  }

  openEdit(position: Position): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.EDIT_POSITION.path,
      position.id,
    ]);
  }

  viewDetail(position: Position): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.DETAIL_POSITION.path,
      position.id,
    ]);
  }

  downloadTemplate(): void {
    this.excelLoading = true;
    this.apiService.postBlob(this.apiService.POSITION.EXCEL_TEMPLATE).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelTemplateFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          'Mau_Import_Chuc_Vu.xlsx',
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
      .uploadFile<ImportResult>(this.apiService.POSITION.EXCEL_IMPORT, file)
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
              console.warn('Position import errors:', result.errors);
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

  exportExcel() {
    this.excelLoading = true;
    const payload: Record<string, any> = {
      code: (this.filters['code'] || '').trim() || undefined,
      name: (this.filters['name'] || '').trim() || undefined,
    };

    if (this.filters['companyId']) payload['companyId'] = this.filters['companyId'];
    if (this.filters['branchId']) payload['branchId'] = this.filters['branchId'];
    if (this.filters['departmentId']) payload['departmentId'] = this.filters['departmentId'];
    if (this.filters['positionMasterId'])
      payload['positionMasterId'] = this.filters['positionMasterId'];

    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    return this.apiService.postBlob(this.apiService.POSITION.EXCEL_EXPORT, payload).pipe(
      tap({
        next: (response) => {
          this.excelLoading = false;
          const blob = response.body;
          if (!blob) {
            this.message.error(this.i18n.excelExportFailed());
            return;
          }
          const fileName = extractFileName(
            response.headers.get('content-disposition'),
            `Danh_Sach_Chuc_Vu_${new Date().getTime()}.xlsx`,
          );
          downloadBlob(blob, fileName);
          this.message.success(this.i18n.excelExportSuccess());
        },
        error: () => {
          this.excelLoading = false;
          this.message.error(this.i18n.excelExportFailed());
        },
      }),
    );
  }

  private getDisplayName(position: Position): string {
    const parts = [position.positionMasterName, position.departmentName].filter(Boolean);
    return parts.length > 0 ? parts.join(' - ') : position.id;
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
