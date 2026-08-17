import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { PagedResult, TrainingCourse } from '@/app/core/models';
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
  selector: 'app-course-manager',
  templateUrl: './course-manager.component.html',
  styleUrls: [],
})
export class CourseManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'training.course.entityName';
  data: TrainingCourse[] = [];
  loading = false;
  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
  sortField = enumData.PAGE.SORT_FIELD.CREATED_AT;
  sortOrder = enumData.PAGE.SORT_ORDER.DESC;
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
      label: 'training.course.search',
      type: 'input',
      placeholder: 'training.course.searchPlaceholder',
      col: 8,
      allowClear: true,
    },
    {
      key: 'status',
      label: 'training.course.status',
      type: 'select',
      placeholder: 'training.common.filterStatus',
      col: 8,
      allowClear: true,
      options: Object.values(enumData.TRAINING_COURSE_STATUS).map((x) => ({
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
    { field: 'code', header: 'training.course.code', type: 'text', sortable: true },
    { field: 'name', header: 'training.course.name', type: 'text', sortable: true },
    { field: 'companyName', header: 'training.common.company', type: 'text' },
    { field: 'provider', header: 'training.course.provider', type: 'text' },
    { field: 'hours', header: 'training.course.hours', type: 'number' },
    { field: 'status', header: 'training.course.status', type: 'text' },
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
        visible: () => this.permissionSvc.has(PERMISSION_CODES.TRAINING_COURSE_CREATE),
      },
    ];
    this.rowActions = [
      {
        key: 'detail',
        icon: 'eye',
        tooltip: 'common.actions.view',
        severity: 'secondary',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.TRAINING_COURSE_VIEW),
        onClick: (r) => this.openDetail(r),
      },
      {
        key: 'edit',
        icon: 'edit',
        tooltip: 'common.actions.update',
        severity: 'info',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.TRAINING_COURSE_UPDATE),
        onClick: (r) => this.openEdit(r),
      },
      {
        key: 'delete',
        icon: 'delete',
        tooltip: 'common.actions.delete',
        severity: 'danger',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.TRAINING_COURSE_DELETE),
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
      .post<PagedResult<TrainingCourse>>(this.apiService.TRAINING_COURSE.PAGINATION, payload)
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
      ROUTES_CONFIG.TALENT.children.TRAINING.children.COURSE.children.ADD_COURSE.path,
    ]);
  }
  openEdit(item: TrainingCourse): void {
    this.router.navigate([
      ROUTES_CONFIG.TALENT.children.TRAINING.children.COURSE.children.EDIT_COURSE.path,
      item.id,
    ]);
  }
  openDetail(item: TrainingCourse): void {
    this.router.navigate([
      ROUTES_CONFIG.TALENT.children.TRAINING.children.COURSE.children.DETAIL_COURSE.path,
      item.id,
    ]);
  }
  delete(item: TrainingCourse): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('training.course.deleteConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.TRAINING_COURSE.DELETE, { id: item.id })
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
