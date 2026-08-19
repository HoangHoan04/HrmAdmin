import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums';
import {
  Asset,
  AssetTicket,
  BranchSelectBoxDto,
  CompanySelectBoxDto,
  EmployeeSelectBoxDto,
  PagedResult,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-add-or-update-asset-ticket',
  templateUrl: './add-or-update-asset-ticket.component.html',
  styleUrls: [],
})
export class AddOrUpdateAssetTicketComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  companies: CompanySelectBoxDto[] = [];
  branches: BranchSelectBoxDto[] = [];
  employees: EmployeeSelectBoxDto[] = [];
  assets: Asset[] = [];
  ticketTypeOptions = Object.values(enumData.ASSET_TICKET_TYPE);
  statusOptions = Object.values(enumData.ASSET_TICKET_STATUS).filter(
    (x, idx, self) => self.findIndex((s) => s.value === x.value) === idx,
  );

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
      assetId: [null, [Validators.required]],
      employeeId: [null, [Validators.required]],
      toEmployeeId: [null],
      companyId: [null, [Validators.required]],
      branchId: [null],
      ticketType: ['ISSUE', [Validators.required]],
      status: ['DRAFT', [Validators.required]],
      ticketAt: [new Date(), [Validators.required]],
      returnExpectedDate: [null],
      condition: [''],
      note: [''],
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    this.apiService.post<CompanySelectBoxDto[]>(this.apiService.COMPANY.SELECT_BOX, {}).subscribe({
      next: (res) => (this.companies = res),
    });
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({ next: (res) => (this.employees = res) });
    this.apiService
      .post<PagedResult<Asset>>(this.apiService.ASSET.PAGINATION, {
        pageIndex: 1,
        pageSize: 500,
      })
      .subscribe({ next: (res) => (this.assets = res.items) });

    this.validateForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.loadBranches(companyId);
      this.validateForm.patchValue({ branchId: null });
    });

    if (this.isEdit && this.id) this.loadDetail(this.id);
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
    this.apiService.post<AssetTicket>(this.apiService.ASSET_TICKET.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue({
          ...item,
          ticketAt: item.ticketAt ? new Date(item.ticketAt) : null,
          returnExpectedDate: item.returnExpectedDate ? new Date(item.returnExpectedDate) : null,
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
    this.router.navigate([ROUTES_CONFIG.ASSET.children.ASSET_TICKET.path]);
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }
    this.submitting = true;
    const payload = this.validateForm.getRawValue();
    const endpoint = this.isEdit
      ? this.apiService.ASSET_TICKET.UPDATE
      : this.apiService.ASSET_TICKET.CREATE;
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
