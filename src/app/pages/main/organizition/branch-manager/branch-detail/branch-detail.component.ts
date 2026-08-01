import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';

interface BranchDetailMock {
  id: string;
  code: string;
  name: string;
  companyName: string;
  address: string;
  hotline: string;
  createdAt: string;
  status: boolean;
}

@Component({
  standalone: false,
  selector: 'app-branch-detail',
  templateUrl: './branch-detail.component.html',
  styleUrls: [],
})
export class BranchDetailComponent implements OnInit {
  id: string | null = null;
  loading = false;
  branch: BranchDetailMock | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadBranchDetail(this.id);
    }
  }

  loadBranchDetail(id: string): void {
    this.loading = true;
    setTimeout(() => {
      this.branch = {
        id,
        code: 'CN-HN',
        name: 'Chi Nhánh Hà Nội',
        companyName: 'CÔNG TY TNHH CÔNG NGHỆ HOÀNG HOAN',
        address: 'Số 456 Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
        hotline: '0123456789',
        createdAt: '2026-01-12T09:30:00Z',
        status: true,
      };
      this.loading = false;
    }, 200);
  }

  goBack(): void {
    const basePath = ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.path;
    this.router.navigate([basePath]);
  }
}
