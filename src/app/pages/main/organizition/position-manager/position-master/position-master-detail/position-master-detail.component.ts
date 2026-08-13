import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';
import { PositionMaster } from '../../../../../../core/models';
import { ApiService } from '../../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../../core/services/i18n-message.service';
import { ActionConfirmService } from '../../../../../../shared/services/action-confirm.service';

@Component({
  standalone: false,
  selector: 'app-position-master-detail',
  templateUrl: './position-master-detail.component.html',
  styleUrls: ['./position-master-detail.component.scss'],
})
export class PositionMasterDetailComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.position.positionMaster.entityName';

  id: string | null = null;
  loading = false;
  positionMaster: PositionMaster | null = null;
  selectedTabIndex = 0;

  detailFields: {
    key: keyof PositionMaster | string;
    label: string;
    type?: 'date' | 'boolean' | 'text';
  }[] = [
    { key: 'code', label: 'organization.positionMaster.code' },
    { key: 'name', label: 'organization.positionMaster.name' },
    { key: 'companyName', label: 'organization.positionMaster.companyName' },
    { key: 'branchName', label: 'organization.positionMaster.branchName' },
    { key: 'description', label: 'organization.positionMaster.description' },
    { key: 'workingHour', label: 'organization.positionMaster.workingHour' },
    { key: 'minimumWorkingHour', label: 'organization.positionMaster.minimumWorkingHour' },
    { key: 'isTimeKeeping', label: 'organization.positionMaster.isTimeKeeping', type: 'boolean' },
    {
      key: 'isLimitHoursWorking',
      label: 'organization.positionMaster.isLimitHoursWorking',
      type: 'boolean',
    },
    { key: 'limit', label: 'organization.positionMaster.limit' },
    {
      key: 'isAllowOverTimekeepingStandard',
      label: 'organization.positionMaster.isAllowOverTimekeepingStandard',
      type: 'boolean',
    },
    { key: 'isSwapPosition', label: 'organization.positionMaster.isSwapPosition', type: 'boolean' },
    {
      key: 'isApprovedWhenHiringCandidate',
      label: 'organization.positionMaster.isApprovedWhenHiringCandidate',
      type: 'boolean',
    },
    {
      key: 'isHadASecondInterview',
      label: 'organization.positionMaster.isHadASecondInterview',
      type: 'boolean',
    },
    {
      key: 'isApprovedDayOff',
      label: 'organization.positionMaster.isApprovedDayOff',
      type: 'boolean',
    },
    { key: 'quantityStandard', label: 'organization.positionMaster.quantityStandard' },
    { key: 'gradeCode', label: 'organization.positionMaster.gradeCode' },
    { key: 'gradeName', label: 'organization.positionMaster.gradeName' },
    { key: 'salaryMin', label: 'organization.positionMaster.salaryMin' },
    { key: 'salaryMax', label: 'organization.positionMaster.salaryMax' },
    { key: 'displayOrder', label: 'organization.positionMaster.displayOrder' },
    { key: 'isActive', label: 'organization.positionMaster.isActive', type: 'boolean' },
    { key: 'createdAt', label: 'organization.positionMaster.createdAt', type: 'date' },
    { key: 'updatedAt', label: 'organization.positionMaster.updatedAt', type: 'date' },
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
      this.loadPositionMasterDetail(this.id);
    }
  }

  loadPositionMasterDetail(id: string): void {
    this.loading = true;
    this.apiService.post<PositionMaster>(this.apiService.POSITION_MASTER.DETAIL, { id }).subscribe({
      next: (item) => {
        this.positionMaster = item;
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
    if (!this.positionMaster) return '---';
    const value = (this.positionMaster as any)[field.key];

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
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.path], {
      queryParams: { tab: 'position-master' },
    });
  }

  goEdit(): void {
    if (!this.id) return;
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.children.EDIT_POSITION_MASTER.path,
      this.id,
    ]);
  }

  async toggleStatus(): Promise<void> {
    if (!this.positionMaster?.id) return;

    const confirmed = this.positionMaster.isDeleted
      ? await this.actionConfirm.confirmActivate(this.ENTITY_KEY, this.positionMaster.name)
      : await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, this.positionMaster.name);

    if (!confirmed) return;

    const endpoint = this.positionMaster.isDeleted
      ? this.apiService.POSITION_MASTER.ACTIVATE
      : this.apiService.POSITION_MASTER.DEACTIVATE;

    this.apiService.post<boolean>(endpoint, { id: this.positionMaster.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(
            this.positionMaster!.isDeleted
              ? this.i18n.activateSuccess(this.ENTITY_KEY, this.positionMaster!.name)
              : this.i18n.deactivateSuccess(this.ENTITY_KEY, this.positionMaster!.name),
          );
          this.loadPositionMasterDetail(this.positionMaster!.id!);
        }
      },
      error: (err: any) => {
        this.message.error(err.error || this.i18n.genericError());
      },
    });
  }
}
