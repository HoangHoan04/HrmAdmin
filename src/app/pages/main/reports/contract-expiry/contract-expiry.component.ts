import { Contract } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import {
  CommonFilterActions,
  FilterAction,
  FilterConfig,
  FilterField,
} from '@/app/shared/components/filter-custom/filter-custom.types';
import { TableColumn } from '@/app/shared/components/table-custom/table-custom.types';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-contract-expiry',
  templateUrl: './contract-expiry.component.html',
  styleUrls: [],
})
export class ContractExpiryComponent implements OnInit {
  private readonly ENTITY_KEY = 'system.reports.contractExpiryEntity';
  data: Contract[] = [];
  loading = false;
  filters: Record<string, any> = { withinDays: 30 };
  filterConfig: FilterConfig = {
    show: true,
    collapsible: true,
    defaultOpen: true,
    title: 'common.filter.title',
    actionsAlign: 'center',
  };
  filterFields: FilterField[] = [
    {
      key: 'withinDays',
      label: 'system.reports.withinDays',
      type: 'number',
      placeholder: 'system.reports.withinDays',
      col: 8,
      allowClear: false,
    },
  ];
  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];
  columns: TableColumn[] = [
    { field: 'code', header: 'contract.code', type: 'text' },
    { field: 'employeeName', header: 'contract.employeeName', type: 'text' },
    { field: 'contractTypeName', header: 'contract.contractTypeName', type: 'text' },
    { field: 'endDate', header: 'contract.endDate', type: 'date' },
    { field: 'daysUntilExpiry', header: 'system.reports.daysUntilExpiry', type: 'number' },
    { field: 'status', header: 'contract.status', type: 'text' },
    { field: 'companyName', header: 'contract.companyName', type: 'text' },
  ];

  constructor(
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    const withinDays = Number(this.filters['withinDays']) || 30;
    this.apiService
      .post<Contract[]>(this.apiService.CONTRACT.EXPIRING_SOON, { withinDays })
      .subscribe({
        next: (res) => {
          this.data = res || [];
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
    this.loadData();
  }
  onFilterClear(): void {
    this.filters = { withinDays: 30 };
    this.loadData();
  }
}
