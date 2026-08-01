import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { enumData } from 'src/app/core/constants/enums/enumData';
import { ROUTES_CONFIG } from '../../../../core/constants/common/routes.config';
import { PagedResult } from '../../../../core/models/common.models';
import { Company, CompanyImportResult } from '../../../../core/models/organization.models';
import { ApiService } from '../../../../core/services/api.service';
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
import { ActionConfirmService } from 'src/app/shared/services/action-confirm.service';

@Component({
  standalone: false,
  selector: 'app-company-manager',
  templateUrl: './company-manager.component.html',
  styleUrls: ['./company-manager.component.scss'],
})
export class CompanyManagerComponent implements OnInit {
  data: (Company & { status?: boolean })[] = [];
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
      options: [
        { label: 'organization.company.statusActive', value: false },
        { label: 'organization.company.statusInactive', value: true },
      ],
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
    { field: 'status', header: 'organization.company.status', type: 'boolean', sortable: true },
    { field: 'createdAt', header: 'organization.company.createdAt', type: 'date', sortable: true },
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
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'toggleStatus',
      icon: 'sync',
      tooltip: 'organization.company.toggleStatus',
      severity: 'warning',
      onClick: (record) => this.toggleStatus(record),
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
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
          this.message.error(err.error || 'Không thể tải danh sách doanh nghiệp.');
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

  async toggleStatus(company: Company): Promise<void> {
    if (!company.id) return;

    const confirmed = company.isDeleted
      ? await this.actionConfirm.confirmActivate('công ty', company.name)
      : await this.actionConfirm.confirmDeactivate('công ty', company.name);

    if (!confirmed) return;

    const endpoint = company.isDeleted
      ? this.apiService.COMPANY.ACTIVATE
      : this.apiService.COMPANY.DEACTIVATE;

    this.apiService.post<boolean>(endpoint, { id: company.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(
            company.isDeleted
              ? 'Kích hoạt hoạt động công ty thành công!'
              : 'Ngưng hoạt động công ty thành công!',
          );
          this.loadData();
        } else {
          this.message.error('Không thể thay đổi trạng thái.');
        }
      },
      error: (err: any) => {
        this.message.error(err.error || 'Có lỗi xảy ra.');
      },
    });
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
          this.message.error('Không thể tải file mẫu Excel.');
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          'Mau_Import_Cong_Ty.xlsx',
        );
        downloadBlob(blob, fileName);
        this.message.success('Tải file mẫu Excel thành công!');
        this.excelLoading = false;
      },
      error: () => {
        this.message.error('Không thể tải file mẫu Excel.');
        this.excelLoading = false;
      },
    });
  }

  uploadFile(file: File): void {
    this.excelLoading = true;
    this.apiService
      .uploadFile<CompanyImportResult>(this.apiService.COMPANY.EXCEL_IMPORT, file)
      .subscribe({
        next: (result) => {
          this.excelLoading = false;
          if (result.errorCount > 0) {
            this.message.warning(
              `Import hoàn tất: ${result.successCount}/${result.totalRows} thành công. ${result.errorCount} lỗi.`,
            );
            if (result.errors?.length) {
              console.warn('Company import errors:', result.errors);
            }
          } else {
            this.message.success(`Import Excel thành công ${result.successCount} công ty!`);
          }
          this.loadData();
        },
        error: (err: any) => {
          this.excelLoading = false;
          this.message.error(err.error || 'Import Excel thất bại.');
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
          this.message.error('Không thể xuất file Excel.');
          this.excelLoading = false;
          return;
        }
        const fileName = extractFileName(
          response.headers.get('content-disposition'),
          `Danh_Sach_Cong_Ty_${new Date().getTime()}.xlsx`,
        );
        downloadBlob(blob, fileName);
        this.message.success('Xuất Excel thành công!');
        this.excelLoading = false;
      },
      error: () => {
        this.message.error('Không thể xuất file Excel.');
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
