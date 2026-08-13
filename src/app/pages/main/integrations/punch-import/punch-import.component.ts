import { PunchImportResult } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  standalone: false,
  selector: 'app-punch-import',
  templateUrl: './punch-import.component.html',
  styleUrls: [],
})
export class PunchImportComponent {
  uploading = false;
  result: PunchImportResult | null = null;
  fileList: NzUploadFile[] = [];

  constructor(
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
  ) {}

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = [file];
    return false;
  };

  importFile(): void {
    const raw = this.fileList[0]?.originFileObj as File | undefined;
    if (!raw) {
      this.message.warning(this.i18n.instant('system.integrations.selectFile'));
      return;
    }
    this.uploading = true;
    this.result = null;
    this.apiService
      .uploadFile<PunchImportResult>(this.apiService.TIMEKEEPING_PUNCH.IMPORT_CSV, raw, 'file')
      .subscribe({
        next: (res) => {
          this.result = res;
          this.message.success(
            this.i18n.instant('system.integrations.importDone', {
              imported: res.imported,
              total: res.totalRows,
            }),
          );
          this.uploading = false;
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.uploading = false;
        },
      });
  }
}
