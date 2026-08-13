import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import {
  Asset,
  AssetType,
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  PagedResult,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-asset',
  templateUrl: './add-or-update-asset.component.html',
  styleUrls: [],
})
export class AddOrUpdateAssetComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  isDetail = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  assetTypes: AssetType[] = [];
  statusOptions = Object.values(enumData.ASSET_STATUS);

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      assetTypeId: [null, [Validators.required]],
      companyId: [null, [Validators.required]],
      branchId: [null],
      serialNumber: [''],
      purchaseDate: [null],
      purchaseCost: [null],
      status: ['AVAILABLE', [Validators.required]],
      note: [''],
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isDetail = this.router.url.includes('/detail');
    this.isEdit = !!this.id && !this.isDetail;

    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => (this.companies = res),
    });
    this.apiService
      .post<PagedResult<AssetType>>(this.apiService.ASSET_TYPE.PAGINATION, {
        pageIndex: 1,
        pageSize: 200,
        isActive: true,
      })
      .subscribe({ next: (res) => (this.assetTypes = res.items) });

    this.validateForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.loadBranches(companyId);
      this.validateForm.patchValue({ branchId: null });
    });

    if (this.id) this.loadDetail(this.id);
    if (this.isDetail) this.validateForm.disable();
  }

  loadBranches(companyId: string | null): void {
    if (!companyId) {
      this.branches = [];
      return;
    }
    this.apiService
      .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.LOAD_BY_COMPANY, { companyId })
      .subscribe({ next: (res) => (this.branches = res) });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Asset>(this.apiService.ASSET.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue({
          ...item,
          purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
        });
        if (item.companyId) this.loadBranches(item.companyId);
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.ASSET.children.ASSET_MANAGER.path]);
  }

  submitForm(): void {
    if (this.isDetail) return;
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }
    this.submitting = true;
    const payload = this.validateForm.getRawValue();
    const endpoint = this.isEdit ? this.apiService.ASSET.UPDATE : this.apiService.ASSET.CREATE;
    const body = this.isEdit ? { ...payload, id: this.id } : payload;
    this.apiService.post<any>(endpoint, body).subscribe({
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
