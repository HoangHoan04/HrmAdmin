import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../core/constants/common/routes.config';
import {
  Branch,
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  TimeKeepingStandardSelectBoxDto,
} from '../../../../../core/models';
import { ApiService } from '../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../core/services/i18n-message.service';

@Component({
  standalone: false,
  selector: 'app-add-or-update-branch',
  templateUrl: './add-or-update-branch.component.html',
  styleUrls: ['./add-or-update-branch.component.scss'],
})
export class AddOrUpdateBranchComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  parentBranches: BranchSelectBoxDto[] = [];
  timeKeepingStandards: TimeKeepingStandardSelectBoxDto[] = [];
  private companyCodeFromRoute: string | null = null;

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
    this.companyCodeFromRoute = this.route.snapshot.queryParamMap.get('companyCode');

    this.loadCompanies();

    if (this.isEdit && this.id) {
      this.loadBranchDetail(this.id);
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      address: ['', [Validators.maxLength(500)]],
      ipAddress: ['', [Validators.maxLength(100)]],
      companyId: [null, [Validators.required]],
      parentBranchId: [null],
      description: [''],
      shortName: [''],
      type: [''],
      groupSalary: [''],
      phoneNumber: [''],
      email: [''],
      latitude: [null],
      longitude: [null],
      timeKeepingStandardId: [null],
      isActive: [true],
    });

    this.validateForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.loadParentBranches(companyId);
      this.loadTimeKeepingStandards(companyId);
      if (!companyId) {
        this.validateForm.patchValue({ parentBranchId: null }, { emitEvent: false });
      }
    });
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.companies = res;
        this.applyCompanyFromRoute();
        if (!this.isEdit && !this.validateForm.value.companyId && this.companies.length > 0) {
          this.validateForm.patchValue({ companyId: this.companies[0].id });
        }
      },
      error: () => {
        this.message.error(this.i18n.instant('common.messages.loadCompanySelectFailed'));
      },
    });
  }

  loadParentBranches(companyId: string | null, excludeId?: string): void {
    if (!companyId) {
      this.parentBranches = [];
      return;
    }

    const payload: Record<string, string> = { companyId };
    if (excludeId) {
      payload['excludeId'] = excludeId;
    }

    this.apiService
      .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.SELECT_BOX, payload)
      .subscribe({
        next: (items) => {
          this.parentBranches = items;
        },
        error: () => {
          this.parentBranches = [];
        },
      });
  }

  loadTimeKeepingStandards(companyId?: string | null): void {
    const payload: Record<string, string> = {};
    if (companyId) payload['companyId'] = companyId;
    this.apiService
      .post<TimeKeepingStandardSelectBoxDto[]>(
        this.apiService.TIMEKEEPING_STANDARD.SELECT_BOX,
        payload,
      )
      .subscribe({
        next: (items) => {
          this.timeKeepingStandards = items;
        },
        error: () => {
          this.timeKeepingStandards = [];
        },
      });
  }

  loadBranchDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Branch>(this.apiService.BRANCH.DETAIL, { id }).subscribe({
      next: (branch) => {
        this.validateForm.patchValue({
          code: branch.code,
          name: branch.name,
          address: branch.address,
          ipAddress: branch.ipAddress,
          companyId: branch.companyId,
          parentBranchId: branch.parentBranchId,
          description: branch.description,
          shortName: branch.shortName,
          type: branch.type,
          groupSalary: branch.groupSalary,
          phoneNumber: branch.phoneNumber,
          email: branch.email,
          latitude: branch.latitude ?? null,
          longitude: branch.longitude ?? null,
          timeKeepingStandardId: branch.timeKeepingStandardId ?? null,
          isActive: branch.isActive ?? true,
        });
        this.loadParentBranches(branch.companyId ?? null, id);
        this.loadTimeKeepingStandards(branch.companyId ?? null);
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    const queryParams = this.companyCodeFromRoute
      ? { companyCode: this.companyCodeFromRoute }
      : undefined;
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.BRANCH_MANAGER.path], {
      queryParams,
    });
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
    const value = this.validateForm.getRawValue();
    const payload = {
      ...value,
      companyId: value.companyId || null,
      parentBranchId: value.parentBranchId || null,
      timeKeepingStandardId: value.timeKeepingStandardId || null,
      latitude: value.latitude ?? null,
      longitude: value.longitude ?? null,
    };

    const endpoint = this.isEdit ? this.apiService.BRANCH.UPDATE : this.apiService.BRANCH.CREATE;
    const requestBody = this.isEdit ? { ...payload, id: this.id } : payload;

    this.apiService.post<any>(endpoint, requestBody).subscribe({
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

  private applyCompanyFromRoute(): void {
    if (!this.companyCodeFromRoute || this.isEdit) return;

    const company = this.companies.find(
      (item) => item.code?.toLowerCase() === this.companyCodeFromRoute!.toLowerCase(),
    );
    if (company?.id) {
      this.validateForm.patchValue({ companyId: company.id });
    }
  }
}
