import { DashboardService } from '@/app/core/services';
import { Component, OnDestroy, OnInit } from '@angular/core';
import type { EChartsCoreOption } from 'echarts/core';
import { Subscription } from 'rxjs';

type ThemePalette = {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  foreground: string;
  mutedFg: string;
  border: string;
  muted: string;
  isDark: boolean;
};

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  Math = Math;
  private sub = new Subscription();

  statsData = [
    {
      label: 'Nhân viên nữ',
      value: '213',
      icon: 'woman',
      tone: 'primary',
      change: 8.5,
    },
    {
      label: 'Nhân viên nam',
      value: '340',
      icon: 'man',
      tone: 'info',
      change: 5.2,
    },
    {
      label: 'Khách hàng',
      value: '540',
      icon: 'team',
      tone: 'success',
      change: 12.3,
    },
    {
      label: 'Đối tác',
      value: '631',
      icon: 'apartment',
      tone: 'warning',
      change: 15.7,
    },
  ];

  businessMetrics = [
    { label: 'Lợi nhuận ròng', value: '$2.4M', change: 12.5 },
    { label: 'Tỷ lệ khách hàng', value: '94%', change: 3.2 },
  ];

  sourceTags = ['Engineering', 'CS', 'Product'];

  techGaugeOption: EChartsCoreOption = {};
  nonTechGaugeOption: EChartsCoreOption = {};
  barChartOption: EChartsCoreOption = {};
  funnelOption: EChartsCoreOption = {};
  pieOption: EChartsCoreOption = {};
  growthOption: EChartsCoreOption = {};
  deptOption: EChartsCoreOption = {};
  revenueGaugeOption: EChartsCoreOption = {};

  constructor(private readonly dashboard: DashboardService) {}

  ngOnInit(): void {
    this.rebuildCharts();
    this.sub.add(this.dashboard.settings$.subscribe(() => this.rebuildCharts()));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private readPalette(): ThemePalette {
    const styles = getComputedStyle(document.documentElement);
    const pick = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;

    return {
      primary: pick('--primary', '#3b82f6'),
      secondary: pick('--secondary', '#8b5cf6'),
      success: pick('--success', '#22c55e'),
      warning: pick('--warning', '#f59e0b'),
      danger: pick('--danger', '#ef4444'),
      info: pick('--info', '#06b6d4'),
      foreground: pick('--foreground', '#1f2937'),
      mutedFg: pick('--muted-foreground', '#6b7280'),
      border: pick('--border', '#e5e7eb'),
      muted: pick('--muted', '#f3f4f6'),
      isDark: document.documentElement.classList.contains('dark'),
    };
  }

  private withAlpha(hex: string, alpha: number): string {
    const raw = hex.replace('#', '');
    if (raw.length !== 6) return hex;
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private rebuildCharts(): void {
    const c = this.readPalette();
    const track = this.withAlpha(c.mutedFg, c.isDark ? 0.2 : 0.15);

    this.techGaugeOption = this.buildHalfGauge(85, c.primary, c, track);
    this.nonTechGaugeOption = this.buildHalfGauge(95, c.success, c, track);
    this.revenueGaugeOption = this.buildRingGauge(78, c.primary, c, track);

    this.barChartOption = {
      grid: { left: 40, right: 12, top: 24, bottom: 28 },
      tooltip: { trigger: 'axis' },
      legend: { show: false },
      xAxis: {
        type: 'category',
        data: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: c.mutedFg, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: this.withAlpha(c.border, 0.9), type: 'dashed' } },
        axisLabel: { color: c.mutedFg, fontSize: 11 },
      },
      series: [
        {
          name: 'External',
          type: 'bar',
          data: [12, 15, 20, 25, 22, 28],
          barMaxWidth: 18,
          itemStyle: { color: c.primary, borderRadius: [6, 6, 0, 0] },
        },
        {
          name: 'Internal',
          type: 'bar',
          data: [5, 8, 12, 15, 18, 20],
          barMaxWidth: 18,
          itemStyle: { color: c.success, borderRadius: [6, 6, 0, 0] },
        },
      ],
    };

    this.funnelOption = {
      tooltip: { trigger: 'item', formatter: '{b}: {c}' },
      series: [
        {
          type: 'funnel',
          left: '6%',
          right: '6%',
          top: 12,
          bottom: 12,
          min: 0,
          max: 1200,
          gap: 4,
          label: {
            show: true,
            position: 'inside',
            formatter: '{b}\n{c}',
            fontSize: 11,
            fontWeight: 600,
            color: '#fff',
          },
          itemStyle: { borderColor: c.isDark ? '#0c0c0c' : '#fff', borderWidth: 2 },
          data: [
            { value: 1200, name: 'Ứng tuyển', itemStyle: { color: c.primary } },
            { value: 680, name: 'Sàng lọc', itemStyle: { color: c.secondary } },
            { value: 240, name: 'Phỏng vấn', itemStyle: { color: c.info } },
            { value: 95, name: 'Đề nghị', itemStyle: { color: c.warning } },
            { value: 75, name: 'Đã nhận', itemStyle: { color: c.success } },
          ],
        },
      ],
    };

    this.pieOption = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        orient: 'vertical',
        right: 0,
        top: 'middle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: c.mutedFg, fontSize: 11 },
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: true,
          padAngle: 2,
          itemStyle: {
            borderRadius: 6,
            borderColor: c.isDark ? '#0c0c0c' : '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{d}%',
            color: c.foreground,
            fontSize: 11,
            fontWeight: 600,
          },
          labelLine: { length: 10, length2: 8 },
          data: [
            { value: 98, name: 'Direct', itemStyle: { color: c.primary } },
            { value: 56, name: 'Work', itemStyle: { color: c.secondary } },
            { value: 42, name: 'LinkedIn', itemStyle: { color: c.info } },
            { value: 23, name: 'Hired', itemStyle: { color: this.withAlpha(c.primary, 0.65) } },
            { value: 14, name: 'Internal', itemStyle: { color: c.success } },
            { value: 8, name: 'Referral', itemStyle: { color: c.danger } },
          ],
        },
      ],
    };

    this.growthOption = {
      grid: { left: 44, right: 12, top: 28, bottom: 28 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['2022', '2023', '2024', '2025', '2026'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: c.mutedFg, fontSize: 11, fontWeight: 600 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: this.withAlpha(c.border, 0.9), type: 'dashed' } },
        axisLabel: { color: c.mutedFg, fontSize: 10 },
      },
      series: [
        {
          type: 'bar',
          data: [580, 720, 890, 1100, 1250],
          barMaxWidth: 28,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: c.primary },
                { offset: 1, color: c.secondary },
              ],
            },
            borderRadius: [8, 8, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            fontSize: 10,
            fontWeight: 700,
            color: c.foreground,
          },
        },
      ],
    };

    this.deptOption = {
      grid: { left: 88, right: 40, top: 8, bottom: 8 },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'value',
        max: 6,
        splitLine: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: 'category',
        data: ['HR', 'Technical', 'Finance', 'Commercial', 'I.T', 'Business'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: c.foreground, fontSize: 12, fontWeight: 600 },
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: 14,
          data: [
            { value: 2.5, itemStyle: { color: c.danger, borderRadius: [0, 8, 8, 0] } },
            { value: 3.5, itemStyle: { color: c.warning, borderRadius: [0, 8, 8, 0] } },
            { value: 4.3, itemStyle: { color: c.info, borderRadius: [0, 8, 8, 0] } },
            { value: 4.5, itemStyle: { color: c.success, borderRadius: [0, 8, 8, 0] } },
            { value: 4.8, itemStyle: { color: c.secondary, borderRadius: [0, 8, 8, 0] } },
            { value: 5.3, itemStyle: { color: c.primary, borderRadius: [0, 8, 8, 0] } },
          ],
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
            fontSize: 12,
            fontWeight: 700,
            color: c.foreground,
          },
        },
      ],
    };
  }

  private buildHalfGauge(
    value: number,
    color: string,
    c: ThemePalette,
    track: string,
  ): EChartsCoreOption {
    return {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          center: ['50%', '70%'],
          radius: '110%',
          min: 0,
          max: 100,
          progress: { show: true, width: 14, roundCap: true },
          pointer: { show: false },
          anchor: { show: false },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 14,
              color: [
                [value / 100, color],
                [1, track],
              ],
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: c.foreground,
            fontSize: 22,
            fontWeight: 700,
            offsetCenter: [0, '-8%'],
          },
          data: [{ value }],
        },
      ],
    };
  }

  private buildRingGauge(
    value: number,
    color: string,
    c: ThemePalette,
    track: string,
  ): EChartsCoreOption {
    return {
      series: [
        {
          type: 'gauge',
          center: ['50%', '52%'],
          radius: '88%',
          startAngle: 220,
          endAngle: -40,
          min: 0,
          max: 100,
          progress: { show: true, width: 12, roundCap: true },
          pointer: { show: false },
          anchor: { show: false },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 12,
              color: [
                [value / 100, color],
                [1, track],
              ],
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: c.foreground,
            fontSize: 26,
            fontWeight: 700,
            offsetCenter: [0, '10%'],
          },
          data: [{ value }],
        },
      ],
    };
  }
}
