export interface ActionLog {
  id: string;
  createdById: string;
  createdByCode: string;
  createdByName: string;
  createdNote?: string;
  actionType?: string;
  entityId?: string;
  entityName?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  createdAt: string;
  oldValueObj?: Record<string, unknown> | null;
  newValueObj?: Record<string, unknown> | null;
}

export interface ActionTypeMeta {
  code: string;
  labelKey: string;
  type?: string;
  color?: string;
}
