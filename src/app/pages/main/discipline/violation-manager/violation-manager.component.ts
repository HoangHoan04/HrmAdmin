import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { PagedResult, Violation } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
import { StaticTranslateService } from '@/app/core/services/static-translate.service';
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
  selector: 'app-violation-manager',
  templateUrl: './violation-manager.component.html',
  styleUrls: [],
})
export class ViolationManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'discipline.violation.entityName';
  data: Violation[] = [];
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
      label: 'discipline.violation.search',
      type: 'input',
      placeholder: 'discipline.violation.searchPlaceholder',
      col: 8,
      allowClear: true,
    },
    {
      key: 'status',
      label: 'discipline.violation.status',
      type: 'select',
      placeholder: 'discipline.common.filterStatus',
      col: 8,
      allowClear: true,
      options: Object.values(enumData.VIOLATION_STATUS).map((x) => ({
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
    { field: 'code', header: 'discipline.violation.code', type: 'text', sortable: true },
    { field: 'violationTypeName', header: 'discipline.violation.violationType', type: 'text' },
    { field: 'employeeName', header: 'discipline.violation.employee', type: 'text' },
    { field: 'companyName', header: 'discipline.common.company', type: 'text' },
    { field: 'occurredAt', header: 'discipline.violation.occurredAt', type: 'date' },
    { field: 'penaltyType', header: 'discipline.violation.penaltyType', type: 'text' },
    {
      field: 'status',
      header: 'discipline.violation.status',
      type: 'badge',
      sortable: true,
      render: (value: string) => {
        const meta = Object.values(enumData.VIOLATION_STATUS).find((x) => x.value === value);
        return meta ? StaticTranslateService.instant(meta.labelKey) : value;
      },
      badgeColor: (value: string) => {
        const meta = Object.values(enumData.VIOLATION_STATUS).find((x) => x.value === value);
        return meta?.color || '#8c8c8c';
      },
    },
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
        visible: () => this.permissionSvc.has(PERMISSION_CODES.DISCIPLINE_VIOLATION_CREATE),
      },
    ];
    this.rowActions = [
      {
        key: 'detail',
        icon: 'eye',
        tooltip: 'common.actions.view',
        severity: 'secondary',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.DISCIPLINE_VIOLATION_VIEW),
        onClick: (r) => this.openDetail(r),
      },
      {
        key: 'edit',
        icon: 'edit',
        tooltip: 'common.actions.update',
        severity: 'info',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.DISCIPLINE_VIOLATION_UPDATE),
        onClick: (r) => this.openEdit(r),
      },
      {
        key: 'confirm',
        icon: 'check',
        tooltip: 'common.actions.confirm',
        severity: 'success',
        visible: (r) =>
          r.status === enumData.VIOLATION_STATUS.DRAFT.value &&
          this.permissionSvc.hasAny(
            PERMISSION_CODES.DISCIPLINE_VIOLATION_APPROVE,
            PERMISSION_CODES.DISCIPLINE_VIOLATION_UPDATE,
          ),
        onClick: (r) => this.confirm(r),
      },
      {
        key: 'cancel',
        icon: 'close',
        tooltip: 'common.actions.cancel',
        severity: 'warning',
        visible: (r) =>
          (r.status === enumData.VIOLATION_STATUS.DRAFT.value ||
            r.status === enumData.VIOLATION_STATUS.CONFIRMED.value) &&
          this.permissionSvc.hasAny(
            PERMISSION_CODES.DISCIPLINE_VIOLATION_APPROVE,
            PERMISSION_CODES.DISCIPLINE_VIOLATION_UPDATE,
          ),
        onClick: (r) => this.cancel(r),
      },
      {
        key: 'delete',
        icon: 'delete',
        tooltip: 'common.actions.delete',
        severity: 'danger',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.DISCIPLINE_VIOLATION_DELETE),
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
      .post<PagedResult<Violation>>(this.apiService.VIOLATION.PAGINATION, payload)
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
      ROUTES_CONFIG.TALENT.children.DISCIPLINE.children.VIOLATION.children.ADD_VIOLATION.path,
    ]);
  }
  openEdit(item: Violation): void {
    this.router.navigate([
      ROUTES_CONFIG.TALENT.children.DISCIPLINE.children.VIOLATION.children.EDIT_VIOLATION.path,
      item.id,
    ]);
  }
  openDetail(item: Violation): void {
    this.router.navigate([
      ROUTES_CONFIG.TALENT.children.DISCIPLINE.children.VIOLATION.children.DETAIL_VIOLATION.path,
      item.id,
    ]);
  }
  confirm(item: Violation): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('discipline.violation.confirmConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.VIOLATION.CONFIRM, { id: item.id })
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

  cancel(item: Violation): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('discipline.violation.cancelConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.VIOLATION.CANCEL, { id: item.id })
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

  delete(item: Violation): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('discipline.violation.deleteConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.VIOLATION.DELETE, { id: item.id })
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
