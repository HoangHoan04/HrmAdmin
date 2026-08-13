import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { SharedModule } from '../../../shared/shared.module';
import { ActionLogManagerComponent } from './action-log-manager/action-log-manager.component';
import { AddOrUpdateApiKeyComponent } from './api-key-manager/add-or-update-api-key/add-or-update-api-key.component';
import { ApiKeyManagerComponent } from './api-key-manager/api-key-manager.component';
import { AddOrUpdateIpAllowlistComponent } from './ip-allowlist-manager/add-or-update-ip-allowlist/add-or-update-ip-allowlist.component';
import { IpAllowlistManagerComponent } from './ip-allowlist-manager/ip-allowlist-manager.component';
import { AddOrUpdateLegalRateComponent } from './legal-rate-manager/add-or-update-legal-rate/add-or-update-legal-rate.component';
import { LegalRateManagerComponent } from './legal-rate-manager/legal-rate-manager.component';
import { AddOrUpdateNotificationTemplateComponent } from './notification-template-manager/add-or-update-notification-template/add-or-update-notification-template.component';
import { NotificationTemplateManagerComponent } from './notification-template-manager/notification-template-manager.component';
import { RetentionManagerComponent } from './retention-manager/retention-manager.component';
import { SecuritySettingsComponent } from './security-settings/security-settings.component';
import { SessionsManagerComponent } from './sessions-manager/sessions-manager.component';
import { AddOrUpdateWebhookComponent } from './webhook-manager/add-or-update-webhook/add-or-update-webhook.component';
import { WebhookManagerComponent } from './webhook-manager/webhook-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'system-settings/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: getRelativePath(ROUTES_CONFIG.SETTING_SYSTEM.children.ACTION_LOG.path),
    component: ActionLogManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.SETTING_SYSTEM.children.LEGAL_RATE.path),
    component: LegalRateManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.SETTING_SYSTEM.children.LEGAL_RATE.children.ADD_LEGAL_RATE.path,
    ),
    component: AddOrUpdateLegalRateComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.SETTING_SYSTEM.children.LEGAL_RATE.children.EDIT_LEGAL_RATE.path,
      ) + '/:id',
    component: AddOrUpdateLegalRateComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.SETTING_SYSTEM.children.NOTIFICATION_TEMPLATE.path),
    component: NotificationTemplateManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.SETTING_SYSTEM.children.NOTIFICATION_TEMPLATE.children
        .ADD_NOTIFICATION_TEMPLATE.path,
    ),
    component: AddOrUpdateNotificationTemplateComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.SETTING_SYSTEM.children.NOTIFICATION_TEMPLATE.children
          .EDIT_NOTIFICATION_TEMPLATE.path,
      ) + '/:id',
    component: AddOrUpdateNotificationTemplateComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.SETTING_SYSTEM.children.API_KEYS.path),
    component: ApiKeyManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.SETTING_SYSTEM.children.API_KEYS.children.ADD_API_KEY.path,
    ),
    component: AddOrUpdateApiKeyComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.SETTING_SYSTEM.children.API_KEYS.children.EDIT_API_KEY.path,
      ) + '/:id',
    component: AddOrUpdateApiKeyComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.SETTING_SYSTEM.children.WEBHOOKS.path),
    component: WebhookManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.SETTING_SYSTEM.children.WEBHOOKS.children.ADD_WEBHOOK.path,
    ),
    component: AddOrUpdateWebhookComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.SETTING_SYSTEM.children.WEBHOOKS.children.EDIT_WEBHOOK.path,
      ) + '/:id',
    component: AddOrUpdateWebhookComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.SETTING_SYSTEM.children.RETENTION.path),
    component: RetentionManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.SETTING_SYSTEM.children.SESSIONS.path),
    component: SessionsManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.SETTING_SYSTEM.children.IP_ALLOWLIST.path),
    component: IpAllowlistManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.SETTING_SYSTEM.children.IP_ALLOWLIST.children.ADD_IP_ALLOWLIST.path,
    ),
    component: AddOrUpdateIpAllowlistComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.SETTING_SYSTEM.children.IP_ALLOWLIST.children.EDIT_IP_ALLOWLIST.path,
      ) + '/:id',
    component: AddOrUpdateIpAllowlistComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.SETTING_SYSTEM.children.SECURITY.path),
    component: SecuritySettingsComponent,
  },
];

@NgModule({
  declarations: [
    ActionLogManagerComponent,
    LegalRateManagerComponent,
    AddOrUpdateLegalRateComponent,
    NotificationTemplateManagerComponent,
    AddOrUpdateNotificationTemplateComponent,
    ApiKeyManagerComponent,
    AddOrUpdateApiKeyComponent,
    WebhookManagerComponent,
    AddOrUpdateWebhookComponent,
    RetentionManagerComponent,
    SessionsManagerComponent,
    IpAllowlistManagerComponent,
    AddOrUpdateIpAllowlistComponent,
    SecuritySettingsComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class SystemSettingsModule {}
