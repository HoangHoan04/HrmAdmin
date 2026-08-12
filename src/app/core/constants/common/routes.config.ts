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
    children: {
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
    children: {
      TIME_ATTENDANCE: {
        key: 'TIME_ATTENDANCE',
        label: 'routes.operate',
        translationKey: 'routes.operate',
        icon: 'clock-circle',
        path: '/operate-manager/time-attendance',
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
                isShow: false,
              },
              EDIT_TIMEKEEPING_STANDARD: {
                key: 'EDIT_TIMEKEEPING_STANDARD',
                label: 'routes.editTimekeepingStandard',
                translationKey: 'routes.editTimekeepingStandard',
                icon: 'edit',
                path: '/operate-manager/time-attendance/timekeeping-standard/edit',
                isShow: false,
              },
              DETAIL_TIMEKEEPING_STANDARD: {
                key: 'DETAIL_TIMEKEEPING_STANDARD',
                label: 'routes.detailTimekeepingStandard',
                translationKey: 'routes.detailTimekeepingStandard',
                icon: 'eye',
                path: '/operate-manager/time-attendance/timekeeping-standard/detail',
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
                isShow: false,
              },
            },
          },
          ATTENDANCE_COMPLAINT: {
            key: 'ATTENDANCE_COMPLAINT',
            label: 'routes.attendanceComplaint',
            translationKey: 'routes.attendanceComplaint',
            path: '/operate-manager/time-attendance/attendance-complaint',
            permission: PERMISSION_CODES.OPERATE_ATTENDANCE_COMPLAINT_VIEW,
          },
        },
      },

      LEAVE_MANAGER: {
        key: 'LEAVE_MANAGER',
        label: 'routes.leaveRequestList',
        translationKey: 'routes.leaveRequestList',
        icon: 'file-done',
        path: '/operate-manager/leave',
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
                isShow: false,
              },
              EDIT_DAY_OFF_CONFIG: {
                key: 'EDIT_DAY_OFF_CONFIG',
                label: 'routes.editDayOffConfig',
                translationKey: 'routes.editDayOffConfig',
                icon: 'edit',
                path: '/operate-manager/time-attendance/day-off-config/edit',
                isShow: false,
              },
              DETAIL_DAY_OFF_CONFIG: {
                key: 'DETAIL_DAY_OFF_CONFIG',
                label: 'routes.detailDayOffConfig',
                translationKey: 'routes.detailDayOffConfig',
                icon: 'eye',
                path: '/operate-manager/time-attendance/day-off-config/detail',
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
                isShow: false,
              },
              EDIT_PUBLIC_HOLIDAY: {
                key: 'EDIT_PUBLIC_HOLIDAY',
                label: 'routes.editPublicHoliday',
                translationKey: 'routes.editPublicHoliday',
                icon: 'edit',
                path: '/operate-manager/time-attendance/public-holiday/edit',
                isShow: false,
              },
              DETAIL_PUBLIC_HOLIDAY: {
                key: 'DETAIL_PUBLIC_HOLIDAY',
                label: 'routes.detailPublicHoliday',
                translationKey: 'routes.detailPublicHoliday',
                icon: 'eye',
                path: '/operate-manager/time-attendance/public-holiday/detail',
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
            isShow: false,
          },
          EDIT_SHIFT: {
            key: 'EDIT_SHIFT',
            label: 'routes.editShift',
            translationKey: 'routes.editShift',
            icon: 'edit',
            path: '/operate-manager/time-attendance/shift/edit',
            isShow: false,
          },
          DETAIL_SHIFT: {
            key: 'DETAIL_SHIFT',
            label: 'routes.detailShift',
            translationKey: 'routes.detailShift',
            icon: 'eye',
            path: '/operate-manager/time-attendance/shift/detail',
            isShow: false,
          },

          ADD_WORK_SCHEDULE: {
            key: 'ADD_WORK_SCHEDULE',
            label: 'routes.addWorkSchedule',
            translationKey: 'routes.addWorkSchedule',
            icon: 'plus-circle',
            path: '/operate-manager/time-attendance/shift/work-schedule/add',
            isShow: false,
          },
          EDIT_WORK_SCHEDULE: {
            key: 'EDIT_WORK_SCHEDULE',
            label: 'routes.editWorkSchedule',
            translationKey: 'routes.editWorkSchedule',
            icon: 'edit',
            path: '/operate-manager/time-attendance/shift/work-schedule/edit',
            isShow: false,
          },
          WORK_SCHEDULE_DETAIL: {
            key: 'WORK_SCHEDULE_DETAIL',
            label: 'routes.workScheduleDetail',
            translationKey: 'routes.workScheduleDetail',
            icon: 'eye',
            path: '/operate-manager/time-attendance/shift/work-schedule/detail',
            isShow: false,
          },
        },
      },

      PERFORMANCE: {
        key: 'PERFORMANCE',
        label: 'routes.performance',
        translationKey: 'routes.performance',
        icon: 'rise',
        path: '/operate-manager/performance',
        children: {
          PERFORMANCE_REVIEW: {
            key: 'PERFORMANCE_REVIEW',
            label: 'routes.performanceReview',
            translationKey: 'routes.performanceReview',
            icon: 'audit',
            path: '/operate-manager/performance/review',
          },
        },
      },
      DISCIPLINE: {
        key: 'DISCIPLINE',
        label: 'routes.discipline',
        translationKey: 'routes.discipline',
        icon: 'warning',
        path: '/operate-manager/discipline',
        children: {
          VIOLATION_MANAGER: {
            key: 'VIOLATION_MANAGER',
            label: 'routes.violationList',
            translationKey: 'routes.violationList',
            icon: 'alert',
            path: '/operate-manager/discipline/violation',
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
            isShow: false,
          },
          EDIT_SALARY: {
            key: 'EDIT_SALARY',
            label: 'routes.editSalary',
            translationKey: 'routes.editSalary',
            icon: 'edit',
            path: '/payroll/run/edit',
            isShow: false,
          },
          DETAIL_SALARY: {
            key: 'DETAIL_SALARY',
            label: 'routes.detailSalary',
            translationKey: 'routes.detailSalary',
            icon: 'eye',
            path: '/payroll/run/detail',
            isShow: false,
          },
        },
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
            isShow: false,
          },
          EDIT_SALARY_CONFIG: {
            key: 'EDIT_SALARY_CONFIG',
            label: 'routes.editSalaryConfig',
            translationKey: 'routes.editSalaryConfig',
            icon: 'edit',
            path: '/payroll/config/edit',
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
    children: {
      RECRUITMENT_PIPELINE: {
        key: 'RECRUITMENT_PIPELINE',
        label: 'routes.recruitmentPipeline',
        translationKey: 'routes.recruitmentPipeline',
        icon: 'solution',
        path: '/recruitment/pipeline',
      },
      TRAINING: {
        key: 'TRAINING',
        label: 'routes.training',
        translationKey: 'routes.training',
        icon: 'read',
        path: '/training',
        children: {
          TRAINING_MANAGER: {
            key: 'TRAINING_MANAGER',
            label: 'routes.trainingCourseList',
            translationKey: 'routes.trainingCourseList',
            icon: 'book',
            path: '/training/course',
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
    children: {
      ASSET_MANAGER: {
        key: 'ASSET_MANAGER',
        label: 'routes.assetList',
        translationKey: 'routes.assetList',
        icon: 'tool',
        path: '/asset/inventory',
        children: {
          ADD_ASSET: {
            key: 'ADD_ASSET',
            label: 'routes.addAsset',
            translationKey: 'routes.addAsset',
            icon: 'plus-circle',
            path: '/asset/inventory/add',
            isShow: false,
          },
          EDIT_ASSET: {
            key: 'EDIT_ASSET',
            label: 'routes.editAsset',
            translationKey: 'routes.editAsset',
            icon: 'edit',
            path: '/asset/inventory/edit',
            isShow: false,
          },
          DETAIL_ASSET: {
            key: 'DETAIL_ASSET',
            label: 'routes.detailAsset',
            translationKey: 'routes.detailAsset',
            icon: 'eye',
            path: '/asset/inventory/detail',
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
    children: {
      ACTION_LOG: {
        key: 'ACTION_LOG',
        label: 'routes.actionLog',
        translationKey: 'routes.actionLog',
        icon: 'history',
        path: '/system-settings/action-log',
        permission: PERMISSION_CODES.ACTION_LOG_VIEW,
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
