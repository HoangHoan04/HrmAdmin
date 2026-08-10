import { DashboardService, DashboardSettings } from '@/app/core/services';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-config-setting',
  standalone: false,
  templateUrl: './config-setting.component.html',
  styleUrls: ['./config-setting.component.scss'],
})
export class ConfigSettingComponent implements OnInit, OnDestroy {
  s: DashboardSettings;
  /** Bound to nz-drawer; avoid async pipe to prevent NG0100 (zIndex 9 → -1). */
  configOpen = false;
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
    { value: 'horizontal', labelKey: 'configSetting.layout.horizontal' },
    { value: 'detached', labelKey: 'configSetting.layout.detached' },
    { value: 'modern', labelKey: 'configSetting.layout.modern' },
    { value: 'two column', labelKey: 'configSetting.layout.twoColumn' },
    { value: 'hovered', labelKey: 'configSetting.layout.hovered' },
    { value: 'boxed', labelKey: 'configSetting.layout.boxed' },
    { value: 'horizontal single', labelKey: 'configSetting.layout.horizontalSingle' },
    { value: 'horizontal overlay', labelKey: 'configSetting.layout.horizontalOverlay' },
    { value: 'horizontal box', labelKey: 'configSetting.layout.horizontalBox' },
    { value: 'menu aside', labelKey: 'configSetting.layout.menuAside' },
    { value: 'transparent', labelKey: 'configSetting.layout.transparent' },
    { value: 'without header', labelKey: 'configSetting.layout.withoutHeader' },
    { value: 'RTL', labelKey: 'configSetting.layout.rtl' },
  ];

  transitionEffects = [
    { value: 'fade', labelKey: 'configSetting.transition.fade' },
    { value: 'fade-side', labelKey: 'configSetting.transition.fadeSide' },
    { value: 'fade-up', labelKey: 'configSetting.transition.fadeUp' },
    { value: 'fade-down', labelKey: 'configSetting.transition.fadeDown' },
    { value: 'fade-zoom', labelKey: 'configSetting.transition.fadeZoom' },
    { value: 'slide-left', labelKey: 'configSetting.transition.slideLeft' },
    { value: 'slide-right', labelKey: 'configSetting.transition.slideRight' },
    { value: 'zoom-in', labelKey: 'configSetting.transition.zoomIn' },
    { value: 'zoom-out', labelKey: 'configSetting.transition.zoomOut' },
    { value: 'rotate', labelKey: 'configSetting.transition.rotate' },
    { value: 'flip-x', labelKey: 'configSetting.transition.flipX' },
    { value: 'flip-y', labelKey: 'configSetting.transition.flipY' },
    { value: 'bounce', labelKey: 'configSetting.transition.bounce' },
    { value: 'slide-up', labelKey: 'configSetting.transition.slideUp' },
    { value: 'slide-down', labelKey: 'configSetting.transition.slideDown' },
  ];

  fontFamilies = ['Inter', 'Roboto', 'Montserrat', 'Playfair Display', 'Outfit'];
  tabStyles = [
    { value: 'chrome', labelKey: 'configSetting.tabStyleChrome' },
    { value: 'card', labelKey: 'configSetting.tabStyleCard' },
    { value: 'icon', labelKey: 'configSetting.tabStyleIcon' },
    { value: 'simple', labelKey: 'configSetting.tabStyleSimple' },
  ];

  constructor(
    public ds: DashboardService,
    private readonly translate: TranslateService,
    private readonly message: NzMessageService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.s = ds.snapshot;
  }

  ngOnInit(): void {
    this.sub.add(
      this.ds.settings$.subscribe((settings) => {
        this.s = settings;
      }),
    );
    this.sub.add(
      this.ds.configOpen$.subscribe((open) => {
        queueMicrotask(() => {
          if (this.configOpen === open) return;
          this.configOpen = open;
          this.cdr.detectChanges();
        });
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  close(): void {
    this.ds.setConfigOpen(false);
  }

  onVisibleChange(visible: boolean): void {
    if (this.configOpen === visible) return;
    this.configOpen = visible;
    this.ds.setConfigOpen(visible);
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
    this.message.success(this.translate.instant('configSetting.copiedMessage'));
  }

  colorLabel(name: string): string {
    return this.translate.instant(`configSetting.color.${name}`);
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
