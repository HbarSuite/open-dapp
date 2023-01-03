import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DaoPageRoutingModule } from './dao-routing.module';

import { DaoPage } from './dao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DaoPageRoutingModule
  ],
  declarations: [DaoPage]
})
export class DaoPageModule {}
