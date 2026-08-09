import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { SharedModule } from '../../../shared/shared.module';
import { CompanyManagerComponent } from '../organizition/company-manager/company-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'asset/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_MANAGER.path),
    component: CompanyManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_MANAGER.children.ADD_ASSET.path),
    component: CompanyManagerComponent,
  },
  {
    path:
      getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_MANAGER.children.EDIT_ASSET.path) + '/:id',
    component: CompanyManagerComponent,
  },
  {
    path:
      getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_MANAGER.children.DETAIL_ASSET.path) +
      '/:id',
    component: CompanyManagerComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class AssetModule {}
