import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isNetworkErrorPayload } from '../utils/http-network-error';

@Injectable({
  providedIn: 'root',
})
export class I18nMessageService {
  constructor(private readonly translate: TranslateService) {}

  instant(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  resolveServerMessage(serverMessage?: unknown): string | undefined {
    if (serverMessage == null || serverMessage === '') return undefined;
    if (typeof serverMessage === 'string') {
      const trimmed = serverMessage.trim();
      return trimmed || undefined;
    }
    if (isNetworkErrorPayload(serverMessage)) {
      return this.instant('common.messages.serverUnavailable');
    }
    if (typeof serverMessage === 'object') {
      const body = serverMessage as { message?: unknown; title?: unknown; detail?: unknown };
      for (const value of [body.message, body.detail, body.title]) {
        if (typeof value === 'string' && value.trim()) return value.trim();
      }
    }
    return undefined;
  }

  entityLabel(entityI18nKey: string): string {
    return this.instant(entityI18nKey);
  }

  entityNotFound(entityI18nKey: string): string {
    return this.instant('common.messages.entityNotFound', {
      entity: this.entityLabel(entityI18nKey),
    });
  }

  loadListFailed(entityI18nKey: string, serverMessage?: unknown): string {
    return (
      this.resolveServerMessage(serverMessage) ||
      this.instant('common.messages.loadListFailedEntity', {
        entity: this.entityLabel(entityI18nKey),
      })
    );
  }

  loadDetailFailed(serverMessage?: unknown): string {
    return (
      this.resolveServerMessage(serverMessage) || this.instant('common.messages.loadDetailFailed')
    );
  }

  activateSuccess(entityI18nKey: string, name: string): string {
    return this.instant('common.messages.activateSuccessNamed', {
      entity: this.entityLabel(entityI18nKey),
      name,
    });
  }

  deactivateSuccess(entityI18nKey: string, name: string): string {
    return this.instant('common.messages.deactivateSuccessNamed', {
      entity: this.entityLabel(entityI18nKey),
      name,
    });
  }

  activateFailed(entityI18nKey: string): string {
    return this.instant('common.messages.activateFailedEntity', {
      entity: this.entityLabel(entityI18nKey),
    });
  }

  deactivateFailed(entityI18nKey: string): string {
    return this.instant('common.messages.deactivateFailedEntity', {
      entity: this.entityLabel(entityI18nKey),
    });
  }

  activateError(entityI18nKey: string, serverMessage?: unknown): string {
    return (
      this.resolveServerMessage(serverMessage) ||
      this.instant('common.messages.activateErrorEntity', {
        entity: this.entityLabel(entityI18nKey),
      })
    );
  }

  deactivateError(entityI18nKey: string, serverMessage?: unknown): string {
    return (
      this.resolveServerMessage(serverMessage) ||
      this.instant('common.messages.deactivateErrorEntity', {
        entity: this.entityLabel(entityI18nKey),
      })
    );
  }

  excelTemplateFailed(): string {
    return this.instant('common.messages.excelTemplateFailed');
  }

  excelTemplateSuccess(): string {
    return this.instant('common.messages.excelTemplateSuccess');
  }

  excelExportFailed(): string {
    return this.instant('common.messages.excelExportFailed');
  }

  excelExportSuccess(): string {
    return this.instant('common.messages.excelExportSuccess');
  }

  excelImportFailed(serverMessage?: unknown): string {
    return (
      this.resolveServerMessage(serverMessage) || this.instant('common.messages.excelImportFailed')
    );
  }

  excelImportPartial(success: number, total: number, errors: number): string {
    return this.instant('common.messages.excelImportPartial', {
      success,
      total,
      errors,
    });
  }

  excelImportSuccess(count: number, entityI18nKey: string): string {
    return this.instant('common.messages.excelImportSuccessEntity', {
      count,
      entity: this.entityLabel(entityI18nKey),
    });
  }

  saveSuccess(): string {
    return this.instant('common.messages.saveSuccess');
  }

  createSuccess(): string {
    return this.instant('common.messages.createSuccess');
  }

  updateSuccess(): string {
    return this.instant('common.messages.updateSuccess');
  }

  genericError(serverMessage?: unknown): string {
    return this.resolveServerMessage(serverMessage) || this.instant('common.messages.genericError');
  }
}
