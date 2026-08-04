import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';
import { BranchSelectBoxDto, CompanySelectBoxDto, PartMaster } from '../../../../../../core/models';
import { ApiService } from '../../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../../core/services/i18n-message.service';

@Component({
  standalone: false,
  selector: 'app-add-or-update-part-master',
  templateUrl: './add-or-update-part-master.component.html',
  styleUrls: [],
})
export class AddOrUpdatePartMasterComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];

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

    this.loadCompanies();

    if (this.isEdit && this.id) {
      this.loadPartMasterDetail(this.id);
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(250)]],
      description: [''],
      companyId: [null],
      branchId: [null],
      type: [''],
      isActive: [true],
      displayOrder: [0],
    });

    this.validateForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.loadBranches(companyId);
      if (!companyId) {
        this.validateForm.patchValue({ branchId: null }, { emitEvent: false });
      }
    });
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.companies = res;
      },
      error: () => {
        this.message.error(this.i18n.instant('common.messages.loadCompanyListFailed'));
      },
    });
  }

  loadBranches(companyId: string | null): void {
    if (!companyId) {
      this.branches = [];
      return;
    }

    this.apiService
      .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.SELECT_BOX, { companyId })
      .subscribe({
        next: (items) => {
          this.branches = items;
        },
        error: () => {
          this.branches = [];
        },
      });
  }

  loadPartMasterDetail(id: string): void {
    this.loading = true;
    this.apiService.post<PartMaster>(this.apiService.PART_MASTER.DETAIL, { id }).subscribe({
      next: (partMaster) => {
        this.validateForm.patchValue({
          code: partMaster.code,
          name: partMaster.name,
          description: partMaster.description,
          companyId: partMaster.companyId,
          branchId: partMaster.branchId,
          type: partMaster.type,
          isActive: partMaster.isActive ?? true,
          displayOrder: partMaster.displayOrder ?? 0,
        });
        this.loadBranches(partMaster.companyId ?? null);
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.path], {
      queryParams: { tab: 'part-master' },
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
      branchId: value.branchId || null,
      type: value.type || null,
      displayOrder: value.displayOrder ?? 0,
    };

    const endpoint = this.isEdit
      ? this.apiService.PART_MASTER.UPDATE
      : this.apiService.PART_MASTER.CREATE;
    const requestBody = this.isEdit ? { ...payload, id: this.id } : payload;

    this.apiService.post<any>(endpoint, requestBody).subscribe({
      next: () => {
        this.message.success(
          this.isEdit
            ? 'Cập nhật danh mục bộ phận thành công!'
            : 'Thêm mới danh mục bộ phận thành công!',
        );
        this.goBack();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
      },
    });
  }
}
