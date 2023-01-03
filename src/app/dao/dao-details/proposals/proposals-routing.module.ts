import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProposalsPage } from './proposals.page';

const routes: Routes = [
  {
    path: '',
    component: ProposalsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProposalsPageRoutingModule {}
