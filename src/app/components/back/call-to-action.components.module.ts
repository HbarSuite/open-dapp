import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackComponent } from './back.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    BackComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    BackComponent
  ]
})
export class BackComponentsModule { }
