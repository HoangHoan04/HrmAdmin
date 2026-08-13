import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import {
  DataScope,
  PermissionActionNode,
  PermissionDto,
  PermissionItemNode,
  PermissionTreeGroup,
  RoleDto,
  RoleSelectBoxDto,
  SetRolePermissionsRequest,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-role-access-panel',
  templateUrl: './role-access-panel.component.html',
  styleUrls: ['../access-control-manager.component.scss'],
})
export class RoleAccessPanelComponent implements OnInit, OnChanges {
  @Input() initialRoleId: string | null = null;

  readonly dataScopes = Object.values(enumData.DATA_SCOPE);

  roleOptions: RoleSelectBoxDto[] = [];
  selectedRoleId: string | null = null;
  selectedRole: RoleDto | null = null;

  permissionGroups: PermissionTreeGroup[] = [];
  checkedCodes = new Set<string>();
  dataScopeByCode: Record<string, DataScope | string> = {};
  expandedItems = new Set<string>();
  initialSnapshot = '';
  permLoading = false;
  permSaving = false;
  rolesLoading = false;

  constructor(
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadRoleOptions();
    this.loadPermissionTree();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialRoleId'] && this.initialRoleId) {
      this.selectedRoleId = this.initialRoleId;
      this.onRoleSelected(this.initialRoleId);
    }
  }

  onRoleSelected(roleId: string | null): void {
    this.selectedRoleId = roleId;
    this.selectedRole = null;
    this.checkedCodes = new Set();
    this.dataScopeByCode = {};
    this.initialSnapshot = '';
    if (!roleId) {
      this.cdr.markForCheck();
      return;
    }
    this.loadRoleDetail(roleId);
  }

  get isDirty(): boolean {
    return !!this.selectedRoleId && this.snapshot() !== this.initialSnapshot;
  }

  isItemExpanded(key: string): boolean {
    return this.expandedItems.has(key);
  }

  toggleItemExpand(key: string): void {
    if (this.expandedItems.has(key)) {
      this.expandedItems.delete(key);
    } else {
      this.expandedItems.add(key);
    }
    this.expandedItems = new Set(this.expandedItems);
  }

  isChecked(code: string): boolean {
    return this.checkedCodes.has(code);
  }

  onCheck(action: PermissionActionNode, checked: boolean): void {
    if (checked) {
      this.checkedCodes.add(action.code);
      if (!this.dataScopeByCode[action.code]) {
        this.dataScopeByCode[action.code] = 'OWN';
      }
    } else {
      this.checkedCodes.delete(action.code);
    }
    this.checkedCodes = new Set(this.checkedCodes);
  }

  getScope(code: string): DataScope | string {
    return this.dataScopeByCode[code] || 'OWN';
  }

  onScopeChange(code: string, scope: DataScope | string): void {
    this.dataScopeByCode[code] = scope;
  }

  toggleItem(item: PermissionItemNode, checked: boolean): void {
    for (const action of item.actions || []) {
      this.onCheck(action, checked);
    }
  }

  toggleModule(group: PermissionTreeGroup, checked: boolean): void {
    for (const item of group.items || []) {
      this.toggleItem(item, checked);
    }
  }

  isItemFullyChecked(item: PermissionItemNode): boolean {
    const list = item.actions || [];
    return list.length > 0 && list.every((a) => this.checkedCodes.has(a.code));
  }

  isItemIndeterminate(item: PermissionItemNode): boolean {
    const list = item.actions || [];
    const count = list.filter((a) => this.checkedCodes.has(a.code)).length;
    return count > 0 && count < list.length;
  }

  isModuleFullyChecked(group: PermissionTreeGroup): boolean {
    const actions = this.flatActions(group);
    return actions.length > 0 && actions.every((a) => this.checkedCodes.has(a.code));
  }

  isModuleIndeterminate(group: PermissionTreeGroup): boolean {
    const actions = this.flatActions(group);
    const count = actions.filter((a) => this.checkedCodes.has(a.code)).length;
    return count > 0 && count < actions.length;
  }

  moduleCheckedCount(group: PermissionTreeGroup): number {
    return this.flatActions(group).filter((a) => this.checkedCodes.has(a.code)).length;
  }

  moduleTotalCount(group: PermissionTreeGroup): number {
    return this.flatActions(group).length;
  }

  get totalChecked(): number {
    return this.checkedCodes.size;
  }

  get totalPermissions(): number {
    return this.permissionGroups.reduce((sum, g) => sum + this.moduleTotalCount(g), 0);
  }

  goEmployeeTab(): void {
    this.router.navigate([ROUTES_CONFIG.ROLE_MANAGER.children.ACCESS_CONTROL.path], {
      queryParams: { tab: 'employee' },
    });
  }

  savePermissions(): void {
    if (!this.selectedRoleId) return;

    const payload: SetRolePermissionsRequest = {
      roleId: this.selectedRoleId,
      permissions: Array.from(this.checkedCodes).map((permissionCode) => ({
        permissionCode,
        dataScope: this.dataScopeByCode[permissionCode] || 'OWN',
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
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.permSaving = false;
        this.message.error(this.i18n.genericError(err.error));
        this.cdr.markForCheck();
      },
    });
  }

  private snapshot(): string {
    const codes = Array.from(this.checkedCodes).sort();
    return codes.map((c) => `${c}:${this.dataScopeByCode[c] || 'OWN'}`).join('|');
  }

  private flatActions(group: PermissionTreeGroup): PermissionActionNode[] {
    return (group.items || []).flatMap((item) => item.actions || []);
  }

  private expandAllItems(): void {
    const keys = new Set<string>();
    for (const group of this.permissionGroups) {
      for (const item of group.items || []) {
        keys.add(`${group.module}:${item.key}`);
      }
    }
    this.expandedItems = keys;
  }

  private loadRoleOptions(): void {
    this.rolesLoading = true;
    this.apiService
      .post<RoleSelectBoxDto[]>(this.apiService.ROLE.SELECT_BOX, { isActive: true })
      .subscribe({
        next: (res) => {
          this.roleOptions = res || [];
          this.rolesLoading = false;
          if (this.initialRoleId) {
            this.selectedRoleId = this.initialRoleId;
            this.onRoleSelected(this.initialRoleId);
          }
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
    this.checkedCodes = new Set();
    this.dataScopeByCode = {};
    this.cdr.markForCheck();

    this.apiService.post<RoleDto>(this.apiService.ROLE.DETAIL, { id }).subscribe({
      next: (role) => {
        this.selectedRole = role;
        for (const p of role.permissions || []) {
          const code = p.permissionCode;
          if (!code) continue;
          this.checkedCodes.add(code);
          this.dataScopeByCode[code] = p.dataScope || 'OWN';
        }
        this.checkedCodes = new Set(this.checkedCodes);
        this.initialSnapshot = this.snapshot();
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
        this.permissionGroups = this.normalizeTree(res);
        this.expandAllItems();
        this.cdr.markForCheck();
      },
      error: () => {
        this.apiService.post<PermissionDto[]>(this.apiService.PERMISSION.LIST, {}).subscribe({
          next: (list) => {
            this.permissionGroups = this.groupFromFlat(list || []);
            this.expandAllItems();
            this.cdr.markForCheck();
          },
        });
      },
    });
  }

  private normalizeTree(res: PermissionTreeGroup[]): PermissionTreeGroup[] {
    if (!Array.isArray(res) || !res.length) return [];
    return res.map((group) => {
      if (group.items?.length) return group;
      return this.groupFromFlat(group.permissions || [])[0] || group;
    });
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
}
