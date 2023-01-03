import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProposalsPageRoutingModule } from './proposals-routing.module';

import { ProposalsPage } from './proposals.page';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProposalsPageRoutingModule
  ],
  declarations: [ProposalsPage]
})
export class ProposalsPageModule {}
