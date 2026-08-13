import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { HomeDashboard } from '@/app/core/models';
import { ApiService, DashboardService, I18nMessageService } from '@/app/core/services';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import type { EChartsCoreOption } from 'echarts/core';
import { NzMessageService } from 'ng-zorro-antd/message';
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

type StatCard = {
  labelKey: string;
  value: string;
  icon: string;
  tone: 'primary' | 'info' | 'success' | 'warning';
  hintKey?: string;
  hintParams?: Record<string, unknown>;
  change?: number | null;
};

type PendingItem = {
  labelKey: string;
  count: number;
  icon: string;
  path: string;
  tone: string;
};

type QuickLink = {
  labelKey: string;
  path: string;
  icon: string;
};

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  loading = false;
  dateRange: [Date, Date] = HomeComponent.defaultRange();
  dashboard: HomeDashboard | null = null;
  greetingKey = 'home.greetingMorning';

  statsData: StatCard[] = [];
  pendingItems: PendingItem[] = [];
  quickLinks: QuickLink[] = [
    {
      labelKey: 'home.quickEmployee',
      path: ROUTES_CONFIG.HUMAN_RESOURCE.children.EMPLOYEE_MANAGER.path,
      icon: 'team',
    },
    {
      labelKey: 'home.quickTimekeeping',
      path: ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.TIMEKEEPING_MANAGER
        .path,
      icon: 'field-time',
    },
    {
      labelKey: 'home.quickLeave',
      path: ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.LEAVE_LIST.path,
      icon: 'calendar',
    },
    {
      labelKey: 'home.quickContract',
      path: ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_LIST.path,
      icon: 'file-protect',
    },
    {
      labelKey: 'home.quickPayroll',
      path: ROUTES_CONFIG.PAYROLL.children.PAYROLL_RUN_MANAGER.path,
      icon: 'dollar',
    },
    {
      labelKey: 'home.quickAccess',
      path: ROUTES_CONFIG.ROLE_MANAGER.children.ACCESS_CONTROL.path,
      icon: 'safety',
    },
  ];

  attendanceGaugeOption: EChartsCoreOption = {};
  genderPieOption: EChartsCoreOption = {};
  hireBarOption: EChartsCoreOption = {};
  growthOption: EChartsCoreOption = {};
  deptOption: EChartsCoreOption = {};
  leavePieOption: EChartsCoreOption = {};

  constructor(
    private readonly api: ApiService,
    private readonly dashboardSvc: DashboardService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.updateGreeting();
    this.loadDashboard();
    this.sub.add(this.dashboardSvc.settings$.subscribe(() => this.rebuildCharts()));
    this.sub.add(
      this.translate.onLangChange.subscribe(() => {
        this.updateGreeting();
        this.buildViewModels();
        this.rebuildCharts();
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onRangeChange(range: [Date, Date] | null): void {
    if (range?.[0] && range?.[1]) {
      this.dateRange = [range[0], range[1]];
      this.loadDashboard();
    }
  }

  refresh(): void {
    this.loadDashboard();
  }

  private updateGreeting(): void {
    const h = new Date().getHours();
    if (h < 12) this.greetingKey = 'home.greetingMorning';
    else if (h < 18) this.greetingKey = 'home.greetingAfternoon';
    else this.greetingKey = 'home.greetingEvening';
  }

  private loadDashboard(): void {
    this.loading = true;
    const [from, to] = this.dateRange;
    this.api
      .post<HomeDashboard>(this.api.HOME.DASHBOARD, {
        fromDate: this.formatDate(from),
        toDate: this.formatDate(to),
      })
      .subscribe({
        next: (res) => {
          this.dashboard = res;
          this.buildViewModels();
          this.rebuildCharts();
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.message.error(
            this.i18n.resolveServerMessage(err?.error) || this.i18n.instant('home.loadFailed'),
          );
        },
      });
  }

  private buildViewModels(): void {
    const d = this.dashboard;
    if (!d) return;

    this.statsData = [
      {
        labelKey: 'home.kpiTotalEmployees',
        value: this.fmt(d.kpis.totalEmployees),
        icon: 'team',
        tone: 'primary',
        hintKey: 'home.kpiActiveHint',
      },
      {
        labelKey: 'home.kpiFemale',
        value: this.fmt(d.kpis.femaleEmployees),
        icon: 'woman',
        tone: 'info',
        hintKey: 'home.kpiPercentOfTotal',
        hintParams: {
          percent: this.pctNumber(d.kpis.femaleEmployees, d.kpis.totalEmployees),
        },
      },
      {
        labelKey: 'home.kpiMale',
        value: this.fmt(d.kpis.maleEmployees),
        icon: 'man',
        tone: 'success',
        hintKey: 'home.kpiPercentOfTotal',
        hintParams: {
          percent: this.pctNumber(d.kpis.maleEmployees, d.kpis.totalEmployees),
        },
      },
      {
        labelKey: 'home.kpiNewHires',
        value: this.fmt(d.kpis.newHiresThisMonth),
        icon: 'user-add',
        tone: 'warning',
        change: d.kpis.newHiresChangePercent,
        hintKey: 'home.kpiPrevPeriod',
        hintParams: { count: d.kpis.newHiresLastMonth },
      },
    ];

    this.pendingItems = [
      {
        labelKey: 'home.pendingLeave',
        count: d.pending.leaveRequests,
        icon: 'calendar',
        path: ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.LEAVE_LIST.path,
        tone: 'warning',
      },
      {
        labelKey: 'home.pendingComplaint',
        count: d.pending.attendanceComplaints,
        icon: 'alert',
        path: ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.ATTENDANCE_COMPLAINT
          .path,
        tone: 'danger',
      },
      {
        labelKey: 'home.pendingTransfer',
        count: d.pending.transfers,
        icon: 'swap',
        path: ROUTES_CONFIG.HUMAN_RESOURCE.children.TRANSFER_MANAGER.path,
        tone: 'info',
      },
      {
        labelKey: 'home.pendingReview',
        count: d.pending.reviewRenewals,
        icon: 'audit',
        path: ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.REVIEW_RENEWAL.path,
        tone: 'primary',
      },
    ];
  }

  private rebuildCharts(): void {
    const d = this.dashboard;
    if (!d) return;
    const c = this.readPalette();
    const track = this.withAlpha(c.mutedFg, c.isDark ? 0.2 : 0.15);
    const t = (key: string) => this.i18n.instant(key);

    this.attendanceGaugeOption = this.buildRingGauge(
      d.attendanceToday.attendanceRatePercent,
      c.primary,
      c,
      track,
    );

    const genderName: Record<string, string> = {
      FEMALE: t('home.female'),
      MALE: t('home.male'),
      OTHER: t('home.other'),
    };
    const genderColors = [c.info, c.primary, c.mutedFg];
    this.genderPieOption = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        bottom: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: c.mutedFg, fontSize: 11 },
      },
      series: [
        {
          type: 'pie',
          radius: ['48%', '72%'],
          center: ['50%', '44%'],
          padAngle: 2,
          itemStyle: {
            borderRadius: 6,
            borderColor: c.isDark ? '#0c0c0c' : '#fff',
            borderWidth: 2,
          },
          label: { show: false },
          data: d.genderBreakdown.map((x, i) => ({
            value: x.count,
            name: genderName[x.key] || x.name,
            itemStyle: { color: genderColors[i % genderColors.length] },
          })),
        },
      ],
    };

    this.hireBarOption = {
      grid: { left: 36, right: 12, top: 24, bottom: 28 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: d.newHiresByMonth.map((x) => x.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: c.mutedFg, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: this.withAlpha(c.border, 0.9), type: 'dashed' } },
        axisLabel: { color: c.mutedFg, fontSize: 11 },
      },
      series: [
        {
          type: 'bar',
          data: d.newHiresByMonth.map((x) => x.count),
          barMaxWidth: 22,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: c.primary },
                { offset: 1, color: this.withAlpha(c.primary, 0.55) },
              ],
            },
            borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    };

    this.growthOption = {
      grid: { left: 44, right: 12, top: 28, bottom: 28 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: d.headcountByYear.map((x) => x.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: c.mutedFg, fontSize: 11, fontWeight: 600 },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: this.withAlpha(c.border, 0.9), type: 'dashed' } },
        axisLabel: { color: c.mutedFg, fontSize: 10 },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbolSize: 8,
          data: d.headcountByYear.map((x) => x.count),
          lineStyle: { width: 3, color: c.primary },
          itemStyle: { color: c.primary },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: this.withAlpha(c.primary, 0.35) },
                { offset: 1, color: this.withAlpha(c.primary, 0.02) },
              ],
            },
          },
        },
      ],
    };

    const unassigned = t('home.deptUnassigned');
    const dept = [...d.departmentHeadcount]
      .map((x) => ({
        ...x,
        name: x.key === 'NONE' ? unassigned : x.name,
      }))
      .reverse();
    const maxDept = Math.max(1, ...dept.map((x) => x.count));
    const deptColors = [c.primary, c.info, c.success, c.warning, c.danger, c.secondary];
    this.deptOption = {
      grid: { left: 110, right: 36, top: 8, bottom: 8 },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'value',
        max: maxDept,
        splitLine: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: 'category',
        data: dept.map((x) => x.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: c.foreground, fontSize: 12, fontWeight: 600 },
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: 14,
          data: dept.map((x, i) => ({
            value: x.count,
            itemStyle: {
              color: deptColors[i % deptColors.length],
              borderRadius: [0, 8, 8, 0],
            },
          })),
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

    const leaveName: Record<string, string> = {
      PENDING: t('home.leavePending'),
      APPROVED: t('home.leaveApproved'),
      REJECTED: t('home.leaveRejected'),
      CANCELLED: t('home.leaveCancelled'),
    };
    const leaveColors: Record<string, string> = {
      PENDING: c.warning,
      APPROVED: c.success,
      REJECTED: c.danger,
      CANCELLED: c.mutedFg,
    };
    this.leavePieOption = {
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
          data: d.leaveStatusThisMonth.map((x) => ({
            value: x.count,
            name: leaveName[x.key] || x.name,
            itemStyle: { color: leaveColors[x.key] || c.primary },
          })),
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
    const safe = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
    return {
      series: [
        {
          type: 'gauge',
          center: ['50%', '55%'],
          radius: '90%',
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
                [safe / 100, color],
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
            offsetCenter: [0, '8%'],
          },
          data: [{ value: safe }],
        },
      ],
    };
  }

  private readPalette(): ThemePalette {
    const styles = getComputedStyle(document.documentElement);
    const pick = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;

    return {
      primary: pick('--primary', '#2563eb'),
      secondary: pick('--secondary', '#0ea5e9'),
      success: pick('--success', '#16a34a'),
      warning: pick('--warning', '#d97706'),
      danger: pick('--danger', '#dc2626'),
      info: pick('--info', '#0891b2'),
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

  private fmt(n: number): string {
    return new Intl.NumberFormat('vi-VN').format(n || 0);
  }

  private pctNumber(part: number, total: number): number {
    if (!total) return 0;
    return Math.round((part * 100) / total);
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private static defaultRange(): [Date, Date] {
    const now = new Date();
    return [new Date(now.getFullYear(), now.getMonth(), 1), now];
  }
}
