import { enumData } from '@/app/core/constants/enums/enumData';
import { BranchSelectBoxDto, CompanySelectBoxDto, PositionMaster } from '@/app/core/models';
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
  selector: 'app-position-master',
  templateUrl: './position-master.component.html',
  imports: [CommonModule, SharedModule],
  styleUrls: [],
})
export class PositionMasterComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.position.positionMaster.entityName';

  data: (PositionMaster & { status?: boolean })[] = [];
  loading = false;
  excelLoading = false;

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
      label: 'organization.positionMaster.code',
      type: 'input',
      placeholder: 'organization.positionMaster.searchCode',
      col: 6,
      allowClear: true,
    },
    {
      key: 'name',
      label: 'organization.positionMaster.name',
      type: 'input',
      placeholder: 'organization.positionMaster.searchName',
      col: 6,
      allowClear: true,
    },
    {
      key: 'companyId',
      label: 'organization.positionMaster.companyName',
      type: 'select',
      placeholder: 'organization.positionMaster.filterCompany',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'organization.positionMaster.branchName',
      type: 'select',
      placeholder: 'organization.positionMaster.filterBranch',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'isDeleted',
      label: 'organization.positionMaster.status',
      type: 'select',
      placeholder: 'organization.positionMaster.filterStatus',
      col: 6,
      allowClear: true,
      options: [
        { label: 'organization.positionMaster.statusActive', value: false },
        { label: 'organization.positionMaster.statusInactive', value: true },
      ],
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'code', header: 'organization.positionMaster.code', type: 'text', sortable: true },
    { field: 'name', header: 'organization.positionMaster.name', type: 'text', sortable: true },
    {
      field: 'companyName',
      header: 'organization.positionMaster.companyName',
      type: 'text',
      sortable: true,
    },
    {
      field: 'branchName',
      header: 'organization.positionMaster.branchName',
      type: 'text',
      sortable: true,
    },
    {
      field: 'quantityStandard',
      header: 'organization.positionMaster.quantityStandard',
      type: 'text',
      sortable: true,
    },
    {
      field: 'status',
      header: 'organization.positionMaster.status',
      type: 'boolean',
      sortable: true,
    },
    {
      field: 'createdAt',
      header: 'organization.positionMaster.createdAt',
      type: 'date',
      sortable: true,
    },
  ];

  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'organization.positionMaster.viewDetail',
      severity: 'primary',
      onClick: (record) => this.viewDetail(record),
    },
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'organization.positionMaster.edit',
      severity: 'info',
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'organization.positionMaster.activate',
      severity: 'success',
      visible: (record) => record.isDeleted === true,
      onClick: (record) => this.activatePositionMaster(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'organization.positionMaster.deactivate',
      severity: 'danger',
      visible: (record) => record.isDeleted === false,
      onClick: (record) => this.deactivatePositionMaster(record),
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
    this.loadFilterOptions();
    this.loadData();
  }

  loadFilterOptions(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (items) => {
        const companyField = this.filterFields.find((field) => field.key === 'companyId');
        if (companyField) {
          companyField.options = items.map((item) => ({
            label: item.code ? `${item.code} - ${item.name}` : item.name,
            value: item.id,
          }));
        }
        this.cdr.markForCheck();
      },
    });

    this.apiService.post<BranchSelectBoxDto[]>(this.apiService.BRANCH.SELECT_BOX, {}).subscribe({
      next: (items) => {
        const branchField = this.filterFields.find((field) => field.key === 'branchId');
        if (branchField) {
          branchField.options = items.map((item) => ({
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
      .post<PagedResult<PositionMaster>>(this.apiService.POSITION_MASTER.PAGINATION, payload)
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
      code: '',
      name: '',
      companyId: null,
      branchId: null,
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

  async activatePositionMaster(positionMaster: PositionMaster): Promise<void> {
    if (!positionMaster.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const confirmed = await this.actionConfirm.confirmActivate(
      'danh mục chức vụ',
      positionMaster.name,
    );
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.POSITION_MASTER.ACTIVATE, { id: positionMaster.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.activateSuccess(this.ENTITY_KEY, positionMaster.name));
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

  async deactivatePositionMaster(positionMaster: PositionMaster): Promise<void> {
    if (!positionMaster.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const confirmed = await this.actionConfirm.confirmDeactivate(
      'danh mục chức vụ',
      positionMaster.name,
    );
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.POSITION_MASTER.DEACTIVATE, { id: positionMaster.id })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(
              this.i18n.deactivateSuccess(this.ENTITY_KEY, positionMaster.name),
            );
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

  async toggleStatus(positionMaster: PositionMaster): Promise<void> {
    if (positionMaster.isDeleted) {
      await this.activatePositionMaster(positionMaster);
    } else {
      await this.deactivatePositionMaster(positionMaster);
    }
  }

  openCreateModal(): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.ADD_POSITION_MASTER.path,
    ]);
  }

  openEdit(positionMaster: PositionMaster): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.EDIT_POSITION_MASTER.path,
      positionMaster.id,
    ]);
  }

  viewDetail(positionMaster: PositionMaster): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.DETAIL_POSITION_MASTER.path,
      positionMaster.id,
    ]);
  }

  downloadTemplate(): void {
    this.excelLoading = true;
    this.apiService.postBlob(this.apiService.POSITION_MASTER.EXCEL_TEMPLATE).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelTemplateFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          'Mau_Import_Danh_Muc_Chuc_Vu.xlsx',
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
      .uploadFile<ImportResult>(this.apiService.POSITION_MASTER.EXCEL_IMPORT, file)
      .subscribe({
        next: (result) => {
          this.excelLoading = false;
          if (result.errorCount > 0) {
            this.message.warning(this.i18n.excelImportPartial(result.successCount, result.totalRows, result.errorCount));
            if (result.errors?.length) {
              console.warn('Position master import errors:', result.errors);
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

    this.apiService.postBlob(this.apiService.POSITION_MASTER.EXCEL_EXPORT, payload).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelExportFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          `Danh_Sach_Danh_Muc_Chuc_Vu_${new Date().getTime()}.xlsx`,
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
