import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_CONFIG } from '../../core/constants/common/routes.config';
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
];

@NgModule({
  declarations: [HomeComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class MainModule {}
