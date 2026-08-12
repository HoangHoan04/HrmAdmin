import { enumData } from '@/app/core/constants/enums/enumData';
import {
  EmployeeSelectBoxDto,
  EmployeeWorkPattern,
  PagedResult,
  ShiftMasterSelectBoxDto,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import {
  CommonFilterActions,
  FilterAction,
  FilterConfig,
  FilterField,
} from '@/app/shared/components/filter-custom/filter-custom.types';
import {
  CommonActions,
  PaginationConfig,
  RowAction,
  TableAction,
  TableColumn,
  ToolbarConfig,
} from '@/app/shared/components/table-custom/table-custom.types';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  standalone: false,
  selector: 'app-work-pattern-manager',
  templateUrl: './work-pattern-manager.component.html',
  styleUrls: [],
})
export class WorkPatternManagerComponent implements OnInit {
  private readonly ENTITY_KEY = 'workPattern.entityName';

  data: EmployeeWorkPattern[] = [];
  loading = false;
  submitting = false;

  upsertVisible = false;
  bulkVisible = false;
  upsertForm: FormGroup;
  bulkForm: FormGroup;
  editingId: string | null = null;

  employeeOptions: { label: string; value: string }[] = [];
  shiftOptions: { label: string; value: string }[] = [];

  pagination: PaginationConfig = {
    current: enumData.PAGE.PAGE_INDEX,
    pageSize: enumData.PAGE.PAGE_SIZE,
    total: enumData.PAGE.TOTAL,
    showTotal: true,
  };

  toolbar: ToolbarConfig = { show: true };
  toolbarActions: TableAction[] = [
    CommonActions.create(() => this.openCreate()),
    {
      key: 'bulk',
      label: 'workPattern.bulkAssign',
      icon: 'usergroup-add',
      severity: 'default',
      onClick: () => this.openBulk(),
    },
  ];

  filters: Record<string, any> = {
    employeeId: null,
    shiftMasterId: null,
    isActive: true,
  };

  filterConfig: FilterConfig = {
    show: true,
    collapsible: true,
    defaultOpen: true,
    title: 'common.filter.title',
    actionsAlign: 'center',
  };

  filterFields: FilterField[] = [
    {
      key: 'employeeId',
      label: 'workPattern.employee',
      type: 'select',
      placeholder: 'workPattern.filterEmployee',
      col: 8,
      allowClear: true,
      options: [],
    },
    {
      key: 'shiftMasterId',
      label: 'workPattern.shift',
      type: 'select',
      placeholder: 'workPattern.filterShift',
      col: 8,
      allowClear: true,
      options: [],
    },
    {
      key: 'isActive',
      label: 'workPattern.isActive',
      type: 'select',
      placeholder: 'workPattern.filterActive',
      col: 8,
      allowClear: true,
      options: [
        { label: 'workPattern.activeYes', value: true },
        { label: 'workPattern.activeNo', value: false },
      ],
    },
  ];

  filterActions: FilterAction[] = [
    CommonFilterActions.search(() => this.loadData()),
    CommonFilterActions.clear(() => this.onFilterClear()),
  ];

  columns: TableColumn[] = [
    { field: 'employeeCode', header: 'workPattern.employeeCode', type: 'text' },
    { field: 'employeeName', header: 'workPattern.employee', type: 'text' },
    { field: 'shiftMasterName', header: 'workPattern.shift', type: 'text' },
    { field: 'workDaysLabel', header: 'workPattern.workDays', type: 'text' },
    { field: 'effectiveFrom', header: 'workPattern.effectiveFrom', type: 'date' },
    { field: 'effectiveTo', header: 'workPattern.effectiveTo', type: 'date' },
    { field: 'isActive', header: 'workPattern.isActive', type: 'boolean' },
  ];

  rowActions: RowAction[] = [
    {
      key: 'edit',
      icon: 'edit',
      tooltip: 'workPattern.edit',
      severity: 'info',
      onClick: (row: EmployeeWorkPattern) => this.openEdit(row),
    },
    {
      key: 'deactivate',
      icon: 'stop',
      tooltip: 'workPattern.deactivate',
      severity: 'danger',
      visible: (row: EmployeeWorkPattern) => !!row.isActive,
      onClick: (row: EmployeeWorkPattern) => this.deactivate(row),
    },
  ];

  constructor(
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly modal: NzModalService,
  ) {
    const today = new Date();
    this.upsertForm = this.fb.group({
      employeeId: [null, Validators.required],
      shiftMasterId: [null, Validators.required],
      workOnMonday: [true],
      workOnTuesday: [true],
      workOnWednesday: [true],
      workOnThursday: [true],
      workOnFriday: [true],
      workOnSaturday: [false],
      workOnSunday: [false],
      effectiveFrom: [today, Validators.required],
      effectiveTo: [null],
      note: [null],
      isActive: [true],
    });

    this.bulkForm = this.fb.group({
      employeeIds: [[], Validators.required],
      shiftMasterId: [null, Validators.required],
      workOnMonday: [true],
      workOnTuesday: [true],
      workOnWednesday: [true],
      workOnThursday: [true],
      workOnFriday: [true],
      workOnSaturday: [false],
      workOnSunday: [false],
      effectiveFrom: [today, Validators.required],
      effectiveTo: [null],
      closeOverlapping: [true],
      note: [null],
    });
  }

  ngOnInit(): void {
    this.loadSelectBoxes();
    this.loadData();
  }

  loadSelectBoxes(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (res) => {
          this.employeeOptions = (res || []).map((e) => ({
            label: e.code ? `${e.code} - ${e.name}` : e.name,
            value: e.id,
          }));
          const field = this.filterFields.find((f) => f.key === 'employeeId');
          if (field) field.options = this.employeeOptions;
          this.cdr.markForCheck();
        },
      });

    this.apiService
      .post<ShiftMasterSelectBoxDto[]>(this.apiService.SHIFT_MASTER.SELECT_BOX, {})
      .subscribe({
        next: (res) => {
          this.shiftOptions = (res || []).map((s) => ({
            label: s.code ? `${s.code} - ${s.name}` : s.name,
            value: s.id,
          }));
          const field = this.filterFields.find((f) => f.key === 'shiftMasterId');
          if (field) field.options = this.shiftOptions;
          this.cdr.markForCheck();
        },
      });
  }

  loadData(): void {
    this.loading = true;
    const payload = {
      pageIndex: this.pagination.current,
      pageSize: this.pagination.pageSize,
      employeeId: this.filters['employeeId'] || null,
      shiftMasterId: this.filters['shiftMasterId'] || null,
      isActive: this.filters['isActive'] ?? null,
    };

    this.apiService
      .post<PagedResult<EmployeeWorkPattern>>(
        this.apiService.EMPLOYEE_WORK_PATTERN.PAGINATION,
        payload,
      )
      .subscribe({
        next: (res) => {
          this.data = res?.items || [];
          this.pagination = {
            ...this.pagination,
            total: res?.totalCount || 0,
            current: res?.pageIndex || this.pagination.current,
            pageSize: res?.pageSize || this.pagination.pageSize,
          };
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

  onFiltersChange(filters: Record<string, any>): void {
    this.filters = { ...filters };
  }

  onFilterClear(): void {
    this.filters = { employeeId: null, shiftMasterId: null, isActive: true };
    this.pagination = { ...this.pagination, current: 1 };
    this.loadData();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination = {
      ...this.pagination,
      current: event.page,
      pageSize: event.pageSize,
    };
    this.loadData();
  }

  onSortChange(_event: unknown): void {
    this.loadData();
  }

  openCreate(): void {
    this.editingId = null;
    const today = new Date();
    this.upsertForm.reset({
      employeeId: null,
      shiftMasterId: null,
      workOnMonday: true,
      workOnTuesday: true,
      workOnWednesday: true,
      workOnThursday: true,
      workOnFriday: true,
      workOnSaturday: false,
      workOnSunday: false,
      effectiveFrom: today,
      effectiveTo: null,
      note: null,
      isActive: true,
    });
    this.upsertVisible = true;
  }

  openEdit(row: EmployeeWorkPattern): void {
    this.editingId = row.id;
    this.upsertForm.reset({
      employeeId: row.employeeId,
      shiftMasterId: row.shiftMasterId,
      workOnMonday: row.workOnMonday,
      workOnTuesday: row.workOnTuesday,
      workOnWednesday: row.workOnWednesday,
      workOnThursday: row.workOnThursday,
      workOnFriday: row.workOnFriday,
      workOnSaturday: row.workOnSaturday,
      workOnSunday: row.workOnSunday,
      effectiveFrom: row.effectiveFrom ? new Date(row.effectiveFrom) : new Date(),
      effectiveTo: row.effectiveTo ? new Date(row.effectiveTo) : null,
      note: row.note,
      isActive: row.isActive,
    });
    this.upsertVisible = true;
  }

  openBulk(): void {
    const today = new Date();
    this.bulkForm.reset({
      employeeIds: [],
      shiftMasterId: null,
      workOnMonday: true,
      workOnTuesday: true,
      workOnWednesday: true,
      workOnThursday: true,
      workOnFriday: true,
      workOnSaturday: false,
      workOnSunday: false,
      effectiveFrom: today,
      effectiveTo: null,
      closeOverlapping: true,
      note: null,
    });
    this.bulkVisible = true;
  }

  closeUpsert(): void {
    this.upsertVisible = false;
  }

  closeBulk(): void {
    this.bulkVisible = false;
  }

  private toDateOnly(value: Date | string | null): string | null {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  submitUpsert(): void {
    if (this.upsertForm.invalid) {
      this.upsertForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const v = this.upsertForm.getRawValue();
    const payload = {
      id: this.editingId,
      employeeId: v.employeeId,
      shiftMasterId: v.shiftMasterId,
      patternType: 'FIXED_WEEKLY',
      workOnMonday: !!v.workOnMonday,
      workOnTuesday: !!v.workOnTuesday,
      workOnWednesday: !!v.workOnWednesday,
      workOnThursday: !!v.workOnThursday,
      workOnFriday: !!v.workOnFriday,
      workOnSaturday: !!v.workOnSaturday,
      workOnSunday: !!v.workOnSunday,
      effectiveFrom: this.toDateOnly(v.effectiveFrom),
      effectiveTo: this.toDateOnly(v.effectiveTo),
      note: (v.note || '').trim() || null,
      isActive: v.isActive !== false,
    };

    this.apiService.post<string>(this.apiService.EMPLOYEE_WORK_PATTERN.UPSERT, payload).subscribe({
      next: () => {
        this.message.success(
          this.editingId ? this.i18n.updateSuccess() : this.i18n.createSuccess(),
        );
        this.upsertVisible = false;
        this.submitting = false;
        this.loadData();
      },
      error: (err: any) => {
        this.message.error(this.i18n.genericError(err.error));
        this.submitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  submitBulk(): void {
    if (this.bulkForm.invalid) {
      this.bulkForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const v = this.bulkForm.getRawValue();
    const payload = {
      employeeIds: v.employeeIds || [],
      shiftMasterId: v.shiftMasterId,
      patternType: 'FIXED_WEEKLY',
      workOnMonday: !!v.workOnMonday,
      workOnTuesday: !!v.workOnTuesday,
      workOnWednesday: !!v.workOnWednesday,
      workOnThursday: !!v.workOnThursday,
      workOnFriday: !!v.workOnFriday,
      workOnSaturday: !!v.workOnSaturday,
      workOnSunday: !!v.workOnSunday,
      effectiveFrom: this.toDateOnly(v.effectiveFrom),
      effectiveTo: this.toDateOnly(v.effectiveTo),
      closeOverlapping: v.closeOverlapping !== false,
      note: (v.note || '').trim() || null,
    };

    this.apiService
      .post<{ created: number; closedPrevious: number; skipped: number }>(
        this.apiService.EMPLOYEE_WORK_PATTERN.BULK_UPSERT,
        payload,
      )
      .subscribe({
        next: (res) => {
          this.message.success(
            this.i18n.instant('workPattern.bulkResult', {
              created: res?.created ?? 0,
              closed: res?.closedPrevious ?? 0,
              skipped: res?.skipped ?? 0,
            }),
          );
          this.bulkVisible = false;
          this.submitting = false;
          this.loadData();
        },
        error: (err: any) => {
          this.message.error(this.i18n.genericError(err.error));
          this.submitting = false;
          this.cdr.markForCheck();
        },
      });
  }

  deactivate(row: EmployeeWorkPattern): void {
    this.modal.confirm({
      nzTitle: this.i18n.instant('workPattern.deactivate'),
      nzContent: this.i18n.instant('workPattern.deactivateConfirm'),
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.apiService
            .post<boolean>(this.apiService.EMPLOYEE_WORK_PATTERN.DEACTIVATE, {
              id: row.id,
              effectiveTo: this.toDateOnly(new Date()),
            })
            .subscribe({
              next: () => {
                this.message.success(this.i18n.updateSuccess());
                this.loadData();
                resolve();
              },
              error: (err: any) => {
                this.message.error(this.i18n.genericError(err.error));
                reject(err);
              },
            });
        }),
    });
  }
}
