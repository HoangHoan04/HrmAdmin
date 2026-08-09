import { ROUTES_CONFIG } from '@/app/core/constants/common/routes.config';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { LeaveManagerComponent } from './time-attendance/leave-manager/leave-manager.component';
import { AddOrUpdateShiftComponent } from './time-attendance/shift-manager/add-or-update-shift/add-or-update-shift.component';
import { AddOrUpdateWorkScheduleComponent } from './time-attendance/shift-manager/add-or-update-work-schedule/add-or-update-work-schedule.component';
import { ShiftListComponent } from './time-attendance/shift-manager/shift-list/shift-list.component';
import { ShiftManagerComponent } from './time-attendance/shift-manager/shift-manager.component';
import { WorkScheduleManagerComponent } from './time-attendance/shift-manager/work-schedule-manager/work-schedule-manager.component';
import { TimekeepingManagerComponent } from './time-attendance/timekeeping-manager/timekeeping-manager.component';
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
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.SHIFT_MANAGER.path,
    ),
    component: ShiftManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.SHIFT_MANAGER.children
        .ADD_SHIFT.path,
    ),
    component: AddOrUpdateShiftComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.SHIFT_MANAGER.children
          .EDIT_SHIFT.path,
      ) + '/:id',
    component: AddOrUpdateShiftComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.SHIFT_MANAGER.children
        .ADD_WORK_SCHEDULE.path,
    ),
    component: AddOrUpdateWorkScheduleComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.SHIFT_MANAGER.children
          .EDIT_WORK_SCHEDULE.path,
      ) + '/:id',
    component: AddOrUpdateWorkScheduleComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.OPERATE_MANAGER.children.TIME_ATTENDANCE.children.LEAVE_MANAGER.path,
    ),
    component: LeaveManagerComponent,
  },
];

@NgModule({
  declarations: [
    TimekeepingStandardManagerComponent,
    AddOrUpdateTimekeepingStandardComponent,
    TimekeepingManagerComponent,
    ShiftManagerComponent,
    ShiftListComponent,
    AddOrUpdateShiftComponent,
    WorkScheduleManagerComponent,
    AddOrUpdateWorkScheduleComponent,
    LeaveManagerComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class OperateModule {}
