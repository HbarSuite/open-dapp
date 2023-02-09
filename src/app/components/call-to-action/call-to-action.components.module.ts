import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallToActionComponent } from './call-to-action.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    CallToActionComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    CallToActionComponent
  ]
})
export class CallToActionComponentsModule { }
