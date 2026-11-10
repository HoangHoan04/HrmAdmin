import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import {
  DataScope,
  PermissionDto,
  PermissionTreeGroup,
  RoleDto,
  RoleSelectBoxDto,
  SetRolePermissionsRequest,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { normalizeSearchText } from '@/app/shared/directives/select-search.directive';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subject, takeUntil } from 'rxjs';
import { PERMISSION_MODULE_ICONS } from '../permission-catalog.service';

/** Một quyền (hành động) trên một trang, đã dịch nhãn. */
interface PermActionVm {
  code: string;
  action: string;
  label: string;
  scopable: boolean;
}

/** Một trang / chức năng trong module. */
interface PermItemVm {
  key: string;
  label: string;
  actions: PermActionVm[];
  hasScopable: boolean;
  search: string;
}

/** Một nhóm module (Tổ chức, Nhân sự...). */
interface PermGroupVm {
  module: string;
  label: string;
  icon: string;
  items: PermItemVm[];
  actionCodes: string[];
  search: string;
}

const MIXED_SCOPE = '__MIXED__';
const DEFAULT_SCOPE = 'OWN';

const MODULE_ICONS = PERMISSION_MODULE_ICONS;

@Component({
  standalone: false,
  selector: 'app-role-access-panel',
  templateUrl: './role-access-panel.component.html',
  styleUrls: ['../access-control-manager.component.scss', './role-access-panel.component.scss'],
})
export class RoleAccessPanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() initialRoleId: string | null = null;

  readonly dataScopes = Object.values(enumData.DATA_SCOPE);
  readonly MIXED_SCOPE = MIXED_SCOPE;

  roleOptions: RoleSelectBoxDto[] = [];
  selectedRoleId: string | null = null;
  selectedRole: RoleDto | null = null;

  /** Dữ liệu gốc từ API. */
  private permissionGroups: PermissionTreeGroup[] = [];
  /** Dữ liệu đã dịch để hiển thị. */
  groups: PermGroupVm[] = [];
  filteredGroups: PermGroupVm[] = [];

  searchText = '';
  collapsedModules = new Set<string>();

  /** Trạng thái hiện tại: code -> data scope. Có trong map = đang được cấp. */
  granted = new Map<string, string>();
  /** Trạng thái đã lưu trên server, dùng để tính thay đổi / hoàn tác. */
  private savedGranted = new Map<string, string>();
  /** Phạm vi mặc định đã chọn cho từng trang (áp dụng khi tick thêm quyền). */
  private itemScope = new Map<string, string>();

  permLoading = false;
  permSaving = false;
  rolesLoading = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly message: NzMessageService,
    private readonly modal: NzModalService,
    private readonly i18n: I18nMessageService,
    private readonly translate: TranslateService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadRoleOptions();
    this.loadPermissionTree();
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.buildViewModel();
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialRoleId'] && this.initialRoleId) {
      this.selectedRoleId = this.initialRoleId;
      this.loadRoleDetail(this.initialRoleId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------------------------------------------------------------------------
  // Chọn vai trò
  // ---------------------------------------------------------------------------

  onRoleSelected(roleId: string | null): void {
    if (roleId === this.selectedRoleId) return;

    if (this.isDirty) {
      const previous = this.selectedRoleId;
      // Trả select về vai trò cũ cho tới khi người dùng xác nhận
      this.selectedRoleId = null;
      this.cdr.detectChanges();
      this.selectedRoleId = previous;
      this.modal.confirm({
        nzTitle: this.translate.instant('role.unsavedChanges', { count: this.unsavedCount }),
        nzContent: this.translate.instant('role.leaveConfirm'),
        nzOkDanger: true,
        nzOnOk: () => this.switchRole(roleId),
      });
      return;
    }

    this.switchRole(roleId);
  }

  private switchRole(roleId: string | null): void {
    this.selectedRoleId = roleId;
    this.selectedRole = null;
    this.granted = new Map();
    this.savedGranted = new Map();
    this.itemScope = new Map();
    if (roleId) {
      this.loadRoleDetail(roleId);
    }
    this.cdr.markForCheck();
  }

  goEmployeeTab(): void {
    this.router.navigate([ROUTES_CONFIG.ROLE_MANAGER.children.ACCESS_CONTROL.path], {
      queryParams: { tab: 'employee' },
    });
  }

  // ---------------------------------------------------------------------------
  // Tìm kiếm & thu gọn
  // ---------------------------------------------------------------------------

  onSearchChange(value: string): void {
    this.searchText = value;
    this.applyFilter();
  }

  isCollapsed(group: PermGroupVm): boolean {
    // Khi đang tìm kiếm luôn mở để thấy kết quả
    return !this.searchText.trim() && this.collapsedModules.has(group.module);
  }

  toggleCollapse(group: PermGroupVm): void {
    const next = new Set(this.collapsedModules);
    if (next.has(group.module)) next.delete(group.module);
    else next.add(group.module);
    this.collapsedModules = next;
  }

  get allCollapsed(): boolean {
    return this.groups.length > 0 && this.groups.every((g) => this.collapsedModules.has(g.module));
  }

  toggleCollapseAll(): void {
    this.collapsedModules = this.allCollapsed
      ? new Set()
      : new Set(this.groups.map((g) => g.module));
  }

  // ---------------------------------------------------------------------------
  // Tick quyền
  // ---------------------------------------------------------------------------

  isChecked(code: string): boolean {
    return this.granted.has(code);
  }

  onActionCheck(item: PermItemVm, action: PermActionVm, checked: boolean): void {
    this.setAction(item, action, checked);
    this.granted = new Map(this.granted);
  }

  private setAction(item: PermItemVm, action: PermActionVm, checked: boolean): void {
    if (!checked) {
      this.granted.delete(action.code);
      return;
    }
    if (this.granted.has(action.code)) return;
    this.granted.set(action.code, this.defaultScopeFor(item));
  }

  private defaultScopeFor(item: PermItemVm): string {
    const chosen = this.itemScope.get(item.key);
    if (chosen) return chosen;
    const current = this.getItemScope(item);
    return current && current !== MIXED_SCOPE ? current : DEFAULT_SCOPE;
  }

  toggleItem(item: PermItemVm, checked: boolean): void {
    for (const action of item.actions) {
      this.setAction(item, action, checked);
    }
    this.granted = new Map(this.granted);
  }

  toggleGroup(group: PermGroupVm, checked: boolean): void {
    for (const item of group.items) {
      for (const action of item.actions) {
        this.setAction(item, action, checked);
      }
    }
    this.granted = new Map(this.granted);
  }

  itemCheckedCount(item: PermItemVm): number {
    return item.actions.filter((a) => this.granted.has(a.code)).length;
  }

  isItemFull(item: PermItemVm): boolean {
    return item.actions.length > 0 && this.itemCheckedCount(item) === item.actions.length;
  }

  isItemPartial(item: PermItemVm): boolean {
    const n = this.itemCheckedCount(item);
    return n > 0 && n < item.actions.length;
  }

  groupCheckedCount(group: PermGroupVm): number {
    return group.actionCodes.filter((c) => this.granted.has(c)).length;
  }

  isGroupFull(group: PermGroupVm): boolean {
    return (
      group.actionCodes.length > 0 && this.groupCheckedCount(group) === group.actionCodes.length
    );
  }

  isGroupPartial(group: PermGroupVm): boolean {
    const n = this.groupCheckedCount(group);
    return n > 0 && n < group.actionCodes.length;
  }

  groupPercent(group: PermGroupVm): number {
    return group.actionCodes.length
      ? Math.round((this.groupCheckedCount(group) / group.actionCodes.length) * 100)
      : 0;
  }

  get totalChecked(): number {
    return this.granted.size;
  }

  get totalPermissions(): number {
    return this.groups.reduce((sum, g) => sum + g.actionCodes.length, 0);
  }

  // ---------------------------------------------------------------------------
  // Phạm vi dữ liệu (theo trang)
  // ---------------------------------------------------------------------------

  /** Trang có quyền nào đang tick mà áp dụng được phạm vi dữ liệu không. */
  itemHasCheckedScopable(item: PermItemVm): boolean {
    return item.actions.some((a) => a.scopable && this.granted.has(a.code));
  }

  /** Phạm vi chung của các quyền đã tick trên trang; MIXED nếu khác nhau. */
  getItemScope(item: PermItemVm): string | null {
    const scopes = new Set(
      item.actions
        .filter((a) => a.scopable && this.granted.has(a.code))
        .map((a) => this.granted.get(a.code) || DEFAULT_SCOPE),
    );
    if (scopes.size === 0) return null;
    return scopes.size === 1 ? [...scopes][0] : MIXED_SCOPE;
  }

  onItemScopeChange(item: PermItemVm, scope: string): void {
    if (!scope || scope === MIXED_SCOPE) return;
    this.itemScope.set(item.key, scope);
    for (const action of item.actions) {
      if (action.scopable && this.granted.has(action.code)) {
        this.granted.set(action.code, scope);
      }
    }
    this.granted = new Map(this.granted);
  }

  // ---------------------------------------------------------------------------
  // Lưu / hoàn tác
  // ---------------------------------------------------------------------------

  get unsavedCount(): number {
    let count = 0;
    for (const [code, scope] of this.granted) {
      if (this.savedGranted.get(code) !== scope) count++;
    }
    for (const code of this.savedGranted.keys()) {
      if (!this.granted.has(code)) count++;
    }
    return count;
  }

  get isDirty(): boolean {
    return !!this.selectedRoleId && this.unsavedCount > 0;
  }

  discardChanges(): void {
    this.granted = new Map(this.savedGranted);
    this.itemScope = new Map();
  }

  savePermissions(): void {
    if (!this.selectedRoleId || !this.isDirty) return;

    const payload: SetRolePermissionsRequest = {
      roleId: this.selectedRoleId,
      permissions: Array.from(this.granted.entries()).map(([permissionCode, dataScope]) => ({
        permissionCode,
        dataScope: dataScope as DataScope,
      })),
    };

    this.permSaving = true;
    this.apiService.post<boolean>(this.apiService.ROLE.SET_PERMISSIONS, payload).subscribe({
      next: (success) => {
        this.permSaving = false;
        if (success === false) {
          this.message.error(this.i18n.genericError());
          this.cdr.markForCheck();
          return;
        }
        this.message.success(this.i18n.saveSuccess());
        this.loadRoleDetail(this.selectedRoleId!);
      },
      error: (err: any) => {
        this.permSaving = false;
        this.message.error(this.i18n.genericError(err.error));
        this.cdr.markForCheck();
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Tải dữ liệu
  // ---------------------------------------------------------------------------

  private loadRoleOptions(): void {
    this.rolesLoading = true;
    this.apiService
      .post<RoleSelectBoxDto[]>(this.apiService.ROLE.SELECT_BOX, { isActive: true })
      .subscribe({
        next: (res) => {
          this.roleOptions = res || [];
          this.rolesLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.rolesLoading = false;
          this.roleOptions = [];
          this.cdr.markForCheck();
        },
      });
  }

  private loadRoleDetail(id: string): void {
    this.permLoading = true;
    this.cdr.markForCheck();

    this.apiService.post<RoleDto>(this.apiService.ROLE.DETAIL, { id }).subscribe({
      next: (role) => {
        if (this.selectedRoleId !== id) return; // đã chuyển sang vai trò khác
        this.selectedRole = role;
        const map = new Map<string, string>();
        for (const p of role.permissions || []) {
          if (p.permissionCode) {
            map.set(p.permissionCode, p.dataScope || DEFAULT_SCOPE);
          }
        }
        this.savedGranted = map;
        this.granted = new Map(map);
        this.itemScope = new Map();
        this.permLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.permLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private loadPermissionTree(): void {
    this.apiService.post<PermissionTreeGroup[]>(this.apiService.PERMISSION.TREE, {}).subscribe({
      next: (res) => {
        this.permissionGroups = Array.isArray(res) ? res : [];
        this.buildViewModel();
        this.cdr.markForCheck();
      },
      error: () => {
        this.apiService.post<PermissionDto[]>(this.apiService.PERMISSION.LIST, {}).subscribe({
          next: (list) => {
            this.permissionGroups = this.groupFromFlat(list || []);
            this.buildViewModel();
            this.cdr.markForCheck();
          },
        });
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Dịch nhãn & dựng view model
  // ---------------------------------------------------------------------------

  /** Dịch theo key; thiếu bản dịch thì dùng tên API trả về (không bao giờ hiện mã kỹ thuật nếu có tên). */
  private tr(key: string, fallback: string | undefined | null): string {
    const value = this.translate.instant(key);
    return value && value !== key ? value : fallback || '';
  }

  private buildViewModel(): void {
    this.groups = this.permissionGroups.map((group) => {
      const module = group.module || 'OTHER';
      const items: PermItemVm[] = (group.items || []).map((item) => {
        const label = this.tr(`role.permission.item.${item.key}`, item.name);
        const actions: PermActionVm[] = (item.actions || []).map((a) => ({
          code: a.code,
          action: a.action,
          label: this.tr(`role.permission.action.${a.action}`, a.actionName || a.name),
          scopable: a.isScopable !== false,
        }));
        return {
          key: item.key,
          label,
          actions,
          hasScopable: actions.some((a) => a.scopable),
          search: normalizeSearchText(label),
        };
      });
      // Dự phòng: API cũ / module chưa khai báo nhóm trả moduleName = mã -> thử dịch theo tên trang
      const label = this.tr(
        `role.permission.module.${module}`,
        this.tr(`role.permission.item.${module}`, group.moduleName),
      );
      return {
        module,
        label,
        icon: MODULE_ICONS[module] || 'appstore',
        items,
        actionCodes: items.flatMap((i) => i.actions.map((a) => a.code)),
        search: normalizeSearchText(label),
      };
    });
    this.applyFilter();
  }

  private applyFilter(): void {
    const keyword = normalizeSearchText(this.searchText);
    if (!keyword) {
      this.filteredGroups = this.groups;
      return;
    }
    const words = keyword.split(/\s+/).filter(Boolean);
    const match = (text: string) => words.every((w) => text.includes(w));

    this.filteredGroups = this.groups
      .map((g) => {
        if (match(g.search)) return g; // trùng tên module -> hiện cả module
        const items = g.items.filter((i) => match(i.search) || match(`${g.search} ${i.search}`));
        return items.length ? { ...g, items } : null;
      })
      .filter((g): g is PermGroupVm => g !== null);
  }

  private groupFromFlat(list: PermissionDto[]): PermissionTreeGroup[] {
    const map = new Map<string, PermissionDto[]>();
    for (const item of list) {
      const module = item.module || 'OTHER';
      if (!map.has(module)) map.set(module, []);
      map.get(module)!.push(item);
    }
    return Array.from(map.entries()).map(([module, permissions]) => ({
      module,
      moduleName: module,
      items: [
        {
          key: module,
          name: module,
          actions: permissions.map((p) => ({
            code: p.code,
            name: p.name,
            action: p.action,
            actionName: p.actionName || p.name,
            isScopable: p.isScopable,
          })),
        },
      ],
      permissions,
    }));
  }

  trackGroup = (_: number, g: PermGroupVm) => g.module;
}
