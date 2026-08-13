import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { HiringPlan, PagedResult } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
import { hiringPlanStatusLabel } from '@/app/core/utils/recruitment-label.util';
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

type HiringPlanRow = HiringPlan & { statusLabel?: string };

@Component({
  standalone: false,
  selector: 'app-hiring-plan-manager',
  templateUrl: './hiring-plan-manager.component.html',
  styleUrls: [],
})
export class HiringPlanManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'recruitment.plan.entityName';
  data: HiringPlanRow[] = [];
  loading = false;
  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
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
      label: 'recruitment.plan.search',
      type: 'input',
      placeholder: 'recruitment.plan.searchPlaceholder',
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
      options: Object.values(enumData.HIRING_PLAN_STATUS).map((x) => ({
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
    { field: 'code', header: 'recruitment.plan.code', type: 'text', sortable: true },
    { field: 'name', header: 'recruitment.plan.name', type: 'text', sortable: true },
    { field: 'companyName', header: 'recruitment.common.company', type: 'text' },
    { field: 'branchName', header: 'recruitment.common.branch', type: 'text' },
    { field: 'recruitmentRequestCode', header: 'recruitment.plan.parentRequest', type: 'text' },
    { field: 'jobDescriptionTitle', header: 'recruitment.request.jobDescription', type: 'text' },
    { field: 'targetQuantity', header: 'recruitment.pipeline.targetQuantity', type: 'number' },
    { field: 'statusLabel', header: 'recruitment.common.status', type: 'tag' },
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
        visible: () => this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_PLAN_CREATE),
      },
    ];
    this.rowActions = [
      {
        key: 'edit',
        icon: 'edit',
        tooltip: 'common.actions.update',
        severity: 'info',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_PLAN_UPDATE),
        onClick: (r) => this.openEdit(r),
      },
      {
        key: 'open',
        icon: 'play-circle',
        tooltip: 'recruitment.plan.openPlan',
        severity: 'success',
        visible: (r: HiringPlan) =>
          this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_PLAN_UPDATE) &&
          (r.status === 'DRAFT' || r.status === 'CLOSED'),
        onClick: (r) => this.setStatus(r, 'OPEN'),
      },
      {
        key: 'close',
        icon: 'pause-circle',
        tooltip: 'recruitment.plan.closePlan',
        severity: 'warning',
        visible: (r: HiringPlan) =>
          this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_PLAN_UPDATE) && r.status === 'OPEN',
        onClick: (r) => this.setStatus(r, 'CLOSED'),
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
      search: (this.filters['searchText'] || '').trim() || undefined,
      status: this.filters['status'] || undefined,
    };
    this.apiService
      .post<PagedResult<HiringPlan>>(this.apiService.HIRING_PLAN.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items.map((item) => ({
            ...item,
            statusLabel: hiringPlanStatusLabel((k) => this.i18n.instant(k), item.status),
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
  openCreate(): void {
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.HIRING_PLAN.children.ADD_HIRING_PLAN
        .path,
    ]);
  }
  openEdit(item: HiringPlan): void {
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.WORKFLOW.children.HIRING_PLAN.children.EDIT_HIRING_PLAN
        .path,
      item.id,
    ]);
  }

  setStatus(item: HiringPlan, status: string): void {
    this.apiService
      .post<boolean>(this.apiService.HIRING_PLAN.UPDATE, { id: item.id, status })
      .subscribe({
        next: (ok) => {
          if (ok) {
            this.message.success(this.i18n.updateSuccess());
            this.loadData();
          } else this.message.error(this.i18n.genericError());
        },
        error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
      });
  }
}
