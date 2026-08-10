import { ROUTES_CONFIG } from '@/app/core/constants/common';
import {
  BranchSelectBoxDto,
  EmployeeSelectBoxDto,
  ShiftMasterSelectBoxDto,
  WorkSchedule,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
@Component({
  standalone: false,
  selector: 'app-add-or-update-work-schedule',
  templateUrl: './add-or-update-work-schedule.component.html',
  styleUrls: [],
})
export class AddOrUpdateWorkScheduleComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;
  employees: EmployeeSelectBoxDto[] = [];
  shifts: ShiftMasterSelectBoxDto[] = [];
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
    this.loadSelectBoxes();
    if (this.isEdit && this.id) {
      this.loadDetail(this.id);
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      employeeId: [null, [Validators.required]],
      shiftMasterId: [null, [Validators.required]],
      workDate: [null, [Validators.required]],
      branchId: [null],
      note: [''],
    });
  }

  loadSelectBoxes(): void {
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({ next: (res) => (this.employees = res) });
    this.apiService
      .post<ShiftMasterSelectBoxDto[]>(this.apiService.SHIFT_MASTER.SELECT_BOX, {})
      .subscribe({ next: (res) => (this.shifts = res) });
    this.apiService
      .post<BranchSelectBoxDto[]>(this.apiService.BRANCH.SELECT_BOX, {})
      .subscribe({ next: (res) => (this.branches = res) });
  }

  loadDetail(id: string): void {
    this.loading = true;
    this.apiService.post<WorkSchedule>(this.apiService.WORK_SCHEDULE.DETAIL, { id }).subscribe({
      next: (item) => {
        this.validateForm.patchValue({
          employeeId: item.employeeId,
          shiftMasterId: item.shiftMasterId,
          workDate: item.workDate ? new Date(item.workDate) : null,
          branchId: item.branchId,
          note: item.note,
        });
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error(this.i18n.loadDetailFailed(err.error));
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.path], {
      queryParams: { tab: 'work-schedule' },
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
      employeeId: value.employeeId,
      shiftMasterId: value.shiftMasterId,
      workDate: this.toDateOnly(value.workDate),
      branchId: value.branchId || null,
      note: value.note || null,
    };

    const endpoint = this.isEdit
      ? this.apiService.WORK_SCHEDULE.UPDATE
      : this.apiService.WORK_SCHEDULE.CREATE;
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

  private toDateOnly(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
