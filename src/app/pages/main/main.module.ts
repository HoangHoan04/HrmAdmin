import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { ROUTES_CONFIG } from '../../core/constants/common/routes.config';
import { echarts } from '../../shared/echarts';
import { SharedModule } from '../../shared/shared.module';
import { HomeComponent } from './home/home.component';

const getPath = (p: string) => (p.startsWith('/') ? p.substring(1) : p);

const routes: Routes = [
  { path: '', component: HomeComponent },

  {
    path: getPath(ROUTES_CONFIG.ORGANIZATION.path),
    loadChildren: () =>
      import('./organizition/organization.module').then((m) => m.OrganizationModule),
  },
  {
    path: getPath(ROUTES_CONFIG.HUMAN_RESOURCE.path),
    loadChildren: () =>
      import('./human-resource/human-resource.module').then((m) => m.HumanResourceModule),
  },
  {
    path: getPath(ROUTES_CONFIG.OPERATE_MANAGER.path),
    loadChildren: () => import('./operate/operate.module').then((m) => m.OperateModule),
  },
  {
    path: getPath(ROUTES_CONFIG.SETTING_SYSTEM.path),
    loadChildren: () =>
      import('./system-settings/system-settings.module').then((m) => m.SystemSettingsModule),
  },
  {
    path: getPath(ROUTES_CONFIG.RECRUITMENT.path),
    loadChildren: () => import('./recruitment/recruitment.module').then((m) => m.RecruitmentModule),
  },
  {
    path: getPath(ROUTES_CONFIG.PAYROLL.path),
    loadChildren: () => import('./payroll/payroll.module').then((m) => m.PayrollModule),
  },
  {
    path: getPath(ROUTES_CONFIG.ASSET.path),
    loadChildren: () => import('./asset/asset.module').then((m) => m.AssetModule),
  },
];

@NgModule({
  declarations: [HomeComponent],
  imports: [SharedModule, RouterModule.forChild(routes), NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
})
export class MainModule {}
