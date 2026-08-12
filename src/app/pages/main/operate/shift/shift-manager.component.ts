import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-shift-manager',
  templateUrl: './shift-manager.component.html',
  styleUrls: [],
})
export class ShiftManagerComponent implements OnInit {
  activeTabKey: 'shift' | 'work-pattern' | 'work-schedule' = 'work-pattern';

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');
      if (tab === 'work-schedule') this.activeTabKey = 'work-schedule';
      else if (tab === 'shift') this.activeTabKey = 'shift';
      else this.activeTabKey = 'work-pattern';
      this.cdr.markForCheck();
    });
  }

  onTabChange(index: number): void {
    const tab = index === 0 ? 'work-pattern' : index === 1 ? 'shift' : 'work-schedule';
    this.router.navigate([ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.path], {
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  get selectedIndex(): number {
    if (this.activeTabKey === 'work-pattern') return 0;
    if (this.activeTabKey === 'shift') return 1;
    return 2;
  }
}
