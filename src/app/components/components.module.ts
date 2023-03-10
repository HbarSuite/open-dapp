import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CallToActionComponentsModule } from './call-to-action/call-to-action.components.module';
import { NodeDetailsComponentsModule } from './node-details/node-details.components.module';
import { BackComponentsModule } from './back/call-to-action.components.module';
import { SearchbarComponentsModule } from './searchbar/searchbar.components.module';

@NgModule({
  imports: [
    CommonModule,
    NodeDetailsComponentsModule,
    BackComponentsModule,
    CallToActionComponentsModule,
    SearchbarComponentsModule
  ],
  exports: [
    NodeDetailsComponentsModule,
    BackComponentsModule,
    CallToActionComponentsModule,
    SearchbarComponentsModule
  ]
})
export class ComponentsModule { }