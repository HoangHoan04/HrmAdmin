import { TemplateRef } from '@angular/core';

export interface FilterOption {
  label?: string;
  name?: string;
  code?: string;
  value: any;
}

export interface FilterField {
  key: string;
  label: string;
  type:
    | 'input'
    | 'textarea'
    | 'select'
    | 'multiSelect'
    | 'number'
    | 'switch'
    | 'date'
    | 'dateRange'
    | 'customButton'
    | 'custom';
  placeholder?: string;
  options?: FilterOption[];
  onClick?: () => void;
  buttonText?: string;
  disabled?: boolean;
  hidden?: boolean;
  col?: number;
  colClassName?: string;
  allowClear?: boolean;
  defaultValue?: any;
  body?: TemplateRef<any>;
  style?: Record<string, any>;
}

export interface FilterConfig {
  show?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
  title?: string;
  gutter?: [number, number];
  actionsAlign?: 'left' | 'center' | 'right';
}

export interface FilterAction {
  key: string;
  label?: string;
  icon?: string;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'default';
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  visible?: boolean;
}

export const CommonFilterFields = {
  searchText: (options?: Partial<FilterField>): FilterField => ({
    key: 'searchText',
    label: 'common.filter.searchText',
    type: 'input',
    placeholder: 'common.filter.searchTextPlaceholder',
    col: 6,
    allowClear: true,
    defaultValue: '',
    ...options,
  }),
};

export const CommonFilterActions = {
  search: (onClick?: () => void, loading?: boolean): FilterAction => ({
    key: 'search',
    label: 'common.filter.search',
    icon: 'search',
    severity: 'primary',
    loading,
    onClick,
  }),

  clear: (onClick?: () => void): FilterAction => ({
    key: 'clear',
    label: 'common.filter.clear',
    icon: 'close-circle',
    severity: 'secondary',
    onClick,
  }),

  refresh: (onClick?: () => void, loading?: boolean): FilterAction => ({
    key: 'refresh',
    label: 'common.actions.refresh',
    icon: 'reload',
    severity: 'info',
    loading,
    onClick,
  }),
};
