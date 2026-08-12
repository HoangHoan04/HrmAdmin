import { ROUTES_CONFIG } from '@/app/core/constants/common';
import { enumData } from '@/app/core/constants/enums/enumData';
import { toUtcDateIso } from '@/app/core/constants/helpers';
import { Contract, ContractTypeSelectBoxDto } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: [],
})
export class ContractDetailComponent implements OnInit {
  id: string | null = null;
  loading = false;
  actionSubmitting = false;
  contract: Contract | null = null;
  history: Contract[] = [];
  contractTypes: ContractTypeSelectBoxDto[] = [];
  enumData = enumData;

  signModalVisible = false;
  terminateModalVisible = false;
  renewModalVisible = false;
  signForm!: FormGroup;
  terminateForm!: FormGroup;
  renewForm!: FormGroup;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.signForm = this.fb.group({
      signDate: [new Date(), [Validators.required]],
      signedByCompanyRepresentative: [''],
      signedByEmployeeName: [''],
      fileUrl: [''],
    });
    this.terminateForm = this.fb.group({
      terminationDate: [new Date(), [Validators.required]],
      terminationReason: ['', [Validators.required]],
    });
    this.renewForm = this.fb.group({
      code: [''],
      contractTypeId: [null],
      startDate: [null, [Validators.required]],
      endDate: [null],
      basicSalary: [null],
    });

    this.id = this.route.snapshot.paramMap.get('id');
    this.loadContractTypes();
    if (this.id) {
      this.loadDetail(this.id);
    }
  }

  get canSign(): boolean {
    return (
      !!this.contract &&
      (this.contract.status === enumData.CONTRACT_STATUS.DRAFT.value ||
        this.contract.status === enumData.CONTRACT_STATUS.PENDING_SIGN.value)
    );
  }

  get canTerminate(): boolean {
    return (
      !!this.contract &&
      (this.contract.status === enumData.CONTRACT_STATUS.ACTIVE.value ||
        this.contract.status === enumData.CONTRACT_STATUS.EXPIRING_SOON.value)
    );
  }

  get canRenew(): boolean {
    return (
      !!this.contract &&
      (this.contract.status === enumData.CONTRACT_STATUS.ACTIVE.value ||
        this.contract.status === enumData.CONTRACT_STATUS.EXPIRING_SOON.value ||
        this.contract.status === enumData.CONTRACT_STATUS.EXPIRED.value)
    );
  }

  get canCreateReview(): boolean {
    return this.canRenew;
  }

  loadContractTypes(): void {
    this.apiService
      .post<ContractTypeSelectBoxDto[]>(this.apiService.CONTRACT_TYPE.SELECT_BOX, {})
      .subscribe({ next: (res) => (this.contractTypes = res) });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<Contract>(this.apiService.CONTRACT.DETAIL, { id }).subscribe({
      next: (item) => {
        this.contract = item;
        this.loading = false;
        if (item.employeeId) {
          this.loadHistory(item.employeeId);
        }
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  loadHistory(employeeId: string): void {
    this.apiService
      .post<Contract[]>(this.apiService.CONTRACT.HISTORY, { employeeId })
      .subscribe({
        next: (items) => {
          this.history = [...(items || [])].sort((a, b) => {
            const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
            const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
            return aTime - bTime;
          });
        },
      });
  }

  statusLabel(status?: string): string {
    if (!status) return '-';
    const meta = Object.values(enumData.CONTRACT_STATUS).find((x) => x.value === status);
    return meta ? this.i18n.instant(meta.labelKey) : status;
  }

  openSignModal(): void {
    if (!this.contract) return;
    this.signForm.reset({
      signDate: new Date(),
      signedByCompanyRepresentative: this.contract.signedByCompanyRepresentative || '',
      signedByEmployeeName:
        this.contract.signedByEmployeeName || this.contract.employeeName || '',
      fileUrl: this.contract.fileUrl || '',
    });
    this.signModalVisible = true;
  }

  openTerminateModal(): void {
    this.terminateForm.reset({
      terminationDate: new Date(),
      terminationReason: '',
    });
    this.terminateModalVisible = true;
  }

  openRenewModal(): void {
    if (!this.contract) return;
    const start = this.contract.endDate
      ? new Date(this.contract.endDate)
      : new Date();
    if (this.contract.endDate) {
      start.setDate(start.getDate() + 1);
    }
    this.renewForm.reset({
      code: '',
      contractTypeId: this.contract.contractTypeId || null,
      startDate: start,
      endDate: null,
      basicSalary: this.contract.basicSalary,
    });
    this.renewModalVisible = true;
  }

  createReview(): void {
    if (!this.contract?.id) return;
    this.router.navigate(
      [
        ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.REVIEW_RENEWAL.children
          .ADD_REVIEW_RENEWAL.path,
      ],
      { queryParams: { contractId: this.contract.id } },
    );
  }

  submitSign(): void {
    if (!this.contract?.id || this.signForm.invalid) {
      this.markInvalid(this.signForm);
      return;
    }
    this.actionSubmitting = true;
    const value = this.signForm.getRawValue();
    this.apiService
      .post<boolean>(this.apiService.CONTRACT.SIGN, {
        id: this.contract.id,
        signDate: toUtcDateIso(value.signDate),
        signedByCompanyRepresentative: value.signedByCompanyRepresentative || null,
        signedByEmployeeName: value.signedByEmployeeName || null,
        fileUrl: value.fileUrl || null,
      })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.instant('contract.signSuccess'));
            this.signModalVisible = false;
            this.loadDetail(this.contract!.id);
          } else {
            this.message.error(this.i18n.genericError());
          }
          this.actionSubmitting = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.actionSubmitting = false;
        },
      });
  }

  submitTerminate(): void {
    if (!this.contract?.id || this.terminateForm.invalid) {
      this.markInvalid(this.terminateForm);
      return;
    }
    this.actionSubmitting = true;
    const value = this.terminateForm.getRawValue();
    this.apiService
      .post<boolean>(this.apiService.CONTRACT.TERMINATE, {
        id: this.contract.id,
        terminationDate: toUtcDateIso(value.terminationDate),
        terminationReason: value.terminationReason,
      })
      .subscribe({
        next: (success) => {
          if (success) {
            this.message.success(this.i18n.instant('contract.terminateSuccess'));
            this.terminateModalVisible = false;
            this.loadDetail(this.contract!.id);
          } else {
            this.message.error(this.i18n.genericError());
          }
          this.actionSubmitting = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.actionSubmitting = false;
        },
      });
  }

  submitRenew(): void {
    if (!this.contract?.id || this.renewForm.invalid) {
      this.markInvalid(this.renewForm);
      return;
    }
    this.actionSubmitting = true;
    const value = this.renewForm.getRawValue();
    this.apiService
      .post<string>(this.apiService.CONTRACT.RENEW, {
        id: this.contract.id,
        code: value.code || null,
        contractTypeId: value.contractTypeId || null,
        startDate: toUtcDateIso(value.startDate),
        endDate: value.endDate ? toUtcDateIso(value.endDate) : null,
        basicSalary: value.basicSalary,
      })
      .subscribe({
        next: (newId) => {
          this.message.success(this.i18n.instant('contract.renewSuccess'));
          this.renewModalVisible = false;
          this.actionSubmitting = false;
          if (newId) {
            this.router.navigate([
              ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_LIST
                .children.DETAIL_CONTRACT.path,
              newId,
            ]);
          } else {
            this.loadDetail(this.contract!.id);
          }
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.actionSubmitting = false;
        },
      });
  }

  goBack(): void {
    this.router.navigate([
      ROUTES_CONFIG.HUMAN_RESOURCE.children.CONTRACT_MANAGER.children.CONTRACT_LIST.path,
    ]);
  }

  private markInvalid(form: FormGroup): void {
    Object.values(form.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}
