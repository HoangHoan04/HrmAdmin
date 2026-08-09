export interface RouteConfig {
  key: string;
  label: string;
  translationKey: string;
  path: string;
  icon?: string;
  isShow?: boolean;
  children?: Record<string, RouteConfig>;
}

export interface SidebarMenuItem {
  key: string;
  label: string;
  translationKey: string;
  path: string;
  icon?: string;
  isShow?: boolean;
  children?: SidebarMenuItem[];
}

export const ROUTES_CONFIG = {
  HOME: {
    key: 'HOME',
    label: 'routes.home',
    translationKey: 'routes.home',
    path: '/',
    icon: 'home',
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
        children: {
          ADD_COMPANY: {
            key: 'ADD_COMPANY',
            label: 'routes.addCompany',
            translationKey: 'routes.addCompany',
            icon: 'plus',
            path: '/organization/company/add',
            isShow: false,
          },
          EDIT_COMPANY: {
            key: 'EDIT_COMPANY',
            label: 'routes.editCompany',
            translationKey: 'routes.editCompany',
            icon: 'plus',
            path: '/organization/company/edit',
            isShow: false,
          },
          DETAIL_COMPANY: {
            key: 'DETAIL_COMPANY',
            label: 'routes.detailCompany',
            translationKey: 'routes.detailCompany',
            icon: 'plus',
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
        children: {
          ADD_BRANCH: {
            key: 'ADD_BRANCH',
            label: 'routes.addBranch',
            translationKey: 'routes.addBranch',
            icon: 'plus',
            path: '/organization/branch/add',
            isShow: false,
          },
          EDIT_BRANCH: {
            key: 'EDIT_BRANCH',
            label: 'routes.editBranch',
            translationKey: 'routes.editBranch',
            icon: 'plus',
            path: '/organization/branch/edit',
            isShow: false,
          },
          DETAIL_BRANCH: {
            key: 'DETAIL_BRANCH',
            label: 'routes.detailBranch',
            translationKey: 'routes.detailBranch',
            icon: 'plus',
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
        children: {
          ADD_DEPARTMENT: {
            key: 'ADD_DEPARTMENT',
            label: 'routes.addDepartment',
            translationKey: 'routes.addDepartment',
            icon: 'plus',
            path: '/organization/department/add',
            isShow: false,
          },
          EDIT_DEPARTMENT: {
            key: 'EDIT_DEPARTMENT',
            label: 'routes.editDepartment',
            translationKey: 'routes.editDepartment',
            icon: 'plus',
            path: '/organization/department/edit',
            isShow: false,
          },
          DETAIL_DEPARTMENT: {
            key: 'DETAIL_DEPARTMENT',
            label: 'routes.detailDepartment',
            translationKey: 'routes.detailDepartment',
            icon: 'plus',
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
        children: {
          ADD_PART: {
            key: 'ADD_PART',
            label: 'routes.addPart',
            translationKey: 'routes.addPart',
            icon: 'plus',
            path: '/organization/part/add',
            isShow: false,
          },
          EDIT_PART: {
            key: 'EDIT_PART',
            label: 'routes.editPart',
            translationKey: 'routes.editPart',
            icon: 'plus',
            path: '/organization/part/edit',
            isShow: false,
          },
          DETAIL_PART: {
            key: 'DETAIL_PART',
            label: 'routes.detailPart',
            translationKey: 'routes.detailPart',
            icon: 'plus',
            path: '/organization/part/detail',
            isShow: false,
          },
          ADD_PART_MASTER: {
            key: 'ADD_PART_MASTER',
            label: 'routes.addPartMaster',
            translationKey: 'routes.addPartMaster',
            icon: 'plus',
            path: '/organization/part-master/add',
            isShow: false,
          },
          EDIT_PART_MASTER: {
            key: 'EDIT_PART_MASTER',
            label: 'routes.editPartMaster',
            translationKey: 'routes.editPartMaster',
            icon: 'plus',
            path: '/organization/part-master/edit',
            isShow: false,
          },
          DETAIL_PART_MASTER: {
            key: 'DETAIL_PART_MASTER',
            label: 'routes.detailPartMaster',
            translationKey: 'routes.detailPartMaster',
            icon: 'plus',
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
        children: {
          ADD_POSITION: {
            key: 'ADD_POSITION',
            label: 'routes.addPosition',
            translationKey: 'routes.addPosition',
            icon: 'plus',
            path: '/organization/position/add',
            isShow: false,
          },
          EDIT_POSITION: {
            key: 'EDIT_POSITION',
            label: 'routes.editPosition',
            translationKey: 'routes.editPosition',
            icon: 'plus',
            path: '/organization/position/edit',
            isShow: false,
          },
          DETAIL_POSITION: {
            key: 'DETAIL_POSITION',
            label: 'routes.detailPosition',
            translationKey: 'routes.detailPosition',
            icon: 'plus',
            path: '/organization/position/detail',
            isShow: false,
          },
          ADD_POSITION_MASTER: {
            key: 'ADD_POSITION_MASTER',
            label: 'routes.addPositionMaster',
            translationKey: 'routes.addPositionMaster',
            icon: 'plus',
            path: '/organization/position-master/add',
            isShow: false,
          },
          EDIT_POSITION_MASTER: {
            key: 'EDIT_POSITION_MASTER',
            label: 'routes.editPositionMaster',
            translationKey: 'routes.editPositionMaster',
            icon: 'plus',
            path: '/organization/position-master/edit',
            isShow: false,
          },
          DETAIL_POSITION_MASTER: {
            key: 'DETAIL_POSITION_MASTER',
            label: 'routes.detailPositionMaster',
            translationKey: 'routes.detailPositionMaster',
            icon: 'plus',
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
        children: {
          ADD_EMPLOYEE: {
            key: 'ADD_EMPLOYEE',
            label: 'routes.addEmployee',
            translationKey: 'routes.addEmployee',
            icon: 'plus',
            path: '/human-resource/employee/add',
            isShow: false,
          },
          EDIT_EMPLOYEE: {
            key: 'EDIT_EMPLOYEE',
            label: 'routes.editEmployee',
            translationKey: 'routes.editEmployee',
            icon: 'plus',
            path: '/human-resource/employee/edit',
            isShow: false,
          },
          DETAIL_EMPLOYEE: {
            key: 'DETAIL_EMPLOYEE',
            label: 'routes.detailEmployee',
            translationKey: 'routes.detailEmployee',
            icon: 'plus',
            path: '/human-resource/employee/detail',
            isShow: false,
          },
        },
      },
      CONTRACT_MANAGER: {
        key: 'CONTRACT_MANAGER',
        label: 'routes.contractList',
        translationKey: 'routes.contractList',
        icon: 'file-text',
        path: '/human-resource/contract',
        children: {
          ADD_CONTRACT: {
            key: 'ADD_CONTRACT',
            label: 'routes.addContract',
            translationKey: 'routes.addContract',
            icon: 'plus',
            path: '/human-resource/contract/add',
            isShow: false,
          },
          EDIT_CONTRACT: {
            key: 'EDIT_CONTRACT',
            label: 'routes.editContract',
            translationKey: 'routes.editContract',
            icon: 'plus',
            path: '/human-resource/contract/edit',
            isShow: false,
          },
          DETAIL_CONTRACT: {
            key: 'DETAIL_CONTRACT',
            label: 'routes.detailContract',
            translationKey: 'routes.detailContract',
            icon: 'plus',
            path: '/human-resource/contract/detail',
            isShow: false,
          },
        },
      },
      TRANSFER_MANAGER: {
        key: 'TRANSFER_MANAGER',
        label: 'routes.transferList',
        translationKey: 'routes.transferList',
        icon: 'swap',
        path: '/human-resource/transfer',
        children: {
          ADD_TRANSFER: {
            key: 'ADD_TRANSFER',
            label: 'routes.addTransfer',
            translationKey: 'routes.addTransfer',
            icon: 'plus',
            path: '/human-resource/transfer/add',
            isShow: false,
          },
          EDIT_TRANSFER: {
            key: 'EDIT_TRANSFER',
            label: 'routes.editTransfer',
            translationKey: 'routes.editTransfer',
            icon: 'plus',
            path: '/human-resource/transfer/edit',
            isShow: false,
          },
          DETAIL_TRANSFER: {
            key: 'DETAIL_TRANSFER',
            label: 'routes.detailTransfer',
            translationKey: 'routes.detailTransfer',
            icon: 'plus',
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
        label: 'routes.timeAttendance',
        translationKey: 'routes.timeAttendance',
        icon: 'clock-circle',
        path: '/operate-manager/time-attendance',
        children: {
          TIMEKEEPING_STANDARD: {
            key: 'TIMEKEEPING_STANDARD',
            label: 'routes.timekeepingStandard',
            translationKey: 'routes.timekeepingStandard',
            path: '/operate-manager/time-attendance/timekeeping-standard',
            children: {
              ADD_TIMEKEEPING_STANDARD: {
                key: 'ADD_TIMEKEEPING_STANDARD',
                label: 'routes.addTimekeepingStandard',
                translationKey: 'routes.addTimekeepingStandard',
                icon: 'plus',
                path: '/operate-manager/time-attendance/timekeeping-standard/add',
                isShow: false,
              },
              EDIT_TIMEKEEPING_STANDARD: {
                key: 'EDIT_TIMEKEEPING_STANDARD',
                label: 'routes.editTimekeepingStandard',
                translationKey: 'routes.editTimekeepingStandard',
                icon: 'plus',
                path: '/operate-manager/time-attendance/timekeeping-standard/edit',
                isShow: false,
              },
            },
          },
          TIMEKEEPING_MANAGER: {
            key: 'TIMEKEEPING_MANAGER',
            label: 'routes.timekeepingList',
            translationKey: 'routes.timekeepingList',
            path: '/operate-manager/time-attendance/timekeeping',
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
          SHIFT_MANAGER: {
            key: 'SHIFT_MANAGER',
            label: 'routes.shiftList',
            translationKey: 'routes.shiftList',
            path: '/operate-manager/time-attendance/shift',
            children: {
              ADD_SHIFT: {
                key: 'ADD_SHIFT',
                label: 'routes.addShift',
                translationKey: 'routes.addShift',
                icon: 'plus',
                path: '/operate-manager/time-attendance/shift/add',
                isShow: false,
              },
              EDIT_SHIFT: {
                key: 'EDIT_SHIFT',
                label: 'routes.editShift',
                translationKey: 'routes.editShift',
                icon: 'plus',
                path: '/operate-manager/time-attendance/shift/edit',
                isShow: false,
              },
              ADD_WORK_SCHEDULE: {
                key: 'ADD_WORK_SCHEDULE',
                label: 'routes.addWorkSchedule',
                translationKey: 'routes.addWorkSchedule',
                icon: 'plus',
                path: '/operate-manager/time-attendance/shift/work-schedule/add',
                isShow: false,
              },
              EDIT_WORK_SCHEDULE: {
                key: 'EDIT_WORK_SCHEDULE',
                label: 'routes.editWorkSchedule',
                translationKey: 'routes.editWorkSchedule',
                icon: 'plus',
                path: '/operate-manager/time-attendance/shift/work-schedule/edit',
                isShow: false,
              },
            },
          },
          LEAVE_MANAGER: {
            key: 'LEAVE_MANAGER',
            label: 'routes.leaveRequestList',
            translationKey: 'routes.leaveRequestList',
            path: '/operate-manager/time-attendance/leave',
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
      },
      PAYROLL_CONFIG: {
        key: 'PAYROLL_CONFIG',
        label: 'routes.payrollConfig',
        translationKey: 'routes.payrollConfig',
        icon: 'setting',
        path: '/payroll/config',
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
            icon: 'plus',
            path: '/asset/inventory/add',
            isShow: false,
          },
          EDIT_ASSET: {
            key: 'EDIT_ASSET',
            label: 'routes.editAsset',
            translationKey: 'routes.editAsset',
            icon: 'plus',
            path: '/asset/inventory/edit',
            isShow: false,
          },
          DETAIL_ASSET: {
            key: 'DETAIL_ASSET',
            label: 'routes.detailAsset',
            translationKey: 'routes.detailAsset',
            icon: 'plus',
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
      USER_MANAGER: {
        key: 'USER_MANAGER',
        label: 'routes.userList',
        translationKey: 'routes.userList',
        icon: 'user',
        path: '/role-manager/user',
      },
      ROLE_LIST: {
        key: 'ROLE_LIST',
        label: 'routes.roleList',
        translationKey: 'routes.roleList',
        icon: 'safety-certificate',
        path: '/role-manager/role',
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
    });
  }

  for (const key of Object.keys(routes)) {
    if (key === 'HOME') continue;
    const item = toMenuItem(routes[key], 1);
    if (item) items.push(item);
  }
  return items;
}
