import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import {
  PaginationConfig,
  RowAction,
  TableAction,
  TableColumn,
  ToolbarConfig,
} from './table-custom.types';

@Component({
  selector: 'app-table-custom',
  standalone: false,
  templateUrl: './table-custom.component.html',
  styleUrls: ['./table-custom.component.scss'],
})
export class TableCustomComponent implements OnInit, OnChanges, OnDestroy {
  @Input() id: string = 'custom-table';
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading: boolean = false;
  @Input() emptyText: string = 'common.noData';
  @Input() dataKey: string = 'id';
  @Input() pagination?: PaginationConfig;
  @Input() enableSelection: boolean = false;
  @Input() showIndexList: boolean = false;
  @Input() selectedRows: any[] = [];
  @Input() selectionMode: 'single' | 'multiple' = 'multiple';
  @Input() rowActions: RowAction[] = [];
  @Input() rowActionsWidth: string | number = '140px';
  @Input() rowActionsStyle?: Record<string, any>;
  @Input() rowActionsFrozen: boolean = true;
  @Input() toolbar?: ToolbarConfig;
  @Input() toolbarActions: TableAction[] = [];
  @Input() stripedRows: boolean = false;
  @Input() showGridlines: boolean = true;
  @Input() size: 'small' | 'normal' | 'large' = 'normal';
  @Input() sortField?: string;
  @Input() sortOrder?: 1 | -1 | 0 | null;
  @Input() toolbarLeftContent?: TemplateRef<any>;
  @Input() toolbarRightContent?: TemplateRef<any>;
  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() sortChange = new EventEmitter<{
    sortField: string | null;
    sortOrder: 1 | -1 | 0 | null;
  }>();
  @Output() refresh = new EventEmitter<void>();
  @Output() rowClick = new EventEmitter<any>();

  handleActionClick(act: TableAction, parent?: TableAction): void {
    if (act.key === 'upload-file' && parent?.onFileSelect) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = parent.acceptFiles || '.xlsx,.xls,.csv';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file && parent.onFileSelect) {
          parent.onFileSelect(file);
        }
      };
      input.click();
    } else if (act.onClick) {
      act.onClick();
    }
  }

  pageSizeOptions = [10, 20, 50, 100];
  density: 'small' | 'normal' | 'large' = 'normal';
  showConfig = false;

  columnOrder: string[] = [];
  visibleColumnsMap: Record<string, boolean> = {};
  columnWidths: Record<string, number> = {};

  private draggedField: string | null = null;
  private resizeRef: { field: string; startX: number; startWidth: number } | null = null;

  ngOnInit(): void {
    this.density = this.size;
    this.loadColumnSettings();
    document.addEventListener('mousedown', this.onClickOutside.bind(this));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.syncColumnSettings();
    }
  }

  onDropdownVisibleChange(visible: boolean, act: any): void {
    act.__open = visible;
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this.onClickOutside.bind(this));
  }

  private onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isCogButton = target.closest('.config-cog-btn') || target.closest('.config-dropdown');
    if (!isCogButton) {
      this.showConfig = false;
    }
  }

  private loadColumnSettings(): void {
    const savedOrder = localStorage.getItem(`${this.id}_column_order`);
    if (savedOrder) {
      try {
        this.columnOrder = JSON.parse(savedOrder);
      } catch (e) {}
    } else {
      this.columnOrder = this.columns.map((c) => c.field);
    }

    const savedVisibility = localStorage.getItem(`${this.id}_column_visibility`);
    if (savedVisibility) {
      try {
        this.visibleColumnsMap = JSON.parse(savedVisibility);
      } catch (e) {}
    }

    this.columns.forEach((col) => {
      if (this.visibleColumnsMap[col.field] === undefined) {
        this.visibleColumnsMap[col.field] = col.hidden !== true;
      }
    });
  }

  private syncColumnSettings(): void {
    const currentFields = this.columns.map((c) => c.field);
    const filteredOrder = this.columnOrder.filter((f) => currentFields.includes(f));
    const added = currentFields.filter((f) => !this.columnOrder.includes(f));
    this.columnOrder = [...filteredOrder, ...added];
    localStorage.setItem(`${this.id}_column_order`, JSON.stringify(this.columnOrder));

    this.columns.forEach((col) => {
      if (this.visibleColumnsMap[col.field] === undefined) {
        this.visibleColumnsMap[col.field] = col.hidden !== true;
      }
    });
    localStorage.setItem(`${this.id}_column_visibility`, JSON.stringify(this.visibleColumnsMap));
  }

  get visibleColumns(): TableColumn[] {
    const colMap = new Map(this.columns.map((c) => [c.field, c]));
    const ordered = this.columnOrder
      .map((field) => colMap.get(field))
      .filter((col): col is TableColumn => !!col && this.visibleColumnsMap[col.field]);

    this.columns.forEach((col) => {
      if (!this.columnOrder.includes(col.field) && this.visibleColumnsMap[col.field]) {
        ordered.push(col);
      }
    });

    return ordered;
  }

  toggleColumnVisibility(field: string): void {
    this.visibleColumnsMap[field] = !this.visibleColumnsMap[field];
    localStorage.setItem(`${this.id}_column_visibility`, JSON.stringify(this.visibleColumnsMap));
  }

  setDensity(d: 'small' | 'normal' | 'large'): void {
    this.density = d;
  }

  onDragStart(e: DragEvent, field: string): void {
    this.draggedField = field;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(e: DragEvent, field: string): void {
    if (this.draggedField && this.draggedField !== field) {
      e.preventDefault();
    }
  }

  onDrop(targetField: string): void {
    if (!this.draggedField || this.draggedField === targetField) return;

    const dragIndex = this.columnOrder.indexOf(this.draggedField);
    const dropIndex = this.columnOrder.indexOf(targetField);

    const newOrder = [...this.columnOrder];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, this.draggedField);

    this.columnOrder = newOrder;
    localStorage.setItem(`${this.id}_column_order`, JSON.stringify(newOrder));
    this.draggedField = null;
  }

  onResizeStart(e: MouseEvent, field: string, initialWidth: number): void {
    e.preventDefault();
    e.stopPropagation();
    this.resizeRef = {
      field,
      startX: e.clientX,
      startWidth: initialWidth,
    };
    document.addEventListener('mousemove', this.onResizeActive);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  private onResizeActive = (e: MouseEvent): void => {
    if (!this.resizeRef) return;
    const { field, startX, startWidth } = this.resizeRef;
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(50, startWidth + deltaX);
    this.columnWidths[field] = newWidth;
  };

  private onResizeEnd = (): void => {
    this.resizeRef = null;
    document.removeEventListener('mousemove', this.onResizeActive);
    document.removeEventListener('mouseup', this.onResizeEnd);
  };

  getColumnWidth(col: TableColumn): number {
    return this.columnWidths[col.field] || Number(col.width) || 150;
  }

  getLeftStickyOffset(col: TableColumn): number {
    let offset = 0;
    if (this.enableSelection) offset += 48;
    if (this.showIndexList) offset += 56;

    const cols = this.visibleColumns;
    for (let i = 0; i < cols.length; i++) {
      if (cols[i].field === col.field) break;
      if (cols[i].frozen && cols[i].alignFrozen !== 'right') {
        offset += this.getColumnWidth(cols[i]);
      }
    }
    return offset;
  }

  isAllSelected(): boolean {
    return this.data.length > 0 && this.selectedRows.length === this.data.length;
  }

  isRowSelected(rowData: any): boolean {
    return this.selectedRows.some((r) => r[this.dataKey] === rowData[this.dataKey]);
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedRows = [...this.data];
    } else {
      this.selectedRows = [];
    }
    this.selectionChange.emit(this.selectedRows);
  }

  onSelectRow(rowData: any, checked: boolean): void {
    if (this.selectionMode === 'single') {
      this.selectedRows = checked ? [rowData] : [];
    } else {
      if (checked) {
        this.selectedRows = [...this.selectedRows, rowData];
      } else {
        this.selectedRows = this.selectedRows.filter(
          (r) => r[this.dataKey] !== rowData[this.dataKey],
        );
      }
    }
    this.selectionChange.emit(this.selectedRows);
  }

  onSortClick(field: string, sortable?: boolean): void {
    if (!sortable) return;
    let nextOrder: 1 | -1 | 0 = 1;
    if (this.sortField === field) {
      if (this.sortOrder === 1) nextOrder = -1;
      else if (this.sortOrder === -1) nextOrder = 0;
    }
    this.sortField = nextOrder === 0 ? undefined : field;
    this.sortOrder = nextOrder === 0 ? null : nextOrder;
    this.sortChange.emit({
      sortField: this.sortField || null,
      sortOrder: this.sortOrder,
    });
  }

  onPageChangeClick(page: number): void {
    if (!this.pagination) return;
    if (this.pagination.current === page) return;
    this.pageChange.emit({ page, pageSize: this.pagination.pageSize });
  }

  onPageSizeChange(size: number): void {
    if (!this.pagination) return;
    if (this.pagination.pageSize === size) return;
    this.pageChange.emit({ page: 1, pageSize: size });
  }

  onRefreshClick(): void {
    this.refresh.emit();
  }

  onRowClickEmit(rowData: any): void {
    this.rowClick.emit(rowData);
  }

  getBadgeSeverityClass(severity: string): string {
    switch (severity) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'info':
        return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'warning':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'danger':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'primary':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'secondary':
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  }

  isActionVisible(action: RowAction, rowData: any): boolean {
    return action.visible === undefined
      ? true
      : typeof action.visible === 'function'
        ? action.visible(rowData)
        : action.visible;
  }

  isActionDisabled(action: RowAction, rowData: any): boolean {
    return action.disabled === undefined
      ? false
      : typeof action.disabled === 'function'
        ? action.disabled(rowData)
        : action.disabled;
  }

  isActionLoading(action: RowAction, rowData: any): boolean {
    return action.loading === undefined
      ? false
      : typeof action.loading === 'function'
        ? action.loading(rowData)
        : action.loading;
  }

  getActionSeverityClass(action: RowAction): string {
    switch (action.severity) {
      case 'success':
        return 'text-emerald-500/70 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500';
      case 'info':
        return 'text-sky-500/70 border-sky-500/20 hover:bg-sky-500/10 hover:text-sky-500';
      case 'warning':
        return 'text-amber-500/70 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-550';
      case 'danger':
        return 'text-red-500/70 border-red-500/20 hover:bg-red-500/10 hover:text-red-500';
      case 'secondary':
        return 'text-muted-foreground/70 border-muted-foreground/20 hover:bg-muted-foreground/10 hover:text-muted-foreground';
      default:
        return 'text-indigo-500/70 border-indigo-500/20 hover:bg-indigo-500/10 hover:text-indigo-500';
    }
  }

  get totalPages(): number {
    if (!this.pagination || !this.pagination.pageSize) return 1;
    return Math.ceil(this.pagination.total / this.pagination.pageSize);
  }

  get displayedTo(): number {
    if (!this.pagination) return this.data.length;
    const to = this.pagination.current * this.pagination.pageSize;
    return to > this.pagination.total ? this.pagination.total : to;
  }

  get displayedFrom(): number {
    if (!this.pagination) return 1;
    return (this.pagination.current - 1) * this.pagination.pageSize + 1;
  }

  getRowIndex(rowIndex: number): number {
    if (!this.pagination) return rowIndex + 1;
    return (this.pagination.current - 1) * this.pagination.pageSize + rowIndex + 1;
  }
}
