import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import { toUtcDateIso } from '@/app/core/constants/helpers';
import {
  Contract,
  ContractTypeSelectBoxDto,
  PagedResult,
  ReviewRenewal,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

interface ContractOption {
  id: string;
  label: string;
}

@Component({
  standalone: false,
  selector: 'app-add-or-update-review-renewal',
  templateUrl: './add-or-update-review-renewal.component.html',
  styleUrls: [],
})
export class AddOrUpdateReviewRenewalComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  contracts: ContractOption[] = [];
  contractTypes: ContractTypeSelectBoxDto[] = [];
  recommendationOptions = Object.values(enumData.REVIEW_RECOMMENDATION);

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
    const contractIdFromQuery = this.route.snapshot.queryParamMap.get('contractId');
    this.loadContracts(contractIdFromQuery);
    this.loadContractTypes();
    if (this.isEdit && this.id) {
      this.loadDetail(this.id);
    } else if (contractIdFromQuery) {
      this.validateForm.patchValue({ contractId: contractIdFromQuery });
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      contractId: [null, [Validators.required]],
      reviewDate: [new Date(), [Validators.required]],
      reviewedBy: [''],
      performanceScore: [null],
      reviewResult: [''],
      reviewComment: [''],
      recommendation: [null],
      proposedContractTypeId: [null],
      proposedStartDate: [null],
      proposedEndDate: [null],
      proposedBasicSalary: [null],
      note: [''],
    });
  }

  loadContracts(preferredId?: string | null): void {
    this.apiService
      .post<PagedResult<Contract>>(this.apiService.CONTRACT.PAGINATION, {
        pageIndex: 1,
        pageSize: 200,
        status: enumData.CONTRACT_STATUS.ACTIVE.value,
        sortField: 'startDate',
        sortOrder: 'desc',
      })
      .subscribe({
        next: (res) => {
          this.contracts = (res.items || []).map((item) => ({
            id: item.id,
            label: `${item.code} - ${item.employeeName || ''}`,
          }));
          if (
            preferredId &&
            !this.contracts.some((c) => c.id === preferredId)
          ) {
            this.apiService
              .post<Contract>(this.apiService.CONTRACT.DETAIL, { id: preferredId })
              .subscribe({
                next: (item) => {
                  this.contracts = [
                    {
                      id: item.id,
                      label: `${item.code} - ${item.employeeName || ''}`,
                    },
                    ...this.contracts,
                  ];
                },
              });
          }
        },
        error: () =>
          this.message.error(this.i18n.instant('reviewRenewal.loadContractSelectFailed')),
      });
  }

  loadContractTypes(): void {
    this.apiService
      .post<ContractTypeSelectBoxDto[]>(this.apiService.CONTRACT_TYPE.SELECT_BOX, {})
      .subscribe({ next: (res) => (this.contractTypes = res) });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService
      .post<ReviewRenewal>(this.apiService.REVIEW_RENEWAL.DETAIL, { id })
      .subscribe({
        next: (item) => {
          if (
            item.contractId &&
            !this.contracts.some((c) => c.id === item.contractId)
          ) {
            this.contracts = [
              {
                id: item.contractId,
                label: `${item.contractCode || item.contractId} - ${item.employeeName || ''}`,
              },
              ...this.contracts,
            ];
          }
          this.validateForm.patchValue({
            contractId: item.contractId,
            reviewDate: item.reviewDate ? new Date(item.reviewDate) : null,
            reviewedBy: item.reviewedBy,
            performanceScore: item.performanceScore,
            reviewResult: item.reviewResult,
            reviewComment: item.reviewComment,
            recommendation: item.recommendation,
            proposedContractTypeId: item.proposedContractTypeId,
            proposedStartDate: item.proposedStartDate
              ? new Date(item.proposedStartDate)
              : null,
            proposedEndDate: item.proposedEndDate ? new Date(item.proposedEndDate) : null,
            proposedBasicSalary: item.proposedBasicSalary,
            note: item.note,
          });
          if (this.isEdit) {
            this.validateForm.get('contractId')?.disable();
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.loadDetailFailed(err.error));
          this.goBack();
        },
      });
  }

  goBack(): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.REVIEW_RENEWAL.path,
    ]);
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
    const payload: Record<string, any> = {
      contractId: value.contractId,
      reviewDate: value.reviewDate ? toUtcDateIso(value.reviewDate) : null,
      reviewedBy: value.reviewedBy || null,
      performanceScore: value.performanceScore,
      reviewResult: value.reviewResult || null,
      reviewComment: value.reviewComment || null,
      recommendation: value.recommendation || null,
      proposedContractTypeId: value.proposedContractTypeId || null,
      proposedStartDate: value.proposedStartDate
        ? toUtcDateIso(value.proposedStartDate)
        : null,
      proposedEndDate: value.proposedEndDate ? toUtcDateIso(value.proposedEndDate) : null,
      clearProposedEndDate: !value.proposedEndDate,
      proposedBasicSalary: value.proposedBasicSalary,
      note: value.note || null,
    };
    const endpoint = this.isEdit
      ? this.apiService.REVIEW_RENEWAL.UPDATE
      : this.apiService.REVIEW_RENEWAL.CREATE;
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
