import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import {
  PaginationConfig,
  RowAction,
  TableColumn,
} from '../../../../../shared/components/table-custom/table-custom.types';
import { SharedModule } from '../../../../../shared/shared.module';

interface PartMock {
  id: string;
  code: string;
  name: string;
  departmentName: string;
  status: boolean;
  createdAt: string;
}

@Component({
  standalone: true,
  selector: 'app-part',
  templateUrl: './part.component.html',
  imports: [CommonModule, SharedModule],
  styleUrls: [],
})
export class PartComponent implements OnInit {
  data: PartMock[] = [];
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
    { field: 'code', header: 'Mã bộ phận', type: 'text', sortable: true },
    { field: 'name', header: 'Tên bộ phận', type: 'text', sortable: true },
    { field: 'departmentName', header: 'Bộ phận/Phòng ban', type: 'text', sortable: true },
    { field: 'status', header: 'Trạng thái', type: 'boolean', sortable: true },
    { field: 'createdAt', header: 'Ngày tạo', type: 'date', sortable: true },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'Sửa bộ phận',
      severity: 'info',
      onClick: (record) =>
        this.router.navigate([
          ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.EDIT_PART.path,
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

  private allMockData: PartMock[] = [
    {
      id: '1',
      code: 'P-WEB-01',
      name: 'Nhóm Frontend Angular',
      departmentName: 'Phòng Kỹ thuật Hà Nội',
      status: true,
      createdAt: '2026-02-15T08:00:00Z',
    },
    {
      id: '2',
      code: 'P-API-02',
      name: 'Nhóm Backend .NET',
      departmentName: 'Phòng Kỹ thuật Hà Nội',
      status: true,
      createdAt: '2026-02-16T09:30:00Z',
    },
    {
      id: '3',
      code: 'P-MKT-FB',
      name: 'Nhóm Facebook Ads',
      departmentName: 'Phòng Marketing',
      status: true,
      createdAt: '2026-03-01T10:00:00Z',
    },
    {
      id: '4',
      code: 'P-MKT-GG',
      name: 'Nhóm Google Ads',
      departmentName: 'Phòng Marketing',
      status: true,
      createdAt: '2026-03-02T14:00:00Z',
    },
    {
      id: '5',
      code: 'P-QA-01',
      name: 'Nhóm Kiểm thử (QA)',
      departmentName: 'Phòng Kỹ thuật Hà Nội',
      status: false,
      createdAt: '2026-03-10T11:00:00Z',
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
            item.departmentName.toLowerCase().includes(query),
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

  toggleStatus(record: PartMock): void {
    record.status = !record.status;
    this.message.success(`Đã ${record.status ? 'kích hoạt' : 'khóa'} bộ phận thành công!`);
    this.loadData();
  }

  openCreateModal(): void {
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.ADD_PART.path]);
  }
}
