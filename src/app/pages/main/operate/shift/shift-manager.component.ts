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
  activeTabKey: 'shift' | 'work-schedule' = 'shift';

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.activeTabKey = params.get('tab') === 'work-schedule' ? 'work-schedule' : 'shift';
      this.cdr.markForCheck();
    });
  }

  onTabChange(index: number): void {
    const tab = index === 1 ? 'work-schedule' : 'shift';
    this.router.navigate([ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.path], {
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }
}
