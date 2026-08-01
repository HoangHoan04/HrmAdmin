import { Injectable } from '@angular/core';
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
  constructor(private readonly modal: NzModalService) {}

  confirm(options: ActionConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.modal.confirm({
        nzTitle: options.title,
        nzContent: options.content,
        nzOkText: options.okText ?? 'Xác nhận',
        nzCancelText: options.cancelText ?? 'Hủy',
        nzOkType: options.okType ?? 'primary',
        nzIconType: options.icon === 'warning' ? 'exclamation-circle' : 'question-circle',
        nzOnOk: () => resolve(true),
        nzOnCancel: () => resolve(false),
      });
    });
  }

  confirmActivate(entityName: string, itemName: string): Promise<boolean> {
    return this.confirm({
      title: 'Xác nhận kích hoạt',
      content: `Bạn có chắc chắn muốn kích hoạt ${entityName} "${itemName}"?`,
      okText: 'Kích hoạt',
      okType: 'primary',
      icon: 'confirm',
    });
  }

  confirmDeactivate(entityName: string, itemName: string): Promise<boolean> {
    return this.confirm({
      title: 'Xác nhận ngưng hoạt động',
      content: `Bạn có chắc chắn muốn ngưng hoạt động ${entityName} "${itemName}"? Dữ liệu sẽ được giữ lại trong hệ thống.`,
      okText: 'Ngưng hoạt động',
      okType: 'primary',
      icon: 'warning',
    });
  }
}
