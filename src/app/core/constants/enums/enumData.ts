export const enumData = {
  PAGE: {
    PAGE_INDEX: 1,
    PAGE_SIZE: 10,
    PAGE_SIZE_MAX: 1000000,
    LST_PAGE_SIZE: [10, 20, 50, 100],
    TOTAL: 0,
    SORT_ORDER: {
      ASC: 'asc',
      DESC: 'desc',
    },

    SORT_FIELD: {
      CREATED_AT: 'createdAt',
      UPDATED_AT: 'updatedAt',
      NAME: 'name',
      CODE: 'code',
      ACTIVATE_STATUS: 'activateStatus',
      IS_DELETED: 'isDeleted',
      STATUS_LABEL: 'statusLabel',
      STATUS: 'status',
      YEAR: 'year',
      REMAINING_DAYS: 'remainingDays',
      WORK_DATE: 'workDate',
      REQUEST_DATE: 'requestDate',
      DISPLAY_ORDER: 'displayOrder',
      SLIP_DATE: 'slipDate',
      USERNAME: 'username',
    },
  },

  maxSizeUpload: 5 * 1024 * 1024,

  STATUS_FILTER_IS_DELETED: {
    ACTIVE: { code: 'ACTIVE', labelKey: 'enums.statusFilter.active', value: false },
    INACTIVE: { code: 'INACTIVE', labelKey: 'enums.statusFilter.inactive', value: true },
    ALL: { code: 'ALL', labelKey: 'enums.statusFilter.all', value: null },
  },

  STATUS_FILTER_IS_ACTIVE: {
    ACTIVE: { code: 'ACTIVE', labelKey: 'enums.statusFilter.active', value: true },
    INACTIVE: { code: 'INACTIVE', labelKey: 'enums.statusFilter.inactive', value: false },
    ALL: { code: 'ALL', labelKey: 'enums.statusFilter.all', value: null },
  },

  YES_NO_FILTER: {
    YES: { code: 'YES', labelKey: 'enums.yesNoFilter.yes', value: true },
    NO: { code: 'NO', labelKey: 'enums.yesNoFilter.no', value: false },
    ALL: { code: 'ALL', labelKey: 'enums.yesNoFilter.all', value: null },
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

  WORK_STATUS: {
    WORKING: {
      code: 'WORKING',
      labelKey: 'enums.workStatus.working',
      value: 'WORKING',
      color: '#52c41a',
    },
    PROBATION: {
      code: 'PROBATION',
      labelKey: 'enums.workStatus.probation',
      value: 'PROBATION',
      color: '#1890ff',
    },
    OFFICIAL: {
      code: 'OFFICIAL',
      labelKey: 'enums.workStatus.official',
      value: 'OFFICIAL',
      color: '#13c2c2',
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
    RESIGNED: {
      code: 'RESIGNED',
      labelKey: 'enums.workStatus.resigned',
      value: 'RESIGNED',
      color: '#f5222d',
    },
    RETIRED: {
      code: 'RETIRED',
      labelKey: 'enums.workStatus.retired',
      value: 'RETIRED',
      color: '#8c8c8c',
    },
  },

  PAYMENT_METHOD: {
    BANK_TRANSFER: {
      code: 'BANK_TRANSFER',
      labelKey: 'enums.paymentMethod.bankTransfer',
      value: 'BANK_TRANSFER',
      color: '#1890ff',
    },
    CASH: {
      code: 'CASH',
      labelKey: 'enums.paymentMethod.cash',
      value: 'CASH',
      color: '#52c41a',
    },
    OTHER: {
      code: 'OTHER',
      labelKey: 'enums.paymentMethod.other',
      value: 'OTHER',
      color: '#8c8c8c',
    },
  },

  CURRENCY: {
    VND: {
      code: 'VND',
      labelKey: 'enums.currency.vnd',
      value: 'VND',
      color: '#1890ff',
    },
    USD: {
      code: 'USD',
      labelKey: 'enums.currency.usd',
      value: 'USD',
      color: '#52c41a',
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

  SALARY_STATUS: {
    DRAFT: {
      code: 'DRAFT',
      labelKey: 'enums.salaryStatus.draft',
      value: 'DRAFT',
      color: '#8c8c8c',
    },
    PROCESSING: {
      code: 'PROCESSING',
      labelKey: 'enums.salaryStatus.processing',
      value: 'PROCESSING',
      color: '#1890ff',
    },
    APPROVED: {
      code: 'APPROVED',
      labelKey: 'enums.salaryStatus.approved',
      value: 'APPROVED',
      color: '#52c41a',
    },
    PAID: {
      code: 'PAID',
      labelKey: 'enums.salaryStatus.paid',
      value: 'PAID',
      color: '#13c2c2',
    },
    CANCELLED: {
      code: 'CANCELLED',
      labelKey: 'enums.salaryStatus.cancelled',
      value: 'CANCELLED',
      color: '#f5222d',
    },
  },

  SLIP_STATUS: {
    DRAFT: {
      code: 'DRAFT',
      labelKey: 'enums.slipStatus.draft',
      value: 'DRAFT',
      color: '#8c8c8c',
    },
    PENDING: {
      code: 'PENDING',
      labelKey: 'enums.slipStatus.pending',
      value: 'PENDING',
      color: '#faad14',
    },
    APPROVED: {
      code: 'APPROVED',
      labelKey: 'enums.slipStatus.approved',
      value: 'APPROVED',
      color: '#52c41a',
    },
    APPLIED: {
      code: 'APPLIED',
      labelKey: 'enums.slipStatus.applied',
      value: 'APPLIED',
      color: '#13c2c2',
    },
    REJECTED: {
      code: 'REJECTED',
      labelKey: 'enums.slipStatus.rejected',
      value: 'REJECTED',
      color: '#f5222d',
    },
    CANCELLED: {
      code: 'CANCELLED',
      labelKey: 'enums.slipStatus.cancelled',
      value: 'CANCELLED',
      color: '#bfbfbf',
    },
  },

  SLIP_KIND: {
    DEDUCTION: {
      code: 'DEDUCTION',
      labelKey: 'enums.slipKind.deduction',
      value: 'DEDUCTION',
      color: '#f5222d',
    },
    ADDITION: {
      code: 'ADDITION',
      labelKey: 'enums.slipKind.addition',
      value: 'ADDITION',
      color: '#52c41a',
    },
  },

  SALARY_ITEM_TYPE: {
    INCOME: {
      code: 'INCOME',
      labelKey: 'enums.salaryItemType.income',
      value: 'INCOME',
      color: '#52c41a',
    },
    DEDUCTION: {
      code: 'DEDUCTION',
      labelKey: 'enums.salaryItemType.deduction',
      value: 'DEDUCTION',
      color: '#f5222d',
    },
  },

  DEDUCTION_SLIP_TYPE: {
    FINE: {
      code: 'FINE',
      labelKey: 'enums.deductionSlipType.fine',
      value: 'FINE',
    },
    COMPENSATION: {
      code: 'COMPENSATION',
      labelKey: 'enums.deductionSlipType.compensation',
      value: 'COMPENSATION',
    },
    OTHER: {
      code: 'OTHER',
      labelKey: 'enums.deductionSlipType.other',
      value: 'OTHER',
    },
  },

  ADDITION_SLIP_TYPE: {
    BONUS: {
      code: 'BONUS',
      labelKey: 'enums.additionSlipType.bonus',
      value: 'BONUS',
    },
    SUPPORT: {
      code: 'SUPPORT',
      labelKey: 'enums.additionSlipType.support',
      value: 'SUPPORT',
    },
    OTHER: {
      code: 'OTHER',
      labelKey: 'enums.additionSlipType.other',
      value: 'OTHER',
    },
  },

  PUNCH_TYPE: {
    IN: { code: 'IN', labelKey: 'enums.punchType.in', value: 'IN' },
    OUT: { code: 'OUT', labelKey: 'enums.punchType.out', value: 'OUT' },
    CHECKIN: { code: 'CHECKIN', labelKey: 'enums.punchType.checkIn', value: 'CHECKIN' },
    CHECKOUT: { code: 'CHECKOUT', labelKey: 'enums.punchType.checkOut', value: 'CHECKOUT' },
  },

  LEAVE_CALENDAR_EVENT_TYPE: {
    LEAVE: { code: 'LEAVE', labelKey: 'enums.leaveCalendarEventType.leave', value: 'LEAVE' },
    HOLIDAY: {
      code: 'HOLIDAY',
      labelKey: 'enums.leaveCalendarEventType.holiday',
      value: 'HOLIDAY',
    },
  },

  ATTENDANCE_SCHEDULE_SOURCE: {
    DAY_OVERRIDE: {
      code: 'DAY_OVERRIDE',
      labelKey: 'enums.attendanceScheduleSource.dayOverride',
      value: 'DAY_OVERRIDE',
    },
    WORK_PATTERN: {
      code: 'WORK_PATTERN',
      labelKey: 'enums.attendanceScheduleSource.workPattern',
      value: 'WORK_PATTERN',
    },
    POSITION: {
      code: 'POSITION',
      labelKey: 'enums.attendanceScheduleSource.position',
      value: 'POSITION',
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

  LEAVE_SESSION: {
    FULL: {
      code: 'FULL',
      labelKey: 'enums.leaveSession.full',
      value: 'FULL',
    },
    AM: {
      code: 'AM',
      labelKey: 'enums.leaveSession.am',
      value: 'AM',
    },
    PM: {
      code: 'PM',
      labelKey: 'enums.leaveSession.pm',
      value: 'PM',
    },
  },

  LEAVE_STATUS: {
    NEW: {
      code: 'NEW',
      labelKey: 'enums.leaveStatus.new',
      value: 'NEW',
      color: '#faad14',
    },
    AWAITING_APPROVAL: {
      code: 'AWAITING_APPROVAL',
      labelKey: 'enums.leaveStatus.awaitingApproval',
      value: 'AWAITING_APPROVAL',
      color: '#1890ff',
    },
    APPROVED: {
      code: 'APPROVED',
      labelKey: 'enums.leaveStatus.approved',
      value: 'APPROVED',
      color: '#52c41a',
    },
    REJECTED: {
      code: 'REJECTED',
      labelKey: 'enums.leaveStatus.rejected',
      value: 'REJECTED',
      color: '#f5222d',
    },
    CANCELLED: {
      code: 'CANCELLED',
      labelKey: 'enums.leaveStatus.cancelled',
      value: 'CANCELLED',
      color: '#8c8c8c',
    },
  },

  ATTENDANCE_COMPLAINT_STATUS: {
    PENDING: {
      code: 'PENDING',
      labelKey: 'enums.attendanceComplaintStatus.pending',
      value: 'PENDING',
      color: '#faad14',
    },
    APPROVED: {
      code: 'APPROVED',
      labelKey: 'enums.attendanceComplaintStatus.approved',
      value: 'APPROVED',
      color: '#52c41a',
    },
    REJECTED: {
      code: 'REJECTED',
      labelKey: 'enums.attendanceComplaintStatus.rejected',
      value: 'REJECTED',
      color: '#f5222d',
    },
    CANCELLED: {
      code: 'CANCELLED',
      labelKey: 'enums.attendanceComplaintStatus.cancelled',
      value: 'CANCELLED',
      color: '#8c8c8c',
    },
  },

  ATTENDANCE_COMPLAINT_TYPE: {
    FORGOT_CHECK_IN: {
      code: 'FORGOT_CHECK_IN',
      labelKey: 'enums.attendanceComplaintType.forgotCheckIn',
      value: 'FORGOT_CHECK_IN',
    },
    FORGOT_CHECK_OUT: {
      code: 'FORGOT_CHECK_OUT',
      labelKey: 'enums.attendanceComplaintType.forgotCheckOut',
      value: 'FORGOT_CHECK_OUT',
    },
    FORGOT_BOTH: {
      code: 'FORGOT_BOTH',
      labelKey: 'enums.attendanceComplaintType.forgotBoth',
      value: 'FORGOT_BOTH',
    },
    WRONG_TIME: {
      code: 'WRONG_TIME',
      labelKey: 'enums.attendanceComplaintType.wrongTime',
      value: 'WRONG_TIME',
    },
    OTHER: {
      code: 'OTHER',
      labelKey: 'enums.attendanceComplaintType.other',
      value: 'OTHER',
    },
  },

  OVERTIME_REQUEST_STATUS: {
    DRAFT: {
      code: 'DRAFT',
      labelKey: 'enums.overtimeRequestStatus.draft',
      value: 'DRAFT',
      color: '#8c8c8c',
    },
    SUBMITTED: {
      code: 'SUBMITTED',
      labelKey: 'enums.overtimeRequestStatus.submitted',
      value: 'SUBMITTED',
      color: '#faad14',
    },
    APPROVED: {
      code: 'APPROVED',
      labelKey: 'enums.overtimeRequestStatus.approved',
      value: 'APPROVED',
      color: '#52c41a',
    },
    REJECTED: {
      code: 'REJECTED',
      labelKey: 'enums.overtimeRequestStatus.rejected',
      value: 'REJECTED',
      color: '#f5222d',
    },
    CANCELLED: {
      code: 'CANCELLED',
      labelKey: 'enums.overtimeRequestStatus.cancelled',
      value: 'CANCELLED',
      color: '#8c8c8c',
    },
  },

  OVERTIME_TYPE: {
    AFTER_SHIFT: {
      code: 'AFTER_SHIFT',
      labelKey: 'enums.overtimeType.afterShift',
      value: 'AFTER_SHIFT',
    },
    DAY_OFF: {
      code: 'DAY_OFF',
      labelKey: 'enums.overtimeType.dayOff',
      value: 'DAY_OFF',
    },
    HOLIDAY: {
      code: 'HOLIDAY',
      labelKey: 'enums.overtimeType.holiday',
      value: 'HOLIDAY',
    },
  },

  DATA_SCOPE: {
    ALL: {
      code: 'ALL',
      labelKey: 'enums.dataScope.all',
      value: 'ALL',
    },
    COMPANY: {
      code: 'COMPANY',
      labelKey: 'enums.dataScope.company',
      value: 'COMPANY',
    },
    BRANCH: {
      code: 'BRANCH',
      labelKey: 'enums.dataScope.branch',
      value: 'BRANCH',
    },
    DEPARTMENT: {
      code: 'DEPARTMENT',
      labelKey: 'enums.dataScope.department',
      value: 'DEPARTMENT',
    },
    PART: {
      code: 'PART',
      labelKey: 'enums.dataScope.part',
      value: 'PART',
    },
    OWN: {
      code: 'OWN',
      labelKey: 'enums.dataScope.own',
      value: 'OWN',
    },
  },

  USER_TYPE: {
    ADMIN: { code: 'ADMIN', labelKey: 'enums.userType.admin', value: 'ADMIN' },
    HR: { code: 'HR', labelKey: 'enums.userType.hr', value: 'HR' },
    MANAGER: { code: 'MANAGER', labelKey: 'enums.userType.manager', value: 'MANAGER' },
    EMPLOYEE: { code: 'EMPLOYEE', labelKey: 'enums.userType.employee', value: 'EMPLOYEE' },
  },

  RECRUITMENT_REQUEST_STATUS: {
    DRAFT: { code: 'DRAFT', labelKey: 'enums.recruitmentRequestStatus.draft', value: 'DRAFT' },
    PENDING: {
      code: 'PENDING',
      labelKey: 'enums.recruitmentRequestStatus.pending',
      value: 'PENDING',
    },
    APPROVED: {
      code: 'APPROVED',
      labelKey: 'enums.recruitmentRequestStatus.approved',
      value: 'APPROVED',
    },
    REJECTED: {
      code: 'REJECTED',
      labelKey: 'enums.recruitmentRequestStatus.rejected',
      value: 'REJECTED',
    },
    CLOSED: { code: 'CLOSED', labelKey: 'enums.recruitmentRequestStatus.closed', value: 'CLOSED' },
  },

  RECRUITMENT_REQUEST_LEVEL: {
    COMPANY: {
      code: 'COMPANY',
      labelKey: 'enums.recruitmentRequestLevel.company',
      value: 'COMPANY',
    },
    BRANCH: { code: 'BRANCH', labelKey: 'enums.recruitmentRequestLevel.branch', value: 'BRANCH' },
    DEPARTMENT: {
      code: 'DEPARTMENT',
      labelKey: 'enums.recruitmentRequestLevel.department',
      value: 'DEPARTMENT',
    },
    PART: { code: 'PART', labelKey: 'enums.recruitmentRequestLevel.part', value: 'PART' },
  },

  HIRING_PLAN_STATUS: {
    DRAFT: { code: 'DRAFT', labelKey: 'enums.hiringPlanStatus.draft', value: 'DRAFT' },
    OPEN: { code: 'OPEN', labelKey: 'enums.hiringPlanStatus.open', value: 'OPEN' },
    CLOSED: { code: 'CLOSED', labelKey: 'enums.hiringPlanStatus.closed', value: 'CLOSED' },
    CANCELLED: {
      code: 'CANCELLED',
      labelKey: 'enums.hiringPlanStatus.cancelled',
      value: 'CANCELLED',
    },
  },

  CANDIDATE_STATUS: {
    NEW: { code: 'NEW', labelKey: 'enums.candidateStatus.new', value: 'NEW' },
    SCREENING: {
      code: 'SCREENING',
      labelKey: 'enums.candidateStatus.screening',
      value: 'SCREENING',
    },
    INTERVIEW: {
      code: 'INTERVIEW',
      labelKey: 'enums.candidateStatus.interview',
      value: 'INTERVIEW',
    },
    WAITLIST: { code: 'WAITLIST', labelKey: 'enums.candidateStatus.waitlist', value: 'WAITLIST' },
    OFFER: { code: 'OFFER', labelKey: 'enums.candidateStatus.offer', value: 'OFFER' },
    HIRED: { code: 'HIRED', labelKey: 'enums.candidateStatus.hired', value: 'HIRED' },
    REJECTED: { code: 'REJECTED', labelKey: 'enums.candidateStatus.rejected', value: 'REJECTED' },
    WITHDRAWN: {
      code: 'WITHDRAWN',
      labelKey: 'enums.candidateStatus.withdrawn',
      value: 'WITHDRAWN',
    },
  },

  INTERVIEW_STATUS: {
    SCHEDULED: {
      code: 'SCHEDULED',
      labelKey: 'enums.interviewStatus.scheduled',
      value: 'SCHEDULED',
    },
    COMPLETED: {
      code: 'COMPLETED',
      labelKey: 'enums.interviewStatus.completed',
      value: 'COMPLETED',
    },
    CANCELLED: {
      code: 'CANCELLED',
      labelKey: 'enums.interviewStatus.cancelled',
      value: 'CANCELLED',
    },
    NO_SHOW: { code: 'NO_SHOW', labelKey: 'enums.interviewStatus.noShow', value: 'NO_SHOW' },
  },

  HIRING_SOURCE_CHANNEL: {
    REFERRAL: {
      code: 'REFERRAL',
      labelKey: 'enums.hiringSourceChannel.referral',
      value: 'REFERRAL',
    },
    EMAIL: { code: 'EMAIL', labelKey: 'enums.hiringSourceChannel.email', value: 'EMAIL' },
    CAREERS_SITE: {
      code: 'CAREERS_SITE',
      labelKey: 'enums.hiringSourceChannel.careersSite',
      value: 'CAREERS_SITE',
    },
    JOBBOARD: {
      code: 'JOBBOARD',
      labelKey: 'enums.hiringSourceChannel.jobboard',
      value: 'JOBBOARD',
    },
    SOCIAL: { code: 'SOCIAL', labelKey: 'enums.hiringSourceChannel.social', value: 'SOCIAL' },
    AGENCY: { code: 'AGENCY', labelKey: 'enums.hiringSourceChannel.agency', value: 'AGENCY' },
    WALK_IN: { code: 'WALK_IN', labelKey: 'enums.hiringSourceChannel.walkIn', value: 'WALK_IN' },
    OTHER: { code: 'OTHER', labelKey: 'enums.hiringSourceChannel.other', value: 'OTHER' },
  },

  VIOLATION_SEVERITY: {
    LOW: { code: 'LOW', labelKey: 'enums.violationSeverity.low', value: 'LOW' },
    MEDIUM: { code: 'MEDIUM', labelKey: 'enums.violationSeverity.medium', value: 'MEDIUM' },
    HIGH: { code: 'HIGH', labelKey: 'enums.violationSeverity.high', value: 'HIGH' },
    CRITICAL: {
      code: 'CRITICAL',
      labelKey: 'enums.violationSeverity.critical',
      value: 'CRITICAL',
    },
  },

  VIOLATION_STATUS: {
    DRAFT: {
      code: 'DRAFT',
      labelKey: 'enums.violationStatus.draft',
      value: 'DRAFT',
      color: '#8c8c8c',
    },
    CONFIRMED: {
      code: 'CONFIRMED',
      labelKey: 'enums.violationStatus.confirmed',
      value: 'CONFIRMED',
      color: '#52c41a',
    },
    CANCELLED: {
      code: 'CANCELLED',
      labelKey: 'enums.violationStatus.cancelled',
      value: 'CANCELLED',
      color: '#f5222d',
    },
  },

  PENALTY_TYPE: {
    WARNING: { code: 'WARNING', labelKey: 'enums.penaltyType.warning', value: 'WARNING' },
    WRITTEN_WARNING: {
      code: 'WRITTEN_WARNING',
      labelKey: 'enums.penaltyType.writtenWarning',
      value: 'WRITTEN_WARNING',
    },
    FINE: { code: 'FINE', labelKey: 'enums.penaltyType.fine', value: 'FINE' },
    SUSPENSION: {
      code: 'SUSPENSION',
      labelKey: 'enums.penaltyType.suspension',
      value: 'SUSPENSION',
    },
    TERMINATION: {
      code: 'TERMINATION',
      labelKey: 'enums.penaltyType.termination',
      value: 'TERMINATION',
    },
    NONE: { code: 'NONE', labelKey: 'enums.penaltyType.none', value: 'NONE' },
  },

  REVIEW_CYCLE_STATUS: {
    DRAFT: { code: 'DRAFT', labelKey: 'enums.reviewCycleStatus.draft', value: 'DRAFT' },
    OPEN: { code: 'OPEN', labelKey: 'enums.reviewCycleStatus.open', value: 'OPEN' },
    CLOSED: { code: 'CLOSED', labelKey: 'enums.reviewCycleStatus.closed', value: 'CLOSED' },
  },

  TRAINING_COURSE_STATUS: {
    DRAFT: { code: 'DRAFT', labelKey: 'enums.trainingCourseStatus.draft', value: 'DRAFT' },
    OPEN: { code: 'OPEN', labelKey: 'enums.trainingCourseStatus.open', value: 'OPEN' },
    CLOSED: { code: 'CLOSED', labelKey: 'enums.trainingCourseStatus.closed', value: 'CLOSED' },
  },

  TRAINING_ENROLLMENT_STATUS: {
    ENROLLED: {
      code: 'ENROLLED',
      labelKey: 'enums.trainingEnrollmentStatus.enrolled',
      value: 'ENROLLED',
    },
    COMPLETED: {
      code: 'COMPLETED',
      labelKey: 'enums.trainingEnrollmentStatus.completed',
      value: 'COMPLETED',
    },
    DROPPED: {
      code: 'DROPPED',
      labelKey: 'enums.trainingEnrollmentStatus.dropped',
      value: 'DROPPED',
    },
  },

  PERFORMANCE_360_REVIEWER_TYPE: {
    SELF: { code: 'SELF', labelKey: 'enums.performance360ReviewerType.self', value: 'SELF' },
    PEER: { code: 'PEER', labelKey: 'enums.performance360ReviewerType.peer', value: 'PEER' },
    MANAGER: {
      code: 'MANAGER',
      labelKey: 'enums.performance360ReviewerType.manager',
      value: 'MANAGER',
    },
  },

  PERFORMANCE_360_STATUS: {
    DRAFT: { code: 'DRAFT', labelKey: 'enums.performance360Status.draft', value: 'DRAFT' },
    SUBMITTED: {
      code: 'SUBMITTED',
      labelKey: 'enums.performance360Status.submitted',
      value: 'SUBMITTED',
    },
  },

  TRAINING_QUIZ_OPTION: {
    A: { code: 'A', labelKey: 'enums.trainingQuizOption.a', value: 'A' },
    B: { code: 'B', labelKey: 'enums.trainingQuizOption.b', value: 'B' },
    C: { code: 'C', labelKey: 'enums.trainingQuizOption.c', value: 'C' },
    D: { code: 'D', labelKey: 'enums.trainingQuizOption.d', value: 'D' },
  },

  ASSET_STATUS: {
    AVAILABLE: {
      code: 'AVAILABLE',
      labelKey: 'enums.assetStatus.available',
      value: 'AVAILABLE',
      color: '#52c41a',
    },
    ASSIGNED: {
      code: 'ASSIGNED',
      labelKey: 'enums.assetStatus.assigned',
      value: 'ASSIGNED',
      color: '#1890ff',
    },
    MAINTENANCE: {
      code: 'MAINTENANCE',
      labelKey: 'enums.assetStatus.maintenance',
      value: 'MAINTENANCE',
      color: '#faad14',
    },
    RETIRED: {
      code: 'RETIRED',
      labelKey: 'enums.assetStatus.retired',
      value: 'RETIRED',
      color: '#f5222d',
    },
    LOST: {
      code: 'LOST',
      labelKey: 'enums.assetStatus.lost',
      value: 'LOST',
      color: '#ff4d4f',
    },
    DISPOSED: {
      code: 'DISPOSED',
      labelKey: 'enums.assetStatus.disposed',
      value: 'DISPOSED',
      color: '#8c8c8c',
    },
  },

  ASSET_TICKET_TYPE: {
    ISSUE: { code: 'ISSUE', labelKey: 'enums.assetTicketType.issue', value: 'ISSUE' },
    RETURN: { code: 'RETURN', labelKey: 'enums.assetTicketType.return', value: 'RETURN' },
    REPAIR: { code: 'REPAIR', labelKey: 'enums.assetTicketType.repair', value: 'REPAIR' },
    TRANSFER: { code: 'TRANSFER', labelKey: 'enums.assetTicketType.transfer', value: 'TRANSFER' },
  },

  ASSET_TICKET_STATUS: {
    DRAFT: {
      code: 'DRAFT',
      labelKey: 'enums.assetTicketStatus.draft',
      value: 'DRAFT',
      color: '#faad14',
    },
    DONE: {
      code: 'DONE',
      labelKey: 'enums.assetTicketStatus.done',
      value: 'DONE',
      color: '#52c41a',
    },
    CANCELLED: {
      code: 'CANCELLED',
      labelKey: 'enums.assetTicketStatus.cancelled',
      value: 'CANCELLED',
      color: '#f5222d',
    },
    // Backwards compatibility aliases
    NEW: {
      code: 'DRAFT',
      labelKey: 'enums.assetTicketStatus.draft',
      value: 'DRAFT',
      color: '#faad14',
    },
    COMPLETED: {
      code: 'DONE',
      labelKey: 'enums.assetTicketStatus.done',
      value: 'DONE',
      color: '#52c41a',
    },
  },

  WORKFLOW_ENTITY_TYPE: {
    LEAVE: { code: 'LEAVE', labelKey: 'enums.workflowEntityType.leave', value: 'LEAVE' },
    OT: { code: 'OT', labelKey: 'enums.workflowEntityType.ot', value: 'OT' },
    TRANSFER: {
      code: 'TRANSFER',
      labelKey: 'enums.workflowEntityType.transfer',
      value: 'TRANSFER',
    },
    DISCIPLINE: {
      code: 'DISCIPLINE',
      labelKey: 'enums.workflowEntityType.discipline',
      value: 'DISCIPLINE',
    },
    RECRUITMENT_REQUEST: {
      code: 'RECRUITMENT_REQUEST',
      labelKey: 'enums.workflowEntityType.recruitmentRequest',
      value: 'RECRUITMENT_REQUEST',
    },
    COMPLAINT: {
      code: 'COMPLAINT',
      labelKey: 'enums.workflowEntityType.complaint',
      value: 'COMPLAINT',
    },
  },

  WORKFLOW_APPROVER_RESOLVER: {
    MANAGER: {
      code: 'MANAGER',
      labelKey: 'enums.workflowApproverResolver.manager',
      value: 'MANAGER',
    },
    HR: { code: 'HR', labelKey: 'enums.workflowApproverResolver.hr', value: 'HR' },
    ROLE: { code: 'ROLE', labelKey: 'enums.workflowApproverResolver.role', value: 'ROLE' },
  },

  WORKFLOW_INSTANCE_STATUS: {
    RUNNING: {
      code: 'RUNNING',
      labelKey: 'enums.workflowInstanceStatus.running',
      value: 'RUNNING',
    },
    APPROVED: {
      code: 'APPROVED',
      labelKey: 'enums.workflowInstanceStatus.approved',
      value: 'APPROVED',
    },
    REJECTED: {
      code: 'REJECTED',
      labelKey: 'enums.workflowInstanceStatus.rejected',
      value: 'REJECTED',
    },
    CANCELLED: {
      code: 'CANCELLED',
      labelKey: 'enums.workflowInstanceStatus.cancelled',
      value: 'CANCELLED',
    },
  },
};
