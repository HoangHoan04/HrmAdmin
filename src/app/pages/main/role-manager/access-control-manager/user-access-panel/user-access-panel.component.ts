import {
  EmployeeSelectBoxDto,
  RoleSelectBoxDto,
  SetEmployeeRolesRequest,
  UserRoleDto,
} from '@/app/core/models';
import { ApiService, I18nMessageService } from '@/app/core/services';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-user-access-panel',
  templateUrl: './user-access-panel.component.html',
  styleUrls: ['../access-control-manager.component.scss'],
})
export class UserAccessPanelComponent implements OnInit {
  employees: EmployeeSelectBoxDto[] = [];
  roleOptions: RoleSelectBoxDto[] = [];
  selectedEmployeeId: string | null = null;
  selectedEmployee: EmployeeSelectBoxDto | null = null;
  selectedRoleIds: string[] = [];
  detailLoading = false;
  saving = false;
  employeesLoading = false;

  constructor(
    private readonly message: NzMessageService,
    private readonly i18n: I18nMessageService,
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadActiveRoles();
  }

  onEmployeeSelected(employeeId: string | null): void {
    this.selectedEmployeeId = employeeId;
    this.selectedEmployee = this.employees.find((e) => e.id === employeeId) || null;
    this.selectedRoleIds = [];
    if (!employeeId) {
      this.cdr.markForCheck();
      return;
    }

    this.detailLoading = true;
    this.cdr.markForCheck();

    this.apiService
      .post<UserRoleDto[]>(this.apiService.USER_ROLE.BY_EMPLOYEE, { employeeId })
      .subscribe({
        next: (roles) => {
          this.selectedRoleIds = (roles || []).map((r) => r.roleId);
          this.detailLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.detailLoading = false;
          this.selectedRoleIds = [];
          this.message.error(this.i18n.genericError(err.error));
          this.cdr.markForCheck();
        },
      });
  }

  isRoleChecked(roleId: string): boolean {
    return this.selectedRoleIds.includes(roleId);
  }

  onRoleCheck(roleId: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedRoleIds.includes(roleId)) {
        this.selectedRoleIds = [...this.selectedRoleIds, roleId];
      }
    } else {
      this.selectedRoleIds = this.selectedRoleIds.filter((id) => id !== roleId);
    }
  }

  saveEmployeeRoles(): void {
    if (!this.selectedEmployeeId) return;

    const payload: SetEmployeeRolesRequest = {
      employeeId: this.selectedEmployeeId,
      roleIds: this.selectedRoleIds || [],
    };

    this.saving = true;
    this.apiService.post<boolean>(this.apiService.USER_ROLE.SET_BY_EMPLOYEE, payload).subscribe({
      next: (success) => {
        this.saving = false;
        if (success === false) {
          this.message.error(this.i18n.genericError());
          this.cdr.markForCheck();
          return;
        }
        this.message.success(this.i18n.saveSuccess());
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.saving = false;
        this.message.error(this.i18n.genericError(err.error));
        this.cdr.markForCheck();
      },
    });
  }

  private loadEmployees(): void {
    this.employeesLoading = true;
    this.apiService
      .post<EmployeeSelectBoxDto[]>(this.apiService.EMPLOYEE.SELECT_BOX, {})
      .subscribe({
        next: (res) => {
          this.employees = res || [];
          this.employeesLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.employees = [];
          this.employeesLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private loadActiveRoles(): void {
    this.apiService
      .post<RoleSelectBoxDto[]>(this.apiService.ROLE.SELECT_BOX, { isActive: true })
      .subscribe({
        next: (res) => {
          this.roleOptions = res || [];
          this.cdr.markForCheck();
        },
        error: () => {
          this.roleOptions = [];
        },
      });
  }
}
