import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DaoDetailsPageRoutingModule } from './dao-details-routing.module';

import { DaoDetailsPage } from './dao-details.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DaoDetailsPageRoutingModule,
  ],
  declarations: [DaoDetailsPage],

})
export class DaoDetailsPageModule {}
