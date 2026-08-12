import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageRef, NzMessageService } from 'ng-zorro-antd/message';

const DEDUPE_MS = 3000;
const FALLBACK_MSG = 'Server đang kết nối hoặc có lỗi, vui lòng thử lại sau';

@Injectable({
  providedIn: 'root',
})
export class NetworkErrorToastService {
  private lastMessage = '';
  private lastShownAt = 0;
  private patched = false;

  constructor(
    private readonly message: NzMessageService,
    private readonly injector: Injector,
  ) {
    this.patchMessageError();
  }

  text(): string {
    try {
      const translate = this.injector.get(TranslateService, null);
      const msg = translate?.instant('common.messages.serverUnavailable');
      if (typeof msg === 'string' && msg.trim() && !msg.startsWith('common.messages.')) {
        return msg;
      }
    } catch {
      //! Translate may not be ready during early bootstrap
    }
    return FALLBACK_MSG;
  }

  notify(): string {
    const text = this.text();
    this.message.error(text);
    return text;
  }

  private patchMessageError(): void {
    if (this.patched) return;
    this.patched = true;

    const original = this.message.error.bind(this.message);

    this.message.error = ((content: any, options?: any) => {
      if (typeof content === 'string' && content.trim()) {
        const now = Date.now();
        if (content === this.lastMessage && now - this.lastShownAt < DEDUPE_MS) {
          return { messageId: `deduped-${now}` } as NzMessageRef;
        }
        this.lastMessage = content;
        this.lastShownAt = now;
      }
      return original(content, options);
    }) as NzMessageService['error'];
  }
}
