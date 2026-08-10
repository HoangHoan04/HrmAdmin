import { Injectable } from '@angular/core';
import { I18nMessageService } from './i18n-message.service';

@Injectable({ providedIn: 'root' })
export class StaticTranslateService {
  private static instance: I18nMessageService;

  constructor(private readonly i18n: I18nMessageService) {
    StaticTranslateService.instance = i18n;
  }

  static instant(key: string, params?: Record<string, any>): string {
    if (!StaticTranslateService.instance) {
      console.warn(`[StaticTranslateService] Chưa được khởi tạo. Key: ${key}`);
      return key;
    }
    return StaticTranslateService.instance.instant(key, params);
  }
}
