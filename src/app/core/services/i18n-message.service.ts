import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class I18nMessageService {
  constructor(private readonly translate: TranslateService) {}

  instant(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  entityLabel(entityI18nKey: string): string {
    return this.instant(entityI18nKey);
  }

  entityNotFound(entityI18nKey: string): string {
    return this.instant('common.messages.entityNotFound', {
      entity: this.entityLabel(entityI18nKey),
    });
  }

  loadListFailed(entityI18nKey: string, serverMessage?: string): string {
    return serverMessage || this.instant('common.messages.loadListFailedEntity', {
      entity: this.entityLabel(entityI18nKey),
    });
  }

  loadDetailFailed(serverMessage?: string): string {
    return serverMessage || this.instant('common.messages.loadDetailFailed');
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

  activateError(entityI18nKey: string, serverMessage?: string): string {
    return serverMessage || this.instant('common.messages.activateErrorEntity', {
      entity: this.entityLabel(entityI18nKey),
    });
  }

  deactivateError(entityI18nKey: string, serverMessage?: string): string {
    return serverMessage || this.instant('common.messages.deactivateErrorEntity', {
      entity: this.entityLabel(entityI18nKey),
    });
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

  excelImportFailed(serverMessage?: string): string {
    return serverMessage || this.instant('common.messages.excelImportFailed');
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

  genericError(serverMessage?: string): string {
    return serverMessage || this.instant('common.messages.genericError');
  }
}
