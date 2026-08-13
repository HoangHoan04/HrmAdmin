import { PERMISSION_CODES, ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { PagedResult, WorkflowDefinition } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
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

@Component({
  standalone: false,
  selector: 'app-workflow-definition-manager',
  templateUrl: './workflow-definition-manager.component.html',
  styleUrls: [],
})
export class WorkflowDefinitionManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'workflow.definition.entityName';
  data: WorkflowDefinition[] = [];
  loading = false;
  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [];
  filters: Record<string, any> = { search: '', entityType: '', isActive: null };
  filterConfig: FilterConfig = {
    show: true,
    collapsible: true,
    defaultOpen: true,
    title: 'common.filter.title',
    actionsAlign: 'center',
  };
  filterFields: FilterField[] = [
    {
      key: 'search',
      label: 'workflow.definition.search',
      type: 'input',
      placeholder: 'workflow.definition.searchPlaceholder',
      col: 8,
      allowClear: true,
    },
    {
      key: 'entityType',
      label: 'workflow.common.entityType',
      type: 'select',
      placeholder: 'workflow.common.entityType',
      col: 8,
      allowClear: true,
      options: Object.values(enumData.WORKFLOW_ENTITY_TYPE).map((x) => ({
        label: x.labelKey,
        value: x.value,
      })),
    },
    {
      key: 'isActive',
      label: 'workflow.common.status',
      type: 'select',
      placeholder: 'workflow.common.filterStatus',
      col: 8,
      allowClear: true,
      options: [
        { label: 'enums.statusFilter.active', value: true },
        { label: 'enums.statusFilter.inactive', value: false },
      ],
    },
  ];
  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onFilterSearch(), this.loading),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];
  columns: TableColumn[] = [
    { field: 'code', header: 'workflow.definition.code', type: 'text', sortable: false },
    { field: 'name', header: 'workflow.definition.name', type: 'text', sortable: false },
    { field: 'entityType', header: 'workflow.common.entityType', type: 'text' },
    { field: 'isActive', header: 'workflow.common.status', type: 'boolean' },
  ];
  rowActions: RowAction[] = [];

  constructor(
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly permissionSvc: PermissionService,
    private readonly modal: NzModalService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.toolbarActions = [
      {
        ...CommonActions.create(() => this.openCreate()),
        visible: () => this.permissionSvc.has(PERMISSION_CODES.WORKFLOW_MANAGE),
      },
    ];
    this.rowActions = [
      {
        key: 'edit',
        icon: 'edit',
        tooltip: 'common.actions.update',
        severity: 'info',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.WORKFLOW_MANAGE),
        onClick: (r) => this.openEdit(r),
      },
      {
        key: 'delete',
        icon: 'delete',
        tooltip: 'common.actions.delete',
        severity: 'danger',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.WORKFLOW_MANAGE),
        onClick: (r) => this.delete(r),
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
      search: (this.filters['search'] || '').trim() || undefined,
      entityType: this.filters['entityType'] || undefined,
    };
    if (this.filters['isActive'] !== null && this.filters['isActive'] !== undefined) {
      payload['isActive'] = this.filters['isActive'];
    }
    this.apiService
      .post<PagedResult<WorkflowDefinition>>(this.apiService.WORKFLOW_DEFINITION.PAGINATION, payload)
      .subscribe({
        next: (res) => {
          this.data = res.items;
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
    this.filters = { search: '', entityType: '', isActive: null };
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
      ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_DEFINITIONS.children.ADD_WORKFLOW_DEFINITION.path,
    ]);
  }
  openEdit(item: WorkflowDefinition): void {
    this.router.navigate([
      ROUTES_CONFIG.WORKFLOW.children.WORKFLOW_DEFINITIONS.children.EDIT_WORKFLOW_DEFINITION.path,
      item.id,
    ]);
  }
  delete(item: WorkflowDefinition): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('workflow.definition.deleteConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.WORKFLOW_DEFINITION.DELETE, { id: item.id })
            .subscribe({
              next: (ok) => {
                if (ok) {
                  this.message.success(this.i18n.instant('common.messages.saveSuccess'));
                  this.loadData();
                  resolve();
                } else {
                  this.message.error(this.i18n.genericError());
                  reject();
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
}
