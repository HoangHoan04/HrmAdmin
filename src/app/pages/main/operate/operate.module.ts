import { ROUTES_CONFIG } from '@/app/core/constants/common/routes.config';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { SharedModule } from '../../../shared/shared.module';
import { AddOrUpdateDayOffConfigComponent } from './leave/day-off-config-manager/add-or-update-day-off-config/add-or-update-day-off-config.component';
import { DayOffConfigManagerComponent } from './leave/day-off-config-manager/day-off-config-manager.component';
import { LeaveAllocationManagerComponent } from './leave/leave-allocation-manager/leave-allocation-manager.component';
import { LeaveBalanceReportComponent } from './leave/leave-balance-report/leave-balance-report.component';
import { LeaveCalendarComponent } from './leave/leave-calendar/leave-calendar.component';
import { LeaveManagerComponent } from './leave/leave-manager/leave-manager.component';
import { AddOrUpdatePublicHolidayComponent } from './leave/public-holiday-manager/add-or-update-public-holiday/add-or-update-public-holiday.component';
import { PublicHolidayManagerComponent } from './leave/public-holiday-manager/public-holiday-manager.component';
import { ShiftManagerComponent } from './shift/shift-manager.component';
import { AddOrUpdateShiftComponent } from './shift/shift-manager/add-or-update-shift/add-or-update-shift.component';
import { ShiftListComponent } from './shift/shift-manager/shift-list.component';
import { AddOrUpdateWorkScheduleComponent } from './shift/work-schedule/add-or-update-work-schedule/add-or-update-work-schedule.component';
import { WorkScheduleManagerComponent } from './shift/work-schedule/work-schedule-manager.component';
import { WorkPatternManagerComponent } from './shift/work-pattern/work-pattern-manager.component';
import { TimekeepingManagerComponent } from './time-attendance/timekeeping-manager/timekeeping-manager.component';
import { AttendanceComplaintManagerComponent } from './time-attendance/attendance-complaint-manager/attendance-complaint-manager.component';
import { OvertimeRequestManagerComponent } from './time-attendance/overtime-request-manager/overtime-request-manager.component';
import { AddOrUpdateTimekeepingStandardComponent } from './time-attendance/timekeeping-standard-manager/add-or-update-timekeeping-standard/add-or-update-timekeeping-standard.component';
import { TimekeepingStandardManagerComponent } from './time-attendance/timekeeping-standard-manager/timekeeping-standard-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'operate-manager/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.DAY_OFF_CONFIG.path,
    ),
    component: DayOffConfigManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.DAY_OFF_CONFIG.children
        .ADD_DAY_OFF_CONFIG.path,
    ),
    component: AddOrUpdateDayOffConfigComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.DAY_OFF_CONFIG.children
          .EDIT_DAY_OFF_CONFIG.path,
      ) + '/:id',
    component: AddOrUpdateDayOffConfigComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.PUBLIC_HOLIDAY.path,
    ),
    component: PublicHolidayManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.PUBLIC_HOLIDAY.children
        .ADD_PUBLIC_HOLIDAY.path,
    ),
    component: AddOrUpdatePublicHolidayComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.PUBLIC_HOLIDAY.children
          .EDIT_PUBLIC_HOLIDAY.path,
      ) + '/:id',
    component: AddOrUpdatePublicHolidayComponent,
  },

  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.TIMEKEEPING_STANDARD.path,
    ),
    component: TimekeepingStandardManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.TIMEKEEPING_STANDARD.children
        .ADD_TIMEKEEPING_STANDARD.path,
    ),
    component: AddOrUpdateTimekeepingStandardComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.TIMEKEEPING_STANDARD
          .children.EDIT_TIMEKEEPING_STANDARD.path,
      ) + '/:id',
    component: AddOrUpdateTimekeepingStandardComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.TIMEKEEPING_MANAGER.path,
    ),
    component: TimekeepingManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.ATTENDANCE_COMPLAINT.path,
    ),
    component: AttendanceComplaintManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.OVERTIME_REQUEST.path,
    ),
    component: OvertimeRequestManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.path),
    component: ShiftManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.children.ADD_SHIFT.path,
    ),
    component: AddOrUpdateShiftComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.children.EDIT_SHIFT.path,
      ) + '/:id',
    component: AddOrUpdateShiftComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.children.ADD_WORK_SCHEDULE.path,
    ),
    component: AddOrUpdateWorkScheduleComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.OPERATE_MANAGER.children.SHIFT_MANAGER.children.EDIT_WORK_SCHEDULE.path,
      ) + '/:id',
    component: AddOrUpdateWorkScheduleComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.LEAVE_LIST.path,
    ),
    component: LeaveManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.LEAVE_ALLOCATION.path,
    ),
    component: LeaveAllocationManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.LEAVE_CALENDAR.path,
    ),
    component: LeaveCalendarComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.LEAVE_MANAGER.children.LEAVE_BALANCE_REPORT.path,
    ),
    component: LeaveBalanceReportComponent,
  },
];

@NgModule({
  declarations: [
    TimekeepingStandardManagerComponent,
    AddOrUpdateTimekeepingStandardComponent,
    TimekeepingManagerComponent,
    AttendanceComplaintManagerComponent,
    OvertimeRequestManagerComponent,
    ShiftManagerComponent,
    ShiftListComponent,
    AddOrUpdateShiftComponent,
    WorkScheduleManagerComponent,
    AddOrUpdateWorkScheduleComponent,
    WorkPatternManagerComponent,
    LeaveManagerComponent,
    LeaveAllocationManagerComponent,
    LeaveCalendarComponent,
    LeaveBalanceReportComponent,
    DayOffConfigManagerComponent,
    AddOrUpdateDayOffConfigComponent,
    PublicHolidayManagerComponent,
    AddOrUpdatePublicHolidayComponent,
  ],
  imports: [SharedModule, NzTabsModule, FullCalendarModule, RouterModule.forChild(routes)],
})
export class OperateModule {}
