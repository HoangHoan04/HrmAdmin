import { DashboardService, DashboardSettings } from '@/app/core/services';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-language',
  standalone: false,
  templateUrl: './change-language.component.html',
  styleUrls: ['./change-language.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChangeLanguageComponent implements OnInit, OnDestroy {
  s: DashboardSettings;
  private sub = new Subscription();

  constructor(private dashboardService: DashboardService) {
    this.s = dashboardService.snapshot;
  }

  ngOnInit(): void {
    this.sub.add(
      this.dashboardService.settings$.subscribe((settings) => {
        this.s = settings;
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  setLanguage(lang: 'vi' | 'en'): void {
    this.dashboardService.updateSettings({ language: lang });
  }
}
