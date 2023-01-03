import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'launchpad',
    pathMatch: 'full'
  },
  {
    path: 'launchpad',
    loadChildren: () => import('./launchpad/launchpad.module').then( m => m.LaunchpadPageModule)
  },
  {
    path: 'dao',
    loadChildren: () => import('./dao/dao.module').then( m => m.DaoPageModule)
  },
  {
    path: 'smart-nodes',
    loadChildren: () => import('./smart-nodes/smart-nodes.module').then( m => m.SmartNodesPageModule)
  },
  {
    path: 'pairing',
    loadChildren: () => import('./modals/pairing/pairing.module').then( m => m.PairingPageModule)
  },
  {
    path: 'buy-ico',
    loadChildren: () => import('./modals/ico/buy-ico/buy-ico.module').then( m => m.BuyIcoPageModule)
  },
  {
    path: 'create-dao',
    loadChildren: () => import('./modals/dao/create-dao/create-dao.module').then( m => m.CreateDaoPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
