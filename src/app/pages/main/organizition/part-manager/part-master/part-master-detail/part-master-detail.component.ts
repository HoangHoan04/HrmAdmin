import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';
import { PartMaster } from '../../../../../../core/models';
import { ApiService } from '../../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../../core/services/i18n-message.service';
import { ActionConfirmService } from '../../../../../../shared/services/action-confirm.service';

@Component({
  standalone: false,
  selector: 'app-part-master-detail',
  templateUrl: './part-master-detail.component.html',
  styleUrls: ['./part-master-detail.component.scss'],
})
export class PartMasterDetailComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.part.partMaster.entityName';

  id: string | null = null;
  loading = false;
  partMaster: PartMaster | null = null;
  selectedTabIndex = 0;

  detailFields: {
    key: keyof PartMaster | string;
    label: string;
    type?: 'date' | 'boolean' | 'text';
  }[] = [
    { key: 'code', label: 'organization.partMaster.code' },
    { key: 'name', label: 'organization.partMaster.name' },
    { key: 'companyName', label: 'organization.partMaster.companyName' },
    { key: 'branchName', label: 'organization.partMaster.branchName' },
    { key: 'type', label: 'organization.partMaster.type' },
    { key: 'displayOrder', label: 'organization.partMaster.displayOrder' },
    { key: 'isActive', label: 'organization.partMaster.isActive', type: 'boolean' },
    { key: 'description', label: 'organization.partMaster.description' },
    { key: 'createdAt', label: 'organization.partMaster.createdAt', type: 'date' },
    { key: 'updatedAt', label: 'organization.partMaster.updatedAt', type: 'date' },
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
      this.loadPartMasterDetail(this.id);
    }
  }

  loadPartMasterDetail(id: string): void {
    this.loading = true;
    this.apiService.post<PartMaster>(this.apiService.PART_MASTER.DETAIL, { id }).subscribe({
      next: (partMaster) => {
        this.partMaster = partMaster;
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
    if (!this.partMaster) return '---';
    const value = (this.partMaster as any)[field.key];

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
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.path], {
      queryParams: { tab: 'part-master' },
    });
  }

  goEdit(): void {
    if (!this.id) return;
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.EDIT_PART_MASTER.path,
      this.id,
    ]);
  }

  async toggleStatus(): Promise<void> {
    if (!this.partMaster?.id) return;

    const confirmed = this.partMaster.isDeleted
      ? await this.actionConfirm.confirmActivate(this.ENTITY_KEY, this.partMaster.name)
      : await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, this.partMaster.name);

    if (!confirmed) return;

    const endpoint = this.partMaster.isDeleted
      ? this.apiService.PART_MASTER.ACTIVATE
      : this.apiService.PART_MASTER.DEACTIVATE;

    this.apiService.post<boolean>(endpoint, { id: this.partMaster.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(
            this.partMaster!.isDeleted
              ? this.i18n.activateSuccess(this.ENTITY_KEY, this.partMaster!.name)
              : this.i18n.deactivateSuccess(this.ENTITY_KEY, this.partMaster!.name),
          );
          this.loadPartMasterDetail(this.partMaster!.id!);
        }
      },
      error: (err: any) => {
        this.message.error(err.error || this.i18n.genericError());
      },
    });
  }
}
