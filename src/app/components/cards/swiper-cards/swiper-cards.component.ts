import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CardsComponent } from '../cards.component';

import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { SwiperOptions } from 'swiper';
import { listenerCount } from 'process';
SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom]);
@Component({
  selector: 'hsuite-swiper-cards',
  templateUrl: './swiper-cards.component.html',
  styleUrls: ['./swiper-cards.component.scss'],
})
export class SwiperCardsComponent extends CardsComponent implements OnInit {

  @ViewChild('swiperComponent') swiper: SwiperComponent;

  constructor() {
    super();
  }

  @Input() Title: string = 'Your title here';
  @Input() List: Array<any> = new Array<any>();
  @Input() AmountOfCards: number = 10;
  @Input() SpaceBetween: number = 20;
  @Input() Route: string = '';
  @Input() RouteParam = 'id';
  @Input() NoContent: boolean = false;

  public placeholder = new Array(10).fill({})


  ngOnInit() {}

  config: SwiperOptions = {
    direction: 'horizontal',
    slidesPerView: 1.4,
    spaceBetween: this.SpaceBetween,
    loop: false,
    keyboard: false,
    mousewheel: false,
    scrollbar:true,
    navigation: false,
    pagination: false,
    centeredSlides: false,
    breakpoints: {
      450: {
        slidesPerView: 1.8,
        spaceBetween: 20,
      },
      600: {
        slidesPerView: 2,
        spaceBetween: this.SpaceBetween,
      },
      700: {
        slidesPerView: 2.4,
        spaceBetween: this.SpaceBetween,
      },
      1100: {
        slidesPerView: 2.8,
        spaceBetween: this.SpaceBetween,
      },
    },

  };


  public setRouter(list: string) {
    let param = this.RouteParam;
    let route = this.Route + list[param];
    return route;
  }

}
