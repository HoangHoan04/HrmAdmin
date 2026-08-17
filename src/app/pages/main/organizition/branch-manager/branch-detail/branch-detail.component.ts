import { enumData } from '@/app/core/constants/enums';
import { RowAction, TableColumn } from '@/app/shared/components/table-custom/table-custom.types';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import { Branch, Department, PagedResult } from '../../../../../core/models';
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
  departmentsLoading = false;
  branch: Branch | null = null;
  departments: Branch[] = [];
  selectedTabIndex = 0;

  departmentRowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'organization.department.viewDetail',
      severity: 'primary',
      onClick: (record) => this.viewDepartment(record),
    },
  ];

  departmentColumns: TableColumn[] = [
    { field: 'code', header: 'organization.department.code', type: 'text' },
    { field: 'name', header: 'organization.department.name', type: 'text' },
    { field: 'managerName', header: 'organization.department.managerName', type: 'text' },
    {
      field: 'status',
      header: 'organization.department.status',
      type: 'boolean',
      renderBoolean: (value) =>
        value
          ? this.i18n.instant('common.statusActive')
          : this.i18n.instant('common.statusInactive'),
    },
  ];

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
    { key: 'managerName', label: 'organization.branch.managerName' },
    { key: 'managerPhone', label: 'organization.branch.managerPhone' },
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
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadBranchDetail(this.id);
    }
  }

  loadBranchDetail(id: string): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.apiService.post<Branch>(this.apiService.BRANCH.DETAIL, { id }).subscribe({
      next: (branch) => {
        this.branch = branch;
        this.loading = false;
        this.cdr.markForCheck();
        this.loadDepartments();
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.loading = false;
        this.cdr.markForCheck();
        this.goBack();
      },
    });
  }

  loadDepartments(): void {
    if (!this.id) return;
    this.departmentsLoading = true;
    this.apiService
      .post<PagedResult<Branch>>(this.apiService.DEPARTMENT.PAGINATION, {
        branchId: this.id,
        pageIndex: enumData.PAGE.PAGE_INDEX,
        pageSize: enumData.PAGE.PAGE_SIZE,
        sortField: enumData.PAGE.SORT_FIELD.NAME,
        sortOrder: enumData.PAGE.SORT_ORDER.ASC,
      })
      .subscribe({
        next: (res) => {
          this.departments = res.items.map((item) => ({
            ...item,
            status: !item.isDeleted,
          }));
          this.departmentsLoading = false;
        },
        error: () => {
          this.departmentsLoading = false;
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

  viewDepartment(department: Department): void {
    if (!department.id) return;
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.DEPARTMENT_MANAGER.children.DETAIL_DEPARTMENT.path,
      department.id,
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
