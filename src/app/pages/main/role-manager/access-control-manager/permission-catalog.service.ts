import { PermissionTreeGroup } from '@/app/core/models';
import { ApiService } from '@/app/core/services';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

/** Icon cho từng nhóm module trong màn phân quyền. */
export const PERMISSION_MODULE_ICONS: Record<string, string> = {
  HOME: 'home',
  ORGANIZATION: 'apartment',
  HUMAN_RESOURCE: 'team',
  OPERATE: 'schedule',
  PAYROLL: 'dollar',
  RECRUITMENT: 'user-add',
  DISCIPLINE: 'warning',
  PERFORMANCE: 'rise',
  TRAINING: 'read',
  ASSET: 'laptop',
  WORKFLOW: 'branches',
  REPORT: 'file-text',
  SYSTEM: 'setting',
  MOBILE: 'mobile',
};

export interface CatalogAction {
  code: string;
  action: string;
  label: string;
}

export interface CatalogItem {
  key: string;
  label: string;
  actions: CatalogAction[];
}

export interface CatalogGroup {
  module: string;
  label: string;
  icon: string;
  items: CatalogItem[];
}

/**
 * Tải cây quyền một lần và dịch tên nhóm module / trang / hành động theo ngôn ngữ đang chọn
 * (khoá role.permission.*), thiếu bản dịch thì dùng tên API trả về.
 */
@Injectable({ providedIn: 'root' })
export class PermissionCatalogService {
  private tree$?: Observable<PermissionTreeGroup[]>;

  constructor(
    private readonly apiService: ApiService,
    private readonly translate: TranslateService,
  ) {}

  loadTree(): Observable<PermissionTreeGroup[]> {
    if (!this.tree$) {
      this.tree$ = this.apiService
        .post<PermissionTreeGroup[]>(this.apiService.PERMISSION.TREE, {})
        .pipe(
          map((res) => (Array.isArray(res) ? res : [])),
          catchError(() => {
            this.tree$ = undefined; // cho phép thử lại lần sau
            return of([] as PermissionTreeGroup[]);
          }),
          shareReplay(1),
        );
    }
    return this.tree$;
  }

  /** Dịch theo key; thiếu bản dịch thì trả fallback. */
  tr(key: string, fallback: string | null | undefined): string {
    const value = this.translate.instant(key);
    return value && value !== key ? value : fallback || '';
  }

  /** Dựng cây đã dịch nhãn từ dữ liệu API. */
  buildCatalog(tree: PermissionTreeGroup[]): CatalogGroup[] {
    return tree.map((group) => {
      const module = group.module || 'OTHER';
      return {
        module,
        label: this.tr(
          `role.permission.module.${module}`,
          this.tr(`role.permission.item.${module}`, group.moduleName),
        ),
        icon: PERMISSION_MODULE_ICONS[module] || 'appstore',
        items: (group.items || []).map((item) => ({
          key: item.key,
          label: this.tr(`role.permission.item.${item.key}`, item.name),
          actions: (item.actions || []).map((a) => ({
            code: a.code,
            action: a.action,
            label: this.tr(`role.permission.action.${a.action}`, a.actionName || a.name),
          })),
        })),
      };
    });
  }
}
