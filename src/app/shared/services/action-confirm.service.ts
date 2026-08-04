import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';

export interface ActionConfirmOptions {
  title: string;
  content: string;
  okText?: string;
  cancelText?: string;
  okType?: 'primary' | 'default';
  icon?: 'confirm' | 'warning' | 'info' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ActionConfirmService {
  constructor(
    private readonly modal: NzModalService,
    private readonly translate: TranslateService,
  ) {}

  confirm(options: ActionConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.modal.confirm({
        nzTitle: options.title,
        nzContent: options.content,
        nzOkText: options.okText ?? this.translate.instant('common.messages.confirm'),
        nzCancelText: options.cancelText ?? this.translate.instant('common.messages.cancel'),
        nzOkType: options.okType ?? 'primary',
        nzIconType: options.icon === 'warning' ? 'exclamation-circle' : 'question-circle',
        nzOnOk: () => resolve(true),
        nzOnCancel: () => resolve(false),
      });
    });
  }

  confirmActivate(entityI18nKey: string, itemName: string): Promise<boolean> {
    const entity = this.translate.instant(entityI18nKey);
    return this.confirm({
      title: this.translate.instant('common.messages.confirmActivate'),
      content: this.translate.instant('common.messages.activateContent', {
        entity,
        name: itemName,
      }),
      okText: this.translate.instant('common.messages.activateAction'),
      okType: 'primary',
      icon: 'confirm',
    });
  }

  confirmDeactivate(entityI18nKey: string, itemName: string): Promise<boolean> {
    const entity = this.translate.instant(entityI18nKey);
    return this.confirm({
      title: this.translate.instant('common.messages.confirmDeactivate'),
      content: this.translate.instant('common.messages.deactivateContentLong', {
        entity,
        name: itemName,
      }),
      okText: this.translate.instant('common.messages.deactivateAction'),
      okType: 'primary',
      icon: 'warning',
    });
  }
}
