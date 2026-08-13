import { PERMISSION_CODES } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { AuthSession } from '@/app/core/models';
import { AuthService, I18nMessageService } from '@/app/core/services';
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
  selector: 'app-sessions-manager',
  templateUrl: './sessions-manager.component.html',
  styleUrls: [],
})
export class SessionsManagerComponent implements OnInit {
  data: AuthSession[] = [];
  loading = false;
  allUsers = false;
  canManageAll = false;
  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
  toolbar: ToolbarConfig = { show: true };
  columns: TableColumn[] = [
    { field: 'username', header: 'system.sessions.username', type: 'text' },
    { field: 'platform', header: 'system.sessions.platform', type: 'text' },
    { field: 'ipAddress', header: 'system.sessions.ipAddress', type: 'text' },
    { field: 'deviceName', header: 'system.sessions.deviceName', type: 'text' },
    { field: 'createdAt', header: 'common.fields.createdAt', type: 'datetime' },
    { field: 'expiresAt', header: 'system.sessions.expiresAt', type: 'datetime' },
  ];
  rowActions: RowAction[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly permissionSvc: PermissionService,
    private readonly modal: NzModalService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.canManageAll = this.permissionSvc.has(PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE);
    this.rowActions = [
      {
        key: 'revoke',
        icon: 'logout',
        tooltip: 'system.sessions.revoke',
        severity: 'danger',
        onClick: (r) => this.revoke(r),
      },
    ];
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.auth.listSessions({ allUsers: this.canManageAll && this.allUsers }).subscribe({
      next: (res) => {
        const items = Array.isArray(res) ? res : res?.items || [];
        this.data = items;
        this.pagination.total = items.length;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadListFailed('system.sessions.entityName', err.error));
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onToggleAllUsers(checked: boolean): void {
    this.allUsers = checked;
    this.loadData();
  }

  onPageChange(e: { page: number; pageSize: number }): void {
    this.pagination.current = e.page;
    this.pagination.pageSize = e.pageSize;
  }

  revoke(item: AuthSession): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('system.sessions.revokeConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.auth.revokeSession(item.id).subscribe({
            next: () => {
              this.message.success(this.i18n.instant('system.sessions.revokeSuccess'));
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
}
