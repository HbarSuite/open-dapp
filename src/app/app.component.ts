import { Component, ElementRef, ViewChild } from '@angular/core';
import { Animation, AnimationController, LoadingController, ModalController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { NotificationsService } from './services/notifications/notifications.service';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import { environment } from 'src/environments/environment';
import { PairingPage } from './modals/pairing/pairing.page';
import { FormatsHelper } from './helpers/formats';
import { LaunchpadService } from './services/launchpad/launchpad.service';
import * as lodash from 'lodash';
import Decimal from 'decimal.js';
import { Transaction } from '@hashgraph/sdk';

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
  public holders: any;
  public staking: any;
  @ViewChild('hashpack', { read: ElementRef, static: true }) private hashpack: ElementRef;

  public appPages = [
    { title: 'LaunchPad', url: 'launchpad', icon: 'rocket' },
    { title: 'DAO', url: 'dao', icon: 'people' },
    { title: 'Smart Nodes', url: 'smart-nodes', icon: 'pulse' },
  ];

  constructor(
    private animationCtrl: AnimationController,
    public platform: Platform,
    private notificationsService: NotificationsService,
    private smartNodeSdkService: SmartNodeSdkService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private launchpadService: LaunchpadService
  ) {
    this.formatsHelper = new FormatsHelper();

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
              // console.error(error);
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
            console.error(error.message);
          }

          this.animation.stop();
          await this.notificationsService.showNotification('Your Hashpack Wallet has been connected!', 'success');
        } else {
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

  public calculateStakingPercentage() {
    return {
      raw: (this.staking.total.hsuite / this.holders.total.hsuite),
      formatted: `${((this.staking.total.hsuite / this.holders.total.hsuite) * 100).toFixed(2)} %`
    }
  }

  public async StakeNow() {
    let launchpads = await this.launchpadService.getList();
    let token = launchpads.find(launchpad => launchpad.id == '0.0.1461158');
    let wallet = lodash.first(this.accountIds);

    if(wallet) {
      let walletNFTs = (await this.smartNodeSdkService.getRestService().getNftForHolder(wallet)).data;
      let isStaking = walletNFTs.find(nft => nft.token_id == token.id);

      if(!isStaking) {
        const loading = await this.loadingController.create({
          message: 'Hsuite Network is validating your request, please wait...'
        });
    
        loading.present();   
    
        let launchpadBuyResponse = await this.launchpadService.launchpadNftBuy(
          wallet,
          new Decimal(token.launchpad.price),
          token.id
        );

        loading.message = 'Please sign the transaction in your wallet...';

        let hashpackResponse: any = await this.launchpadService.hashpackTransaction(
          launchpadBuyResponse.transaction, wallet
        );

        let transactionToExecute = <any>Transaction.fromBytes(new Uint8Array(launchpadBuyResponse.transaction));
        let transactionId = lodash.first(transactionToExecute._transactionIds.list).toString();

        if(hashpackResponse.success) {
          loading.dismiss();
          await this.notificationsService.showNotification(launchpadBuyResponse.message, 'success');
        } else {
          loading.dismiss();
          await this.notificationsService.showNotification(`Transaction failed: ${hashpackResponse.error}`);
        }

        try {
          await this.launchpadService.launchpadConfirm(
            transactionId, 
            hashpackResponse.success, 
            hashpackResponse.error
          );
        } catch(error) {
          console.error(error);
        }        
      } else {
        this.notificationsService.showNotification('This account is already staked.', 'warning');
      }
    } else {
      await this.notificationsService.showNotification(`Please login first.`);
    }
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
}
