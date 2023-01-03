import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SmartNodesPage } from './smart-nodes.page';

const routes: Routes = [
  {
    path: '',
    component: SmartNodesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SmartNodesPageRoutingModule {}
