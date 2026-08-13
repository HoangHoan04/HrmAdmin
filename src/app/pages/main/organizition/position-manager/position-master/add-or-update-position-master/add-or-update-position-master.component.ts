import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';
import {
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  PositionMaster,
} from '../../../../../../core/models';
import { ApiService } from '../../../../../../core/services/api.service';
import { I18nMessageService } from '../../../../../../core/services/i18n-message.service';

@Component({
  standalone: false,
  selector: 'app-add-or-update-position-master',
  templateUrl: './add-or-update-position-master.component.html',
  styleUrls: [],
})
export class AddOrUpdatePositionMasterComponent implements OnInit {
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
      this.loadPositionMasterDetail(this.id);
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      companyId: [null],
      branchId: [null],
      workingHour: [null],
      minimumWorkingHour: [null],
      hourWorkingStart: [null],
      hourWorkingEnd: [null],
      hourSnapShotStart: [null],
      hourSnapShotEnd: [null],
      isTimeKeeping: [false],
      isLimitHoursWorking: [false],
      limit: [''],
      isAllowOverTimekeepingStandard: [false],
      isSwapPosition: [false],
      isApprovedWhenHiringCandidate: [false],
      isHadASecondInterview: [false],
      isApprovedDayOff: [false],
      quantityStandard: [null],
      gradeCode: [''],
      gradeName: [''],
      salaryMin: [null],
      salaryMax: [null],
      isActive: [true],
      displayOrder: [0],
    });

    this.validateForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.loadBranches(companyId);
      if (!companyId) {
        this.validateForm.patchValue({ branchId: null }, { emitEvent: false });
        this.branches = [];
      }
    });
  }

  loadCompanies(): void {
    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => {
        this.companies = res;
        if (!this.isEdit && !this.validateForm.value.companyId && this.companies.length > 0) {
          this.validateForm.patchValue({ companyId: this.companies[0].id });
        }
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

  loadPositionMasterDetail(id: string): void {
    this.loading = true;
    this.apiService.post<PositionMaster>(this.apiService.POSITION_MASTER.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue({
          code: item.code,
          name: item.name,
          description: item.description,
          companyId: item.companyId,
          branchId: item.branchId,
          workingHour: item.workingHour,
          minimumWorkingHour: item.minimumWorkingHour,
          hourWorkingStart: this.parseTime(item.hourWorkingStart),
          hourWorkingEnd: this.parseTime(item.hourWorkingEnd),
          hourSnapShotStart: this.parseTime(item.hourSnapShotStart),
          hourSnapShotEnd: this.parseTime(item.hourSnapShotEnd),
          isTimeKeeping: item.isTimeKeeping ?? false,
          isLimitHoursWorking: item.isLimitHoursWorking ?? false,
          limit: item.limit,
          isAllowOverTimekeepingStandard: item.isAllowOverTimekeepingStandard ?? false,
          isSwapPosition: item.isSwapPosition ?? false,
          isApprovedWhenHiringCandidate: item.isApprovedWhenHiringCandidate ?? false,
          isHadASecondInterview: item.isHadASecondInterview ?? false,
          isApprovedDayOff: item.isApprovedDayOff ?? false,
          quantityStandard: item.quantityStandard,
          gradeCode: item.gradeCode ?? '',
          gradeName: item.gradeName ?? '',
          salaryMin: item.salaryMin ?? null,
          salaryMax: item.salaryMax ?? null,
          isActive: item.isActive ?? true,
          displayOrder: item.displayOrder ?? 0,
        });
        this.loadBranches(item.companyId ?? null);
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.ORGANIZATION.children.POSITION_MANAGER.path], {
      queryParams: { tab: 'position-master' },
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
      code: value.code?.trim(),
      name: value.name?.trim(),
      description: value.description || null,
      companyId: value.companyId || null,
      branchId: value.branchId || null,
      workingHour: value.workingHour ?? null,
      minimumWorkingHour: value.minimumWorkingHour ?? null,
      hourWorkingStart: this.formatTime(value.hourWorkingStart),
      hourWorkingEnd: this.formatTime(value.hourWorkingEnd),
      hourSnapShotStart: this.formatTime(value.hourSnapShotStart),
      hourSnapShotEnd: this.formatTime(value.hourSnapShotEnd),
      isTimeKeeping: value.isTimeKeeping ?? false,
      isLimitHoursWorking: value.isLimitHoursWorking ?? false,
      limit: value.limit || null,
      isAllowOverTimekeepingStandard: value.isAllowOverTimekeepingStandard ?? false,
      isSwapPosition: value.isSwapPosition ?? false,
      isApprovedWhenHiringCandidate: value.isApprovedWhenHiringCandidate ?? false,
      isHadASecondInterview: value.isHadASecondInterview ?? false,
      isApprovedDayOff: value.isApprovedDayOff ?? false,
      quantityStandard: value.quantityStandard ?? null,
      gradeCode: value.gradeCode?.trim() || null,
      gradeName: value.gradeName?.trim() || null,
      salaryMin: value.salaryMin ?? null,
      salaryMax: value.salaryMax ?? null,
      isActive: value.isActive ?? true,
      displayOrder: value.displayOrder ?? 0,
    };

    const endpoint = this.isEdit
      ? this.apiService.POSITION_MASTER.UPDATE
      : this.apiService.POSITION_MASTER.CREATE;
    const requestBody = this.isEdit ? { ...payload, id: this.id } : payload;

    this.apiService.post<any>(endpoint, requestBody).subscribe({
      next: () => {
        this.message.success(
          this.isEdit
            ? 'Cập nhật danh mục chức vụ thành công!'
            : 'Thêm mới danh mục chức vụ thành công!',
        );
        this.goBack();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
      },
    });
  }

  private parseTime(value?: string | null): Date | null {
    if (!value) return null;
    const parts = value.split(':').map((p) => Number(p));
    if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;
    const d = new Date();
    d.setHours(parts[0], parts[1], parts[2] || 0, 0);
    return d;
  }

  private formatTime(value: Date | null): string | null {
    if (!value) return null;
    const hh = String(value.getHours()).padStart(2, '0');
    const mm = String(value.getMinutes()).padStart(2, '0');
    const ss = String(value.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
}
