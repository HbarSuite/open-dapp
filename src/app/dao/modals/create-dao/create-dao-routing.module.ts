import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateDaoPage } from './create-dao.page';

const routes: Routes = [
  {
    path: '',
    component: CreateDaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateDaoPageRoutingModule {}
