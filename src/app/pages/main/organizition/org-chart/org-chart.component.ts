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
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  NzFormatBeforeDropEvent,
  NzTreeNodeOptions,
} from 'ng-zorro-antd/tree';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
export class OrgChartComponent implements OnInit {
  companies: CompanySelectBoxDto[] = [];
  companyId: string | null = null;
  includeParts = true;
  loading = false;
  reparenting = false;
  treeNodes: OrgChartTreeNode[] = [];

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
  }

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

  onCompanyChange(companyId: string | null): void {
    this.companyId = companyId;
    if (companyId) {
      this.loadTree();
    } else {
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
        this.treeNodes = root ? [this.mapToTreeNode(root)] : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.treeNodes = [];
        this.loading = false;
        this.cdr.markForCheck();
        this.message.error(err?.error || this.i18n.instant('organization.orgChart.loadFailed'));
      },
    });
  }

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

  nodeTypeColor(nodeType?: string): string {
    switch ((nodeType || '').toUpperCase()) {
      case 'COMPANY':
        return 'blue';
      case 'BRANCH':
        return 'geekblue';
      case 'DEPARTMENT':
        return 'purple';
      case 'PART':
        return 'cyan';
      default:
        return 'default';
    }
  }

  nodeTypeLabel(nodeType?: string): string {
    const type = (nodeType || '').toUpperCase();
    const key = `organization.orgChart.nodeType.${type.toLowerCase()}`;
    const translated = this.i18n.instant(key);
    return translated === key ? type : translated;
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
}
