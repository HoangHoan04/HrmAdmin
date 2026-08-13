import { PERMISSION_CODES } from '@/app/core/constants/common';
import { BranchSelectBoxDto, CompanySelectBoxDto, HeadcountNode } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { PermissionService } from '@/app/core/services/permission.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

type HeadcountRow = HeadcountNode & {
  fillPercent: number;
  overstaffed: number;
  isEditable: boolean;
  isAggregated: boolean;
  saving?: boolean;
  dirty?: boolean;
};

@Component({
  standalone: false,
  selector: 'app-headcount-manager',
  templateUrl: './headcount-manager.component.html',
  styleUrls: ['./headcount-manager.component.scss'],
})
export class HeadcountManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'recruitment.headcount.entityName';

  data: HeadcountRow[] = [];
  loading = false;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  companyId: string | null = null;
  branchId: string | null = null;
  canUpdate = false;

  summary = {
    totalPlanned: 0,
    totalActual: 0,
    totalVacancy: 0,
    overstaffedRows: 0,
  };

  private readonly typeMeta: Record<string, { labelKey: string; icon: string; tone: string }> = {
    COMPANY: { labelKey: 'recruitment.common.company', icon: 'bank', tone: 'company' },
    BRANCH: { labelKey: 'recruitment.common.branch', icon: 'apartment', tone: 'branch' },
    DEPARTMENT: { labelKey: 'recruitment.common.department', icon: 'cluster', tone: 'department' },
    PART: { labelKey: 'recruitment.common.part', icon: 'appstore', tone: 'part' },
    POSITION: { labelKey: 'recruitment.common.position', icon: 'idcard', tone: 'position' },
  };

  constructor(
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly permissionSvc: PermissionService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.canUpdate = this.permissionSvc.has(PERMISSION_CODES.RECRUITMENT_HEADCOUNT_UPDATE);
    this.loadCompanies();
    this.loadData();
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.companies = res;
        this.cdr.markForCheck();
      },
    });
  }

  onCompanyChange(companyId: string | null): void {
    this.companyId = companyId;
    this.branchId = null;
    this.branches = [];
    if (companyId) {
      this.apiService
        .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, { companyId })
        .subscribe({
          next: (res) => {
            this.branches = res;
            this.cdr.markForCheck();
          },
        });
    }
    this.loadData();
  }

  onBranchChange(branchId: string | null): void {
    this.branchId = branchId;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.apiService
      .post<HeadcountNode[]>(this.apiService.HEADCOUNT.TREE, {
        companyId: this.companyId || undefined,
        branchId: this.branchId || undefined,
      })
      .subscribe({
        next: (rows) => {
          this.data = rows.map((row) => this.toRow(row));
          this.rebuildSummary();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadListFailed(this.ENTITY_KEY, err.error));
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  canEditRow(row: HeadcountRow): boolean {
    return this.canUpdate && row.isEditable !== false;
  }

  onPlannedChange(row: HeadcountRow): void {
    if (!this.canEditRow(row)) return;
    row.dirty = true;
    this.refreshRowMetrics(row);
    this.rebuildSummary();
  }

  saveRow(row: HeadcountRow): void {
    if (!this.canEditRow(row) || row.saving) return;
    row.saving = true;
    this.apiService
      .post<boolean>(this.apiService.HEADCOUNT.UPSERT_ROW, {
        nodeType: row.nodeType,
        id: row.id,
        plannedLimit: row.plannedLimit ?? null,
      })
      .subscribe({
        next: (ok) => {
          row.saving = false;
          if (ok) {
            row.dirty = false;
            this.message.success(this.i18n.updateSuccess());
            this.refreshRowMetrics(row);
            this.rebuildSummary();
          } else {
            this.message.error(this.i18n.genericError());
          }
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          row.saving = false;
          this.message.error(this.i18n.genericError(err.error));
          this.cdr.markForCheck();
        },
      });
  }

  typeLabelKey(nodeType: string): string {
    return this.typeMeta[nodeType]?.labelKey || 'recruitment.headcount.nodeType';
  }

  typeIcon(nodeType: string): string {
    return this.typeMeta[nodeType]?.icon || 'tag';
  }

  typeTone(nodeType: string): string {
    return this.typeMeta[nodeType]?.tone || 'default';
  }

  fillStatus(row: HeadcountRow): 'empty' | 'ok' | 'warn' | 'full' | 'over' {
    if (row.plannedLimit == null || row.plannedLimit <= 0) return 'empty';
    if (row.overstaffed > 0) return 'over';
    if (row.fillPercent >= 100) return 'full';
    if (row.fillPercent >= 80) return 'warn';
    return 'ok';
  }

  fillBarWidth(row: HeadcountRow): number {
    if (!row.plannedLimit || row.plannedLimit <= 0) return 0;
    return Math.min(row.fillPercent, 100);
  }

  private toRow(row: HeadcountNode): HeadcountRow {
    const planned = row.plannedLimit ?? null;
    const actual = row.actualCount || 0;
    const overstaffed = planned != null && planned >= 0 ? Math.max(0, actual - planned) : 0;
    const vacancy = planned == null ? null : Math.max(0, planned - actual);
    const fillPercent =
      planned != null && planned > 0 ? Math.min(999, Math.round((actual / planned) * 100)) : 0;

    return {
      ...row,
      vacancy,
      fillPercent,
      overstaffed,
      isEditable: row.isEditable !== false,
      isAggregated: !!row.isAggregated,
      dirty: false,
    };
  }

  private refreshRowMetrics(row: HeadcountRow): void {
    const planned = row.plannedLimit ?? null;
    const actual = row.actualCount || 0;
    row.overstaffed = planned != null && planned >= 0 ? Math.max(0, actual - planned) : 0;
    row.vacancy = planned == null ? null : Math.max(0, planned - actual);
    row.fillPercent =
      planned != null && planned > 0 ? Math.min(999, Math.round((actual / planned) * 100)) : 0;
  }

  private rebuildSummary(): void {
    const leaves = this.data.filter((r) => r.nodeType === 'POSITION');
    const source = leaves.length ? leaves : this.data.filter((r) => r.nodeType !== 'COMPANY');

    let planned = 0;
    let actual = 0;
    let vacancy = 0;
    let over = 0;

    for (const row of source) {
      if (row.plannedLimit != null) planned += row.plannedLimit;
      actual += row.actualCount || 0;
      if (row.vacancy != null) vacancy += row.vacancy;
      if (row.overstaffed > 0) over += 1;
    }

    this.summary = {
      totalPlanned: planned,
      totalActual: actual,
      totalVacancy: vacancy,
      overstaffedRows: over,
    };
  }
}
