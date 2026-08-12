import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { toUtcDateIso } from '@/app/core/constants/helpers';
import {
  CompanySelectBoxDto,
  Contract,
  ContractTypeSelectBoxDto,
  EmployeeSelectBoxDto,
  PagedResult,
} from '@/app/core/models';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

type ContractRow = Contract & { statusLabel?: string };

@Component({
  standalone: false,
  selector: 'app-contract-manager',
  templateUrl: './contract-manager.component.html',
  styleUrls: [],
})
export class ContractManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'contract.entityName';
  private readonly EDITABLE_STATUSES = [
    enumData.CONTRACT_STATUS.DRAFT.value,
    enumData.CONTRACT_STATUS.PENDING_SIGN.value,
  ];
  private readonly TERMINABLE_STATUSES = [
    enumData.CONTRACT_STATUS.ACTIVE.value,
    enumData.CONTRACT_STATUS.EXPIRING_SOON.value,
  ];

  data: ContractRow[] = [];
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
    code: '',
    employeeId: null,
    contractTypeId: null,
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
      key: 'code',
      label: 'contract.code',
      type: 'input',
      placeholder: 'contract.searchCode',
      col: 6,
      allowClear: true,
    },
    {
      key: 'employeeId',
      label: 'contract.employeeName',
      type: 'select',
      placeholder: 'contract.filterEmployee',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'contractTypeId',
      label: 'contract.contractTypeName',
      type: 'select',
      placeholder: 'contract.filterContractType',
      col: 6,
      allowClear: true,
      options: [],
    },
    {
      key: 'status',
      label: 'contract.status',
      type: 'select',
      placeholder: 'contract.filterStatus',
      col: 6,
      allowClear: true,
      options: Object.values(enumData.CONTRACT_STATUS).map((item) => ({
        label: item.labelKey,
        value: item.value,
      })),
    },
    {
      key: 'companyId',
      label: 'contract.companyName',
      type: 'select',
      placeholder: 'contract.filterCompany',
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
    { field: 'code', header: 'contract.code', type: 'text', sortable: true },
    { field: 'employeeName', header: 'contract.employeeName', type: 'text' },
    { field: 'contractTypeName', header: 'contract.contractTypeName', type: 'text' },
    { field: 'departmentName', header: 'contract.departmentName', type: 'text' },
    { field: 'jobTitle', header: 'contract.jobTitle', type: 'text' },
    { field: 'startDate', header: 'contract.startDate', type: 'date', sortable: true },
    { field: 'endDate', header: 'contract.endDate', type: 'date', sortable: true },
    {
      field: 'statusLabel',
      header: 'contract.status',
      type: 'tag',
      tagSeverity: (value) => this.getStatusSeverityByLabel(value),
    },
    { field: 'basicSalary', header: 'contract.basicSalary', type: 'currency' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'contract.viewDetail',
      severity: 'primary',
      onClick: (record) => this.openDetail(record),
    },
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'contract.edit',
      severity: 'info',
      visible: (record) => this.EDITABLE_STATUSES.includes(record.status),
      onClick: (record) => this.openEdit(record),
    },
    {
      key: 'sign',
      icon: 'form',
      tooltip: 'contract.sign',
      severity: 'success',
      visible: (record) => this.EDITABLE_STATUSES.includes(record.status),
      onClick: (record) => this.openSignModal(record),
    },
    {
      key: 'terminate',
      icon: 'stop',
      tooltip: 'contract.terminate',
      severity: 'danger',
      visible: (record) => this.TERMINABLE_STATUSES.includes(record.status),
      onClick: (record) => this.openTerminateModal(record),
    },
  ];

  signModalVisible = false;
  terminateModalVisible = false;
  actionSubmitting = false;
  selectedContract: ContractRow | null = null;
  signForm!: FormGroup;
  terminateForm!: FormGroup;

  private statusLabelMap = new Map<string, string>();

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.signForm = this.fb.group({
      signDate: [new Date(), [Validators.required]],
      signedByCompanyRepresentative: [''],
      signedByEmployeeName: [''],
      fileUrl: [''],
    });
    this.terminateForm = this.fb.group({
      terminationDate: [new Date(), [Validators.required]],
      terminationReason: ['', [Validators.required]],
    });
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

    this.apiService
      .post<ContractTypeSelectBoxDto[]>(this.apiService.CONTRACT_TYPE.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          const field = this.filterFields.find((f) => f.key === 'contractTypeId');
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
      code: (this.filters['code'] || '').trim() || undefined,
    };
    if (this.filters['employeeId']) payload['employeeId'] = this.filters['employeeId'];
    if (this.filters['contractTypeId']) payload['contractTypeId'] = this.filters['contractTypeId'];
    if (this.filters['status']) payload['status'] = this.filters['status'];
    if (this.filters['companyId']) payload['companyId'] = this.filters['companyId'];

    this.apiService
      .post<PagedResult<Contract>>(this.apiService.CONTRACT.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.statusLabelMap.clear();
          this.data = res.items.map((item) => {
            const statusLabel = this.resolveStatusLabel(item.status);
            if (item.status) this.statusLabelMap.set(statusLabel, item.status);
            return { ...item, statusLabel };
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
      code: '',
      employeeId: null,
      contractTypeId: null,
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
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_LIST.children
        .ADD_CONTRACT.path,
    ]);
  }

  openEdit(item: Contract): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_LIST.children
        .EDIT_CONTRACT.path,
      item.id,
    ]);
  }

  openDetail(item: Contract): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_LIST.children
        .DETAIL_CONTRACT.path,
      item.id,
    ]);
  }

  openSignModal(item: ContractRow): void {
    this.selectedContract = item;
    this.signForm.reset({
      signDate: new Date(),
      signedByCompanyRepresentative: item.signedByCompanyRepresentative || '',
      signedByEmployeeName: item.signedByEmployeeName || item.employeeName || '',
      fileUrl: item.fileUrl || '',
    });
    this.signModalVisible = true;
  }

  openTerminateModal(item: ContractRow): void {
    this.selectedContract = item;
    this.terminateForm.reset({
      terminationDate: new Date(),
      terminationReason: '',
    });
    this.terminateModalVisible = true;
  }

  submitSign(): void {
    if (!this.selectedContract?.id || this.signForm.invalid) {
      Object.values(this.signForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.actionSubmitting = true;
    const value = this.signForm.getRawValue();
    this.apiService
      .post<boolean>(this.apiService.CONTRACT.SIGN, {
        id: this.selectedContract.id,
        signDate: toUtcDateIso(value.signDate),
        signedByCompanyRepresentative: value.signedByCompanyRepresentative || null,
        signedByEmployeeName: value.signedByEmployeeName || null,
        fileUrl: value.fileUrl || null,
      })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.instant('contract.signSuccess'));
            this.signModalVisible = false;
            this.loadData();
          } else {
            this.message.error(this.i18n.genericError());
          }
          this.actionSubmitting = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.actionSubmitting = false;
        },
      });
  }

  submitTerminate(): void {
    if (!this.selectedContract?.id || this.terminateForm.invalid) {
      Object.values(this.terminateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.actionSubmitting = true;
    const value = this.terminateForm.getRawValue();
    this.apiService
      .post<boolean>(this.apiService.CONTRACT.TERMINATE, {
        id: this.selectedContract.id,
        terminationDate: toUtcDateIso(value.terminationDate),
        terminationReason: value.terminationReason,
      })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.instant('contract.terminateSuccess'));
            this.terminateModalVisible = false;
            this.loadData();
          } else {
            this.message.error(this.i18n.genericError());
          }
          this.actionSubmitting = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.actionSubmitting = false;
        },
      });
  }

  private resolveStatusLabel(status?: string): string {
    if (!status) return '-';
    const meta = Object.values(enumData.CONTRACT_STATUS).find((x) => x.value === status);
    return meta ? this.i18n.instant(meta.labelKey) : status;
  }

  private getStatusSeverityByLabel(
    label: string,
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const status = this.statusLabelMap.get(label);
    switch (status) {
      case enumData.CONTRACT_STATUS.ACTIVE.value:
        return 'success';
      case enumData.CONTRACT_STATUS.PENDING_SIGN.value:
        return 'info';
      case enumData.CONTRACT_STATUS.EXPIRING_SOON.value:
        return 'warning';
      case enumData.CONTRACT_STATUS.EXPIRED.value:
      case enumData.CONTRACT_STATUS.TERMINATED.value:
      case enumData.CONTRACT_STATUS.LIQUIDATED.value:
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
