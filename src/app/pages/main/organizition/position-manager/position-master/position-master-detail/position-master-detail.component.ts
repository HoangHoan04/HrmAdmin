import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';

interface PositionMasterDetailMock {
  id: string;
  code: string;
  name: string;
  description: string;
  createdAt: string;
  status: boolean;
}

@Component({
  standalone: false,
  selector: 'app-position-master-detail',
  templateUrl: './position-master-detail.component.html',
  styleUrls: [],
})
export class PositionMasterDetailComponent implements OnInit {
  id: string | null = null;
  loading = false;
  positionMaster: PositionMasterDetailMock | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadPositionMasterDetail(this.id);
    }
  }

  loadPositionMasterDetail(id: string): void {
    this.loading = true;
    setTimeout(() => {
      this.positionMaster = {
        id,
        code: 'CV-GD',
        name: 'Giám đốc',
        description:
          'Chức danh hoạch định chính sách, phương án kinh doanh cấp cao và chịu trách nhiệm tối cao cho kết quả hoạt động doanh nghiệp.',
        createdAt: '2026-01-10T08:00:00Z',
        status: true,
      };
      this.loading = false;
    }, 200);
  }

  goBack(): void {
    const basePath = ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.path;
    this.router.navigate([basePath], { queryParams: { tab: 'position-master' } });
  }
}
