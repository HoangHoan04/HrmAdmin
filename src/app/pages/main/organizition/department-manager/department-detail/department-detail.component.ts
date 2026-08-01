import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';

interface DepartmentDetailMock {
  id: string;
  code: string;
  name: string;
  branchName: string;
  description: string;
  createdAt: string;
  status: boolean;
}

@Component({
  standalone: false,
  selector: 'app-department-detail',
  templateUrl: './department-detail.component.html',
  styleUrls: [],
})
export class DepartmentDetailComponent implements OnInit {
  id: string | null = null;
  loading = false;
  department: DepartmentDetailMock | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadDepartmentDetail(this.id);
    }
  }

  loadDepartmentDetail(id: string): void {
    this.loading = true;
    setTimeout(() => {
      this.department = {
        id,
        code: 'PB-HCNS',
        name: 'Phòng Hành chính Nhân sự',
        branchName: 'Trụ sở chính',
        description:
          'Phòng phụ trách công tác quản lý nhân sự, tuyển dụng, bảo hiểm, tiền lương và chế độ đãi ngộ cho toàn bộ nhân viên.',
        createdAt: '2026-01-10T08:00:00Z',
        status: true,
      };
      this.loading = false;
    }, 200);
  }

  goBack(): void {
    const basePath = ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.path;
    this.router.navigate([basePath]);
  }
}
