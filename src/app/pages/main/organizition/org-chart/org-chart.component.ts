import { PERMISSION_CODES } from '@/app/core/constants/common/permission-codes';
import {
  CompanySelectBoxDto,
  GetOrgChartTreeRequest,
  OrgChartNodeDto,
  ReparentOrgChartNodeRequest,
} from '@/app/core/models';
import { ApiService } from '@/app/core/services/api.service';
import { I18nMessageService } from '@/app/core/services/i18n-message.service';
import { PermissionService } from '@/app/core/services/permission.service';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  NzFormatBeforeDropEvent,
  NzTreeNodeOptions,
} from 'ng-zorro-antd/tree';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface OrgChartFlatNode {
  id: string;
  nodeType: string;
  code: string;
  name: string;
  parentId?: string | null;
  parentName?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  displayOrder: number;
  employeeCount?: number | null;
  managerName?: string | null;
  children: OrgChartFlatNode[];
  collapsed?: boolean;
  highlighted?: boolean;
  level: number;
}

interface OrgChartTreeNode extends NzTreeNodeOptions {
  nodeType?: string;
  code?: string;
  employeeCount?: number | null;
  managerName?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  displayOrder?: number;
  children?: OrgChartTreeNode[];
}

@Component({
  standalone: false,
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.scss'],
})
export class OrgChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartViewport', { static: false }) chartViewport?: ElementRef<HTMLDivElement>;
  @ViewChild('chartContainer', { static: false }) chartContainer?: ElementRef<HTMLDivElement>;

  companies: CompanySelectBoxDto[] = [];
  companyId: string | null = null;
  includeParts = true;
  loading = false;
  reparenting = false;

  // View state
  viewMode: 'TREE' | 'LIST' = 'TREE';
  zoom = 1;
  searchText = '';
  rootNode: OrgChartFlatNode | null = null;
  treeNodes: OrgChartTreeNode[] = [];
  isFullscreen = false;

  // Detail Drawer state
  selectedNode: OrgChartFlatNode | null = null;
  drawerVisible = false;

  // Pan / Dragging state
  isPanning = false;
  startX = 0;
  startY = 0;
  scrollLeft = 0;
  scrollTop = 0;

  readonly canManage = () => this.permissionSvc.has(PERMISSION_CODES.ORG_MANAGE);

  constructor(
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly permissionSvc: PermissionService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    document.addEventListener('fullscreenchange', this.onNativeFullscreenChange);
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.onNativeFullscreenChange);
  }

  private onNativeFullscreenChange = () => {
    this.isFullscreen = !!document.fullscreenElement;
    this.cdr.markForCheck();
  };

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (items) => {
        this.companies = items ?? [];
        if (this.companies.length > 0) {
          this.companyId = this.companies[0].id;
          this.loadTree();
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.message.error(this.i18n.instant('common.messages.loadCompanyListFailed'));
        this.cdr.markForCheck();
      },
    });
  }

  setViewMode(mode: 'TREE' | 'LIST'): void {
    this.viewMode = mode;
    this.cdr.markForCheck();
    if (mode === 'TREE') {
      setTimeout(() => this.centerRoot(), 100);
    }
  }

  onCompanyChange(companyId: string | null): void {
    this.companyId = companyId;
    if (companyId) {
      this.loadTree();
    } else {
      this.rootNode = null;
      this.treeNodes = [];
      this.cdr.markForCheck();
    }
  }

  onIncludePartsChange(checked: boolean): void {
    this.includeParts = checked;
    if (this.companyId) {
      this.loadTree();
    }
  }

  loadTree(): void {
    if (!this.companyId) return;

    this.loading = true;
    this.cdr.markForCheck();
    const body: GetOrgChartTreeRequest = {
      companyId: this.companyId,
      includeParts: this.includeParts,
    };

    this.apiService.post<OrgChartNodeDto>(this.apiService.ORG_CHART.TREE, body).subscribe({
      next: (root) => {
        if (root) {
          this.rootNode = this.mapToFlatNode(root, 0, null);
          this.treeNodes = [this.mapToTreeNode(root)];
          if (this.searchText.trim()) {
            this.applySearch(this.searchText.trim());
          }
        } else {
          this.rootNode = null;
          this.treeNodes = [];
        }
        this.loading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.centerRoot(), 100);
      },
      error: (err: any) => {
        this.rootNode = null;
        this.treeNodes = [];
        this.loading = false;
        this.cdr.markForCheck();
        this.message.error(err?.error || this.i18n.instant('organization.orgChart.loadFailed'));
      },
    });
  }

  // Fullscreen toggle
  toggleFullscreen(): void {
    const container = this.chartContainer?.nativeElement || document.documentElement;
    if (!this.isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          this.isFullscreen = true;
          this.cdr.markForCheck();
        });
      } else {
        this.isFullscreen = true;
        this.cdr.markForCheck();
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {
          this.isFullscreen = false;
          this.cdr.markForCheck();
        });
      } else {
        this.isFullscreen = false;
        this.cdr.markForCheck();
      }
    }
    setTimeout(() => this.centerRoot(), 200);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isFullscreen) {
      this.toggleFullscreen();
    }
  }

  // Zoom controls
  zoomIn(): void {
    this.zoom = Math.min(2.0, Math.round((this.zoom + 0.15) * 100) / 100);
    this.cdr.markForCheck();
  }

  zoomOut(): void {
    this.zoom = Math.max(0.3, Math.round((this.zoom - 0.15) * 100) / 100);
    this.cdr.markForCheck();
  }

  resetZoom(): void {
    this.zoom = 1;
    this.centerRoot();
    this.cdr.markForCheck();
  }

  fitScreen(): void {
    if (!this.chartViewport) return;
    const el = this.chartViewport.nativeElement;
    const treeEl = el.querySelector('.family-tree') as HTMLElement;
    if (treeEl && treeEl.offsetWidth > 0) {
      const availableWidth = el.clientWidth - 64;
      const treeWidth = treeEl.offsetWidth;
      const ratio = availableWidth / treeWidth;
      this.zoom = Math.min(1.2, Math.max(0.3, Math.round(ratio * 100) / 100));
      this.cdr.markForCheck();
      setTimeout(() => this.centerRoot(), 50);
    }
  }

  centerRoot(): void {
    if (!this.chartViewport) return;
    const el = this.chartViewport.nativeElement;
    const scrollWidth = el.scrollWidth;
    const clientWidth = el.clientWidth;
    if (scrollWidth > clientWidth) {
      el.scrollLeft = (scrollWidth - clientWidth) / 2;
    }
    el.scrollTop = 0;
  }

  // Toggle Collapse / Expand
  toggleNode(node: OrgChartFlatNode, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    node.collapsed = !node.collapsed;
    this.cdr.markForCheck();
  }

  expandAll(): void {
    if (!this.rootNode) return;
    this.setCollapseStateRecursive(this.rootNode, false);
    this.cdr.markForCheck();
  }

  collapseAll(): void {
    if (!this.rootNode) return;
    this.rootNode.collapsed = false;
    (this.rootNode.children || []).forEach((c) => {
      this.setCollapseStateRecursive(c, true);
    });
    this.cdr.markForCheck();
  }

  private setCollapseStateRecursive(node: OrgChartFlatNode, collapsed: boolean): void {
    node.collapsed = collapsed;
    (node.children || []).forEach((c) => this.setCollapseStateRecursive(c, collapsed));
  }

  // Search logic
  onSearchChange(text: string): void {
    this.searchText = text;
    this.applySearch(text.trim());
    this.cdr.markForCheck();
  }

  private applySearch(kw: string): void {
    if (!this.rootNode) return;
    if (!kw) {
      this.clearHighlightRecursive(this.rootNode);
      return;
    }
    const lower = kw.toLowerCase();
    this.searchAndExpandRecursive(this.rootNode, lower);
  }

  private clearHighlightRecursive(node: OrgChartFlatNode): void {
    node.highlighted = false;
    (node.children || []).forEach((c) => this.clearHighlightRecursive(c));
  }

  private searchAndExpandRecursive(node: OrgChartFlatNode, kw: string): boolean {
    const match: boolean = Boolean(
      node.code.toLowerCase().includes(kw) ||
      node.name.toLowerCase().includes(kw) ||
      (node.managerName && node.managerName.toLowerCase().includes(kw)) ||
      (this.nodeTypeLabel(node.nodeType) && this.nodeTypeLabel(node.nodeType).toLowerCase().includes(kw)),
    );

    let childMatched = false;
    for (const child of node.children || []) {
      const childHasMatch = this.searchAndExpandRecursive(child, kw);
      if (childHasMatch) {
        childMatched = true;
      }
    }

    node.highlighted = match;
    if (childMatched) {
      node.collapsed = false;
    }
    return match || childMatched;
  }

  // Detail Drawer
  openDetail(node: OrgChartFlatNode, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedNode = node;
    this.drawerVisible = true;
    this.cdr.markForCheck();
  }

  closeDetail(): void {
    this.drawerVisible = false;
    this.selectedNode = null;
    this.cdr.markForCheck();
  }

  // Canvas Pan (Drag to scroll)
  onMouseDown(e: MouseEvent): void {
    if (!this.chartViewport) return;
    const target = e.target as HTMLElement;
    if (target.closest('.org-card') || target.closest('button') || target.closest('input')) {
      return;
    }
    this.isPanning = true;
    const el = this.chartViewport.nativeElement;
    this.startX = e.pageX - el.offsetLeft;
    this.startY = e.pageY - el.offsetTop;
    this.scrollLeft = el.scrollLeft;
    this.scrollTop = el.scrollTop;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (!this.isPanning || !this.chartViewport) return;
    e.preventDefault();
    const el = this.chartViewport.nativeElement;
    const x = e.pageX - el.offsetLeft;
    const y = e.pageY - el.offsetTop;
    const walkX = (x - this.startX) * 1.2;
    const walkY = (y - this.startY) * 1.2;
    el.scrollLeft = this.scrollLeft - walkX;
    el.scrollTop = this.scrollTop - walkY;
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isPanning = false;
  }

  // Visual formatting helpers
  nodeTypeColor(nodeType?: string): string {
    switch ((nodeType || '').toUpperCase()) {
      case 'COMPANY':
        return '#3B82F6';
      case 'BRANCH':
        return '#10B981';
      case 'DEPARTMENT':
        return '#8B5CF6';
      case 'PART':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  }

  nodeTypeBadgeBg(nodeType?: string): string {
    switch ((nodeType || '').toUpperCase()) {
      case 'COMPANY':
        return '#EFF6FF';
      case 'BRANCH':
        return '#ECFDF5';
      case 'DEPARTMENT':
        return '#F5F3FF';
      case 'PART':
        return '#FFFBEB';
      default:
        return '#F8FAFC';
    }
  }

  nodeTypeIcon(nodeType?: string): string {
    switch ((nodeType || '').toUpperCase()) {
      case 'COMPANY':
        return 'bank';
      case 'BRANCH':
        return 'apartment';
      case 'DEPARTMENT':
        return 'cluster';
      case 'PART':
        return 'team';
      default:
        return 'folder';
    }
  }

  nodeTypeLabel(nodeType?: string): string {
    const type = (nodeType || '').toUpperCase();
    const key = `organization.orgChart.nodeType.${type.toLowerCase()}`;
    const translated = this.i18n.instant(key);
    return translated === key ? type : translated;
  }

  getTotalEmployeeCount(node: OrgChartFlatNode): number {
    let total = node.employeeCount ?? 0;
    for (const child of node.children || []) {
      total += this.getTotalEmployeeCount(child);
    }
    return total;
  }

  private mapToFlatNode(
    dto: OrgChartNodeDto,
    level: number,
    parentName: string | null,
  ): OrgChartFlatNode {
    const currentTitle = `${dto.code} - ${dto.name}`;
    const children = (dto.children ?? []).map((c) =>
      this.mapToFlatNode(c, level + 1, currentTitle),
    );
    return {
      id: dto.id,
      nodeType: dto.nodeType,
      code: dto.code,
      name: dto.name,
      parentId: dto.parentId,
      parentName,
      companyId: dto.companyId,
      branchId: dto.branchId,
      displayOrder: dto.displayOrder,
      employeeCount: dto.employeeCount,
      managerName: dto.managerName,
      children,
      collapsed: false,
      highlighted: false,
      level,
    };
  }

  private mapToTreeNode(node: OrgChartNodeDto): OrgChartTreeNode {
    const children = (node.children ?? []).map((c) => this.mapToTreeNode(c));
    return {
      key: node.id,
      title: `${node.code} - ${node.name}`,
      expanded: true,
      isLeaf: children.length === 0,
      children,
      nodeType: node.nodeType,
      code: node.code,
      employeeCount: node.employeeCount,
      managerName: node.managerName,
      companyId: node.companyId,
      branchId: node.branchId,
      displayOrder: node.displayOrder,
    };
  }

  // Drag & drop (List view)
  beforeDrop = (confirm: NzFormatBeforeDropEvent): Observable<boolean> => {
    if (!this.canManage()) {
      this.message.warning(this.i18n.instant('organization.orgChart.noManagePermission'));
      return of(false);
    }

    const drag = confirm.dragNode;
    const drop = confirm.node;
    if (!drag || !drop) return of(false);

    const dragOrigin = drag.origin as OrgChartTreeNode;
    const dropOrigin = drop.origin as OrgChartTreeNode;
    const nodeType = (dragOrigin.nodeType || '').toUpperCase();

    if (nodeType === 'COMPANY') {
      this.message.warning(this.i18n.instant('organization.orgChart.cannotMoveCompany'));
      return of(false);
    }

    let newParentId: string | null = null;
    let newBranchId: string | null | undefined = undefined;
    const pos = confirm.pos;

    if (pos === 0) {
      newParentId = String(drop.key);
    } else {
      const parent = drop.getParentNode();
      newParentId = parent ? String(parent.key) : null;
    }

    const dropType = (dropOrigin.nodeType || '').toUpperCase();
    if (nodeType === 'DEPARTMENT' && dropType === 'BRANCH' && pos === 0) {
      newBranchId = String(drop.key);
    } else if (nodeType === 'DEPARTMENT' && dropType === 'BRANCH' && pos !== 0) {
      newBranchId = dropOrigin.branchId ?? String(drop.key);
    } else if (nodeType === 'PART' && dropType !== 'DEPARTMENT' && pos === 0) {
      this.message.warning(this.i18n.instant('organization.orgChart.partNeedsDepartment'));
      return of(false);
    } else if (nodeType === 'PART' && pos !== 0) {
      const parentOrigin = drop.getParentNode()?.origin as OrgChartTreeNode | undefined;
      if ((parentOrigin?.nodeType || '').toUpperCase() !== 'DEPARTMENT') {
        this.message.warning(this.i18n.instant('organization.orgChart.partNeedsDepartment'));
        return of(false);
      }
    }

    this.reparenting = true;
    this.cdr.markForCheck();
    const payload: ReparentOrgChartNodeRequest = {
      nodeType,
      id: String(drag.key),
      newParentId,
      newBranchId,
      displayOrder: dropOrigin.displayOrder ?? null,
    };

    return this.apiService.post<boolean>(this.apiService.ORG_CHART.REPARENT, payload).pipe(
      map(() => {
        this.reparenting = false;
        this.cdr.markForCheck();
        this.message.success(this.i18n.instant('organization.orgChart.reparentSuccess'));
        this.loadTree();
        return false;
      }),
      catchError((err: any) => {
        this.reparenting = false;
        this.cdr.markForCheck();
        this.message.error(err?.error || this.i18n.instant('organization.orgChart.reparentFailed'));
        return of(false);
      }),
    );
  };
}
