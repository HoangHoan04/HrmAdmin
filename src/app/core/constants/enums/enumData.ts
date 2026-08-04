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
    MALE: { code: 'MALE', labelKey: 'enums.gender.male' },
    FEMALE: { code: 'FEMALE', labelKey: 'enums.gender.female' },
    OTHER: { code: 'OTHER', labelKey: 'enums.gender.other' },
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
};
