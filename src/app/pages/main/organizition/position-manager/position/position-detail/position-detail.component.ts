import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';

interface PositionDetailMock {
  id: string;
  code: string;
  name: string;
  departmentName: string;
  description: string;
  createdAt: string;
  status: boolean;
}

@Component({
  standalone: false,
  selector: 'app-position-detail',
  templateUrl: './position-detail.component.html',
  styleUrls: [],
})
export class PositionDetailComponent implements OnInit {
  id: string | null = null;
  loading = false;
  position: PositionDetailMock | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadPositionDetail(this.id);
    }
  }

  loadPositionDetail(id: string): void {
    this.loading = true;
    setTimeout(() => {
      this.position = {
        id,
        code: 'P-TP-HR',
        name: 'Trưởng phòng Nhân sự',
        departmentName: 'Phòng Hành chính Nhân sự',
        description:
          'Vị trí quản lý trực tiếp điều hành công việc của toàn bộ các chuyên viên và nhân viên bộ phận Hành chính Nhân sự.',
        createdAt: '2026-01-12T09:30:00Z',
        status: true,
      };
      this.loading = false;
    }, 200);
  }

  goBack(): void {
    const basePath = ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.path;
    this.router.navigate([basePath]);
  }
}
