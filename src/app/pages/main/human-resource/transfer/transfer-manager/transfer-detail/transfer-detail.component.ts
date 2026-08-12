import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import { TransferEmployee } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  standalone: false,
  selector: 'app-transfer-detail',
  templateUrl: './transfer-detail.component.html',
  styleUrls: [],
})
export class TransferDetailComponent implements OnInit {
  id: string | null = null;
  loading = false;
  transfer: TransferEmployee | null = null;
  enumData = enumData;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly modal: NzModalService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadDetail(this.id);
    }
  }

  get canEdit(): boolean {
    return this.transfer?.status === enumData.TRANSFER_STATUS.PENDING.value;
  }

  get canApprove(): boolean {
    return this.transfer?.status === enumData.TRANSFER_STATUS.PENDING.value;
  }

  get canReject(): boolean {
    return this.transfer?.status === enumData.TRANSFER_STATUS.PENDING.value;
  }

  get canApply(): boolean {
    return this.transfer?.status === enumData.TRANSFER_STATUS.APPROVED.value;
  }

  get canCancel(): boolean {
    return (
      this.transfer?.status === enumData.TRANSFER_STATUS.PENDING.value ||
      this.transfer?.status === enumData.TRANSFER_STATUS.APPROVED.value
    );
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService
      .post<TransferEmployee>(this.apiService.TRANSFER_EMPLOYEE.DETAIL, { id })
      .subscribe({
        next: (item) => {
          this.transfer = item;
          this.loading = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadDetailFailed(err.error));
          this.goBack();
        },
      });
  }

  statusLabel(status?: string): string {
    if (!status) return '-';
    const meta = Object.values(enumData.TRANSFER_STATUS).find((x) => x.value === status);
    return meta ? this.i18n.instant(meta.labelKey) : status;
  }

  transferTypeLabel(type?: string): string {
    if (!type) return '-';
    const meta = Object.values(enumData.TRANSFER_TYPE).find((x) => x.value === type);
    return meta ? this.i18n.instant(meta.labelKey) : type;
  }

  openEdit(): void {
    if (!this.transfer?.id) return;
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.TRANSFER_MANAGER.children.EDIT_TRANSFER.path,
      this.transfer.id,
    ]);
  }

  approve(): void {
    if (!this.transfer?.id) return;
    this.promptNote('transfer.approve').then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.TRANSFER_EMPLOYEE.APPROVE, {
          id: this.transfer!.id,
          note: note || null,
        })
        .subscribe({
          next: (success) => {
            if (success) {
              this.message.success(this.i18n.instant('transfer.approveSuccess'));
              this.loadDetail(this.transfer!.id);
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  reject(): void {
    if (!this.transfer?.id) return;
    this.promptNote('transfer.reject').then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.TRANSFER_EMPLOYEE.REJECT, {
          id: this.transfer!.id,
          note: note || null,
        })
        .subscribe({
          next: (success) => {
            if (success) {
              this.message.success(this.i18n.instant('transfer.rejectSuccess'));
              this.loadDetail(this.transfer!.id);
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  apply(): void {
    if (!this.transfer?.id) return;
    this.modal.confirm({
      nzTitle: this.i18n.instant('transfer.applyConfirmTitle'),
      nzContent: this.i18n.instant('transfer.applyConfirmContent', {
        code: this.transfer.code || '',
      }),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.TRANSFER_EMPLOYEE.APPLY, { id: this.transfer!.id })
            .subscribe({
              next: (success) => {
                if (success) {
                  this.message.success(this.i18n.instant('transfer.applySuccess'));
                  this.loadDetail(this.transfer!.id);
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

  cancel(): void {
    if (!this.transfer?.id) return;
    this.promptNote('transfer.cancelConfirmTitle').then((note) => {
      if (note === undefined) return;
      this.apiService
        .post<boolean>(this.apiService.TRANSFER_EMPLOYEE.CANCEL, {
          id: this.transfer!.id,
          note: note || null,
        })
        .subscribe({
          next: (success) => {
            if (success) {
              this.message.success(this.i18n.instant('transfer.cancelSuccess'));
              this.loadDetail(this.transfer!.id);
            } else {
              this.message.error(this.i18n.genericError());
            }
          },
          error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
        });
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.HUMAN_RESOURCE.children.TRANSFER_MANAGER.path]);
  }

  private promptNote(titleKey: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      this.modal.confirm({
        nzTitle: this.i18n.instant(titleKey),
        nzContent: `<textarea id="transfer-detail-note" class="ant-input" rows="3" placeholder="${this.i18n.instant(
          'transfer.notePlaceholder',
        )}"></textarea>`,
        nzOnOk: () => {
          const el = document.getElementById('transfer-detail-note') as HTMLTextAreaElement | null;
          resolve(el?.value?.trim() || '');
        },
        nzOnCancel: () => resolve(undefined),
      });
    });
  }
}
