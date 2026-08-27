import { PERMISSION_CODES } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import { WorkflowInboxItem } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
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
  selector: 'app-workflow-inbox',
  templateUrl: './workflow-inbox.component.html',
  styleUrls: [],
})
export class WorkflowInboxComponent implements OnInit {
  private readonly ENTITY_KEY = 'workflow.inbox.entityName';
  data: WorkflowInboxItem[] = [];
  loading = false;
  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
  toolbar: ToolbarConfig = { show: true };
  columns: TableColumn[] = [
    { field: 'entityType', header: 'workflow.common.entityType', type: 'text' },
    { field: 'stepName', header: 'workflow.inbox.stepName', type: 'text' },
    { field: 'stepOrder', header: 'workflow.definition.stepOrder', type: 'number' },
    { field: 'approverResolver', header: 'workflow.definition.approverResolver', type: 'text' },
    { field: 'instanceStatus', header: 'workflow.inbox.instanceStatus', type: 'text' },
    { field: 'startedAt', header: 'workflow.inbox.startedAt', type: 'date' },
  ];
  rowActions: RowAction[] = [];

  constructor(
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly permissionSvc: PermissionService,
    private readonly modal: NzModalService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.rowActions = [
      {
        key: 'approve',
        icon: 'check',
        tooltip: 'workflow.inbox.approve',
        severity: 'success',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.WORKFLOW_INBOX),
        onClick: (r) => this.approve(r as WorkflowInboxItem),
      },
      {
        key: 'reject',
        icon: 'close',
        tooltip: 'workflow.inbox.reject',
        severity: 'danger',
        visible: () => this.permissionSvc.has(PERMISSION_CODES.WORKFLOW_INBOX),
        onClick: (r) => this.reject(r as WorkflowInboxItem),
      },
    ];
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.apiService.post<WorkflowInboxItem[]>(this.apiService.WORKFLOW.INBOX, {}).subscribe({
      next: (res) => {
        this.data = res || [];
        this.pagination.total = this.data.length;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        const apiMessage =
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || err?.error?.title || '';
        if (apiMessage.includes('chưa gắn nhân viên')) {
          this.data = [];
          this.pagination.total = 0;
          this.message.warning(this.i18n.instant('workflow.inbox.noEmployeeLinked'));
        } else {
          this.message.error(this.i18n.loadListFailed(this.ENTITY_KEY, err.error));
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  approve(item: WorkflowInboxItem): void {
    this.promptNote('workflow.inbox.approveConfirm', false).then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.WORKFLOW.ADVANCE, {
          taskId: item.taskId,
          note: note || null,
        })
        .subscribe({
          next: (ok) => {
            if (ok) {
              this.message.success(this.i18n.instant('common.messages.saveSuccess'));
              this.loadData();
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  reject(item: WorkflowInboxItem): void {
    this.promptNote('workflow.inbox.rejectConfirm', true).then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.WORKFLOW.REJECT, { taskId: item.taskId, note })
        .subscribe({
          next: (ok) => {
            if (ok) {
              this.message.success(this.i18n.instant('common.messages.saveSuccess'));
              this.loadData();
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  private promptNote(titleKey: string, required: boolean): Promise<string | undefined> {
    return new Promise((resolve) => {
      let note = '';
      const placeholder = this.i18n.instant(
        required ? 'workflow.inbox.rejectNotePlaceholder' : 'workflow.inbox.notePlaceholder',
      );
      this.modal.confirm({
        nzTitle: this.i18n.instant(titleKey),
        nzContent: `<textarea id="workflow-inbox-note" class="ant-input" rows="3" placeholder="${placeholder}"></textarea>`,
        nzOnOk: () => {
          const el = document.getElementById('workflow-inbox-note') as HTMLTextAreaElement | null;
          note = el?.value?.trim() || '';
          if (required && !note) {
            this.message.error(this.i18n.instant('workflow.inbox.rejectNoteRequired'));
            return false;
          }
          resolve(note);
          return true;
        },
        nzOnCancel: () => resolve(undefined),
      });
    });
  }
}
