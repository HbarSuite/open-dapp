import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateDaoPageRoutingModule } from './create-dao-routing.module';

import { CreateDaoPage } from './create-dao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateDaoPageRoutingModule
  ],
  declarations: [CreateDaoPage]
})
export class CreateDaoPageModule {}
