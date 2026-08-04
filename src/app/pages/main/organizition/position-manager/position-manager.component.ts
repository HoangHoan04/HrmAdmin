import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { Subscription } from 'rxjs';
import { SharedModule } from '../../../../shared/shared.module';
import { PositionMasterComponent } from './position-master/position-master.component';
import { PositionComponent } from './position/position.component';

@Component({
  standalone: true,
  selector: 'app-position-manager',
  templateUrl: './position-manager.component.html',
  imports: [CommonModule, NzTabsModule, SharedModule, PositionComponent, PositionMasterComponent],
  styleUrls: [],
})
export class PositionManagerComponent implements OnInit, OnDestroy {
  activeTabKey: 'position' | 'position-master' = 'position';
  private routerSub!: Subscription;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const tab = params['tab'];
      if (tab === 'position-master') {
        this.activeTabKey = 'position-master';
      } else {
        this.activeTabKey = 'position';
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  onTabChange(index: number): void {
    const tab = index === 1 ? 'position-master' : 'position';
    this.router.navigate(['/organization/position'], {
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
    });
  }
}
