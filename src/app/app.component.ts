import { Component, ElementRef, ViewChild } from '@angular/core';
import { Animation, AnimationController, LoadingController, ModalController, AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { NotificationsService } from './services/notifications/notifications.service';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import { environment } from 'src/environments/environment';
import { PairingPage } from './modals/pairing/pairing.page';
import { FormatsHelper } from './helpers/formats';
import { Storage } from '@capacitor/storage';
import { LaunchpadService } from './launchpad/service/launchpad.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  private formatsHelper: FormatsHelper;
  private animation: Animation;
  private qrCodeModal = null;
  private loading = null;
  public accountIds: Array<string> = new Array();
  public network: string = 'testnet';
  @ViewChild('hashpack', { read: ElementRef, static: true }) private hashpack: ElementRef;

  public appPages = [
    { title: 'LaunchPad', url: 'launchpad', icon: 'rocket', badge: 'beta', color: 'warning' },
    { title: 'DAO', url: 'dao', icon: 'people', badge: 'beta', color: 'warning' },
    { title: 'Smart Nodes', url: 'smart-nodes', icon: 'pulse', badge: 'beta', color: 'warning' }
  ];

  constructor(
    private animationCtrl: AnimationController,
    public platform: Platform,
    private notificationsService: NotificationsService,
    private smartNodeSdkService: SmartNodeSdkService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private launchpadService: LaunchpadService,
    private alertController: AlertController
  ) {
    this.formatsHelper = new FormatsHelper();

    this.showDisclaimer();
    // this.resetDisclaimer();

    this.platform.ready().then(async(readySource) => {
      // subscribing to webSockets authentication events...
      this.smartNodeSdkService.getEventsObserver().subscribe(async(event) => {
        switch(event.method) {
          case 'authentication':
            this.loading = await this.loadingController.create({
              message: event.message
            });

            this.loading.present();
            break;
          case 'authenticate':
            try {
              this.loading.dismiss();
            } catch(error) {
              console.error(error);
              // this.notificationsService.showNotification(error.message);
            }

            this.notificationsService.showNotification(
              event.message,
              event.type,
              5000
            );
            break;
          case 'events':
            this.notificationsService.showServerNotification(event);
            break;
          case 'error':
            try {
              setTimeout(() => {
                this.loading.dismiss();
              }, 1000);
            } catch(error) {
              console.error(error);
              // this.notificationsService.showNotification(error.message);
            }

            let toast = null;

            if(event.title == 'Authentication Error') {
              await this.smartNodeSdkService.getHashPackService().disconnect();

              toast = await this.notificationsService.createServerMessage(
                'HashPack Error', 'Please try to login again to reresh your session.', 5000, 'danger');
            } else {
              toast = await this.notificationsService.createServerMessage(
                event.title, event.message, 5000, event.mode);
            }

            toast.present();
            break;
        }
      });

      // subscribing to hashpackService events...
      this.smartNodeSdkService.getHashPackService().observeHashpackConnection.subscribe(async(savedData) => {
        if(savedData.accountIds.length > 0) {
          try {
            this.qrCodeModal.dismiss();
          } catch(error) {
            console.error(error);
            // this.notificationsService.showNotification(error.message);
          }

          this.animation.stop();
          await this.notificationsService.showNotification('Your Hashpack Wallet has been connected!', 'success');
        } else {
          window.location.reload();
          this.animation.play();
        }

        this.accountIds = savedData.accountIds;
      });

      this.animation = this.animationCtrl.create()
        .addElement(this.hashpack.nativeElement)
        .duration(2000)
        .iterations(Infinity)
        .keyframes([
          { offset: 0, transform: 'scale(1) rotate(0)' },
          { offset: 0.25, transform: 'scale(1.1) rotate(25deg)' },
          { offset: 0.50, transform: 'scale(1) rotate(0)' },
          { offset: 0.75, transform: 'scale(1.1) rotate(-25deg)' },
          { offset: 1, transform: 'scale(1) rotate(0)' }
        ]);

      this.smartNodeSdkService.getHashPackService().loadHashconnectData().then(async(savedData) => {
        if (!savedData || savedData.accountIds.length == 0) {
          this.animation.play();
        } else {
          this.accountIds = savedData.accountIds;

          await this.smartNodeSdkService.getHashPackService().connect(
            <'previewnet' | 'testnet' | 'mainnet'> environment.hashpack,
            'restore'
          );

          // await this.notificationsService.showNotification('Your Hashpack Wallet has been connected!', 'success');
        }
      }).catch(async(error) => {
        await this.notificationsService.showNotification(error.message);
      });
    });
  }

  public formatAmount(amount: number) {
    // return this.formatsHelper.formatNumber(amount, ',', '.', 'HSUITE', 4);
    return this.formatsHelper.formatBigNumber(amount, 2);
  }

  public async hashPackConnect() {
    try {
      await this.smartNodeSdkService.getHashPackService().connect(
        <'previewnet' | 'testnet' | 'mainnet'> environment.hashpack,
        'hashpack'
      );
    } catch(error) {
      await this.notificationsService.showNotification(error.message);
    }
  }

  public async hashPackDisconnect() {
    try {
      await this.smartNodeSdkService.getHashPackService().disconnect();
      await this.notificationsService.showNotification('Your Hashpack Wallet has been disconnected.', 'danger');
      this.accountIds = new Array();
    } catch(error) {
      await this.notificationsService.showNotification(error.message);
    }
  }

  public async showQRCode() {
    try {
      let pairingString = await this.smartNodeSdkService.getHashPackService().connect(
        <'previewnet' | 'testnet' | 'mainnet'> environment.hashpack,
        'qrcode'
      );

      this.qrCodeModal = await this.modalController.create({
        component: PairingPage,
        componentProps: {
          pairingString: pairingString
        },
        ...{
          breakpoints: [0, 0.6, 0.75, 1],
          initialBreakpoint: 1,
          cssClass: 'custom-modal'
        }
      });

      await this.qrCodeModal.present();
    } catch(error) {
      await this.notificationsService.showNotification(error.message);
    }
  }

  async showDisclaimer() {
    let timeVisited = await Storage.get({ key: 'firstTime' });

    if (timeVisited.value == null) {
      const alert = await this.alertController.create({
        header: 'Disclaimer',
        message: 'HbarSuite is currently in beta state and is provided on an "as is" and "as available" basis. Despite this, it may contain errors or inaccuracies, hence the use of the app is at your own risk. <br/><br/>Although HbarSuite will do anything in its power to solve any potential issue, the team is not liable for any damages, loss of profits, or any other damages arising from or in connection with the use of the dApp. <br/><br/>The information provided on the dApp should not be considered as investment advice. By using the dApp, you acknowledge and accept the risks associated with beta software and DeFi Platforms.',
        cssClass: 'disclaimer-alert',
        mode: 'ios',
        backdropDismiss: false,
        buttons: [{
            text: 'I understand',
            handler: () => { Storage.set({ key: 'firstTime', value: 'false' }); }
          }]
      });
      await alert.present();
    }
  }

  resetDisclaimer() {
    Storage.remove({ key: 'firstTime' });
    this.showDisclaimer();
  }
}


