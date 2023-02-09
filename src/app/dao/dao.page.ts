import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { CreateDaoPage } from '../modals/dao/create-dao/create-dao.page';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import { DaoService } from '../services/dao/dao.service';
import { NotificationsService } from '../services/notifications/notifications.service';
import { Subscription } from 'rxjs';
import * as lodash from 'lodash';

@Component({
  selector: 'app-dao',
  templateUrl: './dao.page.html',
  styleUrls: ['./dao.page.scss'],
})
export class DaoPage implements OnInit, OnDestroy {
  @ViewChild(IonModal) modal: IonModal;
  
  public daos: Array<any> = new Array();
  public place_holders = new Array();
  public filteredDaos: Array<any> = new Array();
  private eventsSubscription: Subscription;
  public wallet: string = null;

  constructor(
    private modalController: ModalController,
    private smartNodeSdkService: SmartNodeSdkService,
    private daoService: DaoService,
    private notificationsService: NotificationsService
  ) {
    this.place_holders = Array(4).fill(0, 4).map((x,i)=>i);
  }

  ngOnDestroy() {
    if(this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  generateImageUrl(image: string) {
    if(image.startsWith('http') || image.startsWith('assets')) {
      return image;
    } else {
      let node = this.smartNodeSdkService.getNetworkService().getCurrentNode().url;
      return `${node}/${image}`;
    }
  }

  private mapWrongDAOs(daos: Array<any>): Array<any> {
    let mappedDaos = daos.map(dao => {
      // Capt Brando DAO
      if (dao.tokenId == "0.0.1457166") {
        dao.image = 'assets/icon/nftv.jpeg';
        return dao;
        // TruePerception DAO  
      } else if (dao.tokenId == "0.0.1471053") {
        dao.image = 'assets/icon/trueperception.jpg';
        return dao;
      }
      else {
        return dao;
      }
    });

    return mappedDaos;
  }

  async submitDao(dao: any) {
    try {
      dao.status = 'pending';
      await this.daoService.createDaoRetry(dao.id);
    } catch (error) {
      this.notificationsService.showNotification(error.message);
    }
  }

  ngOnInit() {
    this.daoService.getList().then(daos => {
      this.daos = this.mapWrongDAOs(daos);
      this.filteredDaos = this.daos;
    }).catch(error => {
      this.notificationsService.showNotification(error.message);
    });

    this.daoService.loadHashconnectData().then(hashConnectData => {
      this.wallet = lodash.first(hashConnectData.accountIds);
    });

    this.smartNodeSdkService.getHashPackService().observeHashpackConnection.subscribe(async(hashConnectData) => {
      this.wallet = lodash.first(hashConnectData.accountIds);
    });    

    this.eventsSubscription = this.smartNodeSdkService.getEventsObserver().subscribe(async(event) => {
      if(event.method == 'events' &&
      event.payload.action == 'dao.entity.create') {
        switch(event.event) {
          case 'dao.entity.create.error':
            let dao = this.filteredDaos.find(dao => dao.tokenId == event.payload.dao.tokenId);
            dao.status = event.payload.dao.status;
            break;
          case 'dao.entity.create.success':
            this.daos = [];
            this.daos = this.mapWrongDAOs(await this.daoService.getList());
            this.filteredDaos = this.daos;
            break;
        }
      }
    });
  }

  filterDaos(event) {
    this.filteredDaos = this.daos.filter(dao =>
      dao.name.toLowerCase().includes(event.detail.value.toLowerCase())
    );
  }

  async openCreateDaoModal() {
    const modal = await this.modalController.create({
      component: CreateDaoPage,
      breakpoints: [0, 0.3, 0.5, 0.8, 1],
      initialBreakpoint: 1,
      handle: true,
      cssClass: 'custom-modal'
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.daos = [];
      this.daos = this.mapWrongDAOs(await this.daoService.getList());
      this.filteredDaos = this.daos;
    }
  }

}
