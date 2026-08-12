import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { CompanySelectBoxDto, EmployeeSelectBoxDto, PagedResult, Salary } from '@/app/core/models';
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
import { ActionConfirmService } from '@/app/shared/services/action-confirm.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

type SalaryRow = Salary & { statusLabel?: string; employeeDisplay?: string };

@Component({
  standalone: false,
  selector: 'app-salary-manager',
  templateUrl: './salary-manager.component.html',
  styleUrls: [],
})
export class SalaryManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'salary.entityName';
  private readonly EDITABLE_STATUSES = [
    enumData.SALARY_STATUS.DRAFT.value,
    enumData.SALARY_STATUS.PROCESSING.value,
  ];
  private readonly APPROVABLE_STATUSES = [
    enumData.SALARY_STATUS.DRAFT.value,
    enumData.SALARY_STATUS.PROCESSING.value,
  ];
  private readonly PAYABLE_STATUSES = [
    enumData.SALARY_STATUS.APPROVED.value,
    enumData.SALARY_STATUS.PROCESSING.value,
  ];
  private readonly CANCELLABLE_STATUSES = [
    enumData.SALARY_STATUS.DRAFT.value,
    enumData.SALARY_STATUS.PROCESSING.value,
    enumData.SALARY_STATUS.APPROVED.value,
  ];

  data: SalaryRow[] = [];
  loading = false;
  enumData = enumData;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  sortField = 'createdAt';
  sortOrder = 'desc';
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [CommonActions.create(() => this.openCreate())];

  filters: Record<string, any> = {
    employeeId: null,
    year: null,
    month: null,
    status: null,
    companyId: null,
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
      label: 'salary.employeeName',
      type: 'select',
      placeholder: 'salary.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'year',
      label: 'salary.year',
      type: 'number',
      placeholder: 'salary.filterYear',
      col: 4,
      allowClear: true,
    },
    {
      key: 'month',
      label: 'salary.month',
      type: 'select',
      placeholder: 'salary.filterMonth',
      col: 4,
      allowClear: true,
      options: Array.from({ length: 12 }, (_, i) => ({
        label: String(i + 1),
        value: i + 1,
      })),
    },
    {
      key: 'status',
      label: 'salary.status',
      type: 'select',
      placeholder: 'salary.filterStatus',
      col: 5,
      allowClear: true,
      options: Object.values(enumData.SALARY_STATUS).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'companyId',
      label: 'salary.companyName',
      type: 'select',
      placeholder: 'salary.filterCompany',
      col: 5,
      allowClear: true,
      options: [],
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    {
      field: 'employeeDisplay',
      header: 'salary.employeeName',
      type: 'text',
    },
    { field: 'periodCode', header: 'salary.period', type: 'text', sortable: true },
    {
      field: 'statusLabel',
      header: 'salary.status',
      type: 'tag',
      tagSeverity: (value) => this.getStatusSeverityByLabel(value),
    },
    { field: 'grossSalary', header: 'salary.grossSalary', type: 'currency' },
    { field: 'netSalary', header: 'salary.netSalary', type: 'currency' },
    { field: 'payDate', header: 'salary.payDate', type: 'date', sortable: true },
  ];

  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'salary.viewDetail',
      severity: 'primary',
      onClick: (record) => this.openDetail(record),
    },
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'salary.edit',
      severity: 'info',
      visible: (record) => this.EDITABLE_STATUSES.includes(record.status),
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'approve',
      icon: 'check-circle',
      tooltip: 'salary.approve',
      severity: 'success',
      visible: (record) => this.APPROVABLE_STATUSES.includes(record.status),
      onClick: (record) => this.approve(record),
    },
    {
      key: 'markPaid',
      icon: 'dollar',
      tooltip: 'salary.markPaid',
      severity: 'success',
      visible: (record) => this.PAYABLE_STATUSES.includes(record.status),
      onClick: (record) => this.markPaid(record),
    },
    {
      key: 'cancel',
      icon: 'stop',
      tooltip: 'salary.cancel',
      severity: 'danger',
      visible: (record) => this.CANCELLABLE_STATUSES.includes(record.status),
      onClick: (record) => this.cancel(record),
    },
  ];

  private statusLabelMap = new Map<string, string>();

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly actionConfirm: ActionConfirmService,
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

    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (items) => {
        const field = this.filterFields.find((f) => f.key === 'companyId');
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
    if (this.filters['year']) payload['year'] = this.filters['year'];
    if (this.filters['month']) payload['month'] = this.filters['month'];
    if (this.filters['status']) payload['status'] = this.filters['status'];
    if (this.filters['companyId']) payload['companyId'] = this.filters['companyId'];

    this.apiService
      .post<PagedResult<Salary>>(this.apiService.SALARY.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.statusLabelMap.clear();
          this.data = res.items.map((item) => {
            const statusLabel = this.resolveStatusLabel(item.status);
            if (item.status) this.statusLabelMap.set(statusLabel, item.status);
            const employeeDisplay = item.employeeCode
              ? `${item.employeeCode} - ${item.employeeName || ''}`
              : item.employeeName || '-';
            return { ...item, statusLabel, employeeDisplay };
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
    this.filters = {
      employeeId: null,
      year: null,
      month: null,
      status: null,
      companyId: null,
    };
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
      ROUTES_CONFIG.PAYROLL.children.PAYROLL_RUN_MANAGER.children.ADD_SALARY.path,
    ]);
  }

  openEdit(item: Salary): void {
    this.router.navigate([
      ROUTES_CONFIG.PAYROLL.children.PAYROLL_RUN_MANAGER.children.EDIT_SALARY.path,
      item.id,
    ]);
  }

  openDetail(item: Salary): void {
    this.router.navigate([
      ROUTES_CONFIG.PAYROLL.children.PAYROLL_RUN_MANAGER.children.DETAIL_SALARY.path,
      item.id,
    ]);
  }

  async approve(item: SalaryRow): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('salary.approveConfirmTitle'),
      content: this.i18n.instant('salary.approveConfirmContent', {
        period: item.periodCode,
        name: item.employeeName || item.employeeCode || '',
      }),
      okText: this.i18n.instant('salary.approve'),
      okType: 'primary',
      icon: 'confirm',
    });
    if (!confirmed) return;
    this.apiService.post<boolean>(this.apiService.SALARY.APPROVE, { id: item.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.instant('salary.approveSuccess'));
          this.loadData();
        } else {
          this.message.error(this.i18n.genericError());
        }
      },
      error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
    });
  }

  async markPaid(item: SalaryRow): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('salary.markPaidConfirmTitle'),
      content: this.i18n.instant('salary.markPaidConfirmContent', {
        period: item.periodCode,
        name: item.employeeName || item.employeeCode || '',
      }),
      okText: this.i18n.instant('salary.markPaid'),
      okType: 'primary',
      icon: 'confirm',
    });
    if (!confirmed) return;
    this.apiService.post<boolean>(this.apiService.SALARY.MARK_PAID, { id: item.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.instant('salary.markPaidSuccess'));
          this.loadData();
        } else {
          this.message.error(this.i18n.genericError());
        }
      },
      error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
    });
  }

  async cancel(item: SalaryRow): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.actionConfirm.confirm({
      title: this.i18n.instant('salary.cancelConfirmTitle'),
      content: this.i18n.instant('salary.cancelConfirmContent', {
        period: item.periodCode,
        name: item.employeeName || item.employeeCode || '',
      }),
      okText: this.i18n.instant('salary.cancel'),
      okType: 'primary',
      icon: 'warning',
    });
    if (!confirmed) return;
    this.apiService.post<boolean>(this.apiService.SALARY.CANCEL, { id: item.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(this.i18n.instant('salary.cancelSuccess'));
          this.loadData();
        } else {
          this.message.error(this.i18n.genericError());
        }
      },
      error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
    });
  }

  private resolveStatusLabel(status?: string): string {
    if (!status) return '-';
    const meta = Object.values(enumData.SALARY_STATUS).find((x) => x.value === status);
    return meta ? this.i18n.instant(meta.labelKey) : status;
  }

  private getStatusSeverityByLabel(
    label: string,
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const status = this.statusLabelMap.get(label);
    switch (status) {
      case enumData.SALARY_STATUS.APPROVED.value:
      case enumData.SALARY_STATUS.PAID.value:
        return 'success';
      case enumData.SALARY_STATUS.PROCESSING.value:
        return 'info';
      case enumData.SALARY_STATUS.CANCELLED.value:
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
