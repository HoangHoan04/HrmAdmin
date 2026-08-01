import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';

interface PartDetailMock {
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
  selector: 'app-part-detail',
  templateUrl: './part-detail.component.html',
  styleUrls: [],
})
export class PartDetailComponent implements OnInit {
  id: string | null = null;
  loading = false;
  part: PartDetailMock | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadPartDetail(this.id);
    }
  }

  loadPartDetail(id: string): void {
    this.loading = true;
    setTimeout(() => {
      this.part = {
        id,
        code: 'P-WEB-01',
        name: 'Nhóm Frontend Angular',
        departmentName: 'Phòng Kỹ thuật Hà Nội',
        description:
          'Tổ dự án phụ trách nghiên cứu và phát triển toàn bộ sản phẩm web portal sử dụng Angular và thư viện giao diện cao cấp.',
        createdAt: '2026-02-15T08:00:00Z',
        status: true,
      };
      this.loading = false;
    }, 200);
  }

  goBack(): void {
    const basePath = ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.path;
    this.router.navigate([basePath]);
  }
}
