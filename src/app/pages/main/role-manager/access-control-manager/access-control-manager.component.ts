import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-access-control-manager',
  templateUrl: './access-control-manager.component.html',
  styleUrls: ['./access-control-manager.component.scss'],
})
export class AccessControlManagerComponent implements OnInit {
  activeTabKey: 'role' | 'employee' = 'role';
  initialRoleId: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');
      this.activeTabKey = tab === 'employee' ? 'employee' : 'role';
      this.initialRoleId = params.get('roleId');
      this.cdr.markForCheck();
    });
  }

  onTabChange(index: number): void {
    const tab = index === 1 ? 'employee' : 'role';
    this.router.navigate([ROUTES_CONFIG.ROLE_MANAGER.children.ACCESS_CONTROL.path], {
      queryParams: { tab, roleId: tab === 'role' ? this.initialRoleId : null },
      queryParamsHandling: 'merge',
    });
  }

  get selectedIndex(): number {
    return this.activeTabKey === 'employee' ? 1 : 0;
  }
}
