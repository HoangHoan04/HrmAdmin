import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import { Branch, Company } from '../../../../../core/models';
import { PagedResult } from '../../../../../core/models/common.models';
import { ApiService } from '../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../core/services/i18n-message.service';
import {
  RowAction,
  TableColumn,
} from '../../../../../shared/components/table-custom/table-custom.types';
import { ActionConfirmService } from '../../../../../shared/services/action-confirm.service';

@Component({
  standalone: false,
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss'],
})
export class CompanyDetailComponent implements OnInit {
  private readonly ENTITY_KEY = 'organization.company.entityName';

  id: string | null = null;
  loading = false;
  company: Company | null = null;
  selectedTabIndex = 0;

  branches: (Branch & { status?: boolean })[] = [];
  branchesLoading = false;

  childCompanies: (Company & { status?: boolean })[] = [];
  childCompaniesLoading = false;

  branchRowActions: RowAction[] = [
    {
      key: 'view',
      icon: 'eye',
      tooltip: 'table.action.viewDetail',
      severity: 'primary',
      onClick: (record) => this.viewBranch(record),
    },
  ];

  branchColumns: TableColumn[] = [
    { field: 'code', header: 'organization.branch.code', type: 'text' },
    { field: 'name', header: 'organization.branch.name', type: 'text' },
    { field: 'address', header: 'organization.branch.address', type: 'text' },
    {
      field: 'status',
      header: 'organization.branch.status',
      type: 'boolean',
      renderBoolean: (value) =>
        value
          ? this.i18n.instant('common.statusActive')
          : this.i18n.instant('common.statusInactive'),
    },
  ];

  childCompanyColumns: TableColumn[] = [
    { field: 'code', header: 'organization.company.code', type: 'text' },
    { field: 'name', header: 'organization.company.name', type: 'text' },
    { field: 'hotline', header: 'organization.company.hotline', type: 'text' },
    {
      field: 'status',
      header: 'organization.company.status',
      type: 'boolean',
      renderBoolean: (value) =>
        value
          ? this.i18n.instant('common.statusActive')
          : this.i18n.instant('common.statusInactive'),
    },
  ];

  detailFields: {
    key: keyof Company | string;
    label: string;
    type?: 'date' | 'boolean' | 'text';
  }[] = [
    { key: 'code', label: 'organization.company.code' },
    { key: 'name', label: 'organization.company.name' },
    { key: 'parentName', label: 'organization.company.parentCompany' },
    { key: 'taxCode', label: 'organization.company.taxCode' },
    { key: 'businessRegistrationCode', label: 'organization.company.businessRegistrationCode' },
    { key: 'socialInsuranceCode', label: 'organization.company.socialInsuranceCode' },
    { key: 'hotline', label: 'organization.company.hotline' },
    { key: 'email', label: 'organization.company.email' },
    { key: 'website', label: 'organization.company.website' },
    { key: 'fax', label: 'organization.company.fax' },
    { key: 'address', label: 'organization.company.address' },
    { key: 'country', label: 'organization.company.country' },
    { key: 'city', label: 'organization.company.city' },
    { key: 'district', label: 'organization.company.district' },
    { key: 'ward', label: 'organization.company.ward' },
    { key: 'companyType', label: 'organization.company.companyType' },
    { key: 'industry', label: 'organization.company.industry' },
    { key: 'operatingStatus', label: 'organization.company.operatingStatus' },
    { key: 'legalRepresentative', label: 'organization.company.legalRepresentative' },
    {
      key: 'legalRepresentativePosition',
      label: 'organization.company.legalRepresentativePosition',
    },
    { key: 'foundedDate', label: 'organization.company.foundedDate', type: 'date' },
    { key: 'prefixMaleCode', label: 'organization.company.prefixMaleCode' },
    { key: 'prefixFemaleCode', label: 'organization.company.prefixFemaleCode' },
    { key: 'prefixFullTimeCode', label: 'organization.company.prefixFullTimeCode' },
    { key: 'prefixPartTimeCode', label: 'organization.company.prefixPartTimeCode' },
    { key: 'dayComputeSalary', label: 'organization.company.dayComputeSalary', type: 'date' },
    {
      key: 'isComputePrevMonth',
      label: 'organization.company.isComputePrevMonth',
      type: 'boolean',
    },
    { key: 'bankAccountNumber', label: 'organization.company.bankAccountNumber' },
    { key: 'bankName', label: 'organization.company.bankName' },
    { key: 'bankBranch', label: 'organization.company.bankBranch' },
    { key: 'timeZone', label: 'organization.company.timeZone' },
    { key: 'defaultLanguage', label: 'organization.company.defaultLanguage' },
    { key: 'logoUrl', label: 'organization.company.logoUrl' },
    { key: 'isActive', label: 'organization.company.isActive', type: 'boolean' },
    { key: 'timeKeepingStandardId', label: 'organization.company.timeKeepingStandardId' },
    { key: 'createdAt', label: 'organization.company.createdAt', type: 'date' },
    { key: 'updatedAt', label: 'organization.company.updatedAt', type: 'date' },
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
      this.loadCompanyDetail(this.id);
    }
  }

  loadCompanyDetail(id: string): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.apiService.post<Company>(this.apiService.COMPANY.DETAIL, { id }).subscribe({
      next: (company) => {
        this.company = company;
        this.loading = false;
        this.cdr.markForCheck();
        this.loadBranches();
        this.loadChildCompanies();
      },
      error: (err: any) => {
        this.message.error(err.error || this.i18n.loadDetailFailed(err.error));
        this.loading = false;
        this.cdr.markForCheck();
        this.goBack();
      },
    });
  }

  loadBranches(): void {
    if (!this.id) return;
    this.branchesLoading = true;
    this.apiService
      .post<PagedResult<Branch>>(this.apiService.BRANCH.PAGINATION, {
        pageIndex: 1,
        pageSize: 100,
        companyId: this.id,
        sortField: 'name',
        sortOrder: 'asc',
      })
      .subscribe({
        next: (res) => {
          this.branches = res.items.map((item) => ({
            ...item,
            status: !item.isDeleted,
          }));
          this.branchesLoading = false;
        },
        error: () => {
          this.branchesLoading = false;
        },
      });
  }

  loadChildCompanies(): void {
    if (!this.id) return;
    this.childCompaniesLoading = true;
    this.apiService
      .post<PagedResult<Company>>(this.apiService.COMPANY.PAGINATION, {
        pageIndex: 1,
        pageSize: 100,
        parentId: this.id,
        sortField: 'name',
        sortOrder: 'asc',
      })
      .subscribe({
        next: (res) => {
          this.childCompanies = res.items.map((item) => ({
            ...item,
            status: !item.isDeleted,
          }));
          this.childCompaniesLoading = false;
        },
        error: () => {
          this.childCompaniesLoading = false;
        },
      });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  getFieldValue(field: { key: string; type?: string }): string {
    if (!this.company) return '---';
    const value = (this.company as any)[field.key];

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
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.COMPANY_MANAGER.path]);
  }

  goEdit(): void {
    if (!this.id) return;
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.COMPANY_MANAGER.children.EDIT_COMPANY.path,
      this.id,
    ]);
  }

  viewAllBranches(): void {
    if (!this.company?.code) return;
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.path], {
      queryParams: { companyCode: this.company.code },
    });
  }

  addBranch(): void {
    if (!this.company?.code) return;
    this.router.navigate(
      [ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.children.ADD_BRANCH.path],
      { queryParams: { companyCode: this.company.code } },
    );
  }

  viewBranch(branch: Branch): void {
    if (!branch.id) return;
    this.router.navigate([
      ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.children.DETAIL_BRANCH.path,
      branch.id,
    ]);
  }

  async toggleStatus(): Promise<void> {
    if (!this.company?.id) return;

    const confirmed = this.company.isDeleted
      ? await this.actionConfirm.confirmActivate(this.ENTITY_KEY, this.company.name)
      : await this.actionConfirm.confirmDeactivate(this.ENTITY_KEY, this.company.name);

    if (!confirmed) return;

    const endpoint = this.company.isDeleted
      ? this.apiService.COMPANY.ACTIVATE
      : this.apiService.COMPANY.DEACTIVATE;

    this.apiService.post<boolean>(endpoint, { id: this.company.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(
            this.company!.isDeleted
              ? this.i18n.activateSuccess(this.ENTITY_KEY, this.company!.name)
              : this.i18n.deactivateSuccess(this.ENTITY_KEY, this.company!.name),
          );
          this.loadCompanyDetail(this.company!.id!);
        }
      },
      error: (err: any) => {
        this.message.error(err.error || this.i18n.genericError());
      },
    });
  }
}
