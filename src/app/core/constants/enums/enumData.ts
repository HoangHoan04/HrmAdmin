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

  DAYS_OF_WEEK: [
    { key: 'T2', labelKey: 'enums.daysOfWeek.mon' },
    { key: 'T3', labelKey: 'enums.daysOfWeek.tue' },
    { key: 'T4', labelKey: 'enums.daysOfWeek.wed' },
    { key: 'T5', labelKey: 'enums.daysOfWeek.thu' },
    { key: 'T6', labelKey: 'enums.daysOfWeek.fri' },
    { key: 'T7', labelKey: 'enums.daysOfWeek.sat' },
    { key: 'CN', labelKey: 'enums.daysOfWeek.sun' },
  ],

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
};
