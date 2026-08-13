import { ApiService, I18nMessageService } from '@/app/core/services';
import { downloadBlob, extractFileName } from '@/app/core/utils/file.util';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-payroll-exports',
  templateUrl: './payroll-exports.component.html',
  styleUrls: [],
})
export class PayrollExportsComponent {
  form!: FormGroup;
  loadingBank = false;
  loadingBhxh = false;
  loadingAccounting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
  ) {
    const now = new Date();
    this.form = this.fb.group({
      periodYear: [now.getFullYear(), [Validators.required]],
      periodMonth: [
        now.getMonth() + 1,
        [Validators.required, Validators.min(1), Validators.max(12)],
      ],
      companyId: [null],
    });
  }

  private payload() {
    return this.form.getRawValue();
  }

  exportBank(): void {
    this.loadingBank = true;
    this.apiService.postBlob(this.apiService.SALARY.EXPORT_BANK_FILE, this.payload()).subscribe({
      next: (res) => {
        const blob = res.body!;
        const cd = res.headers.get('content-disposition');
        downloadBlob(blob, extractFileName(cd, 'bank-payroll.csv'));
        this.loadingBank = false;
      },
      error: async (err: any) => {
        this.message.error(await this.readBlobError(err));
        this.loadingBank = false;
      },
    });
  }

  exportBhxh(): void {
    this.loadingBhxh = true;
    this.apiService.postBlob(this.apiService.SALARY.EXPORT_BHXH, this.payload()).subscribe({
      next: (res) => {
        const blob = res.body!;
        const cd = res.headers.get('content-disposition');
        downloadBlob(blob, extractFileName(cd, 'bhxh.csv'));
        this.loadingBhxh = false;
      },
      error: async (err: any) => {
        this.message.error(await this.readBlobError(err));
        this.loadingBhxh = false;
      },
    });
  }

  exportAccounting(): void {
    this.loadingAccounting = true;
    this.apiService.postBlob(this.apiService.SALARY.EXPORT_ACCOUNTING, this.payload()).subscribe({
      next: (res) => {
        const blob = res.body!;
        const cd = res.headers.get('content-disposition');
        downloadBlob(blob, extractFileName(cd, 'accounting.csv'));
        this.loadingAccounting = false;
      },
      error: async (err: any) => {
        this.message.error(await this.readBlobError(err));
        this.loadingAccounting = false;
      },
    });
  }

  private async readBlobError(err: any): Promise<string> {
    try {
      if (err?.error instanceof Blob) {
        const text = await err.error.text();
        return text || this.i18n.genericError(err.error);
      }
    } catch {
      //! ignore
    }
    return this.i18n.genericError(err?.error);
  }
}
