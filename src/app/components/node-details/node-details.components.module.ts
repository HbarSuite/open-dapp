import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NodeDetailsComponent } from './node-details.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    NodeDetailsComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    NodeDetailsComponent
  ]
})
export class NodeDetailsComponentsModule { }
