import { TemplateRef } from '@angular/core';

export interface TableColumn<T = any> {
  field: string;
  header: string;
  width?: string | number;
  body?: TemplateRef<any>;
  sortable?: boolean;
  filter?: boolean;
  filterPlaceholder?: string;
  filterMatchMode?: string;
  style?: Record<string, any>;
  headerStyle?: Record<string, any>;
  bodyStyle?: Record<string, any>;
  frozen?: boolean;
  alignFrozen?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
  resizable?: boolean;
  type?:
    'text' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean' | 'badge' | 'tag' | 'image';
  dateFormat?: string;
  currencySymbol?: string;
  numberFormat?: string;
  badgeSeverity?: (value: any) => 'success' | 'info' | 'warning' | 'danger' | 'secondary';
  badgeColor?: (value: any) => string;
  tagSeverity?: (value: any) => 'success' | 'info' | 'warning' | 'danger' | 'secondary';
  render?: (value: any) => string;
  renderBoolean?: (value: boolean) => string;
  renderEmpty?: () => string;
}

export interface FilterMeta {
  [field: string]: {
    value: any;
    matchMode?: string;
  };
}

export interface RowAction<T = any> {
  key: string;
  label?: string;
  icon?: string;
  tooltip?: string;
  severity?: 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'primary';
  onClick?: (record: T, index: number) => void;
  disabled?: boolean | ((record: T) => boolean);
  visible?: boolean | ((record: T) => boolean);
  loading?: boolean | ((record: T) => boolean);
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showTotal?: boolean;
}

export interface ToolbarConfig {
  show?: boolean;
  align?: 'left' | 'center' | 'right' | 'between';
  showRefreshButton?: boolean;
}

export interface TableAction {
  key: string;
  label?: string;
  icon?: string;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'default';
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  visible?: boolean | (() => boolean);
  subActions?: TableAction[];
  acceptFiles?: string;
  onFileSelect?: (file: File) => void;
  __open?: boolean;
}

export const CommonActions = {
  create: (onClick?: () => void): TableAction => ({
    key: 'create',
    label: 'common.actions.create',
    icon: 'plus-circle',
    severity: 'success',
    onClick,
  }),

  update: (onClick?: () => void): TableAction => ({
    key: 'update',
    label: 'common.actions.update',
    icon: 'edit',
    severity: 'warning',
    onClick,
  }),

  delete: (onClick?: () => void): TableAction => ({
    key: 'delete',
    label: 'common.actions.delete',
    icon: 'delete',
    severity: 'danger',
    onClick,
  }),

  refresh: (onClick?: () => void): TableAction => ({
    key: 'refresh',
    label: 'common.actions.refresh',
    icon: 'reload',
    severity: 'info',
    onClick,
  }),

  uploadExcel: (
    onDownloadTemplate?: () => void,
    onUploadFile?: (file: File) => void,
  ): TableAction => ({
    key: 'upload',
    label: 'common.actions.uploadExcel',
    icon: 'file-excel',
    severity: 'primary',
    onFileSelect: onUploadFile,
    subActions: [
      {
        key: 'download-template',
        label: 'common.actions.downloadTemplate',
        icon: 'download',
        onClick: onDownloadTemplate,
      },
      {
        key: 'upload-file',
        label: 'common.actions.uploadFile',
        icon: 'upload',
      },
    ],
  }),

  exportExcel: (onClick?: () => void): TableAction => ({
    key: 'export-excel',
    label: 'common.actions.exportExcel',
    icon: 'file-excel',
    severity: 'primary',
    onClick,
  }),

  exportPdf: (onClick?: () => void): TableAction => ({
    key: 'export-pdf',
    label: 'common.actions.exportPdf',
    icon: 'file-pdf',
    severity: 'danger',
    onClick,
  }),

  save: (onClick?: () => void, loading?: boolean): TableAction => ({
    key: 'save',
    label: 'common.actions.save',
    icon: 'save',
    severity: 'success',
    loading,
    onClick,
  }),

  cancel: (onClick?: () => void): TableAction => ({
    key: 'cancel',
    label: 'common.actions.cancel',
    icon: 'close',
    severity: 'secondary',
    onClick,
  }),

  view: (onClick?: () => void): TableAction => ({
    key: 'view',
    label: 'common.actions.view',
    icon: 'eye',
    severity: 'info',
    onClick,
  }),
};
