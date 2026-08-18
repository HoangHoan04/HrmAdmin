import {
  BroadcastNotificationPayload,
  NotificationItem,
} from '@/app/core/models/notification/notification.models';
import { ApiService } from '@/app/core/services';
import { NotificationService } from '@/app/core/services/notification.service';
import { StaticTranslateService } from '@/app/core/services/static-translate.service';
import {
  CommonFilterActions,
  FilterAction,
  FilterConfig,
  FilterField,
} from '@/app/shared/components/filter-custom/filter-custom.types';
import {
  PaginationConfig,
  RowAction,
  TableAction,
  TableColumn,
} from '@/app/shared/components/table-custom/table-custom.types';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-notification-center',
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
  standalone: false,
})
export class NotificationCenterComponent implements OnInit {
  data: NotificationItem[] = [];
  loading = false;
  selectedTabIndex = 0;

  pagination: PaginationConfig = {
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
  };

  filters: Record<string, any> = {
    keyword: '',
    type: null,
    isRead: null,
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
      key: 'keyword',
      label: 'common.filter.search',
      type: 'input',
      placeholder: 'Tìm kiếm theo tiêu đề hoặc nội dung...',
      col: 8,
    },
    {
      key: 'type',
      label: 'notification.form.type',
      type: 'select',
      col: 8,
      options: [
        { label: 'Tất cả phân loại', value: null },
        { label: 'Nghỉ phép', value: 'LEAVE' },
        { label: 'Tăng ca', value: 'OVERTIME' },
        { label: 'Chấm công', value: 'ATTENDANCE' },
        { label: 'Phiếu lương', value: 'PAYSLIP' },
        { label: 'Hợp đồng', value: 'CONTRACT' },
        { label: 'Tuyển dụng', value: 'RECRUITMENT' },
        { label: 'Đánh giá', value: 'PERFORMANCE' },
        { label: 'Hệ thống', value: 'SYSTEM' },
        { label: 'Thông báo chung', value: 'ANNOUNCEMENT' },
      ],
    },
    {
      key: 'isRead',
      label: 'Trạng thái',
      type: 'select',
      col: 8,
      options: [
        { label: 'Tất cả trạng thái', value: null },
        { label: 'Chưa đọc', value: false },
        { label: 'Đã đọc', value: true },
      ],
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.onSearch()),
    CommonFilterActions.clear(() => this.onReset()),
  ];

  columns: TableColumn[] = [
    {
      field: 'type',
      header: 'Phân loại',
      width: '130px',
      align: 'center',
    },
    {
      field: 'title',
      header: 'Tiêu đề & Nội dung',
      sortable: false,
    },
    {
      field: 'severity',
      header: 'Mức độ',
      width: '110px',
      align: 'center',
    },
    {
      field: 'createdAt',
      header: 'Thời gian',
      width: '160px',
      align: 'center',
    },
    {
      field: 'isRead',
      header: 'Trạng thái',
      width: '110px',
      align: 'center',
      type: 'boolean',
      sortable: true,
      renderBoolean: (value: boolean) =>
        StaticTranslateService.instant(value ? 'common.statusInactive' : 'common.statusActive'),
      badgeSeverity: (value: boolean) => (value ? 'danger' : 'success'),
    },
  ];

  rowActions: RowAction<NotificationItem>[] = [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: 'eye',
      severity: 'secondary',
      onClick: (row: NotificationItem) => this.onViewDetail(row),
    },
    {
      key: 'mark_read',
      label: 'Đánh dấu đã đọc',
      icon: 'check',
      severity: 'success',
      onClick: (row: NotificationItem) => this.onMarkRead(row),
      visible: (row: NotificationItem) => !row.isRead,
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: 'delete',
      severity: 'danger',
      onClick: (row: NotificationItem) => this.onDelete(row),
    },
  ];

  toolbarActions: TableAction[] = [
    {
      key: 'mark_all_read',
      label: 'notification.markAllRead',
      icon: 'check-circle',
      severity: 'secondary',
      onClick: () => this.onMarkAllRead(),
    },
    {
      key: 'broadcast',
      label: 'notification.broadcastBtn',
      icon: 'sound',
      severity: 'primary',
      onClick: () => this.openBroadcastDrawer(),
    },
  ];

  broadcastVisible = false;
  broadcastSubmitting = false;
  broadcastForm!: FormGroup;
  companyOptions: Array<{ label: string; value: string }> = [];
  branchOptions: Array<{ label: string; value: string }> = [];
  departmentOptions: Array<{ label: string; value: string }> = [];

  constructor(
    private readonly notificationService: NotificationService,
    private readonly api: ApiService,
    private readonly message: NzMessageService,
    private readonly modal: NzModalService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.initBroadcastForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.loadSelectBoxes();
  }

  initBroadcastForm(): void {
    this.broadcastForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required]],
      type: ['ANNOUNCEMENT', [Validators.required]],
      severity: ['INFO', [Validators.required]],
      targetUrl: [''],
      scope: ['ALL', [Validators.required]],
      companyId: [null],
      branchId: [null],
      departmentId: [null],
    });
  }

  loadSelectBoxes(): void {
    this.api.post<any[]>(this.api.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.companyOptions = (res || []).map((x) => ({ label: x.name || x.code, value: x.id }));
      },
    });
    this.api.post<any[]>(this.api.BRANCH.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.branchOptions = (res || []).map((x) => ({ label: x.name || x.code, value: x.id }));
      },
    });
    this.api.post<any[]>(this.api.DEPARTMENT.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.departmentOptions = (res || []).map((x) => ({ label: x.name || x.code, value: x.id }));
      },
    });
  }

  loadData(): void {
    this.loading = true;
    let typeFilter = this.filters['type'];
    let isReadFilter = this.filters['isRead'];

    if (this.selectedTabIndex === 1) isReadFilter = false;
    else if (this.selectedTabIndex === 2) typeFilter = 'LEAVE';
    else if (this.selectedTabIndex === 3) typeFilter = 'OVERTIME';
    else if (this.selectedTabIndex === 4) typeFilter = 'PAYSLIP';
    else if (this.selectedTabIndex === 5) typeFilter = 'SYSTEM';

    this.notificationService
      .getNotifications({
        pageIndex: this.pagination.current,
        pageSize: this.pagination.pageSize,
        keyword: this.filters['keyword'] || undefined,
        type: typeFilter || undefined,
        isRead: isReadFilter === null ? undefined : isReadFilter,
      })
      .subscribe({
        next: (res) => {
          this.data = res.items || [];
          this.pagination.total = res.totalCount || 0;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.pagination.current = 1;
    this.loadData();
  }

  onSearch(): void {
    this.pagination.current = 1;
    this.loadData();
  }

  onReset(): void {
    this.filters = { keyword: '', type: null, isRead: null };
    this.pagination.current = 1;
    this.loadData();
  }

  onPageChange(event: { page?: number; current?: number; pageSize?: number }): void {
    this.pagination.current = event.page ?? event.current ?? 1;
    if (event.pageSize) this.pagination.pageSize = event.pageSize;
    this.loadData();
  }

  onViewDetail(row: NotificationItem): void {
    if (!row.isRead) {
      this.notificationService.markRead([row.id]).subscribe();
      row.isRead = true;
    }
    if (row.targetUrl) {
      this.router.navigateByUrl(row.targetUrl);
    } else {
      this.modal.info({
        nzTitle: row.title,
        nzContent: row.content,
        nzOkText: 'Đóng',
      });
    }
  }

  onMarkRead(row: NotificationItem): void {
    this.notificationService.markRead([row.id]).subscribe({
      next: () => {
        row.isRead = true;
        this.message.success('Đã đánh dấu thông báo là đã đọc.');
        this.loadData();
      },
    });
  }

  onMarkAllRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.message.success('Đã đánh dấu tất cả thông báo là đã đọc.');
        this.loadData();
      },
    });
  }

  onDelete(row: NotificationItem): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: 'Bạn có chắc chắn muốn xóa thông báo này?',
      nzOkText: 'Xóa',
      nzOkDanger: true,
      nzOnOk: () => {
        this.notificationService.deleteNotification(row.id).subscribe({
          next: () => {
            this.message.success('Đã xóa thông báo thành công.');
            this.loadData();
          },
        });
      },
    });
  }

  openBroadcastDrawer(): void {
    this.broadcastForm.reset({
      title: '',
      content: '',
      type: 'ANNOUNCEMENT',
      severity: 'INFO',
      targetUrl: '',
      scope: 'ALL',
      companyId: null,
      branchId: null,
      departmentId: null,
    });
    this.broadcastVisible = true;
  }

  closeBroadcastDrawer(): void {
    this.broadcastVisible = false;
  }

  submitBroadcast(): void {
    if (this.broadcastForm.invalid) {
      Object.values(this.broadcastForm.controls).forEach((ctrl) => {
        ctrl.markAsDirty();
        ctrl.updateValueAndValidity();
      });
      return;
    }

    const val = this.broadcastForm.value;
    const payload: BroadcastNotificationPayload = {
      title: val.title.trim(),
      content: val.content.trim(),
      type: val.type,
      severity: val.severity,
      targetUrl: val.targetUrl ? val.targetUrl.trim() : undefined,
      companyId: val.scope === 'COMPANY' ? val.companyId : undefined,
      branchId: val.scope === 'BRANCH' ? val.branchId : undefined,
      departmentId: val.scope === 'DEPARTMENT' ? val.departmentId : undefined,
    };

    this.broadcastSubmitting = true;
    this.notificationService.broadcast(payload).subscribe({
      next: (count) => {
        this.broadcastSubmitting = false;
        this.broadcastVisible = false;
        this.message.success(`Đã phát thông báo thành công đến ${count} người dùng!`);
        this.loadData();
      },
      error: () => {
        this.broadcastSubmitting = false;
        this.message.error('Không thể phát thông báo. Vui lòng thử lại!');
      },
    });
  }
}
