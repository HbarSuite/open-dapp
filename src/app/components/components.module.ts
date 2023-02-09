import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardsComponentsModule } from './cards/cards.components.module';
import { CallToActionComponentsModule } from './call-to-action/call-to-action.components.module';
import { NodeDetailsComponentsModule } from './node-details/node-details.components.module';
import { TablesComponentsModule } from './tables/tables.components.module';
import { StatsComponentsModule } from './stats/stats.components.module';
import { BackComponentsModule } from './back/call-to-action.components.module';
import { SearchbarComponentsModule } from './searchbar/searchbar.components.module';

@NgModule({
  imports: [
    CommonModule,
    NodeDetailsComponentsModule,
    BackComponentsModule,
    CardsComponentsModule,
    CallToActionComponentsModule,
    TablesComponentsModule,
    StatsComponentsModule,
    SearchbarComponentsModule
  ],
  exports: [
    NodeDetailsComponentsModule,
    BackComponentsModule,
    CardsComponentsModule,
    CallToActionComponentsModule,
    TablesComponentsModule,
    StatsComponentsModule,
    SearchbarComponentsModule
  ]
})
export class ComponentsModule { }
