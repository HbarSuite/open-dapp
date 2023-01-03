import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { CreateDaoPage } from '../modals/dao/create-dao/create-dao.page';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import { DaoService } from '../services/dao/dao.service';
import { NotificationsService } from '../services/notifications/notifications.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dao',
  templateUrl: './dao.page.html',
  styleUrls: ['./dao.page.scss'],
})
export class DaoPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  
  public daos: Array<any> = new Array();
  public place_holders = new Array();
  public filteredDaos: Array<any> = new Array();

  constructor(
    private modalController: ModalController,
    private smartNodeSdkService: SmartNodeSdkService,
    private daoService: DaoService,
    private notificationsService: NotificationsService
  ) {
    this.place_holders = Array(4).fill(0, 4).map((x,i)=>i);
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
    // in case of broken image links, you can use this method to map the correct image to the DAO
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

  ngOnInit() {
    this.daoService.getList().then(daos => {
      this.daos = this.mapWrongDAOs(daos.filter(dao => environment.daos.includes(dao.tokenId)));
      this.filteredDaos = this.daos;
    }).catch(error => {
      this.notificationsService.showNotification(error.message);
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
      this.daos = await this.daoService.getList();
      this.filteredDaos = this.daos;
    }
  }

  getNodeDetails() {
    let node = this.smartNodeSdkService.getNetworkService().getCurrentNode();
    let details = `Connected to <a href="${node.url}/api" target="_blank"><b>${node.operator}</b></a>`;
    return details;
  }

}
