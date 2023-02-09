import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SmartNodesPageRoutingModule } from './smart-nodes-routing.module';

import { SmartNodesPage } from './smart-nodes.page';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SmartNodesPageRoutingModule,
    ComponentsModule
  ],
  providers: [],
  declarations: [SmartNodesPage]
})
export class SmartNodesPageModule {}
