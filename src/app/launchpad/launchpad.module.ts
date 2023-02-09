import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LaunchpadPageRoutingModule } from './launchpad-routing.module';

import { LaunchpadPage } from './launchpad.page';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LaunchpadPageRoutingModule,
    ComponentsModule
  ],
  declarations: [LaunchpadPage]
})
export class LaunchpadPageModule {}
