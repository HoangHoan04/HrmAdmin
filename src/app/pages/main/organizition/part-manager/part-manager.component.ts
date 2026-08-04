import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { Subscription } from 'rxjs';
import { PartMasterComponent } from './part-master/part-master.component';
import { PartComponent } from './part/part.component';

@Component({
  standalone: true,
  selector: 'app-part-manager',
  templateUrl: './part-manager.component.html',
  imports: [CommonModule, NzTabsModule, TranslatePipe, PartComponent, PartMasterComponent],
  styleUrls: [],
})
export class PartManagerComponent implements OnInit, OnDestroy {
  activeTabKey: 'part' | 'part-master' = 'part';
  private routerSub!: Subscription;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const tab = params['tab'];
      if (tab === 'part-master') {
        this.activeTabKey = 'part-master';
      } else {
        this.activeTabKey = 'part';
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
    const tab = index === 1 ? 'part-master' : 'part';
    this.router.navigate(['/organization/part'], {
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
    });
  }
}
