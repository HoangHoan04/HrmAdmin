import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import { PagedResult } from '../../../../../core/models/common.models';
import { Branch, Company } from '../../../../../core/models/organization.models';
import { ApiService } from '../../../../../core/services/api.service';
import { ActionConfirmService } from '../../../../../shared/services/action-confirm.service';
import { TableColumn } from '../../../../../shared/components/table-custom/table-custom.types';

@Component({
  standalone: false,
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss'],
})
export class CompanyDetailComponent implements OnInit {
  id: string | null = null;
  loading = false;
  company: Company | null = null;
  selectedTabIndex = 0;

  branches: (Branch & { status?: boolean })[] = [];
  branchesLoading = false;

  childCompanies: (Company & { status?: boolean })[] = [];
  childCompaniesLoading = false;

  branchColumns: TableColumn[] = [
    { field: 'code', header: 'organization.branch.code', type: 'text' },
    { field: 'name', header: 'organization.branch.name', type: 'text' },
    { field: 'address', header: 'organization.branch.address', type: 'text' },
    {
      field: 'status',
      header: 'organization.branch.status',
      type: 'boolean',
      renderBoolean: (value) => (value ? 'Đang hoạt động' : 'Ngưng hoạt động'),
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
      renderBoolean: (value) => (value ? 'Đang hoạt động' : 'Ngưng hoạt động'),
    },
  ];

  detailFields: { key: keyof Company | string; label: string; type?: 'date' | 'boolean' | 'text' }[] = [
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
    { key: 'legalRepresentativePosition', label: 'organization.company.legalRepresentativePosition' },
    { key: 'foundedDate', label: 'organization.company.foundedDate', type: 'date' },
    { key: 'prefixMaleCode', label: 'organization.company.prefixMaleCode' },
    { key: 'prefixFemaleCode', label: 'organization.company.prefixFemaleCode' },
    { key: 'prefixFullTimeCode', label: 'organization.company.prefixFullTimeCode' },
    { key: 'prefixPartTimeCode', label: 'organization.company.prefixPartTimeCode' },
    { key: 'dayComputeSalary', label: 'organization.company.dayComputeSalary', type: 'date' },
    { key: 'isComputePrevMonth', label: 'organization.company.isComputePrevMonth', type: 'boolean' },
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
    private readonly apiService: ApiService,
    private readonly actionConfirm: ActionConfirmService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadCompanyDetail(this.id);
    }
  }

  loadCompanyDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Company>(this.apiService.COMPANY.DETAIL, { id }).subscribe({
      next: (company) => {
        this.company = company;
        this.loading = false;
        this.loadBranches();
        this.loadChildCompanies();
      },
      error: (err: any) => {
        this.message.error(err.error || 'Không thể tải thông tin chi tiết công ty.');
        this.loading = false;
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
      return value ? 'Có' : 'Không';
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

  async toggleStatus(): Promise<void> {
    if (!this.company?.id) return;

    const confirmed = this.company.isDeleted
      ? await this.actionConfirm.confirmActivate('công ty', this.company.name)
      : await this.actionConfirm.confirmDeactivate('công ty', this.company.name);

    if (!confirmed) return;

    const endpoint = this.company.isDeleted
      ? this.apiService.COMPANY.ACTIVATE
      : this.apiService.COMPANY.DEACTIVATE;

    this.apiService.post<boolean>(endpoint, { id: this.company.id }).subscribe({
      next: (success) => {
        if (success) {
          this.message.success(
            this.company!.isDeleted
              ? 'Kích hoạt hoạt động công ty thành công!'
              : 'Ngưng hoạt động công ty thành công!',
          );
          this.loadCompanyDetail(this.company!.id!);
        }
      },
      error: (err: any) => {
        this.message.error(err.error || 'Có lỗi xảy ra.');
      },
    });
  }
}
