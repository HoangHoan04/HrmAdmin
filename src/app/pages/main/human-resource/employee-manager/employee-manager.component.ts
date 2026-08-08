import { enumData } from '@/app/core/constants/enums/enumData';
import { Employee } from '@/app/core/models/human-resource/employee.models';
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
  selector: 'app-employee-manager',
  templateUrl: './employee-manager.component.html',
  styleUrls: ['./employee-manager.component.scss'],
})
export class EmployeeManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'humanResource.employee.entityName';

  data: (Employee & { activeStatus?: boolean })[] = [];
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
    fullName: '',
    phone: '',
    status: null,
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
      label: 'humanResource.employee.code',
      type: 'input',
      placeholder: 'humanResource.employee.searchCode',
      col: 8,
      allowClear: true,
    },
    {
      key: 'fullName',
      label: 'humanResource.employee.fullName',
      type: 'input',
      placeholder: 'humanResource.employee.searchFullName',
      col: 8,
      allowClear: true,
    },
    {
      key: 'phone',
      label: 'humanResource.employee.phone',
      type: 'input',
      placeholder: 'humanResource.employee.searchPhone',
      col: 8,
      allowClear: true,
    },
    {
      key: 'status',
      label: 'humanResource.employee.status',
      type: 'select',
      placeholder: 'humanResource.employee.filterStatus',
      col: 8,
      allowClear: true,
      options: [
        { label: 'humanResource.employee.statusWorking', value: 'Đang làm việc' },
        { label: 'humanResource.employee.statusResigned', value: 'Nghỉ việc' },
        { label: 'humanResource.employee.statusOnLeave', value: 'Tạm nghỉ' },
      ],
    },
    {
      key: 'isDeleted',
      label: 'humanResource.employee.recordStatus',
      type: 'select',
      placeholder: 'humanResource.employee.filterRecordStatus',
      col: 8,
      allowClear: true,
      options: [
        { label: 'humanResource.employee.statusActive', value: false },
        { label: 'humanResource.employee.statusInactive', value: true },
      ],
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'code', header: 'humanResource.employee.code', type: 'text', sortable: true },
    { field: 'fullName', header: 'humanResource.employee.fullName', type: 'text', sortable: true },
    { field: 'phone', header: 'humanResource.employee.phone', type: 'text', sortable: true },
    { field: 'email', header: 'humanResource.employee.email', type: 'text', sortable: true },
    { field: 'status', header: 'humanResource.employee.status', type: 'text', sortable: true },
    { field: 'joinDate', header: 'humanResource.employee.joinDate', type: 'date', sortable: true },
    {
      field: 'activeStatus',
      header: 'humanResource.employee.recordStatus',
      type: 'boolean',
      sortable: true,
    },
    {
      field: 'createdAt',
      header: 'humanResource.employee.createdAt',
      type: 'date',
      sortable: true,
    },
  ];

  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'humanResource.employee.viewDetail',
      severity: 'primary',
      onClick: (record) => this.viewDetail(record),
    },
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'humanResource.employee.edit',
      severity: 'info',
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'activate',
      icon: 'check-circle',
      tooltip: 'humanResource.employee.activate',
      severity: 'success',
      visible: (record) => record.isDeleted === true,
      onClick: (record) => this.activateEmployee(record),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'humanResource.employee.deactivate',
      severity: 'danger',
      visible: (record) => record.isDeleted === false,
      onClick: (record) => this.deactivateEmployee(record),
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
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.syncFilterActionsLoading();
    this.cdr.markForCheck();

    const payload: Record<string, any> = {
      pageIndex: this.pagination.current,
      pageSize: this.pagination.pageSize,
      sortField: this.sortField === 'activeStatus' ? 'isDeleted' : this.sortField,
      sortOrder: this.sortOrder,
      code: (this.filters['code'] || '').trim() || undefined,
      fullName: (this.filters['fullName'] || '').trim() || undefined,
      phone: (this.filters['phone'] || '').trim() || undefined,
      status: this.filters['status'] || undefined,
    };

    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService
      .post<PagedResult<Employee>>(this.apiService.EMPLOYEE.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items.map((item) => ({
            ...item,
            activeStatus: !item.isDeleted,
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
    this.filters = { code: '', fullName: '', phone: '', status: null, isDeleted: null };
    this.pagination.current = 1;
    this.loadData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.current = event.page;
    this.pagination.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(event: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    const field = event.sortField || 'createdAt';
    this.sortField = field === 'activeStatus' ? 'isDeleted' : field;
    this.sortOrder = event.sortOrder === 1 ? 'asc' : event.sortOrder === -1 ? 'desc' : 'desc';
    this.loadData();
  }

  async activateEmployee(employee: Employee): Promise<void> {
    if (!employee.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const displayName = employee.fullName || employee.code;
    const confirmed = await this.actionConfirm.confirmActivate(this.ENTITY_KEY, displayName);
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.EMPLOYEE.ACTIVATE, { id: employee.id })
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

  async deactivateEmployee(employee: Employee): Promise<void> {
    if (!employee.id) {
      this.message.error(this.i18n.entityNotFound(this.ENTITY_KEY));
      return;
    }

    const displayName = employee.fullName || employee.code;
    const confirmed = await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, displayName);
    if (!confirmed) return;

    this.apiService
      .post<boolean>(this.apiService.EMPLOYEE.DEACTIVATE, { id: employee.id })
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

  openCreateModal(): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.ADD_EMPLOYEE.path,
    ]);
  }

  openEdit(employee: Employee): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.EDIT_EMPLOYEE.path,
      employee.id,
    ]);
  }

  viewDetail(employee: Employee): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.DETAIL_EMPLOYEE.path,
      employee.id,
    ]);
  }

  downloadTemplate(): void {
    this.excelLoading = true;
    this.apiService.postBlob(this.apiService.EMPLOYEE.EXCEL_TEMPLATE).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelTemplateFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          'Mau_Import_Nhan_Vien.xlsx',
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
      .uploadFile<ImportResult>(this.apiService.EMPLOYEE.EXCEL_IMPORT, file)
      .subscribe({
        next: (result) => {
          this.excelLoading = false;
          if (result.errorCount > 0) {
            this.message.warning(
              this.i18n.excelImportPartial(result.successCount, result.totalRows, result.errorCount),
            );
            if (result.errors?.length) {
              console.warn('Employee import errors:', result.errors);
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
      fullName: (this.filters['fullName'] || '').trim() || undefined,
      phone: (this.filters['phone'] || '').trim() || undefined,
      status: this.filters['status'] || undefined,
    };
    if (this.filters['isDeleted'] !== null && this.filters['isDeleted'] !== undefined) {
      payload['isDeleted'] = this.filters['isDeleted'];
    }

    this.apiService.postBlob(this.apiService.EMPLOYEE.EXCEL_EXPORT, payload).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.message.error(this.i18n.excelExportFailed());
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          `Danh_Sach_Nhan_Vien_${new Date().getTime()}.xlsx`,
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
