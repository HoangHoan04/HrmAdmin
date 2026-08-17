import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { PagedResult, RecruitmentRequest } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
import { requestStatusLabel } from '@/app/core/utils/recruitment-label.util';
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

type RequestRow = RecruitmentRequest & { statusLabel?: string };

@Component({
  standalone: false,
  selector: 'app-request-manager',
  templateUrl: './request-manager.component.html',
  styleUrls: [],
})
export class RequestManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'recruitment.request.entityName';
  enumData = enumData;
  data: RequestRow[] = [];
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
  filters: Record<string, any> = { searchText: '', status: null };
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
      label: 'recruitment.request.search',
      type: 'input',
      placeholder: 'recruitment.request.searchPlaceholder',
      col: 8,
      allowClear: true,
    },
    {
      key: 'status',
      label: 'recruitment.common.status',
      type: 'select',
      placeholder: 'recruitment.common.filterStatus',
      col: 8,
      allowClear: true,
      options: Object.values(enumData.RECRUITMENT_REQUEST_STATUS).map((x) => ({
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
    { field: 'code', header: 'recruitment.request.code', type: 'text', sortable: true },
    { field: 'title', header: 'recruitment.request.title', type: 'text' },
    { field: 'companyName', header: 'recruitment.common.company', type: 'text' },
    { field: 'quantity', header: 'recruitment.request.quantity', type: 'number' },
    { field: 'statusLabel', header: 'recruitment.common.status', type: 'tag' },
  ];
  rowActions: RowAction[] = [];
  private statusLabelMap = new Map<string, string>();

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
        visible: () => this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_REQUEST_CREATE),
      },
    ];
    this.rowActions = [
      {
        key: 'view',
        icon: 'eye',
        tooltip: 'common.actions.view',
        severity: 'primary',
        onClick: (r) => this.openDetail(r),
      },
      {
        key: 'edit',
        icon: 'edit',
        tooltip: 'common.actions.update',
        severity: 'info',
        visible: (r) =>
          (r.status === 'DRAFT' || r.status === 'REJECTED') &&
          this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_REQUEST_UPDATE),
        onClick: (r) => this.openEdit(r),
      },
      {
        key: 'submit',
        icon: 'send',
        tooltip: 'recruitment.request.submit',
        severity: 'warning',
        visible: (r) =>
          r.status === 'DRAFT' &&
          this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_REQUEST_UPDATE),
        onClick: (r) => this.action(r, 'SUBMIT'),
      },
      {
        key: 'approve',
        icon: 'check',
        tooltip: 'recruitment.request.approve',
        severity: 'success',
        visible: (r) =>
          r.status === 'PENDING' &&
          this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_REQUEST_APPROVE),
        onClick: (r) => this.action(r, 'APPROVE'),
      },
      {
        key: 'reject',
        icon: 'close',
        tooltip: 'recruitment.request.reject',
        severity: 'danger',
        visible: (r) =>
          r.status === 'PENDING' &&
          this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_REQUEST_APPROVE),
        onClick: (r) => this.action(r, 'REJECT'),
      },
      {
        key: 'close',
        icon: 'stop',
        tooltip: 'recruitment.request.close',
        severity: 'secondary',
        visible: (r) =>
          r.status !== 'CLOSED' &&
          r.status !== 'DRAFT' &&
          this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_REQUEST_UPDATE),
        onClick: (r) => this.action(r, 'CLOSE'),
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
      .post<PagedResult<RecruitmentRequest>>(
        this.apiService.RECRUITMENT_REQUEST.PAGINATION,
        payload,
      )
      .subscribe({
        next: (res) => {
          this.statusLabelMap.clear();
          this.data = res.items.map((item) => {
            const statusLabel = this.resolveStatus(item.status);
            if (item.status) this.statusLabelMap.set(statusLabel, item.status);
            return { ...item, statusLabel };
          });
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
    this.filters = { searchText: '', status: null };
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
      ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.REQUEST.children.ADD_REQUEST.path,
    ]);
  }
  openEdit(item: RecruitmentRequest): void {
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.REQUEST.children.EDIT_REQUEST.path,
      item.id,
    ]);
  }
  openDetail(item: RecruitmentRequest): void {
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.REQUEST.children.DETAIL_REQUEST.path,
      item.id,
    ]);
  }

  action(item: RequestRow, type: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'CLOSE'): void {
    const map = {
      SUBMIT: this.apiService.RECRUITMENT_REQUEST.SUBMIT,
      APPROVE: this.apiService.RECRUITMENT_REQUEST.APPROVE,
      REJECT: this.apiService.RECRUITMENT_REQUEST.REJECT,
      CLOSE: this.apiService.RECRUITMENT_REQUEST.CLOSE,
    };
    const run = (note?: string) => {
      this.apiService
        .post<boolean>(map[type], { id: item.id, approvalNote: note || null })
        .subscribe({
          next: (ok) => {
            if (ok) {
              this.message.success(this.i18n.updateSuccess());
              this.loadData();
            } else this.message.error(this.i18n.genericError());
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    };

    if (type === 'APPROVE' || type === 'REJECT') {
      this.modal.confirm({
        nzTitle: this.i18n.instant(
          type === 'APPROVE' ? 'recruitment.request.approve' : 'recruitment.request.reject',
        ),
        nzContent: `<textarea id="req-note" class="ant-input" rows="3"></textarea>`,
        nzOnOk: () => {
          const el = document.getElementById('req-note') as HTMLTextAreaElement | null;
          run(el?.value?.trim() || '');
        },
      });
      return;
    }

    this.modal.confirm({
      nzTitle: this.i18n.instant(
        type === 'SUBMIT' ? 'recruitment.request.submit' : 'recruitment.request.close',
      ),
      nzOnOk: () => run(),
    });
  }

  private resolveStatus(status?: string): string {
    return requestStatusLabel((k) => this.i18n.instant(k), status);
  }
}
