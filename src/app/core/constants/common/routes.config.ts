import { PERMISSION_CODES } from './permission-codes';

export interface RouteConfig {
  key: string;
  label: string;
  translationKey: string;
  path: string;
  icon?: string;
  isShow?: boolean;
  permission?: string;
  children?: Record<string, RouteConfig>;
}

export interface SidebarMenuItem {
  key: string;
  label: string;
  translationKey: string;
  path: string;
  icon?: string;
  isShow?: boolean;
  permission?: string;
  children?: SidebarMenuItem[];
}

export const ROUTES_CONFIG = {
  HOME: {
    key: 'HOME',
    label: 'routes.home',
    translationKey: 'routes.home',
    path: '/',
    icon: 'home',
    permission: PERMISSION_CODES.HOME_VIEW,
  },

  ORGANIZATION: {
    key: 'ORGANIZATION',
    label: 'routes.organization',
    translationKey: 'routes.organization',
    icon: 'global',
    path: '/organization',
    permission: PERMISSION_CODES.ORG_VIEW,
    children: {
      ORG_CHART: {
        key: 'ORG_CHART',
        label: 'routes.orgChart',
        translationKey: 'routes.orgChart',
        icon: 'apartment',
        path: '/organization/org-chart',
        permission: PERMISSION_CODES.ORG_VIEW,
      },
      COMPANY_MANAGER: {
        key: 'COMPANY_MANAGER',
        label: 'routes.companyList',
        translationKey: 'routes.companyList',
        icon: 'bank',
        path: '/organization/company',
        permission: PERMISSION_CODES.ORG_COMPANY_VIEW,
        children: {
          ADD_COMPANY: {
            key: 'ADD_COMPANY',
            label: 'routes.addCompany',
            translationKey: 'routes.addCompany',
            icon: 'plus-circle',
            path: '/organization/company/add',
            isShow: false,
            permission: PERMISSION_CODES.ORG_COMPANY_CREATE,
          },
          EDIT_COMPANY: {
            key: 'EDIT_COMPANY',
            label: 'routes.editCompany',
            translationKey: 'routes.editCompany',
            icon: 'plus',
            path: '/organization/company/edit',
            isShow: false,
            permission: PERMISSION_CODES.ORG_COMPANY_UPDATE,
          },
          DETAIL_COMPANY: {
            key: 'DETAIL_COMPANY',
            label: 'routes.detailCompany',
            translationKey: 'routes.detailCompany',
            icon: 'eye',
            path: '/organization/company/detail',
            permission: PERMISSION_CODES.ORG_COMPANY_VIEW,
            isShow: false,
          },
        },
      },
      BRANCH_MANAGER: {
        key: 'BRANCH_MANAGER',
        label: 'routes.branchList',
        translationKey: 'routes.branchList',
        icon: 'apartment',
        path: '/organization/branch',
        permission: PERMISSION_CODES.ORG_BRANCH_VIEW,
        children: {
          ADD_BRANCH: {
            key: 'ADD_BRANCH',
            label: 'routes.addBranch',
            translationKey: 'routes.addBranch',
            icon: 'plus-circle',
            path: '/organization/branch/add',
            isShow: false,
            permission: PERMISSION_CODES.ORG_BRANCH_CREATE,
          },
          EDIT_BRANCH: {
            key: 'EDIT_BRANCH',
            label: 'routes.editBranch',
            translationKey: 'routes.editBranch',
            icon: 'edit',
            path: '/organization/branch/edit',
            isShow: false,
            permission: PERMISSION_CODES.ORG_BRANCH_UPDATE,
          },
          DETAIL_BRANCH: {
            key: 'DETAIL_BRANCH',
            label: 'routes.detailBranch',
            translationKey: 'routes.detailBranch',
            icon: 'eye',
            path: '/organization/branch/detail',
            permission: PERMISSION_CODES.ORG_BRANCH_VIEW,
            isShow: false,
          },
        },
      },
      DEPARTMENT_MANAGER: {
        key: 'DEPARTMENT_MANAGER',
        label: 'routes.departmentList',
        translationKey: 'routes.departmentList',
        icon: 'cluster',
        path: '/organization/department',
        permission: PERMISSION_CODES.ORG_DEPARTMENT_VIEW,
        children: {
          ADD_DEPARTMENT: {
            key: 'ADD_DEPARTMENT',
            label: 'routes.addDepartment',
            translationKey: 'routes.addDepartment',
            icon: 'plus-circle',
            path: '/organization/department/add',
            isShow: false,
            permission: PERMISSION_CODES.ORG_DEPARTMENT_CREATE,
          },
          EDIT_DEPARTMENT: {
            key: 'EDIT_DEPARTMENT',
            label: 'routes.editDepartment',
            translationKey: 'routes.editDepartment',
            icon: 'edit',
            path: '/organization/department/edit',
            isShow: false,
            permission: PERMISSION_CODES.ORG_DEPARTMENT_UPDATE,
          },
          DETAIL_DEPARTMENT: {
            key: 'DETAIL_DEPARTMENT',
            label: 'routes.detailDepartment',
            translationKey: 'routes.detailDepartment',
            icon: 'eye',
            path: '/organization/department/detail',
            permission: PERMISSION_CODES.ORG_DEPARTMENT_VIEW,
            isShow: false,
          },
        },
      },
      PART_MANAGER: {
        key: 'PART_MANAGER',
        label: 'routes.partList',
        translationKey: 'routes.partList',
        icon: 'database',
        path: '/organization/part',
        permission: PERMISSION_CODES.ORG_PART_VIEW,
        children: {
          ADD_PART: {
            key: 'ADD_PART',
            label: 'routes.addPart',
            translationKey: 'routes.addPart',
            icon: 'plus-circle',
            path: '/organization/part/add',
            isShow: false,
            permission: PERMISSION_CODES.ORG_PART_CREATE,
          },
          EDIT_PART: {
            key: 'EDIT_PART',
            label: 'routes.editPart',
            translationKey: 'routes.editPart',
            icon: 'edit',
            path: '/organization/part/edit',
            isShow: false,
            permission: PERMISSION_CODES.ORG_PART_UPDATE,
          },
          DETAIL_PART: {
            key: 'DETAIL_PART',
            label: 'routes.detailPart',
            translationKey: 'routes.detailPart',
            icon: 'eye',
            path: '/organization/part/detail',
            permission: PERMISSION_CODES.ORG_PART_VIEW,
            isShow: false,
          },
          ADD_PART_MASTER: {
            key: 'ADD_PART_MASTER',
            label: 'routes.addPartMaster',
            translationKey: 'routes.addPartMaster',
            icon: 'plus-circle',
            path: '/organization/part-master/add',
            isShow: false,
            permission: PERMISSION_CODES.ORG_PART_MASTER_CREATE,
          },
          EDIT_PART_MASTER: {
            key: 'EDIT_PART_MASTER',
            label: 'routes.editPartMaster',
            translationKey: 'routes.editPartMaster',
            icon: 'edit',
            path: '/organization/part-master/edit',
            isShow: false,
            permission: PERMISSION_CODES.ORG_PART_MASTER_UPDATE,
          },
          DETAIL_PART_MASTER: {
            key: 'DETAIL_PART_MASTER',
            label: 'routes.detailPartMaster',
            translationKey: 'routes.detailPartMaster',
            icon: 'eye',
            path: '/organization/part-master/detail',
            permission: PERMISSION_CODES.ORG_PART_MASTER_VIEW,
            isShow: false,
          },
        },
      },
      POSITION_MANAGER: {
        key: 'POSITION_MANAGER',
        label: 'routes.positionList',
        translationKey: 'routes.positionList',
        icon: 'team',
        path: '/organization/position',
        permission: PERMISSION_CODES.ORG_POSITION_VIEW,
        children: {
          ADD_POSITION: {
            key: 'ADD_POSITION',
            label: 'routes.addPosition',
            translationKey: 'routes.addPosition',
            icon: 'plus-circle',
            path: '/organization/position/add',
            isShow: false,
            permission: PERMISSION_CODES.ORG_POSITION_CREATE,
          },
          EDIT_POSITION: {
            key: 'EDIT_POSITION',
            label: 'routes.editPosition',
            translationKey: 'routes.editPosition',
            icon: 'edit',
            path: '/organization/position/edit',
            isShow: false,
            permission: PERMISSION_CODES.ORG_POSITION_UPDATE,
          },
          DETAIL_POSITION: {
            key: 'DETAIL_POSITION',
            label: 'routes.detailPosition',
            translationKey: 'routes.detailPosition',
            icon: 'eye',
            path: '/organization/position/detail',
            permission: PERMISSION_CODES.ORG_POSITION_VIEW,
            isShow: false,
          },
          ADD_POSITION_MASTER: {
            key: 'ADD_POSITION_MASTER',
            label: 'routes.addPositionMaster',
            translationKey: 'routes.addPositionMaster',
            icon: 'plus-circle',
            path: '/organization/position-master/add',
            isShow: false,
            permission: PERMISSION_CODES.ORG_POSITION_MASTER_CREATE,
          },
          EDIT_POSITION_MASTER: {
            key: 'EDIT_POSITION_MASTER',
            label: 'routes.editPositionMaster',
            translationKey: 'routes.editPositionMaster',
            icon: 'edit',
            path: '/organization/position-master/edit',
            isShow: false,
            permission: PERMISSION_CODES.ORG_POSITION_MASTER_UPDATE,
          },
          DETAIL_POSITION_MASTER: {
            key: 'DETAIL_POSITION_MASTER',
            label: 'routes.detailPositionMaster',
            translationKey: 'routes.detailPositionMaster',
            icon: 'eye',
            path: '/organization/position-master/detail',
            permission: PERMISSION_CODES.ORG_POSITION_MASTER_VIEW,
            isShow: false,
          },
        },
      },
    },
  },

  HUMAN_RESOURCE: {
    key: 'HUMAN_RESOURCE',
    label: 'routes.humanResource',
    translationKey: 'routes.humanResource',
    icon: 'team',
    path: '/human-resource',
    permission: PERMISSION_CODES.HR_VIEW,
    children: {
      EMPLOYEE_MANAGER: {
        key: 'EMPLOYEE_MANAGER',
        label: 'routes.employeeList',
        translationKey: 'routes.employeeList',
        icon: 'user',
        path: '/human-resource/employee',
        permission: PERMISSION_CODES.HR_EMPLOYEE_VIEW,
        children: {
          ADD_EMPLOYEE: {
            key: 'ADD_EMPLOYEE',
            label: 'routes.addEmployee',
            translationKey: 'routes.addEmployee',
            icon: 'plus-circle',
            path: '/human-resource/employee/add',
            isShow: false,
            permission: PERMISSION_CODES.HR_EMPLOYEE_CREATE,
          },
          EDIT_EMPLOYEE: {
            key: 'EDIT_EMPLOYEE',
            label: 'routes.editEmployee',
            translationKey: 'routes.editEmployee',
            icon: 'edit',
            path: '/human-resource/employee/edit',
            isShow: false,
            permission: PERMISSION_CODES.HR_EMPLOYEE_UPDATE,
          },
          DETAIL_EMPLOYEE: {
            key: 'DETAIL_EMPLOYEE',
            label: 'routes.detailEmployee',
            translationKey: 'routes.detailEmployee',
            icon: 'eye',
            path: '/human-resource/employee/detail',
            permission: PERMISSION_CODES.HR_EMPLOYEE_VIEW,
            isShow: false,
          },
        },
      },
      CONTRACT_MANAGER: {
        key: 'CONTRACT_MANAGER',
        label: 'routes.contractManager',
        translationKey: 'routes.contractManager',
        icon: 'file-text',
        path: '/human-resource/contract',
        permission: PERMISSION_CODES.HR_CONTRACT_VIEW,
        children: {
          CONTRACT_TYPE: {
            key: 'CONTRACT_TYPE',
            label: 'routes.contractType',
            translationKey: 'routes.contractType',
            icon: 'tags',
            path: '/human-resource/contract/contract-type',
            permission: PERMISSION_CODES.HR_CONTRACT_TYPE_VIEW,
            children: {
              ADD_CONTRACT_TYPE: {
                key: 'ADD_CONTRACT_TYPE',
                label: 'routes.addContractType',
                translationKey: 'routes.addContractType',
                icon: 'plus-circle',
                path: '/human-resource/contract/contract-type/add',
                isShow: false,
                permission: PERMISSION_CODES.HR_CONTRACT_TYPE_CREATE,
              },
              EDIT_CONTRACT_TYPE: {
                key: 'EDIT_CONTRACT_TYPE',
                label: 'routes.editContractType',
                translationKey: 'routes.editContractType',
                icon: 'edit',
                path: '/human-resource/contract/contract-type/edit',
                isShow: false,
                permission: PERMISSION_CODES.HR_CONTRACT_TYPE_UPDATE,
              },
            },
          },
          CONTRACT_LIST: {
            key: 'CONTRACT_LIST',
            label: 'routes.contractList',
            translationKey: 'routes.contractList',
            icon: 'file-text',
            path: '/human-resource/contract/list',
            permission: PERMISSION_CODES.HR_CONTRACT_VIEW,
            children: {
              ADD_CONTRACT: {
                key: 'ADD_CONTRACT',
                label: 'routes.addContract',
                translationKey: 'routes.addContract',
                icon: 'plus-circle',
                path: '/human-resource/contract/list/add',
                isShow: false,
                permission: PERMISSION_CODES.HR_CONTRACT_CREATE,
              },
              EDIT_CONTRACT: {
                key: 'EDIT_CONTRACT',
                label: 'routes.editContract',
                translationKey: 'routes.editContract',
                icon: 'edit',
                path: '/human-resource/contract/list/edit',
                isShow: false,
                permission: PERMISSION_CODES.HR_CONTRACT_UPDATE,
              },
              DETAIL_CONTRACT: {
                key: 'DETAIL_CONTRACT',
                label: 'routes.detailContract',
                translationKey: 'routes.detailContract',
                icon: 'eye',
                path: '/human-resource/contract/list/detail',
                isShow: false,
                permission: PERMISSION_CODES.HR_CONTRACT_VIEW,
              },
            },
          },
          REVIEW_RENEWAL: {
            key: 'REVIEW_RENEWAL',
            label: 'routes.reviewRenewal',
            translationKey: 'routes.reviewRenewal',
            icon: 'audit',
            path: '/human-resource/contract/review-renewal',
            permission: PERMISSION_CODES.HR_REVIEW_RENEWAL_VIEW,
            children: {
              ADD_REVIEW_RENEWAL: {
                key: 'ADD_REVIEW_RENEWAL',
                label: 'routes.addReviewRenewal',
                translationKey: 'routes.addReviewRenewal',
                icon: 'plus-circle',
                path: '/human-resource/contract/review-renewal/add',
                isShow: false,
                permission: PERMISSION_CODES.HR_REVIEW_RENEWAL_CREATE,
              },
              EDIT_REVIEW_RENEWAL: {
                key: 'EDIT_REVIEW_RENEWAL',
                label: 'routes.editReviewRenewal',
                translationKey: 'routes.editReviewRenewal',
                icon: 'edit',
                path: '/human-resource/contract/review-renewal/edit',
                isShow: false,
                permission: PERMISSION_CODES.HR_REVIEW_RENEWAL_UPDATE,
              },
            },
          },
        },
      },
      TRANSFER_MANAGER: {
        key: 'TRANSFER_MANAGER',
        label: 'routes.transferList',
        translationKey: 'routes.transferList',
        icon: 'swap',
        path: '/human-resource/transfer',
        permission: PERMISSION_CODES.HR_TRANSFER_VIEW,
        children: {
          ADD_TRANSFER: {
            key: 'ADD_TRANSFER',
            label: 'routes.addTransfer',
            translationKey: 'routes.addTransfer',
            icon: 'plus-circle',
            path: '/human-resource/transfer/add',
            isShow: false,
            permission: PERMISSION_CODES.HR_TRANSFER_CREATE,
          },
          EDIT_TRANSFER: {
            key: 'EDIT_TRANSFER',
            label: 'routes.editTransfer',
            translationKey: 'routes.editTransfer',
            icon: 'edit',
            path: '/human-resource/transfer/edit',
            isShow: false,
            permission: PERMISSION_CODES.HR_TRANSFER_UPDATE,
          },
          DETAIL_TRANSFER: {
            key: 'DETAIL_TRANSFER',
            label: 'routes.detailTransfer',
            translationKey: 'routes.detailTransfer',
            icon: 'eye',
            path: '/human-resource/transfer/detail',
            isShow: false,
            permission: PERMISSION_CODES.HR_TRANSFER_VIEW,
          },
        },
      },
    },
  },

  OPERATE_MANAGER: {
    key: 'OPERATE_MANAGER',
    label: 'routes.operate',
    translationKey: 'routes.operate',
    icon: 'control',
    path: '/operate-manager',
    permission: PERMISSION_CODES.OPERATE_VIEW,
    children: {
      TIME_ATTENDANCE: {
        key: 'TIME_ATTENDANCE',
        label: 'routes.timeAttendance',
        translationKey: 'routes.timeAttendance',
        icon: 'clock-circle',
        path: '/operate-manager/time-attendance',
        permission: PERMISSION_CODES.OPERATE_VIEW,
        children: {
          TIMEKEEPING_STANDARD: {
            key: 'TIMEKEEPING_STANDARD',
            label: 'routes.timekeepingStandard',
            translationKey: 'routes.timekeepingStandard',
            path: '/operate-manager/time-attendance/timekeeping-standard',
            permission: PERMISSION_CODES.OPERATE_TIMEKEEPING_STANDARD_VIEW,
            children: {
              ADD_TIMEKEEPING_STANDARD: {
                key: 'ADD_TIMEKEEPING_STANDARD',
                label: 'routes.addTimekeepingStandard',
                translationKey: 'routes.addTimekeepingStandard',
                icon: 'plus-circle',
                path: '/operate-manager/time-attendance/timekeeping-standard/add',
                permission: PERMISSION_CODES.OPERATE_TIMEKEEPING_STANDARD_CREATE,
                isShow: false,
              },
              EDIT_TIMEKEEPING_STANDARD: {
                key: 'EDIT_TIMEKEEPING_STANDARD',
                label: 'routes.editTimekeepingStandard',
                translationKey: 'routes.editTimekeepingStandard',
                icon: 'edit',
                path: '/operate-manager/time-attendance/timekeeping-standard/edit',
                permission: PERMISSION_CODES.OPERATE_TIMEKEEPING_STANDARD_UPDATE,
                isShow: false,
              },
              DETAIL_TIMEKEEPING_STANDARD: {
                key: 'DETAIL_TIMEKEEPING_STANDARD',
                label: 'routes.detailTimekeepingStandard',
                translationKey: 'routes.detailTimekeepingStandard',
                icon: 'eye',
                path: '/operate-manager/time-attendance/timekeeping-standard/detail',
                permission: PERMISSION_CODES.OPERATE_TIMEKEEPING_STANDARD_VIEW,
                isShow: false,
              },
            },
          },
          TIMEKEEPING_MANAGER: {
            key: 'TIMEKEEPING_MANAGER',
            label: 'routes.timekeepingList',
            translationKey: 'routes.timekeepingList',
            path: '/operate-manager/time-attendance/timekeeping',
            permission: PERMISSION_CODES.OPERATE_TIMEKEEPING_VIEW,
            children: {
              DETAIL_TIMEKEEPING: {
                key: 'DETAIL_TIMEKEEPING',
                label: 'routes.detailTimekeeping',
                translationKey: 'routes.detailTimekeeping',
                icon: 'eye',
                path: '/operate-manager/time-attendance/timekeeping/detail',
                permission: PERMISSION_CODES.OPERATE_TIMEKEEPING_VIEW,
                isShow: false,
              },
            },
          },
          PUNCH_IMPORT: {
            key: 'PUNCH_IMPORT',
            label: 'routes.punchImport',
            translationKey: 'routes.punchImport',
            path: '/integrations/punch-import',
            permission: PERMISSION_CODES.OPERATE_TIMEKEEPING_MANAGE,
          },
          ATTENDANCE_COMPLAINT: {
            key: 'ATTENDANCE_COMPLAINT',
            label: 'routes.attendanceComplaint',
            translationKey: 'routes.attendanceComplaint',
            path: '/operate-manager/time-attendance/attendance-complaint',
            permission: PERMISSION_CODES.OPERATE_ATTENDANCE_COMPLAINT_VIEW,
          },
          OVERTIME_REQUEST: {
            key: 'OVERTIME_REQUEST',
            label: 'routes.overtimeRequest',
            translationKey: 'routes.overtimeRequest',
            path: '/operate-manager/time-attendance/overtime-request',
            permission: PERMISSION_CODES.OPERATE_OVERTIME_VIEW,
          },
        },
      },

      LEAVE_MANAGER: {
        key: 'LEAVE_MANAGER',
        label: 'routes.leaveManager',
        translationKey: 'routes.leaveManager',
        icon: 'file-done',
        path: '/operate-manager/leave',
        permission: PERMISSION_CODES.OPERATE_LEAVE_VIEW,
        children: {
          DAY_OFF_CONFIG: {
            key: 'DAY_OFF_CONFIG',
            label: 'routes.dayOffConfig',
            translationKey: 'routes.dayOffConfig',
            path: '/operate-manager/time-attendance/day-off-config',
            permission: PERMISSION_CODES.OPERATE_DAY_OFF_CONFIG_VIEW,
            children: {
              ADD_DAY_OFF_CONFIG: {
                key: 'ADD_DAY_OFF_CONFIG',
                label: 'routes.addDayOffConfig',
                translationKey: 'routes.addDayOffConfig',
                icon: 'plus-circle',
                path: '/operate-manager/time-attendance/day-off-config/add',
                permission: PERMISSION_CODES.OPERATE_DAY_OFF_CONFIG_CREATE,
                isShow: false,
              },
              EDIT_DAY_OFF_CONFIG: {
                key: 'EDIT_DAY_OFF_CONFIG',
                label: 'routes.editDayOffConfig',
                translationKey: 'routes.editDayOffConfig',
                icon: 'edit',
                path: '/operate-manager/time-attendance/day-off-config/edit',
                permission: PERMISSION_CODES.OPERATE_DAY_OFF_CONFIG_UPDATE,
                isShow: false,
              },
              DETAIL_DAY_OFF_CONFIG: {
                key: 'DETAIL_DAY_OFF_CONFIG',
                label: 'routes.detailDayOffConfig',
                translationKey: 'routes.detailDayOffConfig',
                icon: 'eye',
                path: '/operate-manager/time-attendance/day-off-config/detail',
                permission: PERMISSION_CODES.OPERATE_DAY_OFF_CONFIG_VIEW,
                isShow: false,
              },
            },
          },
          PUBLIC_HOLIDAY: {
            key: 'PUBLIC_HOLIDAY',
            label: 'routes.publicHoliday',
            translationKey: 'routes.publicHoliday',
            path: '/operate-manager/time-attendance/public-holiday',
            permission: PERMISSION_CODES.OPERATE_PUBLIC_HOLIDAY_VIEW,
            children: {
              ADD_PUBLIC_HOLIDAY: {
                key: 'ADD_PUBLIC_HOLIDAY',
                label: 'routes.addPublicHoliday',
                translationKey: 'routes.addPublicHoliday',
                icon: 'plus-circle',
                path: '/operate-manager/time-attendance/public-holiday/add',
                permission: PERMISSION_CODES.OPERATE_PUBLIC_HOLIDAY_CREATE,
                isShow: false,
              },
              EDIT_PUBLIC_HOLIDAY: {
                key: 'EDIT_PUBLIC_HOLIDAY',
                label: 'routes.editPublicHoliday',
                translationKey: 'routes.editPublicHoliday',
                icon: 'edit',
                path: '/operate-manager/time-attendance/public-holiday/edit',
                permission: PERMISSION_CODES.OPERATE_PUBLIC_HOLIDAY_UPDATE,
                isShow: false,
              },
              DETAIL_PUBLIC_HOLIDAY: {
                key: 'DETAIL_PUBLIC_HOLIDAY',
                label: 'routes.detailPublicHoliday',
                translationKey: 'routes.detailPublicHoliday',
                icon: 'eye',
                path: '/operate-manager/time-attendance/public-holiday/detail',
                permission: PERMISSION_CODES.OPERATE_PUBLIC_HOLIDAY_VIEW,
                isShow: false,
              },
            },
          },
          LEAVE_LIST: {
            key: 'LEAVE_LIST',
            label: 'routes.leaveRequestList',
            translationKey: 'routes.leaveRequestList',
            path: '/operate-manager/time-attendance/leave',
            permission: PERMISSION_CODES.OPERATE_LEAVE_VIEW,
            children: {
              DETAIL_LEAVE: {
                key: 'DETAIL_LEAVE',
                label: 'routes.detailLeaveRequest',
                translationKey: 'routes.detailLeaveRequest',
                icon: 'eye',
                path: '/operate-manager/time-attendance/leave/detail',
                permission: PERMISSION_CODES.OPERATE_LEAVE_VIEW,
                isShow: false,
              },
            },
          },
          LEAVE_ALLOCATION: {
            key: 'LEAVE_ALLOCATION',
            label: 'routes.leaveAllocation',
            translationKey: 'routes.leaveAllocation',
            path: '/operate-manager/time-attendance/leave-allocation',
            permission: PERMISSION_CODES.OPERATE_LEAVE_ALLOCATION_VIEW,
          },
          LEAVE_CALENDAR: {
            key: 'LEAVE_CALENDAR',
            label: 'routes.leaveCalendar',
            translationKey: 'routes.leaveCalendar',
            path: '/operate-manager/time-attendance/leave-calendar',
            permission: PERMISSION_CODES.OPERATE_LEAVE_VIEW,
          },
          LEAVE_BALANCE_REPORT: {
            key: 'LEAVE_BALANCE_REPORT',
            label: 'routes.leaveBalanceReport',
            translationKey: 'routes.leaveBalanceReport',
            path: '/operate-manager/time-attendance/leave-balance-report',
            permission: PERMISSION_CODES.OPERATE_LEAVE_ALLOCATION_VIEW,
          },
        },
      },

      SHIFT_MANAGER: {
        key: 'SHIFT_MANAGER',
        label: 'routes.shiftList',
        translationKey: 'routes.shiftList',
        icon: 'schedule',
        path: '/operate-manager/time-attendance/shift',
        permission: PERMISSION_CODES.OPERATE_SHIFT_VIEW,
        children: {
          ADD_SHIFT: {
            key: 'ADD_SHIFT',
            label: 'routes.addShift',
            translationKey: 'routes.addShift',
            icon: 'plus-circle',
            path: '/operate-manager/time-attendance/shift/add',
            permission: PERMISSION_CODES.OPERATE_SHIFT_CREATE,
            isShow: false,
          },
          EDIT_SHIFT: {
            key: 'EDIT_SHIFT',
            label: 'routes.editShift',
            translationKey: 'routes.editShift',
            icon: 'edit',
            path: '/operate-manager/time-attendance/shift/edit',
            permission: PERMISSION_CODES.OPERATE_SHIFT_UPDATE,
            isShow: false,
          },
          DETAIL_SHIFT: {
            key: 'DETAIL_SHIFT',
            label: 'routes.detailShift',
            translationKey: 'routes.detailShift',
            icon: 'eye',
            path: '/operate-manager/time-attendance/shift/detail',
            permission: PERMISSION_CODES.OPERATE_SHIFT_VIEW,
            isShow: false,
          },

          ADD_WORK_SCHEDULE: {
            key: 'ADD_WORK_SCHEDULE',
            label: 'routes.addWorkSchedule',
            translationKey: 'routes.addWorkSchedule',
            icon: 'plus-circle',
            path: '/operate-manager/time-attendance/shift/work-schedule/add',
            permission: PERMISSION_CODES.OPERATE_WORK_SCHEDULE_CREATE,
            isShow: false,
          },
          EDIT_WORK_SCHEDULE: {
            key: 'EDIT_WORK_SCHEDULE',
            label: 'routes.editWorkSchedule',
            translationKey: 'routes.editWorkSchedule',
            icon: 'edit',
            path: '/operate-manager/time-attendance/shift/work-schedule/edit',
            permission: PERMISSION_CODES.OPERATE_WORK_SCHEDULE_UPDATE,
            isShow: false,
          },
          WORK_SCHEDULE_DETAIL: {
            key: 'WORK_SCHEDULE_DETAIL',
            label: 'routes.workScheduleDetail',
            translationKey: 'routes.workScheduleDetail',
            icon: 'eye',
            path: '/operate-manager/time-attendance/shift/work-schedule/detail',
            permission: PERMISSION_CODES.OPERATE_WORK_SCHEDULE_VIEW,
            isShow: false,
          },
        },
      },
    },
  },

  PAYROLL: {
    key: 'PAYROLL',
    label: 'routes.payroll',
    translationKey: 'routes.payroll',
    icon: 'dollar',
    path: '/payroll',
    permission: PERMISSION_CODES.PAYROLL_VIEW,
    children: {
      PAYROLL_RUN_MANAGER: {
        key: 'PAYROLL_RUN_MANAGER',
        label: 'routes.payrollRunList',
        translationKey: 'routes.payrollRunList',
        icon: 'account-book',
        path: '/payroll/run',
        permission: PERMISSION_CODES.PAYROLL_SALARY_VIEW,
        children: {
          ADD_SALARY: {
            key: 'ADD_SALARY',
            label: 'routes.addSalary',
            translationKey: 'routes.addSalary',
            icon: 'plus',
            path: '/payroll/run/add',
            permission: PERMISSION_CODES.PAYROLL_SALARY_CREATE,
            isShow: false,
          },
          EDIT_SALARY: {
            key: 'EDIT_SALARY',
            label: 'routes.editSalary',
            translationKey: 'routes.editSalary',
            icon: 'edit',
            path: '/payroll/run/edit',
            permission: PERMISSION_CODES.PAYROLL_SALARY_UPDATE,
            isShow: false,
          },
          DETAIL_SALARY: {
            key: 'DETAIL_SALARY',
            label: 'routes.detailSalary',
            translationKey: 'routes.detailSalary',
            icon: 'eye',
            path: '/payroll/run/detail',
            permission: PERMISSION_CODES.PAYROLL_SALARY_VIEW,
            isShow: false,
          },
        },
      },
      PAYROLL_ALLOWANCE: {
        key: 'PAYROLL_ALLOWANCE',
        label: 'routes.payrollAllowance',
        translationKey: 'routes.payrollAllowance',
        icon: 'gift',
        path: '/payroll/allowance',
        permission: PERMISSION_CODES.PAYROLL_ALLOWANCE_VIEW,
      },
      PAYROLL_ADVANCE: {
        key: 'PAYROLL_ADVANCE',
        label: 'routes.payrollAdvance',
        translationKey: 'routes.payrollAdvance',
        icon: 'wallet',
        path: '/payroll/advance',
        permission: PERMISSION_CODES.PAYROLL_ADVANCE_VIEW,
      },
      PAYROLL_ADJUSTMENT: {
        key: 'PAYROLL_ADJUSTMENT',
        label: 'routes.payrollAdjustment',
        translationKey: 'routes.payrollAdjustment',
        icon: 'swap',
        path: '/payroll/adjustment',
        permission: PERMISSION_CODES.PAYROLL_ADJUSTMENT_VIEW,
      },
      PAYROLL_CONFIG: {
        key: 'PAYROLL_CONFIG',
        label: 'routes.payrollConfig',
        translationKey: 'routes.payrollConfig',
        icon: 'setting',
        path: '/payroll/config',
        permission: PERMISSION_CODES.PAYROLL_CONFIG_VIEW,
        children: {
          ADD_SALARY_CONFIG: {
            key: 'ADD_SALARY_CONFIG',
            label: 'routes.addSalaryConfig',
            translationKey: 'routes.addSalaryConfig',
            icon: 'plus',
            path: '/payroll/config/add',
            permission: PERMISSION_CODES.PAYROLL_CONFIG_CREATE,
            isShow: false,
          },
          EDIT_SALARY_CONFIG: {
            key: 'EDIT_SALARY_CONFIG',
            label: 'routes.editSalaryConfig',
            translationKey: 'routes.editSalaryConfig',
            icon: 'edit',
            path: '/payroll/config/edit',
            permission: PERMISSION_CODES.PAYROLL_CONFIG_UPDATE,
            isShow: false,
          },
        },
      },
    },
  },

  RECRUITMENT: {
    key: 'RECRUITMENT',
    label: 'routes.recruitment',
    translationKey: 'routes.recruitment',
    icon: 'user-add',
    path: '/recruitment',
    permission: PERMISSION_CODES.RECRUITMENT_VIEW,
    children: {
      SETUP: {
        key: 'RECRUITMENT_SETUP',
        label: 'routes.recruitmentSetup',
        translationKey: 'routes.recruitmentSetup',
        icon: 'setting',
        path: '/recruitment/setup',
        permission: PERMISSION_CODES.RECRUITMENT_VIEW,
        children: {
          HEADCOUNT: {
            key: 'HEADCOUNT',
            label: 'routes.headcount',
            translationKey: 'routes.headcount',
            icon: 'team',
            path: '/recruitment/headcount',
            permission: PERMISSION_CODES.RECRUITMENT_HEADCOUNT_VIEW,
          },
          HIRING_SOURCE: {
            key: 'HIRING_SOURCE',
            label: 'routes.hiringSource',
            translationKey: 'routes.hiringSource',
            icon: 'share-alt',
            path: '/recruitment/hiring-source',
            permission: PERMISSION_CODES.RECRUITMENT_SOURCE_VIEW,
            children: {
              ADD_HIRING_SOURCE: {
                key: 'ADD_HIRING_SOURCE',
                label: 'routes.addHiringSource',
                translationKey: 'routes.addHiringSource',
                icon: 'plus-circle',
                path: '/recruitment/hiring-source/add',
                permission: PERMISSION_CODES.RECRUITMENT_SOURCE_MANAGE,
                isShow: false,
              },
              EDIT_HIRING_SOURCE: {
                key: 'EDIT_HIRING_SOURCE',
                label: 'routes.editHiringSource',
                translationKey: 'routes.editHiringSource',
                icon: 'edit',
                path: '/recruitment/hiring-source/edit',
                permission: PERMISSION_CODES.RECRUITMENT_SOURCE_MANAGE,
                isShow: false,
              },
            },
          },
          EVALUATION_CRITERIA: {
            key: 'EVALUATION_CRITERIA',
            label: 'routes.evaluationCriteria',
            translationKey: 'routes.evaluationCriteria',
            icon: 'profile',
            path: '/recruitment/evaluation-criteria',
            permission: PERMISSION_CODES.RECRUITMENT_CRITERIA_VIEW,
            children: {
              ADD_EVALUATION_CRITERIA: {
                key: 'ADD_EVALUATION_CRITERIA',
                label: 'routes.addEvaluationCriteria',
                translationKey: 'routes.addEvaluationCriteria',
                icon: 'plus-circle',
                path: '/recruitment/evaluation-criteria/add',
                permission: PERMISSION_CODES.RECRUITMENT_CRITERIA_MANAGE,
                isShow: false,
              },
              EDIT_EVALUATION_CRITERIA: {
                key: 'EDIT_EVALUATION_CRITERIA',
                label: 'routes.editEvaluationCriteria',
                translationKey: 'routes.editEvaluationCriteria',
                icon: 'edit',
                path: '/recruitment/evaluation-criteria/edit',
                permission: PERMISSION_CODES.RECRUITMENT_CRITERIA_MANAGE,
                isShow: false,
              },
            },
          },
          JOB_DESCRIPTION: {
            key: 'JOB_DESCRIPTION',
            label: 'routes.jobDescription',
            translationKey: 'routes.jobDescription',
            icon: 'file-text',
            path: '/recruitment/job-description',
            permission: PERMISSION_CODES.RECRUITMENT_JD_VIEW,
            children: {
              ADD_JOB_DESCRIPTION: {
                key: 'ADD_JOB_DESCRIPTION',
                label: 'routes.addJobDescription',
                translationKey: 'routes.addJobDescription',
                icon: 'plus-circle',
                path: '/recruitment/job-description/add',
                permission: PERMISSION_CODES.RECRUITMENT_JD_CREATE,
                isShow: false,
              },
              EDIT_JOB_DESCRIPTION: {
                key: 'EDIT_JOB_DESCRIPTION',
                label: 'routes.editJobDescription',
                translationKey: 'routes.editJobDescription',
                icon: 'edit',
                path: '/recruitment/job-description/edit',
                permission: PERMISSION_CODES.RECRUITMENT_JD_UPDATE,
                isShow: false,
              },
              DETAIL_JOB_DESCRIPTION: {
                key: 'DETAIL_JOB_DESCRIPTION',
                label: 'routes.detailJobDescription',
                translationKey: 'routes.detailJobDescription',
                icon: 'eye',
                path: '/recruitment/job-description/detail',
                permission: PERMISSION_CODES.RECRUITMENT_JD_VIEW,
                isShow: false,
              },
            },
          },
        },
      },
      WORKFLOW: {
        key: 'RECRUITMENT_WORKFLOW',
        label: 'routes.recruitmentWorkflow',
        translationKey: 'routes.recruitmentWorkflow',
        icon: 'apartment',
        path: '/recruitment/workflow',
        permission: PERMISSION_CODES.RECRUITMENT_VIEW,
        children: {
          REQUEST: {
            key: 'REQUEST',
            label: 'routes.recruitmentRequest',
            translationKey: 'routes.recruitmentRequest',
            icon: 'form',
            path: '/recruitment/request',
            permission: PERMISSION_CODES.RECRUITMENT_REQUEST_VIEW,
            children: {
              ADD_REQUEST: {
                key: 'ADD_REQUEST',
                label: 'routes.addRecruitmentRequest',
                translationKey: 'routes.addRecruitmentRequest',
                icon: 'plus-circle',
                path: '/recruitment/request/add',
                permission: PERMISSION_CODES.RECRUITMENT_REQUEST_CREATE,
                isShow: false,
              },
              EDIT_REQUEST: {
                key: 'EDIT_REQUEST',
                label: 'routes.editRecruitmentRequest',
                translationKey: 'routes.editRecruitmentRequest',
                icon: 'edit',
                path: '/recruitment/request/edit',
                permission: PERMISSION_CODES.RECRUITMENT_REQUEST_UPDATE,
                isShow: false,
              },
              DETAIL_REQUEST: {
                key: 'DETAIL_REQUEST',
                label: 'routes.detailRecruitmentRequest',
                translationKey: 'routes.detailRecruitmentRequest',
                icon: 'eye',
                path: '/recruitment/request/detail',
                permission: PERMISSION_CODES.RECRUITMENT_REQUEST_VIEW,
                isShow: false,
              },
            },
          },
          HIRING_PLAN: {
            key: 'HIRING_PLAN',
            label: 'routes.hiringPlan',
            translationKey: 'routes.hiringPlan',
            icon: 'project',
            path: '/recruitment/hiring-plan',
            permission: PERMISSION_CODES.RECRUITMENT_PLAN_VIEW,
            children: {
              ADD_HIRING_PLAN: {
                key: 'ADD_HIRING_PLAN',
                label: 'routes.addHiringPlan',
                translationKey: 'routes.addHiringPlan',
                icon: 'plus-circle',
                path: '/recruitment/hiring-plan/add',
                permission: PERMISSION_CODES.RECRUITMENT_PLAN_CREATE,
                isShow: false,
              },
              EDIT_HIRING_PLAN: {
                key: 'EDIT_HIRING_PLAN',
                label: 'routes.editHiringPlan',
                translationKey: 'routes.editHiringPlan',
                icon: 'edit',
                path: '/recruitment/hiring-plan/edit',
                permission: PERMISSION_CODES.RECRUITMENT_PLAN_UPDATE,
                isShow: false,
              },
            },
          },
          PIPELINE: {
            key: 'PIPELINE',
            label: 'routes.recruitmentPipeline',
            translationKey: 'routes.recruitmentPipeline',
            icon: 'solution',
            path: '/recruitment/pipeline',
            permission: PERMISSION_CODES.RECRUITMENT_PIPELINE_VIEW,
          },
          WAITLIST: {
            key: 'WAITLIST',
            label: 'routes.recruitmentWaitlist',
            translationKey: 'routes.recruitmentWaitlist',
            icon: 'schedule',
            path: '/recruitment/waitlist',
            permission: PERMISSION_CODES.RECRUITMENT_PIPELINE_VIEW,
          },
        },
      },
      CANDIDATES: {
        key: 'RECRUITMENT_CANDIDATES',
        label: 'routes.recruitmentCandidates',
        translationKey: 'routes.recruitmentCandidates',
        icon: 'team',
        path: '/recruitment/candidates',
        permission: PERMISSION_CODES.RECRUITMENT_VIEW,
        children: {
          CANDIDATE_LIST: {
            key: 'CANDIDATE_LIST',
            label: 'routes.candidateList',
            translationKey: 'routes.candidateList',
            icon: 'user',
            path: '/recruitment/candidate',
            permission: PERMISSION_CODES.RECRUITMENT_CANDIDATE_VIEW,
            children: {
              ADD_CANDIDATE: {
                key: 'ADD_CANDIDATE',
                label: 'routes.addCandidate',
                translationKey: 'routes.addCandidate',
                icon: 'plus-circle',
                path: '/recruitment/candidate/add',
                permission: PERMISSION_CODES.RECRUITMENT_CANDIDATE_CREATE,
                isShow: false,
              },
              EDIT_CANDIDATE: {
                key: 'EDIT_CANDIDATE',
                label: 'routes.editCandidate',
                translationKey: 'routes.editCandidate',
                icon: 'edit',
                path: '/recruitment/candidate/edit',
                permission: PERMISSION_CODES.RECRUITMENT_CANDIDATE_UPDATE,
                isShow: false,
              },
              DETAIL_CANDIDATE: {
                key: 'DETAIL_CANDIDATE',
                label: 'routes.detailCandidate',
                translationKey: 'routes.detailCandidate',
                icon: 'eye',
                path: '/recruitment/candidate/detail',
                permission: PERMISSION_CODES.RECRUITMENT_CANDIDATE_VIEW,
                isShow: false,
              },
            },
          },
          CANDIDATE_STATUS: {
            key: 'CANDIDATE_STATUS',
            label: 'routes.candidateStatus',
            translationKey: 'routes.candidateStatus',
            icon: 'fund',
            path: '/recruitment/candidate-status',
            permission: PERMISSION_CODES.RECRUITMENT_CANDIDATE_VIEW,
          },
          INTERVIEW_CALENDAR: {
            key: 'INTERVIEW_CALENDAR',
            label: 'routes.interviewCalendar',
            translationKey: 'routes.interviewCalendar',
            icon: 'calendar',
            path: '/recruitment/interview-calendar',
            permission: PERMISSION_CODES.RECRUITMENT_INTERVIEW_VIEW,
          },
        },
      },
    },
  },

  TALENT: {
    key: 'TALENT',
    label: 'routes.talent',
    translationKey: 'routes.talent',
    icon: 'solution',
    path: '/talent',
    children: {
      DISCIPLINE: {
        key: 'DISCIPLINE',
        label: 'routes.discipline',
        translationKey: 'routes.discipline',
        icon: 'warning',
        path: '/discipline',
        permission: PERMISSION_CODES.DISCIPLINE_VIEW,
        children: {
          VIOLATION_TYPE: {
            key: 'VIOLATION_TYPE',
            label: 'routes.violationType',
            translationKey: 'routes.violationType',
            icon: 'tags',
            path: '/discipline/violation-type',
            permission: PERMISSION_CODES.DISCIPLINE_TYPE_VIEW,
            children: {
              ADD_VIOLATION_TYPE: {
                key: 'ADD_VIOLATION_TYPE',
                label: 'routes.addViolationType',
                translationKey: 'routes.addViolationType',
                icon: 'plus-circle',
                path: '/discipline/violation-type/add',
                permission: PERMISSION_CODES.DISCIPLINE_TYPE_MANAGE,
                isShow: false,
              },
              EDIT_VIOLATION_TYPE: {
                key: 'EDIT_VIOLATION_TYPE',
                label: 'routes.editViolationType',
                translationKey: 'routes.editViolationType',
                icon: 'edit',
                path: '/discipline/violation-type/edit',
                permission: PERMISSION_CODES.DISCIPLINE_TYPE_MANAGE,
                isShow: false,
              },
            },
          },
          VIOLATION: {
            key: 'VIOLATION',
            label: 'routes.violationList',
            translationKey: 'routes.violationList',
            icon: 'alert',
            path: '/discipline/violation',
            permission: PERMISSION_CODES.DISCIPLINE_VIOLATION_VIEW,
            children: {
              ADD_VIOLATION: {
                key: 'ADD_VIOLATION',
                label: 'routes.addViolation',
                translationKey: 'routes.addViolation',
                icon: 'plus-circle',
                path: '/discipline/violation/add',
                permission: PERMISSION_CODES.DISCIPLINE_VIOLATION_CREATE,
                isShow: false,
              },
              EDIT_VIOLATION: {
                key: 'EDIT_VIOLATION',
                label: 'routes.editViolation',
                translationKey: 'routes.editViolation',
                icon: 'edit',
                path: '/discipline/violation/edit',
                permission: PERMISSION_CODES.DISCIPLINE_VIOLATION_UPDATE,
                isShow: false,
              },
              DETAIL_VIOLATION: {
                key: 'DETAIL_VIOLATION',
                label: 'routes.detailViolation',
                translationKey: 'routes.detailViolation',
                icon: 'eye',
                path: '/discipline/violation/detail',
                permission: PERMISSION_CODES.DISCIPLINE_VIOLATION_VIEW,
                isShow: false,
              },
            },
          },
        },
      },
      PERFORMANCE: {
        key: 'PERFORMANCE',
        label: 'routes.performance',
        translationKey: 'routes.performance',
        icon: 'rise',
        path: '/performance',
        permission: PERMISSION_CODES.PERFORMANCE_VIEW,
        children: {
          PERFORMANCE_DASHBOARD: {
            key: 'PERFORMANCE_DASHBOARD',
            label: 'routes.performanceDashboard',
            translationKey: 'routes.performanceDashboard',
            icon: 'dashboard',
            path: '/performance/dashboard',
            permission: PERMISSION_CODES.PERFORMANCE_VIEW,
            isShow: true,
          },
          COMPETENCY: {
            key: 'COMPETENCY',
            label: 'routes.competency',
            translationKey: 'routes.competency',
            icon: 'trophy',
            path: '/performance/competency',
            permission: PERMISSION_CODES.PERFORMANCE_COMPETENCY_VIEW,
            children: {
              ADD_COMPETENCY: {
                key: 'ADD_COMPETENCY',
                label: 'routes.addCompetency',
                translationKey: 'routes.addCompetency',
                icon: 'plus-circle',
                path: '/performance/competency/add',
                permission: PERMISSION_CODES.PERFORMANCE_COMPETENCY_MANAGE,
                isShow: false,
              },
              EDIT_COMPETENCY: {
                key: 'EDIT_COMPETENCY',
                label: 'routes.editCompetency',
                translationKey: 'routes.editCompetency',
                icon: 'edit',
                path: '/performance/competency/edit',
                permission: PERMISSION_CODES.PERFORMANCE_COMPETENCY_MANAGE,
                isShow: false,
              },
            },
          },
          REVIEW_CYCLE: {
            key: 'REVIEW_CYCLE',
            label: 'routes.reviewCycle',
            translationKey: 'routes.reviewCycle',
            icon: 'schedule',
            path: '/performance/review-cycle',
            permission: PERMISSION_CODES.PERFORMANCE_CYCLE_VIEW,
            children: {
              ADD_REVIEW_CYCLE: {
                key: 'ADD_REVIEW_CYCLE',
                label: 'routes.addReviewCycle',
                translationKey: 'routes.addReviewCycle',
                icon: 'plus-circle',
                path: '/performance/review-cycle/add',
                permission: PERMISSION_CODES.PERFORMANCE_CYCLE_CREATE,
                isShow: false,
              },
              EDIT_REVIEW_CYCLE: {
                key: 'EDIT_REVIEW_CYCLE',
                label: 'routes.editReviewCycle',
                translationKey: 'routes.editReviewCycle',
                icon: 'edit',
                path: '/performance/review-cycle/edit',
                permission: PERMISSION_CODES.PERFORMANCE_CYCLE_UPDATE,
                isShow: false,
              },
            },
          },
          KPI_GOAL: {
            key: 'KPI_GOAL',
            label: 'routes.kpiGoal',
            translationKey: 'routes.kpiGoal',
            icon: 'aim',
            path: '/performance/kpi-goal',
            permission: PERMISSION_CODES.PERFORMANCE_GOAL_VIEW,
            children: {
              ADD_KPI_GOAL: {
                key: 'ADD_KPI_GOAL',
                label: 'routes.addKpiGoal',
                translationKey: 'routes.addKpiGoal',
                icon: 'plus-circle',
                path: '/performance/kpi-goal/add',
                permission: PERMISSION_CODES.PERFORMANCE_GOAL_MANAGE,
                isShow: false,
              },
              EDIT_KPI_GOAL: {
                key: 'EDIT_KPI_GOAL',
                label: 'routes.editKpiGoal',
                translationKey: 'routes.editKpiGoal',
                icon: 'edit',
                path: '/performance/kpi-goal/edit',
                permission: PERMISSION_CODES.PERFORMANCE_GOAL_MANAGE,
                isShow: false,
              },
            },
          },
          KPI_RESULT: {
            key: 'KPI_RESULT',
            label: 'routes.kpiResult',
            translationKey: 'routes.kpiResult',
            icon: 'line-chart',
            path: '/performance/kpi-result',
            permission: PERMISSION_CODES.PERFORMANCE_RESULT_VIEW,
            children: {
              ADD_KPI_RESULT: {
                key: 'ADD_KPI_RESULT',
                label: 'routes.addKpiResult',
                translationKey: 'routes.addKpiResult',
                icon: 'plus-circle',
                path: '/performance/kpi-result/add',
                permission: PERMISSION_CODES.PERFORMANCE_RESULT_MANAGE,
                isShow: false,
              },
              EDIT_KPI_RESULT: {
                key: 'EDIT_KPI_RESULT',
                label: 'routes.editKpiResult',
                translationKey: 'routes.editKpiResult',
                icon: 'edit',
                path: '/performance/kpi-result/edit',
                permission: PERMISSION_CODES.PERFORMANCE_RESULT_MANAGE,
                isShow: false,
              },
            },
          },
          PERFORMANCE_360: {
            key: 'PERFORMANCE_360',
            label: 'routes.performance360',
            translationKey: 'routes.performance360',
            icon: 'radar-chart',
            path: '/performance/review-360',
            permission: PERMISSION_CODES.PERFORMANCE_360_VIEW,
            children: {
              ADD_PERFORMANCE_360: {
                key: 'ADD_PERFORMANCE_360',
                label: 'routes.addPerformance360',
                translationKey: 'routes.addPerformance360',
                icon: 'plus-circle',
                path: '/performance/review-360/add',
                permission: PERMISSION_CODES.PERFORMANCE_360_MANAGE,
                isShow: false,
              },
              EDIT_PERFORMANCE_360: {
                key: 'EDIT_PERFORMANCE_360',
                label: 'routes.editPerformance360',
                translationKey: 'routes.editPerformance360',
                icon: 'edit',
                path: '/performance/review-360/edit',
                permission: PERMISSION_CODES.PERFORMANCE_360_MANAGE,
                isShow: false,
              },
            },
          },
        },
      },
      TRAINING: {
        key: 'TRAINING',
        label: 'routes.training',
        translationKey: 'routes.training',
        icon: 'read',
        path: '/training',
        permission: PERMISSION_CODES.TRAINING_VIEW,
        children: {
          TRAINING_PROGRESS: {
            key: 'TRAINING_PROGRESS',
            label: 'routes.trainingProgress',
            translationKey: 'routes.trainingProgress',
            icon: 'bar-chart',
            path: '/training/progress',
            permission: PERMISSION_CODES.TRAINING_VIEW,
            isShow: true,
          },
          COURSE: {
            key: 'TRAINING_COURSE',
            label: 'routes.trainingCourseList',
            translationKey: 'routes.trainingCourseList',
            icon: 'book',
            path: '/training/course',
            permission: PERMISSION_CODES.TRAINING_COURSE_VIEW,
            children: {
              ADD_COURSE: {
                key: 'ADD_TRAINING_COURSE',
                label: 'routes.addTrainingCourse',
                translationKey: 'routes.addTrainingCourse',
                icon: 'plus-circle',
                path: '/training/course/add',
                permission: PERMISSION_CODES.TRAINING_COURSE_CREATE,
                isShow: false,
              },
              EDIT_COURSE: {
                key: 'EDIT_TRAINING_COURSE',
                label: 'routes.editTrainingCourse',
                translationKey: 'routes.editTrainingCourse',
                icon: 'edit',
                path: '/training/course/edit',
                permission: PERMISSION_CODES.TRAINING_COURSE_UPDATE,
                isShow: false,
              },
              DETAIL_COURSE: {
                key: 'DETAIL_TRAINING_COURSE',
                label: 'routes.detailTrainingCourse',
                translationKey: 'routes.detailTrainingCourse',
                icon: 'eye',
                path: '/training/course/detail',
                permission: PERMISSION_CODES.TRAINING_COURSE_VIEW,
                isShow: false,
              },
            },
          },
          TRAINING_MATERIAL: {
            key: 'TRAINING_MATERIAL',
            label: 'routes.trainingMaterial',
            translationKey: 'routes.trainingMaterial',
            icon: 'file-text',
            path: '/training/material',
            permission: PERMISSION_CODES.TRAINING_COURSE_VIEW,
            children: {
              ADD_TRAINING_MATERIAL: {
                key: 'ADD_TRAINING_MATERIAL',
                label: 'routes.addTrainingMaterial',
                translationKey: 'routes.addTrainingMaterial',
                icon: 'plus-circle',
                path: '/training/material/add',
                permission: PERMISSION_CODES.TRAINING_COURSE_UPDATE,
                isShow: false,
              },
              EDIT_TRAINING_MATERIAL: {
                key: 'EDIT_TRAINING_MATERIAL',
                label: 'routes.editTrainingMaterial',
                translationKey: 'routes.editTrainingMaterial',
                icon: 'edit',
                path: '/training/material/edit',
                permission: PERMISSION_CODES.TRAINING_COURSE_UPDATE,
                isShow: false,
              },
            },
          },
          TRAINING_QUIZ: {
            key: 'TRAINING_QUIZ',
            label: 'routes.trainingQuiz',
            translationKey: 'routes.trainingQuiz',
            icon: 'form',
            path: '/training/quiz',
            permission: PERMISSION_CODES.TRAINING_COURSE_VIEW,
            children: {
              ADD_TRAINING_QUIZ: {
                key: 'ADD_TRAINING_QUIZ',
                label: 'routes.addTrainingQuiz',
                translationKey: 'routes.addTrainingQuiz',
                icon: 'plus-circle',
                path: '/training/quiz/add',
                permission: PERMISSION_CODES.TRAINING_COURSE_UPDATE,
                isShow: false,
              },
              EDIT_TRAINING_QUIZ: {
                key: 'EDIT_TRAINING_QUIZ',
                label: 'routes.editTrainingQuiz',
                translationKey: 'routes.editTrainingQuiz',
                icon: 'edit',
                path: '/training/quiz/edit',
                permission: PERMISSION_CODES.TRAINING_COURSE_UPDATE,
                isShow: false,
              },
            },
          },
          ENROLLMENT: {
            key: 'TRAINING_ENROLLMENT',
            label: 'routes.trainingEnrollment',
            translationKey: 'routes.trainingEnrollment',
            icon: 'team',
            path: '/training/enrollment',
            permission: PERMISSION_CODES.TRAINING_ENROLLMENT_VIEW,
            children: {
              ADD_ENROLLMENT: {
                key: 'ADD_TRAINING_ENROLLMENT',
                label: 'routes.addTrainingEnrollment',
                translationKey: 'routes.addTrainingEnrollment',
                icon: 'plus-circle',
                path: '/training/enrollment/add',
                permission: PERMISSION_CODES.TRAINING_ENROLLMENT_MANAGE,
                isShow: false,
              },
              EDIT_ENROLLMENT: {
                key: 'EDIT_TRAINING_ENROLLMENT',
                label: 'routes.editTrainingEnrollment',
                translationKey: 'routes.editTrainingEnrollment',
                icon: 'edit',
                path: '/training/enrollment/edit',
                permission: PERMISSION_CODES.TRAINING_ENROLLMENT_MANAGE,
                isShow: false,
              },
            },
          },
          RESULT: {
            key: 'TRAINING_RESULT',
            label: 'routes.trainingResult',
            translationKey: 'routes.trainingResult',
            icon: 'check-circle',
            path: '/training/result',
            permission: PERMISSION_CODES.TRAINING_RESULT_VIEW,
            children: {
              ADD_RESULT: {
                key: 'ADD_TRAINING_RESULT',
                label: 'routes.addTrainingResult',
                translationKey: 'routes.addTrainingResult',
                icon: 'plus-circle',
                path: '/training/result/add',
                permission: PERMISSION_CODES.TRAINING_RESULT_MANAGE,
                isShow: false,
              },
              EDIT_RESULT: {
                key: 'EDIT_TRAINING_RESULT',
                label: 'routes.editTrainingResult',
                translationKey: 'routes.editTrainingResult',
                icon: 'edit',
                path: '/training/result/edit',
                permission: PERMISSION_CODES.TRAINING_RESULT_MANAGE,
                isShow: false,
              },
            },
          },
        },
      },
    },
  },

  ASSET: {
    key: 'ASSET',
    label: 'routes.asset',
    translationKey: 'routes.asset',
    icon: 'laptop',
    path: '/asset',
    permission: PERMISSION_CODES.ASSET_VIEW,
    children: {
      ASSET_TYPE: {
        key: 'ASSET_TYPE',
        label: 'routes.assetType',
        translationKey: 'routes.assetType',
        icon: 'tags',
        path: '/asset/type',
        permission: PERMISSION_CODES.ASSET_INVENTORY_VIEW,
        children: {
          ADD_ASSET_TYPE: {
            key: 'ADD_ASSET_TYPE',
            label: 'routes.addAssetType',
            translationKey: 'routes.addAssetType',
            icon: 'plus-circle',
            path: '/asset/type/add',
            permission: PERMISSION_CODES.ASSET_INVENTORY_MANAGE,
            isShow: false,
          },
          EDIT_ASSET_TYPE: {
            key: 'EDIT_ASSET_TYPE',
            label: 'routes.editAssetType',
            translationKey: 'routes.editAssetType',
            icon: 'edit',
            path: '/asset/type/edit',
            permission: PERMISSION_CODES.ASSET_INVENTORY_MANAGE,
            isShow: false,
          },
        },
      },
      ASSET_MANAGER: {
        key: 'ASSET_MANAGER',
        label: 'routes.assetList',
        translationKey: 'routes.assetList',
        icon: 'tool',
        path: '/asset/inventory',
        permission: PERMISSION_CODES.ASSET_INVENTORY_VIEW,
        children: {
          ADD_ASSET: {
            key: 'ADD_ASSET',
            label: 'routes.addAsset',
            translationKey: 'routes.addAsset',
            icon: 'plus-circle',
            path: '/asset/inventory/add',
            permission: PERMISSION_CODES.ASSET_INVENTORY_CREATE,
            isShow: false,
          },
          EDIT_ASSET: {
            key: 'EDIT_ASSET',
            label: 'routes.editAsset',
            translationKey: 'routes.editAsset',
            icon: 'edit',
            path: '/asset/inventory/edit',
            permission: PERMISSION_CODES.ASSET_INVENTORY_UPDATE,
            isShow: false,
          },
          DETAIL_ASSET: {
            key: 'DETAIL_ASSET',
            label: 'routes.detailAsset',
            translationKey: 'routes.detailAsset',
            icon: 'eye',
            path: '/asset/inventory/detail',
            permission: PERMISSION_CODES.ASSET_INVENTORY_VIEW,
            isShow: false,
          },
        },
      },
      ASSET_TICKET: {
        key: 'ASSET_TICKET',
        label: 'routes.assetTicket',
        translationKey: 'routes.assetTicket',
        icon: 'swap',
        path: '/asset/ticket',
        permission: PERMISSION_CODES.ASSET_VIEW,
        children: {
          ADD_ASSET_TICKET: {
            key: 'ADD_ASSET_TICKET',
            label: 'routes.addAssetTicket',
            translationKey: 'routes.addAssetTicket',
            icon: 'plus-circle',
            path: '/asset/ticket/add',
            permission: PERMISSION_CODES.ASSET_MANAGE,
            isShow: false,
          },
          EDIT_ASSET_TICKET: {
            key: 'EDIT_ASSET_TICKET',
            label: 'routes.editAssetTicket',
            translationKey: 'routes.editAssetTicket',
            icon: 'edit',
            path: '/asset/ticket/edit',
            permission: PERMISSION_CODES.ASSET_MANAGE,
            isShow: false,
          },
        },
      },
    },
  },

  WORKFLOW: {
    key: 'WORKFLOW',
    label: 'routes.workflow',
    translationKey: 'routes.workflow',
    icon: 'apartment',
    path: '/workflow',
    permission: PERMISSION_CODES.WORKFLOW_VIEW,
    children: {
      WORKFLOW_DASHBOARD: {
        key: 'WORKFLOW_DASHBOARD',
        label: 'routes.workflowDashboard',
        translationKey: 'routes.workflowDashboard',
        icon: 'dashboard',
        path: '/workflow/dashboard',
        permission: PERMISSION_CODES.WORKFLOW_VIEW,
      },
      WORKFLOW_INBOX: {
        key: 'WORKFLOW_INBOX',
        label: 'routes.workflowInbox',
        translationKey: 'routes.workflowInbox',
        icon: 'inbox',
        path: '/workflow/inbox',
        permission: PERMISSION_CODES.WORKFLOW_INBOX,
      },
      WORKFLOW_DEFINITIONS: {
        key: 'WORKFLOW_DEFINITIONS',
        label: 'routes.workflowDefinitions',
        translationKey: 'routes.workflowDefinitions',
        icon: 'partition',
        path: '/workflow/definitions',
        permission: PERMISSION_CODES.WORKFLOW_VIEW,
        children: {
          ADD_WORKFLOW_DEFINITION: {
            key: 'ADD_WORKFLOW_DEFINITION',
            label: 'routes.addWorkflowDefinition',
            translationKey: 'routes.addWorkflowDefinition',
            icon: 'plus-circle',
            path: '/workflow/definitions/add',
            permission: PERMISSION_CODES.WORKFLOW_MANAGE,
            isShow: false,
          },
          EDIT_WORKFLOW_DEFINITION: {
            key: 'EDIT_WORKFLOW_DEFINITION',
            label: 'routes.editWorkflowDefinition',
            translationKey: 'routes.editWorkflowDefinition',
            icon: 'edit',
            path: '/workflow/definitions/edit',
            permission: PERMISSION_CODES.WORKFLOW_MANAGE,
            isShow: false,
          },
        },
      },
      WORKFLOW_FORM_TEMPLATES: {
        key: 'WORKFLOW_FORM_TEMPLATES',
        label: 'routes.workflowFormTemplates',
        translationKey: 'routes.workflowFormTemplates',
        icon: 'form',
        path: '/workflow/form-templates',
        permission: PERMISSION_CODES.WORKFLOW_VIEW,
        children: {
          ADD_WORKFLOW_FORM_TEMPLATE: {
            key: 'ADD_WORKFLOW_FORM_TEMPLATE',
            label: 'routes.addWorkflowFormTemplate',
            translationKey: 'routes.addWorkflowFormTemplate',
            icon: 'plus-circle',
            path: '/workflow/form-templates/add',
            permission: PERMISSION_CODES.WORKFLOW_MANAGE,
            isShow: false,
          },
          EDIT_WORKFLOW_FORM_TEMPLATE: {
            key: 'EDIT_WORKFLOW_FORM_TEMPLATE',
            label: 'routes.editWorkflowFormTemplate',
            translationKey: 'routes.editWorkflowFormTemplate',
            icon: 'edit',
            path: '/workflow/form-templates/edit',
            permission: PERMISSION_CODES.WORKFLOW_MANAGE,
            isShow: false,
          },
        },
      },
    },
  },

  ROLE_MANAGER: {
    key: 'ROLE_MANAGER',
    label: 'routes.roleManager',
    translationKey: 'routes.roleManager',
    icon: 'safety',
    path: '/role-manager',
    permission: PERMISSION_CODES.ROLE_VIEW,
    children: {
      ACCOUNT_MANAGER: {
        key: 'ACCOUNT_MANAGER',
        label: 'routes.accountManager',
        translationKey: 'routes.accountManager',
        icon: 'user',
        path: '/role-manager/accounts',
        permission: PERMISSION_CODES.USER_VIEW,
      },
      ROLE_LIST: {
        key: 'ROLE_LIST',
        label: 'routes.roleList',
        translationKey: 'routes.roleList',
        icon: 'team',
        path: '/role-manager/roles',
        permission: PERMISSION_CODES.ROLE_VIEW,
      },
      ACCESS_CONTROL: {
        key: 'ACCESS_CONTROL',
        label: 'routes.accessControl',
        translationKey: 'routes.accessControl',
        icon: 'key',
        path: '/role-manager/access',
        permission: PERMISSION_CODES.ROLE_MANAGE,
      },
    },
  },

  SETTING_SYSTEM: {
    key: 'SETTING_SYSTEM',
    label: 'routes.settingSystem',
    translationKey: 'routes.settingSystem',
    icon: 'setting',
    path: '/system-settings',
    permission: PERMISSION_CODES.SYSTEM_SETTINGS_VIEW,
    children: {
      ACTION_LOG: {
        key: 'ACTION_LOG',
        label: 'routes.actionLog',
        translationKey: 'routes.actionLog',
        icon: 'history',
        path: '/system-settings/action-log',
        permission: PERMISSION_CODES.ACTION_LOG_VIEW,
      },
      LEGAL_RATE: {
        key: 'LEGAL_RATE',
        label: 'routes.legalRate',
        translationKey: 'routes.legalRate',
        icon: 'percentage',
        path: '/system-settings/legal-rate',
        permission: PERMISSION_CODES.SYSTEM_SETTINGS_VIEW,
        children: {
          ADD_LEGAL_RATE: {
            key: 'ADD_LEGAL_RATE',
            label: 'routes.addLegalRate',
            translationKey: 'routes.addLegalRate',
            path: '/system-settings/legal-rate/add',
            permission: PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE,
            isShow: false,
          },
          EDIT_LEGAL_RATE: {
            key: 'EDIT_LEGAL_RATE',
            label: 'routes.editLegalRate',
            translationKey: 'routes.editLegalRate',
            path: '/system-settings/legal-rate/edit',
            permission: PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE,
            isShow: false,
          },
        },
      },
      NOTIFICATION_CENTER: {
        key: 'NOTIFICATION_CENTER',
        label: 'routes.notificationCenter',
        translationKey: 'routes.notificationCenter',
        icon: 'bell',
        path: '/system-settings/notification-center',
        permission: PERMISSION_CODES.SYSTEM_SETTINGS_VIEW,
      },
      NOTIFICATION_TEMPLATE: {
        key: 'NOTIFICATION_TEMPLATE',
        label: 'routes.notificationTemplate',
        translationKey: 'routes.notificationTemplate',
        icon: 'mail',
        path: '/system-settings/notification-template',
        permission: PERMISSION_CODES.SYSTEM_SETTINGS_VIEW,
        children: {
          ADD_NOTIFICATION_TEMPLATE: {
            key: 'ADD_NOTIFICATION_TEMPLATE',
            label: 'routes.addNotificationTemplate',
            translationKey: 'routes.addNotificationTemplate',
            path: '/system-settings/notification-template/add',
            permission: PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE,
            isShow: false,
          },
          EDIT_NOTIFICATION_TEMPLATE: {
            key: 'EDIT_NOTIFICATION_TEMPLATE',
            label: 'routes.editNotificationTemplate',
            translationKey: 'routes.editNotificationTemplate',
            path: '/system-settings/notification-template/edit',
            permission: PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE,
            isShow: false,
          },
        },
      },
      API_KEYS: {
        key: 'API_KEYS',
        label: 'routes.apiKeys',
        translationKey: 'routes.apiKeys',
        icon: 'key',
        path: '/system-settings/api-keys',
        permission: PERMISSION_CODES.SYSTEM_SETTINGS_VIEW,
        children: {
          ADD_API_KEY: {
            key: 'ADD_API_KEY',
            label: 'routes.addApiKey',
            translationKey: 'routes.addApiKey',
            path: '/system-settings/api-keys/add',
            permission: PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE,
            isShow: false,
          },
          EDIT_API_KEY: {
            key: 'EDIT_API_KEY',
            label: 'routes.editApiKey',
            translationKey: 'routes.editApiKey',
            path: '/system-settings/api-keys/edit',
            permission: PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE,
            isShow: false,
          },
        },
      },
      WEBHOOKS: {
        key: 'WEBHOOKS',
        label: 'routes.webhooks',
        translationKey: 'routes.webhooks',
        icon: 'api',
        path: '/system-settings/webhooks',
        permission: PERMISSION_CODES.SYSTEM_SETTINGS_VIEW,
        children: {
          ADD_WEBHOOK: {
            key: 'ADD_WEBHOOK',
            label: 'routes.addWebhook',
            translationKey: 'routes.addWebhook',
            path: '/system-settings/webhooks/add',
            permission: PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE,
            isShow: false,
          },
          EDIT_WEBHOOK: {
            key: 'EDIT_WEBHOOK',
            label: 'routes.editWebhook',
            translationKey: 'routes.editWebhook',
            path: '/system-settings/webhooks/edit',
            permission: PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE,
            isShow: false,
          },
        },
      },
      RETENTION: {
        key: 'RETENTION',
        label: 'routes.retention',
        translationKey: 'routes.retention',
        icon: 'delete',
        path: '/system-settings/retention',
        permission: PERMISSION_CODES.SYSTEM_SETTINGS_VIEW,
      },
      SESSIONS: {
        key: 'SESSIONS',
        label: 'routes.sessions',
        translationKey: 'routes.sessions',
        icon: 'laptop',
        path: '/system-settings/sessions',
        permission: PERMISSION_CODES.SYSTEM_SETTINGS_VIEW,
      },
      IP_ALLOWLIST: {
        key: 'IP_ALLOWLIST',
        label: 'routes.ipAllowlist',
        translationKey: 'routes.ipAllowlist',
        icon: 'safety',
        path: '/system-settings/ip-allowlist',
        permission: PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE,
        children: {
          ADD_IP_ALLOWLIST: {
            key: 'ADD_IP_ALLOWLIST',
            label: 'routes.addIpAllowlist',
            translationKey: 'routes.addIpAllowlist',
            path: '/system-settings/ip-allowlist/add',
            permission: PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE,
            isShow: false,
          },
          EDIT_IP_ALLOWLIST: {
            key: 'EDIT_IP_ALLOWLIST',
            label: 'routes.editIpAllowlist',
            translationKey: 'routes.editIpAllowlist',
            path: '/system-settings/ip-allowlist/edit',
            permission: PERMISSION_CODES.SYSTEM_SETTINGS_MANAGE,
            isShow: false,
          },
        },
      },
      SECURITY: {
        key: 'SECURITY',
        label: 'routes.security',
        translationKey: 'routes.security',
        icon: 'security-scan',
        path: '/system-settings/security',
        permission: PERMISSION_CODES.SYSTEM_SETTINGS_VIEW,
      },
    },
  },

  INTEGRATIONS: {
    key: 'INTEGRATIONS',
    label: 'routes.integrations',
    translationKey: 'routes.integrations',
    icon: 'deployment-unit',
    path: '/integrations',
    permission: PERMISSION_CODES.INTEGRATIONS_VIEW,
    children: {
      HUB: {
        key: 'INTEGRATIONS_HUB',
        label: 'routes.integrationsHub',
        translationKey: 'routes.integrationsHub',
        icon: 'dashboard',
        path: '/integrations',
        permission: PERMISSION_CODES.INTEGRATIONS_VIEW,
        isShow: false,
      },
      SMS_CONFIG: {
        key: 'SMS_CONFIG',
        label: 'routes.smsConfig',
        translationKey: 'routes.smsConfig',
        icon: 'message',
        path: '/integrations/sms',
        permission: PERMISSION_CODES.INTEGRATIONS_VIEW,
      },
      ZALO_CONFIG: {
        key: 'ZALO_CONFIG',
        label: 'routes.zaloConfig',
        translationKey: 'routes.zaloConfig',
        icon: 'comment',
        path: '/integrations/zalo',
        permission: PERMISSION_CODES.INTEGRATIONS_VIEW,
      },
      PUNCH_IMPORT: {
        key: 'INTEGRATIONS_PUNCH_IMPORT',
        label: 'routes.punchImport',
        translationKey: 'routes.punchImport',
        icon: 'upload',
        path: '/integrations/punch-import',
        permission: PERMISSION_CODES.OPERATE_TIMEKEEPING_MANAGE,
      },
      PAYROLL_EXPORTS: {
        key: 'PAYROLL_EXPORTS',
        label: 'routes.payrollExports',
        translationKey: 'routes.payrollExports',
        icon: 'export',
        path: '/integrations/payroll-exports',
        permission: PERMISSION_CODES.PAYROLL_SALARY_VIEW,
      },
    },
  },

  REPORTS: {
    key: 'REPORTS',
    label: 'routes.reports',
    translationKey: 'routes.reports',
    icon: 'bar-chart',
    path: '/reports',
    permission: PERMISSION_CODES.COMPLIANCE_VIEW,
    children: {
      CONTRACT_EXPIRY: {
        key: 'CONTRACT_EXPIRY_REPORT',
        label: 'routes.contractExpiryReport',
        translationKey: 'routes.contractExpiryReport',
        icon: 'file-protect',
        path: '/reports/contract-expiry',
        permission: PERMISSION_CODES.COMPLIANCE_VIEW,
      },
      SCHEDULES: {
        key: 'REPORT_SCHEDULES',
        label: 'routes.reportSchedules',
        translationKey: 'routes.reportSchedules',
        icon: 'schedule',
        path: '/reports/schedules',
        permission: PERMISSION_CODES.REPORT_SCHEDULE_VIEW,
        children: {
          ADD_REPORT_SCHEDULE: {
            key: 'ADD_REPORT_SCHEDULE',
            label: 'routes.addReportSchedule',
            translationKey: 'routes.addReportSchedule',
            path: '/reports/schedules/add',
            permission: PERMISSION_CODES.REPORT_SCHEDULE_MANAGE,
            isShow: false,
          },
          EDIT_REPORT_SCHEDULE: {
            key: 'EDIT_REPORT_SCHEDULE',
            label: 'routes.editReportSchedule',
            translationKey: 'routes.editReportSchedule',
            path: '/reports/schedules/edit',
            permission: PERMISSION_CODES.REPORT_SCHEDULE_MANAGE,
            isShow: false,
          },
        },
      },
    },
  },
} as const satisfies Record<string, RouteConfig>;

export function getRouteByPath(path: string): RouteConfig | undefined {
  const routes = ROUTES_CONFIG as unknown as Record<string, RouteConfig>;
  let bestMatch: RouteConfig | undefined = undefined;

  const traverse = (routeList: Record<string, RouteConfig>) => {
    for (const key of Object.keys(routeList)) {
      const r = routeList[key];
      if (path === r.path) {
        bestMatch = r;
        return;
      }
      if (r.path !== '/' && path.startsWith(r.path + '/')) {
        if (!bestMatch || r.path.length > bestMatch.path.length) {
          bestMatch = r;
        }
      }
      if (r.children) {
        traverse(r.children as Record<string, RouteConfig>);
      }
    }
  };

  traverse(routes);
  return bestMatch;
}

export function getFirstNavigableRoute(route: RouteConfig): RouteConfig {
  if (!route.children || Object.keys(route.children).length === 0) {
    return route;
  }
  const childKeys = Object.keys(route.children);
  for (const k of childKeys) {
    const child = route.children[k];
    if (child && child.isShow !== false) {
      return getFirstNavigableRoute(child);
    }
  }
  return childKeys.length > 0 ? getFirstNavigableRoute(route.children[childKeys[0]]) : route;
}

export function getRouteByKey(key: string): RouteConfig | undefined {
  const routes = ROUTES_CONFIG as unknown as Record<string, RouteConfig>;
  let foundRoute: RouteConfig | undefined = undefined;

  const traverse = (routeList: Record<string, RouteConfig>) => {
    for (const k of Object.keys(routeList)) {
      if (foundRoute) return;
      const r = routeList[k];
      if (r.key === key) {
        foundRoute = r;
        return;
      }
      if (r.children) {
        traverse(r.children as Record<string, RouteConfig>);
      }
    }
  };

  traverse(routes);
  return foundRoute;
}

export function convertRoutesToMenuItems(routes: Record<string, RouteConfig>): SidebarMenuItem[] {
  const toMenuItem = (route: RouteConfig, depth: number): SidebarMenuItem | null => {
    if (route.isShow === false) return null;

    const item: SidebarMenuItem = {
      key: route.key,
      label: route.label,
      translationKey: route.translationKey,
      path: route.path,
      icon: route.icon,
      isShow: route.isShow,
      permission: route.permission,
    };

    if (route.children && depth < 3) {
      const children = Object.keys(route.children)
        .map((childKey) => toMenuItem(route.children![childKey], depth + 1))
        .filter((child): child is SidebarMenuItem => child !== null);
      if (children.length > 0) {
        item.children = children;
      }
    }

    return item;
  };

  const items: SidebarMenuItem[] = [];
  const home = routes['HOME'];
  if (home && home.isShow !== false) {
    items.push({
      key: home.key,
      label: home.label,
      translationKey: home.translationKey,
      path: home.path,
      icon: home.icon,
      isShow: home.isShow,
      permission: home.permission,
    });
  }

  for (const key of Object.keys(routes)) {
    if (key === 'HOME') continue;
    const item = toMenuItem(routes[key], 1);
    if (item) items.push(item);
  }
  return items;
}

export function filterMenuByPermission(
  items: SidebarMenuItem[],
  canAccess: (permission?: string) => boolean,
): SidebarMenuItem[] {
  const filterItem = (item: SidebarMenuItem): SidebarMenuItem | null => {
    if (item.permission && !canAccess(item.permission)) {
      return null;
    }

    if (item.children?.length) {
      const children = item.children
        .map((child) => filterItem(child))
        .filter((child): child is SidebarMenuItem => child !== null);
      if (children.length === 0) {
        return null;
      }
      return { ...item, children };
    }

    return item;
  };

  return items
    .map((item) => filterItem(item))
    .filter((item): item is SidebarMenuItem => item !== null);
}
