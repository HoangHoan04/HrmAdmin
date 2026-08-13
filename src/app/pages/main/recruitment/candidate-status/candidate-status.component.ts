import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import { Candidate, CandidateStatusSummary, PagedResult } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { candidateStatusLabel } from '@/app/core/utils/recruitment-label.util';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import type { EChartsCoreOption } from 'echarts/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

type StatusMeta = { value: string; labelKey: string; color: string };

@Component({
  standalone: false,
  selector: 'app-candidate-status',
  templateUrl: './candidate-status.component.html',
  styleUrls: ['./candidate-status.component.scss'],
})
export class CandidateStatusComponent implements OnInit, OnDestroy {
  loading = false;
  summaries: CandidateStatusSummary[] = [];
  columns: StatusMeta[] = [];
  candidatesByStatus: Record<string, Candidate[]> = {};
  total = 0;
  activeInPipeline = 0;
  hiredCount = 0;
  rejectedCount = 0;

  funnelOption: EChartsCoreOption = {};
  pieOption: EChartsCoreOption = {};
  barOption: EChartsCoreOption = {};

  private readonly sub = new Subscription();
  private readonly statusColors: Record<string, string> = {
    NEW: '#2563eb',
    SCREENING: '#7c3aed',
    INTERVIEW: '#d97706',
    WAITLIST: '#64748b',
    OFFER: '#0891b2',
    HIRED: '#16a34a',
    REJECTED: '#dc2626',
    WITHDRAWN: '#9ca3af',
  };

  constructor(
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.columns = Object.values(enumData.CANDIDATE_STATUS).map((x) => ({
      value: x.value,
      labelKey: x.labelKey,
      color: this.statusColors[x.value] || '#64748b',
    }));
    this.sub.add(this.translate.onLangChange.subscribe(() => this.rebuildCharts()));
    this.load();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.apiService
      .post<CandidateStatusSummary[]>(this.apiService.CANDIDATE.STATUS_SUMMARY, {})
      .subscribe({
        next: (res) => {
          this.summaries = res;
          this.rebuildKpis();
          this.rebuildCharts();
          this.cdr.markForCheck();
        },
        error: (err: any) => this.message.error(this.i18n.genericError(err.error)),
      });

    this.apiService
      .post<PagedResult<Candidate>>(this.apiService.CANDIDATE.PAGINATION, {
        pageIndex: 1,
        pageSize: 200,
      })
      .subscribe({
        next: (res) => {
          this.candidatesByStatus = {};
          for (const col of this.columns) {
            this.candidatesByStatus[col.value] = [];
          }
          for (const c of res.items) {
            const key = c.status || 'NEW';
            if (!this.candidatesByStatus[key]) this.candidatesByStatus[key] = [];
            this.candidatesByStatus[key].push(c);
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  countOf(status: string): number {
    return this.summaries.find((s) => s.status === status)?.count ?? 0;
  }

  labelOf(status: string): string {
    return candidateStatusLabel((k) => this.i18n.instant(k), status);
  }

  colorOf(status: string): string {
    return this.statusColors[status] || '#64748b';
  }

  pctOf(status: string): number {
    if (!this.total) return 0;
    return Math.round((this.countOf(status) * 100) / this.total);
  }

  openCandidateList(): void {
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_LIST.path,
    ]);
  }

  openCandidate(c: Candidate): void {
    this.router.navigate([
      ROUTES_CONFIG.RECRUITMENT.children.CANDIDATES.children.CANDIDATE_LIST.children
        .DETAIL_CANDIDATE.path,
      c.id,
    ]);
  }

  private rebuildKpis(): void {
    this.total = this.summaries.reduce((s, x) => s + (x.count || 0), 0);
    this.hiredCount = this.countOf('HIRED');
    this.rejectedCount = this.countOf('REJECTED') + this.countOf('WITHDRAWN');
    this.activeInPipeline = this.total - this.hiredCount - this.rejectedCount;
  }

  private rebuildCharts(): void {
    const labels = this.columns.map((c) => this.i18n.instant(c.labelKey));
    const values = this.columns.map((c) => this.countOf(c.value));
    const colors = this.columns.map((c) => c.color);
    const muted =
      getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim() ||
      '#6b7280';
    const border =
      getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#e5e7eb';

    this.funnelOption = {
      tooltip: { trigger: 'item', formatter: '{b}: {c}' },
      series: [
        {
          type: 'funnel',
          left: '8%',
          top: 16,
          bottom: 16,
          width: '84%',
          minSize: '18%',
          maxSize: '100%',
          sort: 'none',
          gap: 4,
          label: { show: true, position: 'inside', color: '#fff', fontSize: 11, fontWeight: 600 },
          itemStyle: { borderColor: '#fff', borderWidth: 1 },
          data: this.columns.map((c, i) => ({
            name: labels[i],
            value: Math.max(values[i], 0),
            itemStyle: { color: colors[i] },
          })),
        },
      ],
    };

    this.pieOption = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        bottom: 0,
        type: 'scroll',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: muted, fontSize: 11 },
      },
      series: [
        {
          type: 'pie',
          radius: ['46%', '70%'],
          center: ['50%', '42%'],
          padAngle: 2,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          data: this.columns
            .map((c, i) => ({
              name: labels[i],
              value: values[i],
              itemStyle: { color: colors[i] },
            }))
            .filter((x) => x.value > 0),
        },
      ],
    };

    this.barOption = {
      grid: { left: 36, right: 12, top: 20, bottom: 36 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: muted,
          fontSize: 10,
          interval: 0,
          rotate: 28,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: border, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 11 },
      },
      series: [
        {
          type: 'bar',
          data: values.map((v, i) => ({
            value: v,
            itemStyle: {
              color: colors[i],
              borderRadius: [6, 6, 0, 0],
            },
          })),
          barMaxWidth: 28,
        },
      ],
    };
  }
}
