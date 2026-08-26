import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { SharedModule } from '../../../shared/shared.module';
import { ActionLogManagerComponent } from './action-log-manager/action-log-manager.component';
import { AddOrUpdateIpAllowlistComponent } from './ip-allowlist-manager/add-or-update-ip-allowlist/add-or-update-ip-allowlist.component';
import { IpAllowlistManagerComponent } from './ip-allowlist-manager/ip-allowlist-manager.component';
import { AddOrUpdateLegalRateComponent } from './legal-rate-manager/add-or-update-legal-rate/add-or-update-legal-rate.component';
import { LegalRateManagerComponent } from './legal-rate-manager/legal-rate-manager.component';
import { NotificationCenterComponent } from './notification-center/notification-center.component';
import { RetentionManagerComponent } from './retention-manager/retention-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'system-settings/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: getRelativePath(ROUTES_CONFIG.SETTING_SYSTEM.children.NOTIFICATION_CENTER.path),
  },
  {
    path: getRelativePath(ROUTES_CONFIG.SETTING_SYSTEM.children.NOTIFICATION_CENTER.path),
    component: NotificationCenterComponent,
  },
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
    path: getRelativePath(ROUTES_CONFIG.SETTING_SYSTEM.children.RETENTION.path),
    component: RetentionManagerComponent,
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
];

@NgModule({
  declarations: [
    NotificationCenterComponent,
    ActionLogManagerComponent,
    LegalRateManagerComponent,
    AddOrUpdateLegalRateComponent,
    RetentionManagerComponent,
    IpAllowlistManagerComponent,
    AddOrUpdateIpAllowlistComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class SystemSettingsModule {}
