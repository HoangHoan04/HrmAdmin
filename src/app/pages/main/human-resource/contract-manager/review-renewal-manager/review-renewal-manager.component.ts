import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { EmployeeSelectBoxDto, PagedResult, ReviewRenewal } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
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

type ReviewRow = ReviewRenewal & {
  statusLabel?: string;
  recommendationLabel?: string;
};

@Component({
  standalone: false,
  selector: 'app-review-renewal-manager',
  templateUrl: './review-renewal-manager.component.html',
  styleUrls: [],
})
export class ReviewRenewalManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'reviewRenewal.entityName';
  private readonly PENDING_STATUSES = [
    enumData.REVIEW_RENEWAL_STATUS.PENDING_REVIEW.value,
    enumData.REVIEW_RENEWAL_STATUS.PENDING_APPROVAL.value,
  ];

  data: ReviewRow[] = [];
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
  toolbarActions: TableAction[] = [CommonActions.create(() => this.openCreate())];

  filters: Record<string, any> = {
    status: null,
    recommendation: null,
    employeeId: null,
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
      key: 'status',
      label: 'reviewRenewal.status',
      type: 'select',
      placeholder: 'reviewRenewal.filterStatus',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.REVIEW_RENEWAL_STATUS).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'recommendation',
      label: 'reviewRenewal.recommendation',
      type: 'select',
      placeholder: 'reviewRenewal.filterRecommendation',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.REVIEW_RECOMMENDATION).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'employeeId',
      label: 'reviewRenewal.employeeName',
      type: 'select',
      placeholder: 'reviewRenewal.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'contractCode', header: 'reviewRenewal.contractCode', type: 'text' },
    { field: 'employeeName', header: 'reviewRenewal.employeeName', type: 'text' },
    { field: 'recommendationLabel', header: 'reviewRenewal.recommendation', type: 'text' },
    {
      field: 'statusLabel',
      header: 'reviewRenewal.status',
      type: 'tag',
      tagSeverity: (value) => this.getStatusSeverityByLabel(value),
    },
    { field: 'reviewDate', header: 'reviewRenewal.reviewDate', type: 'date' },
    {
      field: 'proposedBasicSalary',
      header: 'reviewRenewal.proposedBasicSalary',
      type: 'currency',
    },
    { field: 'contractEndDate', header: 'reviewRenewal.contractEndDate', type: 'date' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'reviewRenewal.edit',
      severity: 'info',
      visible: (record) => this.PENDING_STATUSES.includes(record.status),
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'approve',
      icon: 'check-circle',
      tooltip: 'reviewRenewal.approve',
      severity: 'success',
      visible: (record) => this.PENDING_STATUSES.includes(record.status),
      onClick: (record) => this.approve(record),
    },
    {
      key: 'reject',
      icon: 'close-circle',
      tooltip: 'reviewRenewal.reject',
      severity: 'danger',
      visible: (record) => this.PENDING_STATUSES.includes(record.status),
      onClick: (record) => this.reject(record),
    },
    {
      key: 'apply',
      icon: 'play-circle',
      tooltip: 'reviewRenewal.apply',
      severity: 'primary',
      visible: (record) => record.status === enumData.REVIEW_RENEWAL_STATUS.APPROVED.value,
      onClick: (record) => this.apply(record),
    },
  ];

  private statusLabelMap = new Map<string, string>();

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly modal: NzModalService,
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadData();
  }

  loadEmployees(): void {
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
    if (this.filters['status']) payload['status'] = this.filters['status'];
    if (this.filters['recommendation']) payload['recommendation'] = this.filters['recommendation'];
    if (this.filters['employeeId']) payload['employeeId'] = this.filters['employeeId'];

    this.apiService
      .post<PagedResult<ReviewRenewal>>(this.apiService.REVIEW_RENEWAL.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.statusLabelMap.clear();
          this.data = res.items.map((item) => {
            const statusLabel = this.resolveEnumLabel(item.status, enumData.REVIEW_RENEWAL_STATUS);
            const recommendationLabel = this.resolveEnumLabel(
              item.recommendation,
              enumData.REVIEW_RECOMMENDATION,
            );
            if (item.status) this.statusLabelMap.set(statusLabel, item.status);
            return { ...item, statusLabel, recommendationLabel };
          });
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
    this.filters = { status: null, recommendation: null, employeeId: null };
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

  openCreate(): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.REVIEW_RENEWAL.children
        .ADD_REVIEW_RENEWAL.path,
    ]);
  }

  openEdit(item: ReviewRenewal): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.REVIEW_RENEWAL.children
        .EDIT_REVIEW_RENEWAL.path,
      item.id,
    ]);
  }

  approve(item: ReviewRenewal): void {
    this.promptNote('reviewRenewal.approve').then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.REVIEW_RENEWAL.APPROVE, {
          id: item.id,
          note: note || null,
        })
        .subscribe({
          next: (success) => {
            if (success) {
              this.message.success(this.i18n.instant('reviewRenewal.approveSuccess'));
              this.loadData();
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  reject(item: ReviewRenewal): void {
    this.promptNote('reviewRenewal.reject').then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.REVIEW_RENEWAL.REJECT, {
          id: item.id,
          note: note || null,
        })
        .subscribe({
          next: (success) => {
            if (success) {
              this.message.success(this.i18n.instant('reviewRenewal.rejectSuccess'));
              this.loadData();
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  apply(item: ReviewRenewal): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('reviewRenewal.applyConfirmTitle'),
      nzContent: this.i18n.instant('reviewRenewal.applyConfirmContent', {
        code: item.contractCode || '',
      }),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<string | null>(this.apiService.REVIEW_RENEWAL.APPLY, { id: item.id })
            .subscribe({
              next: () => {
                this.message.success(this.i18n.instant('reviewRenewal.applySuccess'));
                this.loadData();
                resolve();
              },
              error: (err: any) => {
                this.message.error(this.i18n.genericError(err.error));
                reject();
              },
            });
        }),
    });
  }

  private promptNote(titleKey: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      this.modal.confirm({
        nzTitle: this.i18n.instant(titleKey),
        nzContent: `<textarea id="review-renewal-note" class="ant-input" rows="3" placeholder="${this.i18n.instant(
          'reviewRenewal.notePlaceholder',
        )}"></textarea>`,
        nzOnOk: () => {
          const el = document.getElementById('review-renewal-note') as HTMLTextAreaElement | null;
          resolve(el?.value?.trim() || '');
        },
        nzOnCancel: () => resolve(undefined),
      });
    });
  }

  private resolveEnumLabel(
    value: string | undefined | null,
    enumObj: Record<string, { value: string; labelKey: string }>,
  ): string {
    if (!value) return '-';
    const meta = Object.values(enumObj).find((x) => x.value === value);
    return meta ? this.i18n.instant(meta.labelKey) : value;
  }

  private getStatusSeverityByLabel(
    label: string,
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const status = this.statusLabelMap.get(label);
    switch (status) {
      case enumData.REVIEW_RENEWAL_STATUS.APPROVED.value:
      case enumData.REVIEW_RENEWAL_STATUS.APPLIED.value:
        return 'success';
      case enumData.REVIEW_RENEWAL_STATUS.PENDING_APPROVAL.value:
        return 'info';
      case enumData.REVIEW_RENEWAL_STATUS.PENDING_REVIEW.value:
        return 'warning';
      case enumData.REVIEW_RENEWAL_STATUS.REJECTED.value:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  private syncFilterActionsLoading(): void {
    const searchAction = this.filterActions.find((a) => a.key === 'search');
    if (searchAction) searchAction.loading = this.loading;
  }
}
