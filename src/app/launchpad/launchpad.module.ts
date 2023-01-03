import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LaunchpadPageRoutingModule } from './launchpad-routing.module';

import { LaunchpadPage } from './launchpad.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LaunchpadPageRoutingModule
  ],
  declarations: [LaunchpadPage]
})
export class LaunchpadPageModule {}
