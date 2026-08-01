import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';

interface PartMasterDetailMock {
  id: string;
  code: string;
  name: string;
  description: string;
  createdAt: string;
  status: boolean;
}

@Component({
  standalone: false,
  selector: 'app-part-master-detail',
  templateUrl: './part-master-detail.component.html',
  styleUrls: [],
})
export class PartMasterDetailComponent implements OnInit {
  id: string | null = null;
  loading = false;
  partMaster: PartMasterDetailMock | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadPartMasterDetail(this.id);
    }
  }

  loadPartMasterDetail(id: string): void {
    this.loading = true;
    setTimeout(() => {
      this.partMaster = {
        id,
        code: 'PM-WEB',
        name: 'Tổ Phát triển Web',
        description:
          'Tổ chịu trách nhiệm định hướng công nghệ và chuẩn hóa quy trình phát triển ứng dụng Web.',
        createdAt: '2026-01-15T08:00:00Z',
        status: true,
      };
      this.loading = false;
    }, 200);
  }

  goBack(): void {
    const basePath = ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.path;
    this.router.navigate([basePath], { queryParams: { tab: 'part-master' } });
  }
}
