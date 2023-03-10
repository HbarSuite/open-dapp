import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LaunchpadPage } from './launchpad.page';

const routes: Routes = [
  {
    path: '',
    component: LaunchpadPage
  },
  {
    path: 'buy',
    loadChildren: () => import('./modals/buy/buy.module').then( m => m.BuyPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LaunchpadPageRoutingModule {}
