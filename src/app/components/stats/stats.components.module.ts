import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsComponent } from './stats.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    StatsComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [
    StatsComponent
  ]
})
export class StatsComponentsModule { }
