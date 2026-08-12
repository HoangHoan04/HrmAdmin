import { enumData } from '@/app/core/constants/enums/enumData';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  DepartmentSelectBoxDto,
  Part,
  PartMasterSelectBoxDto,
} from '@/app/core/models';
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
  selector: 'app-part',
  templateUrl: './part.component.html',
  imports: [CommonModule, SharedModule],
  styleUrls: [],
})
export class PartComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.part.entityName';

  data: (Part & { status?: boolean })[] = [];
  loading = false;
  excelLoading = false;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  departments: DepartmentSelectBoxDto[] = [];
  partMasters: PartMasterSelectBoxDto[] = [];

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
    departmentId: null,
    partMasterId: null,
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
      label: 'organization.part.code',
      type: 'input',
      placeholder: 'organization.part.searchCode',
      col: 6,
      allowClear: true,
    },
    {
      key: 'name',
      label: 'organization.part.name',
      type: 'input',
      placeholder: 'organization.part.searchName',
      col: 6,
      allowClear: true,
    },
    {
      key: 'companyId',
      label: 'organization.part.companyName',
      type: 'select',
      placeholder: 'organization.part.filterCompany',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'organization.part.branchName',
      type: 'select',
      placeholder: 'organization.part.filterBranch',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'departmentId',
      label: 'organization.part.departmentName',
      type: 'select',
      placeholder: 'organization.part.filterDepartment',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'partMasterId',
      label: 'organization.part.partMasterName',
      type: 'select',
      placeholder: 'organization.part.filterPartMaster',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'isDeleted',
      label: 'organization.part.status',
      type: 'select',
      placeholder: 'organization.part.filterStatus',
      col: 6,
      allowClear: true,
      options: [
        { label: 'organization.part.statusActive', value: false },
        { label: 'organization.part.statusInactive', value: true },
      ],
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'code', header: 'organization.part.code', type: 'text', sortable: true },
    { field: 'name', header: 'organization.part.name', type: 'text', sortable: true },
    {
      field: 'partMasterName',
      header: 'organization.part.partMasterName',
      type: 'text',
      sortable: true,
    },
    {
      field: 'departmentName',
      header: 'organization.part.departmentName',
      type: 'text',
      sortable: true,
    },
    {
      field: 'companyName',
      header: 'organization.part.companyName',
      type: 'text',
      sortable: true,
    },
    { field: 'branchName', header: 'organization.part.branchName', type: 'text', sortable: true },
    {
      field: 'managerName',
      header: 'organization.part.managerName',
      type: 'text',
      sortable: false,
    },
    { field: 'status', header: 'organization.part.status', type: 'boolean', sortable: true },
  ];

  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'organization.part.viewDetail',
      severity: 'primary',
      onClick: (record) => this.viewDetail(record),
    },
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'organization.part.edit',
      severity: 'info',
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'organization.part.activate',
      severity: 'success',
      visible: (record) => record.isDeleted === true,
      onClick: (record) => this.activatePart(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'organization.part.deactivate',
      severity: 'danger',
      visible: (record) => record.isDeleted === false,
      onClick: (record) => this.deactivatePart(record),
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

  loadDepartments(branchId: string | null): void {
    if (!branchId) {
      this.departments = [];
      this.updateFilterOptions('departmentId', []);
      return;
    }

    this.apiService
      .post<DepartmentSelectBoxDto[]>(this.apiService.DEPARTMENT.SELECT_BOX, { branchId })
      .subscribe({
        next: (items) => {
          this.departments = items;
          this.updateFilterOptions('departmentId', items);
          this.cdr.markForCheck();
        },
      });
  }

  loadPartMasters(companyId: string | null, branchId: string | null): void {
    const payload: Record<string, string> = {};
    if (companyId) payload['companyId'] = companyId;
    if (branchId) payload['branchId'] = branchId;

    this.apiService
      .post<PartMasterSelectBoxDto[]>(this.apiService.PART_MASTER.SELECT_BOX, payload)
      .subscribe({
        next: (items) => {
          this.partMasters = items;
          this.updateFilterOptions('partMasterId', items);
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
    if (this.filters['departmentId']) payload['departmentId'] = this.filters['departmentId'];
    if (this.filters['partMasterId']) payload['partMasterId'] = this.filters['partMasterId'];

    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService.post<PagedResult<Part>>(this.apiService.PART.PAGINATION, payload).subscribe({
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
    const prevBranchId = this.filters['branchId'];

    this.filters = filters;

    if (filters['companyId'] !== prevCompanyId) {
      this.filters = {
        ...filters,
        branchId: null,
        departmentId: null,
        partMasterId: null,
      };
      this.loadBranches(filters['companyId']);
      this.loadDepartments(null);
      this.loadPartMasters(filters['companyId'], null);
      return;
    }

    if (filters['branchId'] !== prevBranchId) {
      this.filters = {
        ...filters,
        departmentId: null,
      };
      this.loadDepartments(filters['branchId']);
      this.loadPartMasters(filters['companyId'], filters['branchId']);
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
      departmentId: null,
      partMasterId: null,
      isDeleted: null,
    };
    this.branches = [];
    this.departments = [];
    this.partMasters = [];
    this.updateFilterOptions('branchId', []);
    this.updateFilterOptions('departmentId', []);
    this.updateFilterOptions('partMasterId', []);
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

  async activatePart(part: Part): Promise<void> {
    if (!part.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const confirmed = await this.actionConfirm.confirmActivate(this.ENTITY_KEY, part.name);
    if (!confirmed) return;

    this.apiService.post<boolean>(this.apiService.PART.ACTIVATE, { id: part.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.activateSuccess(this.ENTITY_KEY, part.name));
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

  async deactivatePart(part: Part): Promise<void> {
    if (!part.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const confirmed = await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, part.name);
    if (!confirmed) return;

    this.apiService.post<boolean>(this.apiService.PART.DEACTIVATE, { id: part.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.deactivateSuccess(this.ENTITY_KEY, part.name));
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

  async toggleStatus(part: Part): Promise<void> {
    if (part.isDeleted) {
      await this.activatePart(part);
    } else {
      await this.deactivatePart(part);
    }
  }
  openCreateModal(): void {
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.ADD_PART.path]);
  }

  openEdit(part: Part): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.EDIT_PART.path,
      part.id,
    ]);
  }

  viewDetail(part: Part): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.DETAIL_PART.path,
      part.id,
    ]);
  }

  downloadTemplate(): void {
    this.excelLoading = true;
    this.apiService.postBlob(this.apiService.PART.EXCEL_TEMPLATE).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelTemplateFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          'Mau_Import_To_Nhom.xlsx',
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
    this.apiService.uploadFile<ImportResult>(this.apiService.PART.EXCEL_IMPORT, file).subscribe({
      next: (result) => {
        this.excelLoading = false;
        if (result.errorCount > 0) {
          this.message.warning(
            this.i18n.excelImportPartial(result.successCount, result.totalRows, result.errorCount),
          );
          if (result.errors?.length) {
            console.warn('Part import errors:', result.errors);
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

    if (this.filters['companyId']) payload['companyId'] = this.filters['companyId'];
    if (this.filters['branchId']) payload['branchId'] = this.filters['branchId'];
    if (this.filters['departmentId']) payload['departmentId'] = this.filters['departmentId'];
    if (this.filters['partMasterId']) payload['partMasterId'] = this.filters['partMasterId'];

    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService.postBlob(this.apiService.PART.EXCEL_EXPORT, payload).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelExportFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          `Danh_Sach_Bo_Phan_${new Date().getTime()}.xlsx`,
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
