import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { PagedResult, PerformanceReviewCycle } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
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
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  standalone: false,
  selector: 'app-review-cycle-manager',
  templateUrl: './review-cycle-manager.component.html',
  styleUrls: [],
})
export class ReviewCycleManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'performance.reviewCycle.entityName';
  data: PerformanceReviewCycle[] = [];
  loading = false;
  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
  sortField = 'createdAt';
  sortOrder = 'desc';
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [];
  filters: Record<string, any> = { searchText: '', status: '' };
  filterConfig: FilterConfig = {
    show: true,
    collapsible: true,
    defaultOpen: true,
    title: 'common.filter.title',
    actionsAlign: 'center',
  };
  filterFields: FilterField[] = [
    {
      key: 'searchText',
      label: 'performance.reviewCycle.search',
      type: 'input',
      placeholder: 'performance.reviewCycle.searchPlaceholder',
      col: 8,
      allowClear: true,
    },
    {
      key: 'status',
      label: 'performance.reviewCycle.status',
      type: 'select',
      placeholder: 'performance.common.filterStatus',
      col: 8,
      allowClear: true,
      options: Object.values(enumData.REVIEW_CYCLE_STATUS).map((x) => ({
        label: x.labelKey,
        value: x.value,
      })),
    },
  ];
  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];
  columns: TableColumn[] = [
    { field: 'code', header: 'performance.reviewCycle.code', type: 'text', sortable: true },
    { field: 'name', header: 'performance.reviewCycle.name', type: 'text', sortable: true },
    { field: 'companyName', header: 'performance.common.company', type: 'text' },
    { field: 'periodFrom', header: 'performance.reviewCycle.periodFrom', type: 'date' },
    { field: 'periodTo', header: 'performance.reviewCycle.periodTo', type: 'date' },
    { field: 'status', header: 'performance.reviewCycle.status', type: 'text' },
  ];
  rowActions: RowAction[] = [];

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly permissionSvc: PermissionService,
    private readonly modal: NzModalService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.toolbarActions = [
      {
        ...CommonActions.create(() => this.openCreate()),
        visible: () => this.permissionSvc.has(PERMISSION_CODES.PERFORMANCE_CYCLE_CREATE),
      },
    ];
    this.rowActions = [
      {
        key: 'edit',
        icon: 'edit',
        tooltip: 'common.actions.update',
        severity: 'info',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.PERFORMANCE_CYCLE_UPDATE),
        onClick: (r) => this.openEdit(r),
      },
      {
        key: 'delete',
        icon: 'delete',
        tooltip: 'common.actions.delete',
        severity: 'danger',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.PERFORMANCE_CYCLE_UPDATE),
        onClick: (r) => this.delete(r),
      },
    ];
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    const payload: Record<string, any> = {
      pageIndex: this.pagination.current,
      pageSize: this.pagination.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: (this.filters['searchText'] || '').trim() || undefined,
      status: this.filters['status'] || undefined,
    };
    this.apiService
      .post<PagedResult<PerformanceReviewCycle>>(
        this.apiService.PERFORMANCE_CYCLE.PAGINATION,
        payload,
      )
      .subscribe({
        next: (res) => {
          this.data = res.items;
          this.pagination.total = res.totalCount;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadListFailed(this.ENTITY_KEY, err.error));
          this.loading = false;
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
    this.filters = { searchText: '', status: '' };
    this.pagination.current = 1;
    this.loadData();
  }
  onPageChange(e: { page: number; pageSize: number }): void {
    this.pagination.current = e.page;
    this.pagination.pageSize = e.pageSize;
    this.loadData();
  }
  onSortChange(e: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    this.sortField = e.sortField || 'createdAt';
    this.sortOrder = e.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }
  openCreate(): void {
    this.router.navigate([
      ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.REVIEW_CYCLE.children.ADD_REVIEW_CYCLE
        .path,
    ]);
  }
  openEdit(item: PerformanceReviewCycle): void {
    this.router.navigate([
      ROUTES_CONFIG.TALENT.children.PERFORMANCE.children.REVIEW_CYCLE.children.EDIT_REVIEW_CYCLE
        .path,
      item.id,
    ]);
  }
  delete(item: PerformanceReviewCycle): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('performance.reviewCycle.deleteConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.PERFORMANCE_CYCLE.DELETE, { id: item.id })
            .subscribe({
              next: (ok) => {
                if (ok) {
                  this.message.success(this.i18n.instant('common.messages.saveSuccess'));
                  this.loadData();
                  resolve();
                } else {
                  this.message.error(this.i18n.genericError());
                  reject();
                }
              },
              error: (err: any) => {
                this.message.error(this.i18n.genericError(err.error));
                reject();
              },
            });
        }),
    });
  }
}
