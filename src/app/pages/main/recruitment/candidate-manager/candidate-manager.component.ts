import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { Candidate, PagedResult } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
import { candidateStatusLabel } from '@/app/core/utils/recruitment-label.util';
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

type CandidateRow = Candidate & { statusLabel?: string };

@Component({
  standalone: false,
  selector: 'app-candidate-manager',
  templateUrl: './candidate-manager.component.html',
  styleUrls: [],
})
export class CandidateManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'recruitment.candidate.entityName';
  data: CandidateRow[] = [];
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
      label: 'recruitment.candidate.search',
      type: 'input',
      placeholder: 'recruitment.candidate.searchPlaceholder',
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
      options: Object.values(enumData.CANDIDATE_STATUS).map((x) => ({
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
    { field: 'code', header: 'recruitment.candidate.code', type: 'text', sortable: true },
    { field: 'fullName', header: 'recruitment.candidate.fullName', type: 'text' },
    { field: 'email', header: 'recruitment.candidate.email', type: 'text' },
    { field: 'phone', header: 'recruitment.candidate.phone', type: 'text' },
    { field: 'hiringPlanName', header: 'recruitment.candidate.hiringPlan', type: 'text' },
    { field: 'statusLabel', header: 'recruitment.common.status', type: 'tag' },
    { field: 'appliedAt', header: 'recruitment.candidate.appliedAt', type: 'datetime' },
  ];
  rowActions: RowAction[] = [];

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly permissionSvc: PermissionService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.toolbarActions = [
      {
        ...CommonActions.create(() => this.openCreate()),
        visible: () => this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_CANDIDATE_CREATE),
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
        visible: () => this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_CANDIDATE_UPDATE),
        onClick: (r) => this.openEdit(r),
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
      .post<PagedResult<Candidate>>(this.apiService.CANDIDATE.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items.map((item) => ({
            ...item,
            statusLabel: this.resolveStatus(item.status),
          }));
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
      ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_LIST.children.ADD_CANDIDATE
        .path,
    ]);
  }
  openEdit(item: Candidate): void {
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_LIST.children.EDIT_CANDIDATE
        .path,
      item.id,
    ]);
  }
  openDetail(item: Candidate): void {
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_LIST.children
        .DETAIL_CANDIDATE.path,
      item.id,
    ]);
  }

  private resolveStatus(status?: string): string {
    return candidateStatusLabel((k) => this.i18n.instant(k), status);
  }
}
