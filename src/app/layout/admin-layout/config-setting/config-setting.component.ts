import { DashboardService, DashboardSettings } from '@/app/core/services';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-config-setting',
  standalone: false,
  templateUrl: './config-setting.component.html',
  styleUrls: ['./config-setting.component.scss'],
})
export class ConfigSettingComponent implements OnInit, OnDestroy {
  s: DashboardSettings;
  configOpen$: Observable<boolean>;
  private sub = new Subscription();

  primaryColors = [
    { name: 'blue', value: '#3b82f6' },
    { name: 'red', value: '#ef4444' },
    { name: 'yellow', value: '#f59e0b' },
    { name: 'brown', value: '#78350f' },
    { name: 'purple', value: '#8b5cf6' },
    { name: 'pink', value: '#ec4899' },
    { name: 'orange', value: '#f97316' },
    { name: 'emerald', value: '#10b981' },
    { name: 'teal', value: '#14b8a6' },
    { name: 'indigo', value: '#6366f1' },
  ];

  solidColors = [
    '#ffffff',
    '#f8fafc',
    '#f0fdf4',
    '#eff6ff',
    '#fdf2f8',
    '#faf5ff',
    '#fffbeb',
    '#f0f9ff',
    '#8f0b0b',
    '#f5f5f4',
  ];
  solidColorsDark = [
    '#000000',
    '#1e1e2e',
    '#18181b',
    '#0f172a',
    '#1a1a2e',
    '#16213e',
    '#0d1117',
    '#111827',
    '#1f2937',
    '#27272a',
  ];

  gradientColors = [
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    'linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)',
  ];

  gradientColorsDark = [
    'linear-gradient(135deg, #1c1c1c 0%, #2d2d2d 100%)',
    'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)',
    'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    'linear-gradient(135deg, #0d0d0d 0%, #1a0533 100%)',
    'linear-gradient(135deg, #0f2027 0%, #203a43 100%)',
    'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
    'linear-gradient(135deg, #16222a 0%, #3a6073 100%)',
    'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
    'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
  ];

  layoutModes = [
    'horizontal',
    'detached',
    'modern',
    'two column',
    'hovered',
    'boxed',
    'horizontal single',
    'horizontal overlay',
    'horizontal box',
    'menu aside',
    'transparent',
    'without header',
    'RTL',
  ];

  transitionEffects = [
    'fade',
    'fade-side',
    'fade-up',
    'fade-down',
    'fade-zoom',
    'slide-left',
    'slide-right',
    'zoom-in',
    'zoom-out',
    'rotate',
    'flip-x',
    'flip-y',
    'bounce',
    'slide-up',
    'slide-down',
  ];

  fontFamilies = ['Inter', 'Roboto', 'Montserrat', 'Playfair Display', 'Outfit'];
  tabStyles = ['chrome', 'card', 'icon', 'simple'];

  constructor(public ds: DashboardService) {
    this.s = ds.snapshot;
    this.configOpen$ = ds.configOpen$;
  }

  ngOnInit(): void {
    this.sub.add(
      this.ds.settings$.subscribe((settings) => {
        this.s = settings;
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  close(): void {
    this.ds.setConfigOpen(false);
  }

  update(partial: Partial<DashboardSettings>): void {
    this.ds.updateSettings(partial);
    this.s = this.ds.snapshot;
  }

  reset(): void {
    this.ds.resetSettings();
    this.s = this.ds.snapshot;
  }

  copyConfig(): void {
    navigator.clipboard.writeText(JSON.stringify(this.s, null, 2));
  }

  clearCacheAndLogout(): void {
    localStorage.clear();
    window.location.reload();
  }

  onBreakpointChange(): void {}

  navbarPalette(mode: string): string[] {
    const isLight = mode === 'light';
    const type = this.s.navbarColorType;
    if (type === 'solid') return isLight ? this.solidColors : this.solidColorsDark;
    return isLight ? this.gradientColors : this.gradientColorsDark;
  }

  sidebarPalette(mode: string): string[] {
    const isLight = mode === 'light';
    const type = this.s.sidebarColorType;
    if (type === 'solid') return isLight ? this.solidColors : this.solidColorsDark;
    return isLight ? this.gradientColors : this.gradientColorsDark;
  }
}
