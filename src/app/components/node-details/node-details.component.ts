import { Component, OnInit} from '@angular/core';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import { AlertController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'hsuite-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss'],
})
export class NodeDetailsComponent implements OnInit {
 public uniqueId: string = null;

  constructor(
    private alertController: AlertController,
    protected smartNodeSdkService: SmartNodeSdkService
    ) {}

  ngOnInit() {
    this.uniqueId = uuidv4();
  }

  async presentAlert() {
    let node = this.smartNodeSdkService.getNetworkService().getCurrentNode();
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Hsuite',
      subHeader: 'Smart Node Network',
      message: `Connected to <a href="${node.url}/api" target="_blank"><b>${node.operator}</b></a>`,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
