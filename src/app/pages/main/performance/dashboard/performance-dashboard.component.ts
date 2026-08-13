import {
  PagedResult,
  PerformanceDashboard,
  PerformanceReviewCycle,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import type { EChartsCoreOption } from 'echarts/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-performance-dashboard',
  templateUrl: './performance-dashboard.component.html',
  styleUrls: ['./performance-dashboard.component.scss'],
})
export class PerformanceDashboardComponent implements OnInit, OnDestroy {
  loading = false;
  cycles: PerformanceReviewCycle[] = [];
  cycleId: string | null = null;
  summary: PerformanceDashboard | null = null;
  pieOption: EChartsCoreOption = {};
  barOption: EChartsCoreOption = {};

  private readonly sub = new Subscription();
  private readonly bandColors: Record<string, string> = {
    '0-2': '#dc2626',
    '2-4': '#d97706',
    '4-6': '#eab308',
    '6-8': '#2563eb',
    '8-10': '#16a34a',
  };

  constructor(
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.sub.add(this.translate.onLangChange.subscribe(() => this.rebuildCharts()));
    this.apiService
      .post<PagedResult<PerformanceReviewCycle>>(this.apiService.PERFORMANCE_CYCLE.PAGINATION, {
        pageIndex: 1,
        pageSize: 200,
        sortField: 'createdAt',
        sortOrder: 'desc',
      })
      .subscribe({
        next: (res) => {
          this.cycles = res.items;
          this.cdr.markForCheck();
        },
      });
    this.load();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onCycleChange(cycleId: string | null): void {
    this.cycleId = cycleId;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.apiService
      .post<PerformanceDashboard>(this.apiService.PERFORMANCE_DASHBOARD.SUMMARY, {
        cycleId: this.cycleId || undefined,
      })
      .subscribe({
        next: (res) => {
          this.summary = res;
          this.rebuildCharts();
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

  private rebuildCharts(): void {
    const muted =
      getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim() ||
      '#6b7280';
    const border =
      getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#e5e7eb';
    const bands = this.summary?.scoreBands || [];
    const depts = this.summary?.deptScores || [];

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
          data: bands
            .map((b) => ({
              name: b.band,
              value: b.count,
              itemStyle: { color: this.bandColors[b.band] || '#64748b' },
            }))
            .filter((x) => x.value > 0),
        },
      ],
    };

    this.barOption = {
      grid: { left: 40, right: 12, top: 20, bottom: 48 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: depts.map((d) => d.departmentName || '-'),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: muted, fontSize: 10, interval: 0, rotate: 28 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: border, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 11 },
      },
      series: [
        {
          type: 'bar',
          data: depts.map((d) => ({
            value: d.avgScore,
            itemStyle: { color: '#2563eb', borderRadius: [6, 6, 0, 0] },
          })),
          barMaxWidth: 28,
        },
      ],
    };
  }
}
