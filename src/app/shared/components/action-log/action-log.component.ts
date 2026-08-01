import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { enumData } from '../../../core/constants/enums/enumData';
import { ActionLog, ActionTypeMeta } from '../../../core/models/action-log.models';
import { PagedResult } from '../../../core/models/common.models';
import { ApiService } from '../../../core/services/api.service';
import {
  PaginationConfig,
  RowAction,
  TableColumn,
} from '../table-custom/table-custom.types';

@Component({
  standalone: false,
  selector: 'app-action-log',
  templateUrl: './action-log.component.html',
  styleUrls: ['./action-log.component.scss'],
})
export class ActionLogComponent implements OnInit, OnChanges {
  /** @deprecated Use functionType — kept for backward compatibility */
  @Input() entityName!: string;
  /** @deprecated Use functionId — kept for backward compatibility */
  @Input() entityId?: string;

  @Input() functionType?: string;
  @Input() functionId?: string;
  @Input() title?: string;

  @ViewChild('actionTypeTpl', { static: true }) actionTypeTpl!: TemplateRef<any>;

  logs: ActionLog[] = [];
  loading = false;

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  columns: TableColumn[] = [];
  rowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'actionLog.viewDetail',
      severity: 'info',
      visible: (record: ActionLog) => !!(record.oldValue || record.newValue),
      onClick: (record) => this.openDetailModal(record),
    },
  ];

  selectedLog: ActionLog | null = null;
  modalVisible = false;

  constructor(private readonly apiService: ApiService) {}

  ngOnInit(): void {
    this.initColumns();

    if (this.resolvedEntityName && this.resolvedEntityId) {
      this.loadLogs();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const keys = ['entityName', 'entityId', 'functionType', 'functionId'];
    const hasRelevantChange = keys.some((key) => changes[key] && !changes[key]?.firstChange);

    if (hasRelevantChange) {
      this.pagination.current = 1;
      this.loadLogs();
    }
  }

  private initColumns(): void {
    this.columns = [
      {
        field: 'createdAt',
        header: 'actionLog.createdAt',
        type: 'datetime',
        dateFormat: 'dd/MM/yyyy HH:mm:ss',
        width: 160,
      },
      {
        field: 'createdByName',
        header: 'actionLog.createdByName',
        type: 'text',
        width: 180,
      },
      {
        field: 'actionType',
        header: 'actionLog.actionType',
        body: this.actionTypeTpl,
        width: 150,
      },
      {
        field: 'createdNote',
        header: 'actionLog.createdNote',
        type: 'text',
        style: { minWidth: '250px' },
      },
    ];
  }

  get resolvedEntityName(): string {
    return this.functionType || this.entityName || '';
  }

  get resolvedEntityId(): string | undefined {
    return this.functionId || this.entityId;
  }

  loadLogs(): void {
    if (!this.resolvedEntityId) return;

    this.loading = true;
    const url =
      `${this.apiService.ACTION_LOG.BASE}?pageIndex=${this.pagination.current}` +
      `&pageSize=${this.pagination.pageSize}` +
      `&entityName=${encodeURIComponent(this.resolvedEntityName)}` +
      `&entityId=${encodeURIComponent(this.resolvedEntityId)}`;

    this.apiService.get<PagedResult<ActionLog>>(url).subscribe({
      next: (res) => {
        this.logs = (res?.items || []).map((item) => this.mapLogItem(item));
        this.pagination.total = res?.totalCount || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.current = event.page;
    this.pagination.pageSize = event.pageSize;
    this.loadLogs();
  }

  getActionTypeMeta(actionType?: string): ActionTypeMeta | undefined {
    if (!actionType) return undefined;
    return Object.values(enumData.ACTION_TYPE).find((item) => item.code === actionType);
  }

  getActionTypeLabel(actionType?: string): string {
    return this.getActionTypeMeta(actionType)?.name || actionType || 'N/A';
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
    if (!value || Object.keys(value).length === 0) {
      return emptyText;
    }
    return JSON.stringify(value, null, 2);
  }

  private mapLogItem(item: ActionLog): ActionLog {
    return {
      ...item,
      oldValueObj: this.parseJsonValue(item.oldValue),
      newValueObj: this.parseJsonValue(item.newValue),
    };
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
