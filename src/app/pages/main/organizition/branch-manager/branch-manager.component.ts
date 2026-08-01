import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../core/constants/common/routes.config';
import { PagedResult } from '../../../../core/models/common.models';
import { Branch } from '../../../../core/models/organization.models';
import { ApiService } from '../../../../core/services/api.service';
import {
  CommonActions,
  PaginationConfig,
  RowAction,
  TableAction,
  TableColumn,
} from '../../../../shared/components/table-custom/table-custom.types';

@Component({
  standalone: false,
  selector: 'app-branch-manager',
  templateUrl: './branch-manager.component.html',
  styleUrls: ['./branch-manager.component.scss'],
})
export class BranchManagerComponent implements OnInit {
  data: (Branch & { status?: boolean })[] = [];
  loading = false;

  pagination: PaginationConfig = {
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
  };

  searchText = '';
  sortField = 'createdAt';
  sortOrder = 'desc';

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
    { field: 'status', header: 'organization.branch.status', type: 'boolean', sortable: true },
    { field: 'createdAt', header: 'organization.branch.createdAt', type: 'date', sortable: true },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'Sửa chi nhánh',
      severity: 'info',
      onClick: (record) =>
        this.router.navigate([
          ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.children.EDIT_BRANCH.path,
          record.id,
        ]),
    },
    {
      key: 'toggleStatus',
      icon: 'sync',
      tooltip: 'Kích hoạt / Khóa',
      severity: 'warning',
      onClick: (record) => this.toggleStatus(record),
    },
  ];

  toolbarActions: TableAction[] = [
    CommonActions.create(() => this.openCreateModal()),
    CommonActions.uploadExcel(
      () => this.downloadTemplate(),
      (file) => this.uploadFile(file),
    ),
    CommonActions.exportExcel(() => this.exportExcel()),
  ];

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService
      .post<PagedResult<Branch>>(this.apiService.BRANCH.PAGINATION, {
        pageIndex: this.pagination.current,
        pageSize: this.pagination.pageSize,
        searchText: this.searchText,
        sortField: this.sortField,
        sortOrder: this.sortOrder,
      })
      .subscribe({
        next: (res) => {
          this.data = res.items.map((item) => ({
            ...item,
            status: !item.isDeleted,
          }));
          this.pagination.total = res.totalCount;
          this.loading = false;
        },
        error: (err: any) => {
          this.message.error(err.error || 'Không thể tải danh sách chi nhánh.');
          this.loading = false;
        },
      });
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

  toggleStatus(branch: Branch): void {
    if (!branch.id) return;
    this.loading = true;

    const endpoint = branch.isDeleted
      ? this.apiService.BRANCH.ACTIVATE
      : this.apiService.BRANCH.DEACTIVATE;

    this.apiService.post<boolean>(endpoint, { id: branch.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(
            branch.isDeleted
              ? 'Kích hoạt hoạt động chi nhánh thành công!'
              : 'Khóa hoạt động chi nhánh thành công!',
          );
          this.loadData();
        } else {
          this.message.error('Không thể thay đổi trạng thái.');
          this.loading = false;
        }
      },
      error: (err: any) => {
        this.message.error(err.error || 'Có lỗi xảy ra.');
        this.loading = false;
      },
    });
  }

  openCreateModal(): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.children.ADD_BRANCH.path,
    ]);
  }

  downloadTemplate(): void {
    this.message.info('Tải file mẫu Excel chi nhánh...');
  }

  uploadFile(file: File): void {
    this.message.success(`Đang tải file Excel lên: ${file.name}`);
  }

  exportExcel(): void {
    this.message.info('Xuất file Excel chi nhánh...');
  }
}
