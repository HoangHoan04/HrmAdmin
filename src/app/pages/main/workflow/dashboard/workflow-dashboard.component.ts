import { WorkflowDashboardSummary } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import type { EChartsCoreOption } from 'echarts/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-workflow-dashboard',
  templateUrl: './workflow-dashboard.component.html',
  styleUrls: ['./workflow-dashboard.component.scss'],
})
export class WorkflowDashboardComponent implements OnInit, OnDestroy {
  loading = false;
  summary: WorkflowDashboardSummary | null = null;
  pieOption: EChartsCoreOption = {};
  barOption: EChartsCoreOption = {};
  private readonly sub = new Subscription();

  constructor(
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.sub.add(this.translate.onLangChange.subscribe(() => this.rebuildCharts()));
    this.load();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.apiService
      .post<WorkflowDashboardSummary>(this.apiService.WORKFLOW.DASHBOARD_SUMMARY, {})
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
    const byStatus = this.summary?.byStatus || [];
    const byEntity = this.summary?.byEntityType || [];

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
          data: byStatus
            .map((b) => ({ name: b.status, value: b.count }))
            .filter((x) => x.value > 0),
        },
      ],
    };

    this.barOption = {
      grid: { left: 40, right: 12, top: 20, bottom: 48 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: byEntity.map((d) => d.entityType || '-'),
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
          data: byEntity.map((d) => ({
            value: d.count,
            itemStyle: { color: '#2563eb', borderRadius: [6, 6, 0, 0] },
          })),
          barMaxWidth: 28,
        },
      ],
    };
  }
}
