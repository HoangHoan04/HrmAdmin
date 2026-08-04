import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import { Branch } from '../../../../../core/models';
import { ApiService } from '../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../core/services/i18n-message.service';
import { ActionConfirmService } from '../../../../../shared/services/action-confirm.service';

@Component({
  standalone: false,
  selector: 'app-branch-detail',
  templateUrl: './branch-detail.component.html',
  styleUrls: ['./branch-detail.component.scss'],
})
export class BranchDetailComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.branch.entityName';

  id: string | null = null;
  loading = false;
  branch: Branch | null = null;
  selectedTabIndex = 0;

  detailFields: {
    key: keyof Branch | string;
    label: string;
    type?: 'date' | 'boolean' | 'text';
  }[] = [
    { key: 'code', label: 'organization.branch.code' },
    { key: 'name', label: 'organization.branch.name' },
    { key: 'shortName', label: 'organization.branch.shortName' },
    { key: 'companyName', label: 'organization.branch.companyName' },
    { key: 'parentBranchName', label: 'organization.branch.parentBranch' },
    { key: 'type', label: 'organization.branch.type' },
    { key: 'groupSalary', label: 'organization.branch.groupSalary' },
    { key: 'address', label: 'organization.branch.address' },
    { key: 'ipAddress', label: 'organization.branch.ipAddress' },
    { key: 'phoneNumber', label: 'organization.branch.phoneNumber' },
    { key: 'email', label: 'organization.branch.email' },
    { key: 'taxCode', label: 'organization.branch.taxCode' },
    { key: 'operatingStatus', label: 'organization.branch.operatingStatus' },
    { key: 'isHeadQuarter', label: 'organization.branch.isHeadQuarter', type: 'boolean' },
    { key: 'isActive', label: 'organization.branch.isActive', type: 'boolean' },
    { key: 'description', label: 'organization.branch.description' },
    { key: 'createdAt', label: 'organization.branch.createdAt', type: 'date' },
    { key: 'updatedAt', label: 'organization.branch.updatedAt', type: 'date' },
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
      this.loadBranchDetail(this.id);
    }
  }

  loadBranchDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Branch>(this.apiService.BRANCH.DETAIL, { id }).subscribe({
      next: (branch) => {
        this.branch = branch;
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
    if (!this.branch) return '---';
    const value = (this.branch as any)[field.key];

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
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.path]);
  }

  goEdit(): void {
    if (!this.id) return;
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.children.EDIT_BRANCH.path,
      this.id,
    ]);
  }

  async toggleStatus(): Promise<void> {
    if (!this.branch?.id) return;

    const confirmed = this.branch.isDeleted
      ? await this.actionConfirm.confirmActivate(this.ENTITY_KEY, this.branch.name)
      : await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, this.branch.name);

    if (!confirmed) return;

    const endpoint = this.branch.isDeleted
      ? this.apiService.BRANCH.ACTIVATE
      : this.apiService.BRANCH.DEACTIVATE;

    this.apiService.post<boolean>(endpoint, { id: this.branch.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(
            this.branch!.isDeleted
              ? this.i18n.activateSuccess(this.ENTITY_KEY, this.branch!.name)
              : this.i18n.deactivateSuccess(this.ENTITY_KEY, this.branch!.name),
          );
          this.loadBranchDetail(this.branch!.id!);
        }
      },
      error: (err: any) => {
        this.message.error(err.error || this.i18n.genericError());
      },
    });
  }
}
