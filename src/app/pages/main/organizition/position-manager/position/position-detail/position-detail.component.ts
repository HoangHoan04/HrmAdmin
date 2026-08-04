import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';
import { Position } from '../../../../../../core/models';
import { ApiService } from '../../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../../core/services/i18n-message.service';
import { ActionConfirmService } from '../../../../../../shared/services/action-confirm.service';

@Component({
  standalone: false,
  selector: 'app-position-detail',
  templateUrl: './position-detail.component.html',
  styleUrls: ['./position-detail.component.scss'],
})
export class PositionDetailComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.position.entityName';

  id: string | null = null;
  loading = false;
  position: Position | null = null;
  selectedTabIndex = 0;

  detailFields: {
    key: keyof Position | string;
    label: string;
    type?: 'date' | 'boolean' | 'text';
  }[] = [
    { key: 'positionMasterName', label: 'organization.position.positionMasterName' },
    { key: 'companyName', label: 'organization.position.companyName' },
    { key: 'branchName', label: 'organization.position.branchName' },
    { key: 'departmentName', label: 'organization.position.departmentName' },
    { key: 'partName', label: 'organization.position.partName' },
    { key: 'quantityStandard', label: 'organization.position.quantityStandard' },
    { key: 'displayOrder', label: 'organization.position.displayOrder' },
    { key: 'isActive', label: 'organization.position.isActive', type: 'boolean' },
    { key: 'createdAt', label: 'organization.position.createdAt', type: 'date' },
    { key: 'updatedAt', label: 'organization.position.updatedAt', type: 'date' },
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
      this.loadPositionDetail(this.id);
    }
  }

  loadPositionDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Position>(this.apiService.POSITION.DETAIL, { id }).subscribe({
      next: (position) => {
        this.position = position;
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
    if (!this.position) return '---';
    const value = (this.position as any)[field.key];

    if (value === null || value === undefined || value === '') return '---';

    if (field.type === 'boolean') {
      return value ? this.i18n.instant('common.yes') : this.i18n.instant('common.no');
    }

    if (field.type === 'date') {
      return new Date(value).toLocaleDateString('vi-VN');
    }

    return String(value);
  }

  getDisplayName(): string {
    if (!this.position) return '';
    const parts = [this.position.positionMasterName, this.position.departmentName].filter(Boolean);
    return parts.length > 0 ? parts.join(' - ') : this.position.id;
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.path]);
  }

  goEdit(): void {
    if (!this.id) return;
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.EDIT_POSITION.path,
      this.id,
    ]);
  }

  async toggleStatus(): Promise<void> {
    if (!this.position?.id) return;

    const displayName = this.getDisplayName();
    const confirmed = this.position.isDeleted
      ? await this.actionConfirm.confirmActivate(this.ENTITY_KEY, displayName)
      : await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, displayName);

    if (!confirmed) return;

    const endpoint = this.position.isDeleted
      ? this.apiService.POSITION.ACTIVATE
      : this.apiService.POSITION.DEACTIVATE;

    this.apiService.post<boolean>(endpoint, { id: this.position.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(
            this.position!.isDeleted
              ? this.i18n.activateSuccess(this.ENTITY_KEY, displayName)
              : this.i18n.deactivateSuccess(this.ENTITY_KEY, displayName),
          );
          this.loadPositionDetail(this.position!.id!);
        }
      },
      error: (err: any) => {
        this.message.error(err.error || this.i18n.genericError());
      },
    });
  }
}
