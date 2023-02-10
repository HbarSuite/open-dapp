import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LaunchpadPage } from './launchpad.page';

const routes: Routes = [
  {
    path: '',
    component: LaunchpadPage
  },
  {
    path: 'buy-ico',
    loadChildren: () => import('../modals/ico/buy-ico/buy-ico.module').then( m => m.BuyIcoPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LaunchpadPageRoutingModule {}
