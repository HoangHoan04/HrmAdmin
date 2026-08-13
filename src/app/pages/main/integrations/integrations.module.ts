import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { SharedModule } from '../../../shared/shared.module';
import { IntegrationsHubComponent } from './integrations-hub/integrations-hub.component';
import { PayrollExportsComponent } from './payroll-exports/payroll-exports.component';
import { PunchImportComponent } from './punch-import/punch-import.component';
import { SmsConfigComponent } from './sms-config/sms-config.component';
import { ZaloConfigComponent } from './zalo-config/zalo-config.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'integrations/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean === 'integrations' ? '' : clean;
};

const routes: Routes = [
  { path: '', component: IntegrationsHubComponent },
  {
    path: getRelativePath(ROUTES_CONFIG.INTEGRATIONS.children.SMS_CONFIG.path),
    component: SmsConfigComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.INTEGRATIONS.children.ZALO_CONFIG.path),
    component: ZaloConfigComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.INTEGRATIONS.children.PUNCH_IMPORT.path),
    component: PunchImportComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.INTEGRATIONS.children.PAYROLL_EXPORTS.path),
    component: PayrollExportsComponent,
  },
];

@NgModule({
  declarations: [
    IntegrationsHubComponent,
    SmsConfigComponent,
    ZaloConfigComponent,
    PunchImportComponent,
    PayrollExportsComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class IntegrationsModule {}
