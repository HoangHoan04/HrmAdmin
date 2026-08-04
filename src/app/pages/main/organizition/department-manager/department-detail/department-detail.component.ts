import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import { Department } from '../../../../../core/models';
import { ApiService } from '../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../core/services/i18n-message.service';
import { ActionConfirmService } from '../../../../../shared/services/action-confirm.service';

@Component({
  standalone: false,
  selector: 'app-department-detail',
  templateUrl: './department-detail.component.html',
  styleUrls: ['./department-detail.component.scss'],
})
export class DepartmentDetailComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.department.entityName';

  id: string | null = null;
  loading = false;
  department: Department | null = null;
  selectedTabIndex = 0;

  detailFields: {
    key: keyof Department | string;
    label: string;
    type?: 'date' | 'boolean' | 'text';
  }[] = [
    { key: 'code', label: 'organization.department.code' },
    { key: 'name', label: 'organization.department.name' },
    { key: 'shortName', label: 'organization.department.shortName' },
    { key: 'companyName', label: 'organization.department.companyName' },
    { key: 'branchName', label: 'organization.department.branchName' },
    { key: 'parentDepartmentName', label: 'organization.department.parentDepartment' },
    { key: 'level', label: 'organization.department.level' },
    { key: 'limit', label: 'organization.department.limit' },
    { key: 'currentHeadCount', label: 'organization.department.currentHeadCount' },
    { key: 'type', label: 'organization.department.type' },
    { key: 'email', label: 'organization.department.email' },
    { key: 'phoneExtension', label: 'organization.department.phoneExtension' },
    { key: 'costCenterCode', label: 'organization.department.costCenterCode' },
    { key: 'isActive', label: 'organization.department.isActive', type: 'boolean' },
    { key: 'description', label: 'organization.department.description' },
    { key: 'createdAt', label: 'organization.department.createdAt', type: 'date' },
    { key: 'updatedAt', label: 'organization.department.updatedAt', type: 'date' },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly actionConfirm: ActionConfirmService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadDepartmentDetail(this.id);
    }
  }

  loadDepartmentDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Department>(this.apiService.DEPARTMENT.DETAIL, { id }).subscribe({
      next: (department) => {
        this.department = department;
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.loading = false;
        this.goBack();
      },
    });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  getFieldValue(field: { key: string; type?: string }): string {
    if (!this.department) return '---';
    const value = (this.department as any)[field.key];

    if (value === null || value === undefined || value === '') return '---';

    if (field.type === 'boolean') {
      return value ? this.i18n.instant('common.yes') : this.i18n.instant('common.no');
    }

    if (field.type === 'date') {
      return new Date(value).toLocaleDateString('vi-VN');
    }

    return String(value);
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.path]);
  }

  goEdit(): void {
    if (!this.id) return;
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.children.EDIT_DEPARTMENT.path,
      this.id,
    ]);
  }

  async toggleStatus(): Promise<void> {
    if (!this.department?.id) return;

    const confirmed = this.department.isDeleted
      ? await this.actionConfirm.confirmActivate(this.ENTITY_KEY, this.department.name)
      : await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, this.department.name);

    if (!confirmed) return;

    const endpoint = this.department.isDeleted
      ? this.apiService.DEPARTMENT.ACTIVATE
      : this.apiService.DEPARTMENT.DEACTIVATE;

    this.apiService.post<boolean>(endpoint, { id: this.department.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(
            this.department!.isDeleted
              ? this.i18n.activateSuccess(this.ENTITY_KEY, this.department!.name)
              : this.i18n.deactivateSuccess(this.ENTITY_KEY, this.department!.name),
          );
          this.loadDepartmentDetail(this.department!.id!);
        }
      },
      error: (err: any) => {
        this.message.error(err.error || this.i18n.genericError());
      },
    });
  }
}
