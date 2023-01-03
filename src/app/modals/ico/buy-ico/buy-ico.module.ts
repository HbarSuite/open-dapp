import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BuyIcoPageRoutingModule } from './buy-ico-routing.module';

import { BuyIcoPage } from './buy-ico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BuyIcoPageRoutingModule
  ],
  declarations: [BuyIcoPage]
})
export class BuyIcoPageModule {}
