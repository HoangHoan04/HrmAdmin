import { enumData } from '@/app/core/constants/enums/enumData';
import {
  BranchSelectBoxDto,
  EmployeeSelectBoxDto,
  PagedResult,
  RegisterDayOff,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  standalone: false,
  selector: 'app-leave-manager',
  templateUrl: './leave-manager.component.html',
  styleUrls: [],
})
export class LeaveManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'leave.entityName';

  data: RegisterDayOff[] = [];
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

  filters: Record<string, any> = {
    employeeId: null,
    branchId: null,
    status: null,
    dateRange: null,
  };

  filterConfig: FilterConfig = {
    show: true,
    collapsible: true,
    defaultOpen: true,
    title: 'common.filter.title',
    actionsAlign: 'center',
  };

  filterFields: FilterField[] = [
    {
      key: 'employeeId',
      label: 'leave.employee',
      type: 'select',
      placeholder: 'leave.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'branchId',
      label: 'leave.branch',
      type: 'select',
      placeholder: 'leave.filterBranch',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'status',
      label: 'leave.status',
      type: 'select',
      placeholder: 'leave.filterStatus',
      col: 6,
      allowClear: true,
      options: [
        { label: 'leave.statusPending', value: 'PENDING' },
        { label: 'leave.statusApproved', value: 'APPROVED' },
        { label: 'leave.statusRejected', value: 'REJECTED' },
        { label: 'leave.statusCancelled', value: 'CANCELLED' },
      ],
    },
    {
      key: 'dateRange',
      label: 'leave.filterDateRange',
      type: 'dateRange',
      col: 6,
      allowClear: true,
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'employeeCode', header: 'leave.employeeCode', type: 'text' },
    { field: 'employeeName', header: 'leave.employee', type: 'text' },
    { field: 'dayOffType', header: 'leave.dayOffType', type: 'text' },
    { field: 'dayOffConfigName', header: 'leave.dayOffConfig', type: 'text' },
    { field: 'fromDate', header: 'leave.fromDate', type: 'date' },
    { field: 'toDate', header: 'leave.toDate', type: 'date' },
    { field: 'totalDays', header: 'leave.totalDays', type: 'text' },
    { field: 'status', header: 'leave.status', type: 'text' },
    { field: 'branchName', header: 'leave.branch', type: 'text' },
    { field: 'reason', header: 'leave.reason', type: 'text' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'approve',
      icon: 'check-circle',
      tooltip: 'leave.approve',
      severity: 'success',
      visible: (record) => record.status === 'PENDING',
      onClick: (record) => this.approve(record),
    },
    {
      key: 'reject',
      icon: 'close-circle',
      tooltip: 'leave.reject',
      severity: 'danger',
      visible: (record) => record.status === 'PENDING',
      onClick: (record) => this.reject(record),
    },
  ];

  constructor(
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly modal: NzModalService,
  ) {}

  ngOnInit(): void {
    this.loadSelectBoxes();
    this.loadData();
  }

  loadSelectBoxes(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          const field = this.filterFields.find((f) => f.key === 'employeeId');
          if (field) {
            field.options = items.map((item) => ({
              label: item.code ? `${item.code} - ${item.name}` : item.name,
              value: item.id,
            }));
          }
          this.cdr.markForCheck();
        },
      });

    this.apiService.post<BranchSelectBoxDto[]>(this.apiService.BRANCH.SELECT_BOX, {}).subscribe({
      next: (items) => {
        const field = this.filterFields.find((f) => f.key === 'branchId');
        if (field) {
          field.options = items.map((item) => ({
            label: item.code ? `${item.code} - ${item.name}` : item.name,
            value: item.id,
          }));
        }
        this.cdr.markForCheck();
      },
    });
  }

  loadData(): void {
    this.loading = true;
    this.syncFilterActionsLoading();
    this.cdr.markForCheck();

    const payload: Record<string, any> = {
      pageIndex: this.pagination.current,
      pageSize: this.pagination.pageSize,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
    };
    if (this.filters['employeeId']) payload['employeeId'] = this.filters['employeeId'];
    if (this.filters['branchId']) payload['branchId'] = this.filters['branchId'];
    if (this.filters['status']) payload['status'] = this.filters['status'];

    const range = this.filters['dateRange'] as Date[] | null;
    if (range?.length === 2 && range[0] && range[1]) {
      payload['fromDate'] = this.toDateOnly(range[0]);
      payload['toDate'] = this.toDateOnly(range[1]);
    }

    this.apiService
      .post<PagedResult<RegisterDayOff>>(this.apiService.REGISTER_DAY_OFF.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items;
          this.pagination.total = res.totalCount;
          this.loading = false;
          this.syncFilterActionsLoading();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadListFailed(this.ENTITY_KEY, err.error));
          this.loading = false;
          this.syncFilterActionsLoading();
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
    this.filters = { employeeId: null, branchId: null, status: null, dateRange: null };
    this.pagination.current = 1;
    this.loadData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.current = event.page;
    this.pagination.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(event: { sortField: string | null; sortOrder: 1 | -1 | 0 | null }): void {
    this.sortField = event.sortField || 'createdAt';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.loadData();
  }

  approve(item: RegisterDayOff): void {
    this.promptNote('leave.approve').then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.REGISTER_DAY_OFF.APPROVE, {
          id: item.id,
          approverNote: note || null,
        })
        .subscribe({
          next: (success) => {
            if (success) {
              this.message.success(this.i18n.updateSuccess());
              this.loadData();
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  reject(item: RegisterDayOff): void {
    this.promptNote('leave.reject').then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.REGISTER_DAY_OFF.REJECT, {
          id: item.id,
          approverNote: note || null,
        })
        .subscribe({
          next: (success) => {
            if (success) {
              this.message.success(this.i18n.updateSuccess());
              this.loadData();
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  private promptNote(titleKey: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      let note = '';
      this.modal.confirm({
        nzTitle: this.i18n.instant(titleKey),
        nzContent: `<textarea id="leave-approver-note" class="ant-input" rows="3" placeholder="${this.i18n.instant(
          'leave.approverNotePlaceholder',
        )}"></textarea>`,
        nzOnOk: () => {
          const el = document.getElementById('leave-approver-note') as HTMLTextAreaElement | null;
          note = el?.value?.trim() || '';
          resolve(note);
        },
        nzOnCancel: () => resolve(undefined),
      });
    });
  }

  private toDateOnly(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
