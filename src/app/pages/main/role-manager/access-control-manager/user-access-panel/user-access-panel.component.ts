import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import {
  EmployeeAccessSummaryDto,
  EmployeeSelectBoxDto,
  PagedResult,
  RoleDto,
  SetEmployeeRolesRequest,
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
import { Subject, forkJoin, of, takeUntil } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CatalogAction,
  CatalogGroup,
  CatalogItem,
  PermissionCatalogService,
} from '../permission-catalog.service';

interface EffectiveItem {
  item: CatalogItem;
  actions: CatalogAction[];
}

interface EffectiveGroup {
  group: CatalogGroup;
  items: EffectiveItem[];
  count: number;
}

const EMPLOYEE_ROLE_CODE = 'EMPLOYEE';
const ADMIN_TYPE = 'ADMIN';

@Component({
  standalone: false,
  selector: 'app-user-access-panel',
  templateUrl: './user-access-panel.component.html',
  styleUrls: ['../access-control-manager.component.scss', './user-access-panel.component.scss'],
})
export class UserAccessPanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() initialEmployeeId: string | null = null;

  employees: EmployeeSelectBoxDto[] = [];
  employeesLoading = false;
  selectedEmployeeId: string | null = null;

  summary: EmployeeAccessSummaryDto | null = null;
  summaryLoading = false;

  roles: RoleDto[] = [];
  filteredRoles: RoleDto[] = [];
  roleSearch = '';
  rolesLoading = false;

  /** Vai trò gán theo nhân viên (sửa được ở đây). */
  selectedRoleIds = new Set<string>();
  private savedRoleIds = new Set<string>();
  /** Vai trò gán trực tiếp cho tài khoản (chỉ hiển thị). */
  lockedRoleIds = new Set<string>();

  saving = false;

  private catalog: CatalogGroup[] = [];
  private roleDetails = new Map<string, RoleDto>();
  private effectiveSeq = 0;
  effectiveLoading = false;
  effectiveGroups: EffectiveGroup[] = [];
  effectivePermCount = 0;
  effectivePageCount = 0;
  expandedEffective = new Set<string>();

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly message: NzMessageService,
    private readonly modal: NzModalService,
    private readonly i18n: I18nMessageService,
    private readonly translate: TranslateService,
    private readonly apiService: ApiService,
    private readonly catalogService: PermissionCatalogService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadRoles();
    this.catalogService
      .loadTree()
      .pipe(takeUntil(this.destroy$))
      .subscribe((tree) => {
        this.catalog = this.catalogService.buildCatalog(tree);
        this.recomputeEffective();
      });
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.catalogService.loadTree().subscribe((tree) => {
        this.catalog = this.catalogService.buildCatalog(tree);
        this.recomputeEffective();
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialEmployeeId'] && this.initialEmployeeId) {
      this.switchEmployee(this.initialEmployeeId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------------------------------------------------------------------------
  // Chọn nhân viên
  // ---------------------------------------------------------------------------

  onEmployeeSelected(employeeId: string | null): void {
    if (employeeId === this.selectedEmployeeId) return;

    if (this.isDirty) {
      const previous = this.selectedEmployeeId;
      this.selectedEmployeeId = null;
      this.cdr.detectChanges();
      this.selectedEmployeeId = previous;
      this.modal.confirm({
        nzTitle: this.translate.instant('role.unsavedChanges', { count: this.unsavedCount }),
        nzContent: this.translate.instant('role.leaveConfirm'),
        nzOkDanger: true,
        nzOnOk: () => this.switchEmployee(employeeId),
      });
      return;
    }
    this.switchEmployee(employeeId);
  }

  private switchEmployee(employeeId: string | null): void {
    this.selectedEmployeeId = employeeId;
    this.summary = null;
    this.selectedRoleIds = new Set();
    this.savedRoleIds = new Set();
    this.lockedRoleIds = new Set();
    this.effectiveGroups = [];
    if (employeeId) {
      this.loadSummary(employeeId);
    }
    this.cdr.markForCheck();
  }

  private loadSummary(employeeId: string): void {
    this.summaryLoading = true;
    this.cdr.markForCheck();

    this.apiService
      .post<EmployeeAccessSummaryDto>(this.apiService.USER_ROLE.EMPLOYEE_SUMMARY, { employeeId })
      .subscribe({
        next: (res) => {
          if (this.selectedEmployeeId !== employeeId) return;
          this.summary = res;
          const editable = (res.roles || [])
            .filter((r) => r.source !== 'USER')
            .map((r) => r.roleId);
          const locked = (res.roles || []).filter((r) => r.source === 'USER').map((r) => r.roleId);
          this.selectedRoleIds = new Set(editable);
          this.savedRoleIds = new Set(editable);
          this.lockedRoleIds = new Set(locked);
          this.summaryLoading = false;
          this.recomputeEffective();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.summaryLoading = false;
          this.message.error(this.i18n.genericError(err.error));
          this.cdr.markForCheck();
        },
      });
  }

  // ---------------------------------------------------------------------------
  // Thông tin hiển thị
  // ---------------------------------------------------------------------------

  get isAdminAccount(): boolean {
    return (this.summary?.account?.type || '').toUpperCase() === ADMIN_TYPE;
  }

  get initials(): string {
    const name = (this.summary?.fullName || '').trim();
    if (!name) return '?';
    const parts = name.split(/\s+/);
    const last = parts[parts.length - 1] || '';
    const first = parts.length > 1 ? parts[0] : '';
    return ((first[0] || '') + (last[0] || '')).toUpperCase() || name[0].toUpperCase();
  }

  get statusMeta(): { labelKey: string; color: string } | null {
    const value = (this.summary?.status || '').toUpperCase();
    if (!value) return null;
    const meta = Object.values(enumData.WORK_STATUS).find(
      (s: any) => (s.value || '').toUpperCase() === value,
    ) as any;
    return meta ? { labelKey: meta.labelKey, color: meta.color } : null;
  }

  // ---------------------------------------------------------------------------
  // Vai trò
  // ---------------------------------------------------------------------------

  onRoleSearch(value: string): void {
    this.roleSearch = value;
    this.applyRoleFilter();
  }

  private applyRoleFilter(): void {
    const keyword = normalizeSearchText(this.roleSearch);
    if (!keyword) {
      this.filteredRoles = this.roles;
      return;
    }
    const words = keyword.split(/\s+/).filter(Boolean);
    this.filteredRoles = this.roles.filter((r) => {
      const text = normalizeSearchText(`${r.name} ${r.code} ${r.description || ''}`);
      return words.every((w) => text.includes(w));
    });
  }

  isRoleSelected(role: RoleDto): boolean {
    return this.selectedRoleIds.has(role.id!) || this.lockedRoleIds.has(role.id!);
  }

  isRoleLocked(role: RoleDto): boolean {
    return this.lockedRoleIds.has(role.id!);
  }

  toggleRole(role: RoleDto): void {
    if (!role.id || this.isRoleLocked(role) || this.saving) return;
    const next = new Set(this.selectedRoleIds);
    if (next.has(role.id)) next.delete(role.id);
    else next.add(role.id);
    this.selectedRoleIds = next;
    this.recomputeEffective();
  }

  get selectedCount(): number {
    return new Set([...this.selectedRoleIds, ...this.lockedRoleIds]).size;
  }

  openRolePermissions(role: RoleDto, event: Event): void {
    event.stopPropagation();
    this.router.navigate([ROUTES_CONFIG.ROLE_MANAGER.children.ACCESS_CONTROL.path], {
      queryParams: { tab: 'role', roleId: role.id },
    });
  }

  get unsavedCount(): number {
    let count = 0;
    for (const id of this.selectedRoleIds) if (!this.savedRoleIds.has(id)) count++;
    for (const id of this.savedRoleIds) if (!this.selectedRoleIds.has(id)) count++;
    return count;
  }

  get isDirty(): boolean {
    return !!this.selectedEmployeeId && this.unsavedCount > 0;
  }

  get showDefaultRoleNotice(): boolean {
    return !!this.summary && !this.isAdminAccount && this.selectedCount === 0;
  }

  discardChanges(): void {
    this.selectedRoleIds = new Set(this.savedRoleIds);
    this.recomputeEffective();
  }

  saveEmployeeRoles(): void {
    if (!this.selectedEmployeeId || !this.isDirty) return;

    const employeeId = this.selectedEmployeeId;
    const payload: SetEmployeeRolesRequest = {
      employeeId,
      roleIds: Array.from(this.selectedRoleIds),
    };

    this.saving = true;
    this.apiService.post<boolean>(this.apiService.USER_ROLE.SET_BY_EMPLOYEE, payload).subscribe({
      next: (success) => {
        this.saving = false;
        if (success === false) {
          this.message.error(this.i18n.genericError());
          this.cdr.markForCheck();
          return;
        }
        this.message.success(this.i18n.saveSuccess());
        this.loadSummary(employeeId);
      },
      error: (err: any) => {
        this.saving = false;
        this.message.error(this.i18n.genericError(err.error));
        this.cdr.markForCheck();
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Quyền thực tế (xem trước)
  // ---------------------------------------------------------------------------

  isEffectiveExpanded(module: string): boolean {
    return this.expandedEffective.has(module);
  }

  toggleEffective(module: string): void {
    const next = new Set(this.expandedEffective);
    if (next.has(module)) next.delete(module);
    else next.add(module);
    this.expandedEffective = next;
  }

  private recomputeEffective(): void {
    if (!this.summary || this.isAdminAccount || !this.catalog.length) {
      this.effectiveGroups = [];
      this.effectivePermCount = 0;
      this.effectivePageCount = 0;
      this.cdr.markForCheck();
      return;
    }

    let roleIds = Array.from(new Set([...this.selectedRoleIds, ...this.lockedRoleIds]));
    if (roleIds.length === 0) {
      // Không gán vai trò -> hệ thống dùng vai trò EMPLOYEE mặc định
      const employeeRole = this.roles.find(
        (r) => (r.code || '').toUpperCase() === EMPLOYEE_ROLE_CODE,
      );
      roleIds = employeeRole?.id ? [employeeRole.id] : [];
    }

    const seq = ++this.effectiveSeq;
    const missing = roleIds.filter((id) => !this.roleDetails.has(id));
    if (!missing.length) {
      this.buildEffective(roleIds);
      return;
    }

    this.effectiveLoading = true;
    this.cdr.markForCheck();
    forkJoin(
      missing.map((id) =>
        this.apiService
          .post<RoleDto>(this.apiService.ROLE.DETAIL, { id })
          .pipe(catchError(() => of(null))),
      ),
    ).subscribe((details) => {
      details.forEach((d, i) => {
        if (d) this.roleDetails.set(missing[i], d);
      });
      if (seq !== this.effectiveSeq) return; // đã có lần tính mới hơn
      this.effectiveLoading = false;
      this.buildEffective(roleIds);
    });
  }

  private buildEffective(roleIds: string[]): void {
    const granted = new Set<string>();
    for (const id of roleIds) {
      for (const p of this.roleDetails.get(id)?.permissions || []) {
        if (p.permissionCode) granted.add(p.permissionCode);
      }
    }

    const groups: EffectiveGroup[] = [];
    let pages = 0;
    let perms = 0;
    for (const group of this.catalog) {
      const items: EffectiveItem[] = [];
      for (const item of group.items) {
        const actions = item.actions.filter((a) => granted.has(a.code));
        if (actions.length) {
          items.push({ item, actions });
          pages++;
          perms += actions.length;
        }
      }
      if (items.length) {
        groups.push({ group, items, count: items.reduce((s, i) => s + i.actions.length, 0) });
      }
    }

    this.effectiveGroups = groups;
    this.effectivePermCount = perms;
    this.effectivePageCount = pages;
    this.effectiveLoading = false;
    this.cdr.markForCheck();
  }

  // ---------------------------------------------------------------------------
  // Tải danh sách
  // ---------------------------------------------------------------------------

  private loadEmployees(): void {
    this.employeesLoading = true;
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (res) => {
          this.employees = res || [];
          this.employeesLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.employees = [];
          this.employeesLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private loadRoles(): void {
    this.rolesLoading = true;
    this.apiService
      .post<PagedResult<RoleDto>>(this.apiService.ROLE.PAGINATION, {
        pageIndex: 1,
        pageSize: 500,
        isActive: true,
      })
      .subscribe({
        next: (res) => {
          this.roles = res?.items || [];
          this.applyRoleFilter();
          this.rolesLoading = false;
          this.recomputeEffective();
          this.cdr.markForCheck();
        },
        error: () => {
          this.roles = [];
          this.filteredRoles = [];
          this.rolesLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  trackRole = (_: number, r: RoleDto) => r.id;
}
