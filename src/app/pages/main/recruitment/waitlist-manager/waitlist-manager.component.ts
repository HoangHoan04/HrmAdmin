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
  PaginationConfig,
  RowAction,
  TableColumn,
  ToolbarConfig,
} from '@/app/shared/components/table-custom/table-custom.types';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

type WaitlistRow = Candidate & { statusLabel?: string };

@Component({
  standalone: false,
  selector: 'app-waitlist-manager',
  templateUrl: './waitlist-manager.component.html',
  styleUrls: ['./waitlist-manager.component.scss'],
})
export class WaitlistManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'recruitment.waitlist.entityName';
  private readonly DEFAULT_STATUSES = ['WAITLIST', 'OFFER', 'HIRED'];

  data: WaitlistRow[] = [];
  loading = false;
  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
  sortField = 'appliedAt';
  sortOrder = 'desc';
  toolbar: ToolbarConfig = { show: true };
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
      label: 'recruitment.waitlist.search',
      type: 'input',
      placeholder: 'recruitment.waitlist.searchPlaceholder',
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
      options: [
        { label: 'enums.candidateStatus.waitlist', value: 'WAITLIST' },
        { label: 'enums.candidateStatus.offer', value: 'OFFER' },
        { label: 'enums.candidateStatus.hired', value: 'HIRED' },
      ],
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
    private readonly modal: NzModalService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly permissionSvc: PermissionService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const canUpdate = () => this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_CANDIDATE_UPDATE);
    this.rowActions = [
      {
        key: 'view',
        icon: 'eye',
        tooltip: 'common.actions.view',
        severity: 'primary',
        onClick: (r) => this.openDetail(r),
      },
      {
        key: 'offer',
        icon: 'mail',
        tooltip: 'recruitment.waitlist.toOffer',
        severity: 'info',
        visible: (r) => canUpdate() && r.status === 'WAITLIST',
        onClick: (r) => this.confirmChange(r, 'OFFER', 'recruitment.waitlist.confirmOffer'),
      },
      {
        key: 'hired',
        icon: 'check-circle',
        tooltip: 'recruitment.waitlist.toHired',
        severity: 'success',
        visible: (r) => canUpdate() && (r.status === 'WAITLIST' || r.status === 'OFFER'),
        onClick: (r) => this.confirmChange(r, 'HIRED', 'recruitment.waitlist.confirmHired'),
      },
      {
        key: 'createEmployee',
        icon: 'user-add',
        tooltip: 'recruitment.waitlist.createEmployee',
        severity: 'success',
        visible: (r) =>
          this.permissionSvc.has(PERMISSION_CODES.HR_EMPLOYEE_CREATE) &&
          r.status === 'HIRED' &&
          !r.employeeId,
        onClick: (r) => this.openCreateEmployee(r),
      },
      {
        key: 'viewEmployee',
        icon: 'idcard',
        tooltip: 'recruitment.waitlist.viewEmployee',
        severity: 'primary',
        visible: (r) => !!r.employeeId,
        onClick: (r) => this.openEmployee(r),
      },
      {
        key: 'reject',
        icon: 'close-circle',
        tooltip: 'recruitment.waitlist.toReject',
        severity: 'danger',
        visible: (r) => canUpdate() && (r.status === 'WAITLIST' || r.status === 'OFFER'),
        onClick: (r) => this.confirmChange(r, 'REJECTED', 'recruitment.waitlist.confirmReject'),
      },
    ];
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    const status = this.filters['status'] as string | null;
    const payload: Record<string, unknown> = {
      pageIndex: this.pagination.current,
      pageSize: this.pagination.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      search: (this.filters['searchText'] || '').trim() || undefined,
      status: status || undefined,
      statuses: status ? undefined : this.DEFAULT_STATUSES,
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
    this.sortField = e.sortField || 'appliedAt';
    this.sortOrder = e.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }

  openDetail(item: Candidate): void {
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_LIST.children
        .DETAIL_CANDIDATE.path,
      item.id,
    ]);
  }

  openCreateEmployee(item: Candidate): void {
    this.router.navigate(
      [ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.ADD_EMPLOYEE.path],
      { queryParams: { candidateId: item.id } },
    );
  }

  openEmployee(item: Candidate): void {
    if (!item.employeeId) return;
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.children.DETAIL_EMPLOYEE.path,
      item.employeeId,
    ]);
  }

  private confirmChange(item: Candidate, status: string, confirmKey: string): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant(confirmKey),
      nzContent: `${item.code} — ${item.fullName}`,
      nzOkDanger: status === 'REJECTED',
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post(this.apiService.CANDIDATE.CHANGE_STATUS, { id: item.id, status })
            .subscribe({
              next: () => {
                this.message.success(this.i18n.updateSuccess());
                this.loadData();
                resolve();
                if (status === 'HIRED' && !item.employeeId) {
                  this.promptCreateEmployee(item);
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

  private promptCreateEmployee(item: Candidate): void {
    if (!this.permissionSvc.has(PERMISSION_CODES.HR_EMPLOYEE_CREATE)) return;
    this.modal.confirm({
      nzTitle: this.i18n.instant('recruitment.waitlist.createEmployeePrompt'),
      nzContent: `${item.code} — ${item.fullName}`,
      nzOkText: this.i18n.instant('recruitment.waitlist.createEmployee'),
      nzCancelText: this.i18n.instant('common.actions.cancel'),
      nzOnOk: () => this.openCreateEmployee(item),
    });
  }

  private resolveStatus(status?: string): string {
    return candidateStatusLabel((k) => this.i18n.instant(k), status);
  }
}
