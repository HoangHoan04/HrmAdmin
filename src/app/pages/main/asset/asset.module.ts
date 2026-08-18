import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTES_CONFIG } from '../../../core/constants/common/routes.config';
import { SharedModule } from '../../../shared/shared.module';
import { AddOrUpdateAssetTypeComponent } from './asset-type-manager/add-or-update-asset-type/add-or-update-asset-type.component';
import { AssetTypeManagerComponent } from './asset-type-manager/asset-type-manager.component';
import { AddOrUpdateAssetComponent } from './asset-inventory-manager/add-or-update-asset/add-or-update-asset.component';
import { AssetInventoryManagerComponent } from './asset-inventory-manager/asset-inventory-manager.component';
import { AddOrUpdateAssetTicketComponent } from './asset-ticket-manager/add-or-update-asset-ticket/add-or-update-asset-ticket.component';
import { AssetTicketManagerComponent } from './asset-ticket-manager/asset-ticket-manager.component';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'asset/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_TYPE.path),
  },
  {
    path: getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_TYPE.path),
    component: AssetTypeManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_TYPE.children.ADD_ASSET_TYPE.path),
    component: AddOrUpdateAssetTypeComponent,
  },
  {
    path:
      getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_TYPE.children.EDIT_ASSET_TYPE.path) +
      '/:id',
    component: AddOrUpdateAssetTypeComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_MANAGER.path),
    component: AssetInventoryManagerComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_MANAGER.children.ADD_ASSET.path),
    component: AddOrUpdateAssetComponent,
  },
  {
    path:
      getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_MANAGER.children.EDIT_ASSET.path) +
      '/:id',
    component: AddOrUpdateAssetComponent,
  },
  {
    path:
      getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_MANAGER.children.DETAIL_ASSET.path) +
      '/:id',
    component: AddOrUpdateAssetComponent,
  },
  {
    path: getRelativePath(ROUTES_CONFIG.ASSET.children.ASSET_TICKET.path),
    component: AssetTicketManagerComponent,
  },
  {
    path: getRelativePath(
      ROUTES_CONFIG.ASSET.children.ASSET_TICKET.children.ADD_ASSET_TICKET.path,
    ),
    component: AddOrUpdateAssetTicketComponent,
  },
  {
    path:
      getRelativePath(
        ROUTES_CONFIG.ASSET.children.ASSET_TICKET.children.EDIT_ASSET_TICKET.path,
      ) + '/:id',
    component: AddOrUpdateAssetTicketComponent,
  },
];

@NgModule({
  declarations: [
    AssetTypeManagerComponent,
    AddOrUpdateAssetTypeComponent,
    AssetInventoryManagerComponent,
    AddOrUpdateAssetComponent,
    AssetTicketManagerComponent,
    AddOrUpdateAssetTicketComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class AssetModule {}
