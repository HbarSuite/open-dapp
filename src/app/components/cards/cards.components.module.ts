import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SwiperCardsComponent } from 'src/app/components/cards/swiper-cards/swiper-cards.component';
import { CardsComponent } from 'src/app/components/cards/cards.component';
import { RouterModule } from '@angular/router';
import { SwiperModule } from 'swiper/angular';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    CardsComponent,
    SwiperCardsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SwiperModule,
    IonicModule
  ],
  exports: [
    CardsComponent,
    SwiperCardsComponent
  ]
})
export class CardsComponentsModule { }
