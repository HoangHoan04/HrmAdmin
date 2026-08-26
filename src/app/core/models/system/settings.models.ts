import { BaseDto } from '../common.models';

export interface LegalRateConfig extends BaseDto {
  year: number;
  socialInsuranceEmployeeRate: number;
  socialInsuranceEmployerRate: number;
  healthInsuranceRate: number;
  unemploymentRate: number;
  personalDeduction: number;
  dependentDeduction: number;
  note?: string;
}

export interface NotificationTemplate extends BaseDto {
  code: string;
  channel: string;
  subject?: string;
  body: string;
  isActive: boolean;
  note?: string;
}

export interface ApiClientKey extends BaseDto {
  name: string;
  keyPrefix: string;
  companyId?: string | null;
  isActive: boolean;
  expiresAt?: string | null;
  note?: string;
  plaintextKey?: string;
}

export interface WebhookSubscription extends BaseDto {
  name: string;
  url: string;
  eventTypes: string;
  secret?: string;
  isActive: boolean;
  note?: string;
}

export interface SystemRetentionConfig extends BaseDto {
  softDeleteRetentionDays: number;
  isPurgeEnabled: boolean;
  note?: string;
}

export interface IpAllowlistEntry extends BaseDto {
  cidrOrIp: string;
  note?: string;
  isActive: boolean;
}

export interface AuthSession {
  id: string;
  userId: string;
  username?: string;
  platform: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  isCurrent?: boolean;
}

export interface SsoProviderStatus {
  enabled: boolean;
  configured: boolean;
  clientIdMasked?: string | null;
}

export interface SsoStatus {
  google: SsoProviderStatus;
  microsoft: SsoProviderStatus;
}

export interface TwoFactorSetup {
  secret: string;
  otpAuthUri: string;
}

export interface ReportSchedule extends BaseDto {
  code: string;
  name: string;
  reportType: string;
  cronHint: string;
  emailTo: string;
  isActive: boolean;
  lastRunAt?: string | null;
  note?: string;
}

export interface ComplianceSummary {
  expiringContractCount: number;
  expiringFileCount: number;
  pendingTransferCount: number;
  withinDays: number;
}

export interface SmsGatewayConfig extends BaseDto {
  provider: string;
  apiUrl: string;
  apiKey: string;
  senderId?: string;
  isActive: boolean;
  note?: string;
}

export interface ZaloOaConfig extends BaseDto {
  oaId: string;
  appId: string;
  secretKey: string;
  accessToken?: string;
  refreshToken?: string;
  isActive: boolean;
  note?: string;
}

export interface PunchImportResult {
  totalRows: number;
  imported: number;
  skipped: number;
  errors: string[];
}
