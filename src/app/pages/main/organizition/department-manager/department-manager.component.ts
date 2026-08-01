import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../core/constants/common/routes.config';
import {
  PaginationConfig,
  RowAction,
  TableColumn,
} from '../../../../shared/components/table-custom/table-custom.types';

interface DepartmentMock {
  id: string;
  code: string;
  name: string;
  branchName: string;
  status: boolean;
  createdAt: string;
}

@Component({
  standalone: false,
  selector: 'app-department-manager',
  templateUrl: './department-manager.component.html',
  styleUrls: [],
})
export class DepartmentManagerComponent implements OnInit {
  data: DepartmentMock[] = [];
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
    { field: 'code', header: 'Mã phòng ban', type: 'text', sortable: true },
    { field: 'name', header: 'Tên phòng ban', type: 'text', sortable: true },
    { field: 'branchName', header: 'Chi nhánh', type: 'text', sortable: true },
    { field: 'status', header: 'Trạng thái', type: 'boolean', sortable: true },
    { field: 'createdAt', header: 'Ngày tạo', type: 'date', sortable: true },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'Sửa phòng ban',
      severity: 'info',
      onClick: (record) =>
        this.router.navigate([
          ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.children.EDIT_DEPARTMENT.path,
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

  private allMockData: DepartmentMock[] = [
    {
      id: '1',
      code: 'PB-HCNS',
      name: 'Phòng Hành chính Nhân sự',
      branchName: 'Trụ sở chính',
      status: true,
      createdAt: '2026-01-10T08:00:00Z',
    },
    {
      id: '2',
      code: 'PB-KT',
      name: 'Phòng Kế toán',
      branchName: 'Trụ sở chính',
      status: true,
      createdAt: '2026-01-12T09:30:00Z',
    },
    {
      id: '3',
      code: 'PB-KT-HN',
      name: 'Phòng Kỹ thuật Hà Nội',
      branchName: 'Chi nhánh Hà Nội',
      status: true,
      createdAt: '2026-02-15T10:00:00Z',
    },
    {
      id: '4',
      code: 'PB-KD-HCM',
      name: 'Phòng Kinh doanh HCM',
      branchName: 'Chi nhánh Hồ Chí Minh',
      status: true,
      createdAt: '2026-02-20T14:00:00Z',
    },
    {
      id: '5',
      code: 'PB-MKT',
      name: 'Phòng Marketing',
      branchName: 'Trụ sở chính',
      status: false,
      createdAt: '2026-03-01T11:00:00Z',
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      let filtered = [...this.allMockData];
      if (this.searchText) {
        const query = this.searchText.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.code.toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query) ||
            item.branchName.toLowerCase().includes(query),
        );
      }

      filtered.sort((a, b) => {
        const valA = (a as any)[this.sortField];
        const valB = (b as any)[this.sortField];
        if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      this.data = filtered;
      this.pagination.total = filtered.length;
      this.loading = false;
      this.cdr.markForCheck();
    }, 300);
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

  toggleStatus(record: DepartmentMock): void {
    record.status = !record.status;
    this.message.success(`Đã ${record.status ? 'kích hoạt' : 'khóa'} phòng ban thành công!`);
    this.loadData();
  }

  openCreateModal(): void {
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.children.ADD_DEPARTMENT.path,
    ]);
  }
}
