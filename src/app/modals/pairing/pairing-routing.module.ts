import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PairingPage } from './pairing.page';

const routes: Routes = [
  {
    path: '',
    component: PairingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PairingPageRoutingModule {}
