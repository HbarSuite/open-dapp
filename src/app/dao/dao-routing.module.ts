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
  },
  {
    path: 'create-dao',
    loadChildren: () => import('../modals/dao/create-dao/create-dao.module').then( m => m.CreateDaoPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DaoPageRoutingModule {}
