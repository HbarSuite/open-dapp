import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSlides, LoadingController, ModalController } from '@ionic/angular';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import * as lodash from 'lodash';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import { Subscription } from 'rxjs';
import { Clipboard } from '@capacitor/clipboard';
import { DaoService } from 'src/app/dao/service/dao.service';

@Component({
  selector: 'app-create-dao',
  templateUrl: './create-dao.page.html',
  styleUrls: ['./create-dao.page.scss'],
})
export class CreateDaoPage implements OnInit, OnDestroy {
  @ViewChild('slides', { static: false }) slides: IonSlides;

  private loading: HTMLIonLoadingElement;
  private eventsSubscription: Subscription;
  private daos: Array<any> = new Array<any>();
  private wallet: string;

  public tokenInfos: any = {
    name: '',
    memo: '',
    token_id: '',
    treasury_account_id: '',
    type: ''
  };
  public councilInfos: any;

  public dao: {
    about: string
    tokenId: string
    image: string
    limited: {
      councilNftId: string
    }
    model: 'classic' | 'limited'
  } = {
    about: null,
    tokenId: null,
    image: null,
    limited: {
      councilNftId: null
    },
    model: 'classic'
  };

  public sliderConfig = {
    initialSlide: 0,
    allowSlideNext: false
  };

  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private notificationsService: NotificationsService,
    private daoService: DaoService,
    private smartNodeSdkService: SmartNodeSdkService
    ) {}

  ngOnDestroy() {
    if(this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.daoService.list().then(daos => {
      this.daos = daos;
    }).catch(error => {
      this.notificationsService.showNotification(error.message);
    });

    this.daoService.loadHashconnectData().then(hashconnectData=> {
      this.wallet = lodash.first(hashconnectData.accountIds);
    }).catch(error => {
      this.notificationsService.showNotification(error.message);
    });

    this.eventsSubscription = this.smartNodeSdkService.getEventsObserver().subscribe(async(event) => {
      if(event.method == 'error' || event.event == 'transaction.offline.error') {
        this.loading.dismiss();
      }

      if(event.method == 'events' &&
      event.payload.action == 'dao.entity.create' &&
      event.event == 'transaction.offline.signed') {
        this.loading.dismiss();
        this.slides.lockSwipeToNext(false);
        this.slides.slideNext();
        this.slides.lockSwipeToNext(true);
      }
    });
  }

  closeModal() {
    return this.modalController.dismiss(null, 'cancel');
  }

  completeDao() {
    return this.modalController.dismiss(this.dao, 'confirm');
  }

  async shareDao() {
    try {
      await Clipboard.write({
        string: `${window.location.origin}/dao/project/${this.dao.tokenId}`
      });

      await this.notificationsService.showNotification('Copied to Clipboard!', 'primary');
    } catch(error) {
      await this.notificationsService.showNotification(error.message);
    }
  }

  generateImageUrl() {
    if(this.dao.image) {
      return this.dao.image;
    } else {
      let node = this.smartNodeSdkService.getNetworkService().getCurrentNode().url;
      return `${node}/public/tokens/hsuite.png`;
    }
  }

  async setupAbout() {
    try {
      if(this.dao.about) {
        if(this.dao.model == 'limited') {
          this.slides.lockSwipeToNext(false);
          this.slides.slideNext();
          this.slides.lockSwipeToNext(true);
        } else {
          this.slides.lockSwipeToNext(false);
          this.slides.slideTo(3);
          this.slides.lockSwipeToNext(true);          
        }

      } else {
        const alert = await this.alertController.create({
          mode: 'ios',
          header: this.tokenInfos.name,
          subHeader: this.tokenInfos.token_id,
          message: `Sorry, a description is required.`,
          buttons: ['OK'],
        });

        await alert.present();
      }
    } catch(error) {
      this.notificationsService.showNotification(error.message);
    }
  }

  async setupCouncil() {
    const loading = await this.loadingController.create({
      message: `checking your token's informations...`
    });

    loading.present();

    try {
      let tokenInfos = await this.daoService.getTokenInfos(this.dao.limited.councilNftId);
      this.councilInfos = tokenInfos.data;
      loading.dismiss();

      if(this.councilInfos.type == 'NON_FUNGIBLE_UNIQUE') {
        this.slides.lockSwipeToNext(false);
        this.slides.slideNext();
        this.slides.lockSwipeToNext(true);
      } else {
        const alert = await this.alertController.create({
          mode: 'ios',
          header: this.tokenInfos.name,
          subHeader: this.tokenInfos.token_id,
          message: `Sorry, the tokenID must be an NFT one.`,
          buttons: ['OK'],
        });

        await alert.present();
      }
    } catch(error) {
      loading.dismiss()
      this.notificationsService.showNotification(error.message);
    }
  }

  confirmDao() {
    this.slides.lockSwipeToNext(false);
    this.slides.slideNext();
    this.slides.lockSwipeToNext(true);
  }

  async createDao() {
    this.loading = await this.loadingController.create({
      message: `creating DAO for ${this.tokenInfos.name}, please sign from your wallet...`
    });

    this.loading.present();

    try {
      let fees = await this.daoService.getFees('daos');
      let responseData = await this.daoService.createDaoTransaction(
        this.dao.tokenId,
        this.wallet,
        this.dao,
        fees
      );

      if(responseData.status == 'SUCCESS') {
        await this.notificationsService.showNotification(
          'Transaction sent correctly, it will be shortly processed by the network...',
          'success',
          2500
        );
      } else {
        this.loading.dismiss();
        await this.notificationsService.showNotification(responseData.payload);
      }
    } catch(error) {
      this.loading.dismiss();
      this.notificationsService.showNotification(error.message);
    }
  }

  async validateDao() {
    try {
      if(this.dao.tokenId && this.dao.image) {
        let exists = this.daos.find(dao => dao.tokenId == this.dao.tokenId);
        if(exists) {
          const alert = await this.alertController.create({
            mode: 'ios',
            header: exists.name,
            subHeader: exists.tokenId,
            message: `Sorry, this DAO exists already.`,
            buttons: ['OK'],
          });

          await alert.present();
        } else {
          const loading = await this.loadingController.create({
            message: `checking your token's informations...`
          });

          loading.present();

          try {
            let tokenInfos = await this.daoService.getTokenInfos(this.dao.tokenId);
            this.tokenInfos = tokenInfos.data;
            loading.dismiss();

            if(this.tokenInfos.treasury_account_id !== this.wallet) {
              const alert = await this.alertController.create({
                mode: 'ios',
                header: this.tokenInfos.name,
                subHeader: this.tokenInfos.token_id,
                message: `Sorry, you must be logged in
                  with your token's treasury <b>${this.tokenInfos.treasury_account_id}</b>
                  in order to proof the ownership of <b>${this.tokenInfos.name}</b>`,
                buttons: ['OK'],
              });

              await alert.present();
            } else {
              this.slides.lockSwipeToNext(false);
              this.slides.slideNext();
              this.slides.lockSwipeToNext(true);
            }
          } catch(error) {
            loading.dismiss();
            this.notificationsService.showNotification(`Something went wrong, please be sure the tokenID is correct.`);
          }
        }
      } else {
        const alert = await this.alertController.create({
          mode: 'ios',
          header: `Create DAO`,
          subHeader: `missing inputs`,
          message: `Sorry, you need to introduce a tokenID and a image in order to proceed.`,
          buttons: ['OK'],
        });

        await alert.present();
      }
    } catch(error) {
      this.notificationsService.showNotification(error.message);
    }
  }

  async openHelpAlert() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: `DAO Type`,
      subHeader: `Classic OR Limited?`,
      message: `
      <b>Classic DAO</b></br>
      - Every holder can submit a proposal</br>
      - Every holder can vote</br>
      </br>
      <b>Limited DAO</b></br>
      - Every holder can submit a proposal</br>
      - Every proposal must be approved by a council</br>
      - Once the council approved a proposal, every holder can vote</br>
      - The Council members are those who hold the NFT you define</br>
      `,
      buttons: ['OK'],
    });

    await alert.present();
  }

}


