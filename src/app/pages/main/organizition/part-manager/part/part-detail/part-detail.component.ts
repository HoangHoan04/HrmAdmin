import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';
import { Part } from '../../../../../../core/models';
import { ApiService } from '../../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../../core/services/i18n-message.service';
import { ActionConfirmService } from '../../../../../../shared/services/action-confirm.service';

@Component({
  standalone: false,
  selector: 'app-part-detail',
  templateUrl: './part-detail.component.html',
  styleUrls: ['./part-detail.component.scss'],
})
export class PartDetailComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.part.entityName';

  id: string | null = null;
  loading = false;
  part: Part | null = null;
  selectedTabIndex = 0;

  detailFields: {
    key: keyof Part | string;
    label: string;
    type?: 'date' | 'boolean' | 'text';
  }[] = [
    { key: 'code', label: 'organization.part.code' },
    { key: 'name', label: 'organization.part.name' },
    { key: 'partMasterName', label: 'organization.part.partMasterName' },
    { key: 'companyName', label: 'organization.part.companyName' },
    { key: 'branchName', label: 'organization.part.branchName' },
    { key: 'departmentName', label: 'organization.part.departmentName' },
    { key: 'limit', label: 'organization.part.limit' },
    { key: 'displayOrder', label: 'organization.part.displayOrder' },
    { key: 'isActive', label: 'organization.part.isActive', type: 'boolean' },
    { key: 'description', label: 'organization.part.description' },
    { key: 'createdAt', label: 'organization.part.createdAt', type: 'date' },
    { key: 'updatedAt', label: 'organization.part.updatedAt', type: 'date' },
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
      this.loadPartDetail(this.id);
    }
  }

  loadPartDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Part>(this.apiService.PART.DETAIL, { id }).subscribe({
      next: (part) => {
        this.part = part;
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
    if (!this.part) return '---';
    const value = (this.part as any)[field.key];

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
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.path]);
  }

  goEdit(): void {
    if (!this.id) return;
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.children.EDIT_PART.path,
      this.id,
    ]);
  }

  async toggleStatus(): Promise<void> {
    if (!this.part?.id) return;

    const confirmed = this.part.isDeleted
      ? await this.actionConfirm.confirmActivate(this.ENTITY_KEY, this.part.name)
      : await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, this.part.name);

    if (!confirmed) return;

    const endpoint = this.part.isDeleted
      ? this.apiService.PART.ACTIVATE
      : this.apiService.PART.DEACTIVATE;

    this.apiService.post<boolean>(endpoint, { id: this.part.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(
            this.part!.isDeleted
              ? this.i18n.activateSuccess(this.ENTITY_KEY, this.part!.name)
              : this.i18n.deactivateSuccess(this.ENTITY_KEY, this.part!.name),
          );
          this.loadPartDetail(this.part!.id!);
        }
      },
      error: (err: any) => {
        this.message.error(err.error || this.i18n.genericError());
      },
    });
  }
}
