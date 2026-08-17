import { enumData } from '@/app/core/constants/enums';
import { toDateOnly } from '@/app/core/constants/helpers';
import { ActionLog, PagedResult } from '@/app/core/models';
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
} from '@/app/shared/components/table-custom/table-custom.types';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-action-log-manager',
  templateUrl: './action-log-manager.component.html',
  styleUrls: [],
})
export class ActionLogManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'system.actionLog.listEntity';

  @ViewChild('actionTypeTpl', { static: true }) actionTypeTpl!: TemplateRef<any>;

  data: ActionLog[] = [];
  loading = false;
  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
  filters: Record<string, any> = {
    entityName: '',
    actionType: null,
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
      key: 'entityName',
      label: 'system.actionLog.entityName',
      type: 'input',
      placeholder: 'system.actionLog.entityNamePlaceholder',
      col: 8,
      allowClear: true,
    },
    {
      key: 'actionType',
      label: 'system.actionLog.actionType',
      type: 'select',
      placeholder: 'system.actionLog.actionTypePlaceholder',
      col: 8,
      allowClear: true,
      options: Object.values(enumData.ACTION_TYPE).map((x) => ({
        label: x.labelKey,
        value: x.code,
      })),
    },
    {
      key: 'dateRange',
      label: 'system.actionLog.dateRange',
      type: 'dateRange',
      col: 8,
      allowClear: true,
    },
  ];
  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];
  columns: TableColumn[] = [];
  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'table.action.viewDetail',
      severity: 'info',
      visible: (record: ActionLog) => !!(record.oldValue || record.newValue),
      onClick: (record) => this.openDetailModal(record),
    },
  ];

  selectedLog: ActionLog | null = null;
  modalVisible = false;

  constructor(
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.columns = [
      {
        field: 'createdAt',
        header: 'actionLog.createdAt',
        type: 'datetime',
        dateFormat: 'dd/MM/yyyy HH:mm:ss',
        width: 170,
      },
      { field: 'entityName', header: 'system.actionLog.entityName', type: 'text', width: 160 },
      { field: 'createdByName', header: 'actionLog.createdByName', type: 'text', width: 180 },
      {
        field: 'actionType',
        header: 'actionLog.actionType',
        body: this.actionTypeTpl,
        width: 140,
      },
      { field: 'createdNote', header: 'actionLog.createdNote', type: 'text' },
      { field: 'ipAddress', header: 'system.actionLog.ipAddress', type: 'text', width: 130 },
    ];
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    const params = new URLSearchParams();
    params.set('pageIndex', String(this.pagination.current));
    params.set('pageSize', String(this.pagination.pageSize));
    const entityName = (this.filters['entityName'] || '').trim();
    if (entityName) params.set('entityName', entityName);
    if (this.filters['actionType']) params.set('actionType', this.filters['actionType']);
    const range = this.filters['dateRange'] as Date[] | null;
    if (range?.length === 2 && range[0] && range[1]) {
      params.set('fromDate', toDateOnly(range[0]));
      params.set('toDate', toDateOnly(range[1]));
    }
    const url = `${this.apiService.ACTION_LOG.BASE}?${params.toString()}`;
    this.apiService.get<PagedResult<ActionLog>>(url).subscribe({
      next: (res) => {
        this.data = res?.items || [];
        this.pagination.total = res?.totalCount || 0;
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
    this.filters = { entityName: '', actionType: null, dateRange: null };
    this.pagination.current = 1;
    this.loadData();
  }
  onPageChange(e: { page: number; pageSize: number }): void {
    this.pagination.current = e.page;
    this.pagination.pageSize = e.pageSize;
    this.loadData();
  }

  getActionTypeLabel(actionType?: string): string {
    if (!actionType) return this.translate.instant('enums.notAvailable');
    const meta = Object.values(enumData.ACTION_TYPE).find((item) => item.code === actionType);
    return meta?.labelKey ? this.translate.instant(meta.labelKey) : actionType;
  }

  openDetailModal(log: ActionLog): void {
    this.selectedLog = {
      ...log,
      oldValueObj: this.parseJsonValue(log.oldValue),
      newValueObj: this.parseJsonValue(log.newValue),
    };
    this.modalVisible = true;
  }

  closeModal(): void {
    this.modalVisible = false;
    this.selectedLog = null;
  }

  formatJsonValue(value: Record<string, unknown> | null | undefined, emptyText: string): string {
    if (!value || Object.keys(value).length === 0) return emptyText;
    return JSON.stringify(value, null, 2);
  }

  private parseJsonValue(raw?: string | null): Record<string, unknown> | null {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : { value: parsed };
    } catch {
      return { value: raw };
    }
  }
}
