import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BuyPageRoutingModule } from './buy-routing.module';
import { BuyPage } from './buy.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BuyPageRoutingModule
  ],
  declarations: [BuyPage]
})
export class BuyPageModule {}
