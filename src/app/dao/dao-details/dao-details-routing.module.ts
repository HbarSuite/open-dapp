import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DaoDetailsPage } from './dao-details.page';

const routes: Routes = [
  {
    path: '',
    component: DaoDetailsPage
  },
  {
    path: 'proposal/:proposal/:type',
    loadChildren: () => import('./proposals/proposals.module').then( m => m.ProposalsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DaoDetailsPageRoutingModule {}
