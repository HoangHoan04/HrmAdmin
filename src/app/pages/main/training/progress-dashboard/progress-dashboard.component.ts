import { enumData } from '@/app/core/constants/enums/enumData';
import { TrainingProgress } from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import {
  PaginationConfig,
  TableColumn,
  ToolbarConfig,
} from '@/app/shared/components/table-custom/table-custom.types';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-progress-dashboard',
  templateUrl: './progress-dashboard.component.html',
  styleUrls: [],
})
export class ProgressDashboardComponent implements OnInit {
  data: TrainingProgress[] = [];
  loading = false;
  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };
  toolbar: ToolbarConfig = { show: true, showRefreshButton: true };
  columns: TableColumn[] = [
    { field: 'courseName', header: 'training.progress.courseName', type: 'text' },
    { field: 'enrolledCount', header: 'training.progress.enrolledCount', type: 'number' },
    { field: 'completedCount', header: 'training.progress.completedCount', type: 'number' },
    { field: 'droppedCount', header: 'training.progress.droppedCount', type: 'number' },
    { field: 'completionPercent', header: 'training.progress.completionPercent', type: 'number' },
  ];

  constructor(
    private readonly apiService: ApiService,
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.apiService
      .post<TrainingProgress[]>(this.apiService.TRAINING_PROGRESS.SUMMARY, {})
      .subscribe({
        next: (res) => {
          this.data = res || [];
          this.pagination.total = this.data.length;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }
}
