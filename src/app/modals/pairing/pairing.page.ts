import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Clipboard } from '@capacitor/clipboard';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';

@Component({
  selector: 'app-pairing',
  templateUrl: './pairing.page.html',
  styleUrls: ['./pairing.page.scss'],
})
export class PairingPage implements OnInit {
  @Input() pairingString: any;
  
  constructor(
    private modalController: ModalController,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss({dismissed: true});
  }

  async writeToClipboard(pairingString: string) {
    try {
      await Clipboard.write({
        string: pairingString
      });
  
      await this.notificationsService.showNotification('Copied to Clipboard!', 'primary'); 
    } catch(error) {
      await this.notificationsService.showNotification(error.message); 
    }
  };
}
