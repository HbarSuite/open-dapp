import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchbarComponent } from './searchbar.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    SearchbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    IonicModule
  ],
  exports: [
    SearchbarComponent
  ]
})
export class SearchbarComponentsModule { }
