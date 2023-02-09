import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TablesComponent } from './tables.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    TablesComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [
    TablesComponent
  ]
})
export class TablesComponentsModule { }
