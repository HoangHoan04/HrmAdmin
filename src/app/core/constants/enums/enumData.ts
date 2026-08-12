export const enumData = {
  PAGE: {
    PAGE_INDEX: 1,
    PAGE_SIZE: 10,
    PAGE_SIZE_MAX: 1000000,
    LST_PAGE_SIZE: [10, 20, 50, 100],
    TOTAL: 0,
  },
  maxSizeUpload: 5 * 1024 * 1024,

  STATUS_FILTER: {
    ACTIVE: { code: 'ACTIVE', labelKey: 'enums.statusFilter.active', value: false },
    INACTIVE: { code: 'INACTIVE', labelKey: 'enums.statusFilter.inactive', value: true },
    ALL: { code: 'ALL', labelKey: 'enums.statusFilter.all', value: null },
  },

  GENDER: {
    MALE: { code: 'MALE', labelKey: 'enums.gender.male', value: 'MALE', color: '#1890ff' },
    FEMALE: { code: 'FEMALE', labelKey: 'enums.gender.female', value: 'FEMALE', color: '#faad14' },
    OTHER: { code: 'OTHER', labelKey: 'enums.gender.other', value: 'OTHER', color: '#722ed1' },
  },

  ACTION_TYPE: {
    CREATE: {
      code: 'CREATE',
      labelKey: 'enums.actionType.create',
      type: 'ThemMoi',
      color: '#00FF00',
    },
    APPROVE: {
      code: 'APPROVE',
      labelKey: 'enums.actionType.approve',
      type: 'Duyet',
      color: '#00FF00',
    },
    ACTIVATE: {
      code: 'ACTIVATE',
      labelKey: 'enums.actionType.activate',
      type: 'KichHoat',
      color: '#00FF00',
    },
    LOGIN: {
      code: 'LOGIN',
      labelKey: 'enums.actionType.login',
      type: 'DangNhap',
      color: '#00FF00',
    },

    UPDATE: {
      code: 'UPDATE',
      labelKey: 'enums.actionType.update',
      type: 'CapNhat',
      color: '#FFFF00',
    },
    EDIT: {
      code: 'EDIT',
      labelKey: 'enums.actionType.edit',
      type: 'ChinhSua',
      color: '#FFA500',
    },

    DELETE: {
      code: 'DELETE',
      labelKey: 'enums.actionType.delete',
      type: 'XoaBo',
      color: '#FF0000',
    },
    REJECT: {
      code: 'REJECT',
      labelKey: 'enums.actionType.reject',
      type: 'TuChoi',
      color: '#FF0000',
    },
    CANCEL: {
      code: 'CANCEL',
      labelKey: 'enums.actionType.cancel',
      type: 'Huy',
      color: '#78716C',
    },
    DEACTIVATE: {
      code: 'DEACTIVATE',
      labelKey: 'enums.actionType.deactivate',
      type: 'NgungHoatDong',
      color: '#808080',
    },
    LOGOUT: {
      code: 'LOGOUT',
      labelKey: 'enums.actionType.logout',
      type: 'DangXuat',
      color: '#78716C',
    },

    SYNC: {
      code: 'SYNC',
      labelKey: 'enums.actionType.sync',
      type: 'DongBo',
      color: '#0000FF',
    },
    SEND_APPROVE: {
      code: 'SEND_APPROVE',
      labelKey: 'enums.actionType.sendApprove',
      type: 'GuiDuyet',
      color: '#00FFFF',
    },
    RESTORE: {
      code: 'RESTORE',
      labelKey: 'enums.actionType.restore',
      type: 'KhoiPhuc',
      color: '#00FFFF',
    },
    REGISTER: {
      code: 'REGISTER',
      labelKey: 'enums.actionType.register',
      type: 'DangKy',
      color: '#4B0082',
    },
    IMPORT_EXCEL: {
      code: 'IMPORT_EXCEL',
      labelKey: 'enums.actionType.importExcel',
      type: 'NhapExcel',
      color: '#800080',
    },
    UPLOAD_FILE: {
      code: 'UPLOAD_FILE',
      labelKey: 'enums.actionType.uploadFile',
      type: 'TaiFileLen',
      color: '#800080',
    },
    LOCK: {
      code: 'LOCK',
      labelKey: 'enums.actionType.lock',
      color: '#FF0000',
    },
    UNLOCK: {
      code: 'UNLOCK',
      labelKey: 'enums.actionType.unlock',
      color: '#00FF00',
    },
  },

  DAY_OF_WEEK: {
    SUNDAY: {
      code: 'SUNDAY',
      key: 'CN',
      labelKey: 'enums.daysOfWeek.sun',
      value: 0,
    },
    MONDAY: {
      code: 'MONDAY',
      key: 'T2',
      labelKey: 'enums.daysOfWeek.mon',
      value: 1,
    },
    TUESDAY: {
      code: 'TUESDAY',
      key: 'T3',
      labelKey: 'enums.daysOfWeek.tue',
      value: 2,
    },
    WEDNESDAY: {
      code: 'WEDNESDAY',
      key: 'T4',
      labelKey: 'enums.daysOfWeek.wed',
      value: 3,
    },
    THURSDAY: {
      code: 'THURSDAY',
      key: 'T5',
      labelKey: 'enums.daysOfWeek.thu',
      value: 4,
    },
    FRIDAY: {
      code: 'FRIDAY',
      key: 'T6',
      labelKey: 'enums.daysOfWeek.fri',
      value: 5,
    },
    SATURDAY: {
      code: 'SATURDAY',
      key: 'T7',
      labelKey: 'enums.daysOfWeek.sat',
      value: 6,
    },
  },

  DAYS_OF_WEEK: [
    { key: 'T2', code: 'MONDAY', labelKey: 'enums.daysOfWeek.mon', value: 1 },
    { key: 'T3', code: 'TUESDAY', labelKey: 'enums.daysOfWeek.tue', value: 2 },
    { key: 'T4', code: 'WEDNESDAY', labelKey: 'enums.daysOfWeek.wed', value: 3 },
    { key: 'T5', code: 'THURSDAY', labelKey: 'enums.daysOfWeek.thu', value: 4 },
    { key: 'T6', code: 'FRIDAY', labelKey: 'enums.daysOfWeek.fri', value: 5 },
    { key: 'T7', code: 'SATURDAY', labelKey: 'enums.daysOfWeek.sat', value: 6 },
    { key: 'CN', code: 'SUNDAY', labelKey: 'enums.daysOfWeek.sun', value: 0 },
  ],

  MONTH: {
    JANUARY: { code: 'JANUARY', labelKey: 'enums.month.january', value: 0 },
    FEBRUARY: { code: 'FEBRUARY', labelKey: 'enums.month.february', value: 1 },
    MARCH: { code: 'MARCH', labelKey: 'enums.month.march', value: 2 },
    APRIL: { code: 'APRIL', labelKey: 'enums.month.april', value: 3 },
    MAY: { code: 'MAY', labelKey: 'enums.month.may', value: 4 },
    JUNE: { code: 'JUNE', labelKey: 'enums.month.june', value: 5 },
    JULY: { code: 'JULY', labelKey: 'enums.month.july', value: 6 },
    AUGUST: { code: 'AUGUST', labelKey: 'enums.month.august', value: 7 },
    SEPTEMBER: { code: 'SEPTEMBER', labelKey: 'enums.month.september', value: 8 },
    OCTOBER: { code: 'OCTOBER', labelKey: 'enums.month.october', value: 9 },
    NOVEMBER: { code: 'NOVEMBER', labelKey: 'enums.month.november', value: 10 },
    DECEMBER: { code: 'DECEMBER', labelKey: 'enums.month.december', value: 11 },
  },

  EMPLOYEE_LEVEL: {
    INTERNSHIP: {
      code: 'INTERNSHIP',
      labelKey: 'enums.employeeLevel.internship',
      value: 'INTERNSHIP',
      color: '#8c8c8c',
    },
    FRESHER: {
      code: 'FRESHER',
      labelKey: 'enums.employeeLevel.fresher',
      value: 'FRESHER',
      color: '#52c41a',
    },
    JUNIOR: {
      code: 'JUNIOR',
      labelKey: 'enums.employeeLevel.junior',
      value: 'JUNIOR',
      color: '#1890ff',
    },
    MIDDLE: {
      code: 'MIDDLE',
      labelKey: 'enums.employeeLevel.middle',
      value: 'MIDDLE',
      color: '#faad14',
    },
    SENIOR: {
      code: 'SENIOR',
      labelKey: 'enums.employeeLevel.senior',
      value: 'SENIOR',
      color: '#f5222d',
    },
    LEADER: {
      code: 'LEADER',
      labelKey: 'enums.employeeLevel.leader',
      value: 'LEADER',
      color: '#722ed1',
    },
    MANAGER: {
      code: 'MANAGER',
      labelKey: 'enums.employeeLevel.manager',
      value: 'MANAGER',
      color: '#eb2f96',
    },
    DIRECTOR: {
      code: 'DIRECTOR',
      labelKey: 'enums.employeeLevel.director',
      value: 'DIRECTOR',
      color: '#13c2c2',
    },
    EXECUTIVE: {
      code: 'EXECUTIVE',
      labelKey: 'enums.employeeLevel.executive',
      value: 'EXECUTIVE',
      color: '#2f54eb',
    },
  },

  WORKING_MODE: {
    ON_SITE: {
      code: 'ON_SITE',
      labelKey: 'enums.workingMode.onSite',
      value: 'ON_SITE',
      color: '#1890ff',
    },
    REMOTE: {
      code: 'REMOTE',
      labelKey: 'enums.workingMode.remote',
      value: 'REMOTE',
      color: '#52c41a',
    },
    HYBRID: {
      code: 'HYBRID',
      labelKey: 'enums.workingMode.hybrid',
      value: 'HYBRID',
      color: '#faad14',
    },
    FLEXIBLE: {
      code: 'FLEXIBLE',
      labelKey: 'enums.workingMode.flexible',
      value: 'FLEXIBLE',
      color: '#722ed1',
    },
    BUSINESS_TRIP: {
      code: 'BUSINESS_TRIP',
      labelKey: 'enums.workingMode.businessTrip',
      value: 'BUSINESS_TRIP',
      color: '#13c2c2',
    },
  },

  CONTRACT_TYPE: {
    PROBATION: {
      code: 'PROBATION',
      labelKey: 'enums.contractType.probation',
      value: 'PROBATION',
      color: '#faad14',
    },
    INDEFINITE: {
      code: 'INDEFINITE',
      labelKey: 'enums.contractType.indefinite',
      value: 'INDEFINITE',
      color: '#52c41a',
    },
    DEFINITE: {
      code: 'DEFINITE',
      labelKey: 'enums.contractType.definite',
      value: 'DEFINITE',
      color: '#1890ff',
    },
    SEASONAL: {
      code: 'SEASONAL',
      labelKey: 'enums.contractType.seasonal',
      value: 'SEASONAL',
      color: '#fa8c16',
    },
    COLLABORATOR: {
      code: 'COLLABORATOR',
      labelKey: 'enums.contractType.collaborator',
      value: 'COLLABORATOR',
      color: '#722ed1',
    },
    INTERNSHIP: {
      code: 'INTERNSHIP',
      labelKey: 'enums.contractType.internship',
      value: 'INTERNSHIP',
      color: '#8c8c8c',
    },
  },

  WORK_STATUS: {
    WORKING: {
      code: 'WORKING',
      labelKey: 'enums.workStatus.working',
      value: 'WORKING',
      color: '#52c41a',
    },
    RESIGNED: {
      code: 'RESIGNED',
      labelKey: 'enums.workStatus.resigned',
      value: 'RESIGNED',
      color: '#f5222d',
    },
    ON_LEAVE: {
      code: 'ON_LEAVE',
      labelKey: 'enums.workStatus.onLeave',
      value: 'ON_LEAVE',
      color: '#faad14',
    },
    SUSPENDED: {
      code: 'SUSPENDED',
      labelKey: 'enums.workStatus.suspended',
      value: 'SUSPENDED',
      color: '#722ed1',
    },
    RETIRED: {
      code: 'RETIRED',
      labelKey: 'enums.workStatus.retired',
      value: 'RETIRED',
      color: '#8c8c8c',
    },
  },

  DAY_OFF_CONFIG_TYPE: {
    ANNUAL: {
      code: 'ANNUAL',
      labelKey: 'enums.dayOffConfigType.annual',
      value: 'ANNUAL',
      color: '#52c41a',
    },
    SICK: {
      code: 'SICK',
      labelKey: 'enums.dayOffConfigType.sick',
      value: 'SICK',
      color: '#faad14',
    },
    UNPAID: {
      code: 'UNPAID',
      labelKey: 'enums.dayOffConfigType.unpaid',
      value: 'UNPAID',
      color: '#722ed1',
    },
    MATERNITY: {
      code: 'MATERNITY',
      labelKey: 'enums.dayOffConfigType.maternity',
      value: 'MATERNITY',
      color: '#1890ff',
    },
    PATERNITY: {
      code: 'PATERNITY',
      labelKey: 'enums.dayOffConfigType.paternity',
      value: 'PATERNITY',
      color: '#13c2c2',
    },
    OTHER: {
      code: 'OTHER',
      labelKey: 'enums.dayOffConfigType.other',
      value: 'OTHER',
      color: '#8c8c8c',
    },
  },

  CONTRACT_STATUS: {
    DRAFT: {
      code: 'DRAFT',
      labelKey: 'enums.contractStatus.draft',
      value: 'DRAFT',
      color: '#8c8c8c',
    },
    PENDING_SIGN: {
      code: 'PENDING_SIGN',
      labelKey: 'enums.contractStatus.pendingSign',
      value: 'PENDING_SIGN',
      color: '#1890ff',
    },
    ACTIVE: {
      code: 'ACTIVE',
      labelKey: 'enums.contractStatus.active',
      value: 'ACTIVE',
      color: '#52c41a',
    },
    EXPIRING_SOON: {
      code: 'EXPIRING_SOON',
      labelKey: 'enums.contractStatus.expiringSoon',
      value: 'EXPIRING_SOON',
      color: '#faad14',
    },
    EXPIRED: {
      code: 'EXPIRED',
      labelKey: 'enums.contractStatus.expired',
      value: 'EXPIRED',
      color: '#f5222d',
    },
    TERMINATED: {
      code: 'TERMINATED',
      labelKey: 'enums.contractStatus.terminated',
      value: 'TERMINATED',
      color: '#cf1322',
    },
    LIQUIDATED: {
      code: 'LIQUIDATED',
      labelKey: 'enums.contractStatus.liquidated',
      value: 'LIQUIDATED',
      color: '#595959',
    },
  },

  REVIEW_RENEWAL_STATUS: {
    PENDING_REVIEW: {
      code: 'PENDING_REVIEW',
      labelKey: 'enums.reviewRenewalStatus.pendingReview',
      value: 'PENDING_REVIEW',
      color: '#faad14',
    },
    PENDING_APPROVAL: {
      code: 'PENDING_APPROVAL',
      labelKey: 'enums.reviewRenewalStatus.pendingApproval',
      value: 'PENDING_APPROVAL',
      color: '#1890ff',
    },
    APPROVED: {
      code: 'APPROVED',
      labelKey: 'enums.reviewRenewalStatus.approved',
      value: 'APPROVED',
      color: '#52c41a',
    },
    REJECTED: {
      code: 'REJECTED',
      labelKey: 'enums.reviewRenewalStatus.rejected',
      value: 'REJECTED',
      color: '#f5222d',
    },
    APPLIED: {
      code: 'APPLIED',
      labelKey: 'enums.reviewRenewalStatus.applied',
      value: 'APPLIED',
      color: '#13c2c2',
    },
  },

  REVIEW_RECOMMENDATION: {
    RENEW: {
      code: 'RENEW',
      labelKey: 'enums.reviewRecommendation.renew',
      value: 'RENEW',
      color: '#52c41a',
    },
    CONVERT: {
      code: 'CONVERT',
      labelKey: 'enums.reviewRecommendation.convert',
      value: 'CONVERT',
      color: '#1890ff',
    },
    INCREASE_SALARY: {
      code: 'INCREASE_SALARY',
      labelKey: 'enums.reviewRecommendation.increaseSalary',
      value: 'INCREASE_SALARY',
      color: '#722ed1',
    },
    TERMINATE: {
      code: 'TERMINATE',
      labelKey: 'enums.reviewRecommendation.terminate',
      value: 'TERMINATE',
      color: '#f5222d',
    },
    NO_CHANGE: {
      code: 'NO_CHANGE',
      labelKey: 'enums.reviewRecommendation.noChange',
      value: 'NO_CHANGE',
      color: '#8c8c8c',
    },
  },

  TRANSFER_STATUS: {
    PENDING: {
      code: 'PENDING',
      labelKey: 'enums.transferStatus.pending',
      value: 'PENDING',
      color: '#faad14',
    },
    APPROVED: {
      code: 'APPROVED',
      labelKey: 'enums.transferStatus.approved',
      value: 'APPROVED',
      color: '#52c41a',
    },
    REJECTED: {
      code: 'REJECTED',
      labelKey: 'enums.transferStatus.rejected',
      value: 'REJECTED',
      color: '#f5222d',
    },
    CANCELLED: {
      code: 'CANCELLED',
      labelKey: 'enums.transferStatus.cancelled',
      value: 'CANCELLED',
      color: '#8c8c8c',
    },
    APPLIED: {
      code: 'APPLIED',
      labelKey: 'enums.transferStatus.applied',
      value: 'APPLIED',
      color: '#13c2c2',
    },
  },

  TRANSFER_TYPE: {
    INTERNAL_TRANSFER: {
      code: 'INTERNAL_TRANSFER',
      labelKey: 'enums.transferType.internalTransfer',
      value: 'INTERNAL_TRANSFER',
      color: '#1890ff',
    },
    SECONDMENT: {
      code: 'SECONDMENT',
      labelKey: 'enums.transferType.secondment',
      value: 'SECONDMENT',
      color: '#722ed1',
    },
    ROTATION: {
      code: 'ROTATION',
      labelKey: 'enums.transferType.rotation',
      value: 'ROTATION',
      color: '#13c2c2',
    },
    COMPANY_TRANSFER: {
      code: 'COMPANY_TRANSFER',
      labelKey: 'enums.transferType.companyTransfer',
      value: 'COMPANY_TRANSFER',
      color: '#2f54eb',
    },
    BRANCH_TRANSFER: {
      code: 'BRANCH_TRANSFER',
      labelKey: 'enums.transferType.branchTransfer',
      value: 'BRANCH_TRANSFER',
      color: '#597ef7',
    },
    PROMOTION: {
      code: 'PROMOTION',
      labelKey: 'enums.transferType.promotion',
      value: 'PROMOTION',
      color: '#52c41a',
    },
    DEMOTION: {
      code: 'DEMOTION',
      labelKey: 'enums.transferType.demotion',
      value: 'DEMOTION',
      color: '#fa8c16',
    },
    DISMISSAL: {
      code: 'DISMISSAL',
      labelKey: 'enums.transferType.dismissal',
      value: 'DISMISSAL',
      color: '#f5222d',
    },
  },

  ATTENDANCE_STATUS: {
    ON_TIME: {
      code: 'ON_TIME',
      labelKey: 'enums.attendanceStatus.onTime',
      value: 'ON_TIME',
      color: '#52c41a',
    },
    LATE: {
      code: 'LATE',
      labelKey: 'enums.attendanceStatus.late',
      value: 'LATE',
      color: '#faad14',
    },
    EARLY: {
      code: 'EARLY',
      labelKey: 'enums.attendanceStatus.early',
      value: 'EARLY',
      color: '#13c2c2',
    },
    LEAVE: {
      code: 'LEAVE',
      labelKey: 'enums.attendanceStatus.leave',
      value: 'LEAVE',
      color: '#1890ff',
    },
    ABSENT: {
      code: 'ABSENT',
      labelKey: 'enums.attendanceStatus.absent',
      value: 'ABSENT',
      color: '#f5222d',
    },
    INCOMPLETE: {
      code: 'INCOMPLETE',
      labelKey: 'enums.attendanceStatus.incomplete',
      value: 'INCOMPLETE',
      color: '#8c8c8c',
    },
  },

  DAY_OFF_STATUS: {
    PENDING: {
      code: 'PENDING',
      labelKey: 'enums.dayOffStatus.pending',
      value: 'PENDING',
      color: '#faad14',
    },
    APPROVED: {
      code: 'APPROVED',
      labelKey: 'enums.dayOffStatus.approved',
      value: 'APPROVED',
      color: '#52c41a',
    },
    REJECTED: {
      code: 'REJECTED',
      labelKey: 'enums.dayOffStatus.rejected',
      value: 'REJECTED',
      color: '#f5222d',
    },
    CANCELLED: {
      code: 'CANCELLED',
      labelKey: 'enums.dayOffStatus.cancelled',
      value: 'CANCELLED',
      color: '#8c8c8c',
    },
  },
};
