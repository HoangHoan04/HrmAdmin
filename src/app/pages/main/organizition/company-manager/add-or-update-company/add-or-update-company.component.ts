import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import {
  Company,
  CompanySelectBoxDto,
  TimeKeepingStandardSelectBoxDto,
} from '../../../../../core/models';
import { ApiService } from '../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../core/services/i18n-message.service';

@Component({
  standalone: false,
  selector: 'app-add-or-update-company',
  templateUrl: './add-or-update-company.component.html',
  styleUrls: ['./add-or-update-company.component.scss'],
})
export class AddOrUpdateCompanyComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  parentCompanies: CompanySelectBoxDto[] = [];
  timeKeepingStandards: TimeKeepingStandardSelectBoxDto[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.loadParentCompanies();
    this.loadTimeKeepingStandards();

    if (this.isEdit && this.id) {
      this.loadCompanyDetail(this.id);
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      id: [null],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(250)]],
      description: [''],
      address: ['', [Validators.maxLength(500)]],
      taxCode: ['', [Validators.maxLength(50)]],
      hotline: ['', [Validators.maxLength(20)]],
      prefixMaleCode: ['', [Validators.maxLength(50)]],
      prefixFemaleCode: ['', [Validators.maxLength(50)]],
      prefixFullTimeCode: ['', [Validators.maxLength(50)]],
      prefixPartTimeCode: ['', [Validators.maxLength(50)]],
      parentId: [null],
      dayComputeSalary: [null],
      isComputePrevMonth: [false],
      email: ['', [Validators.maxLength(250)]],
      website: ['', [Validators.maxLength(250)]],
      fax: ['', [Validators.maxLength(50)]],
      country: ['', [Validators.maxLength(100)]],
      city: ['', [Validators.maxLength(100)]],
      district: ['', [Validators.maxLength(100)]],
      ward: ['', [Validators.maxLength(100)]],
      businessRegistrationCode: ['', [Validators.maxLength(50)]],
      foundedDate: [null],
      operatingStatus: ['', [Validators.maxLength(100)]],
      legalRepresentative: ['', [Validators.maxLength(250)]],
      legalRepresentativePosition: ['', [Validators.maxLength(250)]],
      companyType: ['', [Validators.maxLength(100)]],
      industry: ['', [Validators.maxLength(250)]],
      bankAccountNumber: ['', [Validators.maxLength(50)]],
      bankName: ['', [Validators.maxLength(250)]],
      bankBranch: ['', [Validators.maxLength(250)]],
      timeZone: ['', [Validators.maxLength(100)]],
      defaultLanguage: ['', [Validators.maxLength(20)]],
      logoUrl: ['', [Validators.maxLength(500)]],
      isActive: [true],
      socialInsuranceCode: ['', [Validators.maxLength(50)]],
      timeKeepingStandardId: [null],
    });
  }

  loadParentCompanies(): void {
    const payload = this.isEdit && this.id ? { excludeId: this.id } : {};
    this.apiService
      .post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, payload)
      .subscribe({
        next: (items) => {
          this.parentCompanies = items;
        },
        error: () => {
          this.message.error(this.i18n.instant('common.messages.loadParentCompanyFailed'));
        },
      });
  }

  loadTimeKeepingStandards(): void {
    this.apiService
      .post<TimeKeepingStandardSelectBoxDto[]>(this.apiService.TIMEKEEPING_STANDARD.SELECT_BOX, {})
      .subscribe({
        next: (items) => {
          this.timeKeepingStandards = items;
        },
        error: () => {
          this.timeKeepingStandards = [];
        },
      });
  }

  loadCompanyDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Company>(this.apiService.COMPANY.DETAIL, { id }).subscribe({
      next: (company) => {
        this.validateForm.patchValue({
          id: company.id,
          code: company.code,
          name: company.name,
          description: company.description,
          address: company.address,
          hotline: company.hotline,
          taxCode: company.taxCode,
          prefixMaleCode: company.prefixMaleCode,
          prefixFemaleCode: company.prefixFemaleCode,
          prefixFullTimeCode: company.prefixFullTimeCode,
          prefixPartTimeCode: company.prefixPartTimeCode,
          parentId: company.parentId,
          dayComputeSalary: company.dayComputeSalary ? new Date(company.dayComputeSalary) : null,
          isComputePrevMonth: company.isComputePrevMonth ?? false,
          email: company.email,
          website: company.website,
          fax: company.fax,
          country: company.country,
          city: company.city,
          district: company.district,
          ward: company.ward,
          businessRegistrationCode: company.businessRegistrationCode,
          foundedDate: company.foundedDate ? new Date(company.foundedDate) : null,
          operatingStatus: company.operatingStatus,
          legalRepresentative: company.legalRepresentative,
          legalRepresentativePosition: company.legalRepresentativePosition,
          companyType: company.companyType,
          industry: company.industry,
          bankAccountNumber: company.bankAccountNumber,
          bankName: company.bankName,
          bankBranch: company.bankBranch,
          timeZone: company.timeZone,
          defaultLanguage: company.defaultLanguage,
          logoUrl: company.logoUrl,
          isActive: company.isActive ?? true,
          socialInsuranceCode: company.socialInsuranceCode,
          timeKeepingStandardId: company.timeKeepingStandardId,
        });
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(err.error || this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    const basePath = ROUTES_CONFIG.ORGANIZATION.children.COMPANY_MANAGER.path;
    this.router.navigate([basePath]);
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting = true;
    const raw = this.validateForm.getRawValue();
    const payload = {
      ...raw,
      dayComputeSalary: raw.dayComputeSalary ? new Date(raw.dayComputeSalary).toISOString() : null,
      foundedDate: raw.foundedDate ? new Date(raw.foundedDate).toISOString() : null,
      parentId: raw.parentId || null,
      timeKeepingStandardId: raw.timeKeepingStandardId || null,
    };

    const endpoint = this.isEdit ? this.apiService.COMPANY.UPDATE : this.apiService.COMPANY.CREATE;

    this.apiService.post<any>(endpoint, payload).subscribe({
      next: () => {
        this.message.success(this.isEdit ? this.i18n.updateSuccess() : this.i18n.createSuccess());
        this.goBack();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
      },
    });
  }
}
