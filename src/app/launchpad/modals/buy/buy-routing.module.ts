import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BuyPage } from './buy.page';

const routes: Routes = [
  {
    path: '',
    component: BuyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuyPageRoutingModule {}
