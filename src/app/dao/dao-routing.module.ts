import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DaoPage } from './dao.page';

const routes: Routes = [
  {
    path: '',
    component: DaoPage
  },
  {
    path: 'project/:dao',
    loadChildren: () => import('./dao-details/dao-details.module').then( m => m.DaoDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DaoPageRoutingModule {}
