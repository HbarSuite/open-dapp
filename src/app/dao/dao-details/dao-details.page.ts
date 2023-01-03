import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonSlides, LoadingController } from '@ionic/angular';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import { DaoService } from 'src/app/services/dao/dao.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import * as moment from 'moment';
import * as lodash from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dao-details',
  templateUrl: './dao-details.page.html',
  styleUrls: ['./dao-details.page.scss'],
})
export class DaoDetailsPage implements OnInit, OnDestroy {
  @ViewChild('slides', { static: true }) slider: IonSlides;

  dao: any = null;
  segment = 'proposals';
  proposal_type = 'public';
  publicProposals: Array<any> = new Array();
  filteredPublicProposals: Array<any> = new Array();

  councilProposals: Array<any> = new Array();
  filteredCouncilProposals: Array<any> = new Array();
  
  focused: boolean;
  isModalOpen = false;
  isLoading: boolean = true;
  daoName: string;
  startShowPicker = false;
  endShowPicker = false;
  private loading: HTMLIonLoadingElement;
  private eventsSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private smartNodeSdkService: SmartNodeSdkService,
    private daoService: DaoService,
    private notificationsService: NotificationsService,
    private loadingController: LoadingController
  ) {}

  settings = { choices: { min: 2, max: 30 } };

  newProposal: any = {
    title: '',
    description: '',
    content: '',
    options: [{ name: '' }, { name: '' }],
    start_date: moment(),
    end_date: moment().add(1, 'week')
  };

  opt: any;
  moreIndex: any = 2;

  addOption(val) {
    if (val == 1) {
      if (this.moreIndex < this.settings.choices.max) {
        this.newProposal.options.push(this.opt = { name: '' });
        this.moreIndex++;
      }
    }
    else {
      if (this.moreIndex > this.settings.choices.min) {
        this.newProposal.options.pop();
        this.moreIndex--;
      }
    }
  }

  async createProposal() {
    try {
      let isLoggedAuth = await this.daoService.checkLoginAuth();
      if(isLoggedAuth) {
        this.loading = await this.loadingController.create({
          message: 'Creating the proposal...'
        });

        this.loading.present();

        let hashConnectData = await this.daoService.loadHashconnectData();
        let wallet = lodash.first(hashConnectData.accountIds);
        let proposal = Object.assign({}, this.newProposal);

        proposal.options = this.newProposal.options.map(option => option.name)
          .filter(option => option != '');
        proposal.start_date = this.newProposal.start_date.valueOf().toString();
        proposal.end_date = this.newProposal.end_date.valueOf().toString();
  
        let fees = await this.daoService.getFees("proposals");
        let responseData = await this.daoService.proposalTransaction(
          this.dao.tokenId,
          proposal,
          wallet,
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
      }
    } catch (error) {
      this.loading.dismiss();
      this.notificationsService.showNotification(error.message);
    }
  }

  ngOnDestroy() {
    if(this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  private cleanProposals(): void {
    this.publicProposals = new Array();
    this.filteredPublicProposals = new Array();
  
    this.councilProposals = new Array();
    this.filteredCouncilProposals = new Array();    
  }

  private cleanProposalForm(): void {
    this.newProposal = {
      title: '',
      description: '',
      content: '',
      options: [{ name: '' }, { name: '' }],
      start_date: moment(),
      end_date: moment().add(1, 'week')
    };    
  }

  private async initProposals(noCache: boolean): Promise<boolean> {
    return new Promise(async(resolve, reject) => {
      try {
        const proposals = await this.daoService.getProposals(this.dao.tokenId, noCache);

        this.publicProposals = proposals.filter(proposal => proposal.type == 'public');
        this.filteredPublicProposals = this.publicProposals;

        this.councilProposals = proposals.filter(proposal => proposal.type == 'private');
        this.filteredCouncilProposals = this.councilProposals;

        this.isLoading = false;
        resolve(true);
      } catch(error) {
        console.log(error);
        reject(error);
      }     
    })
  }

  private mapWrongDAO(dao: any): Array<any> {
    if(dao.tokenId == "0.0.1457166") {
      dao.image = 'assets/icon/nftv.jpeg';
      return dao;
    } else {
      return dao;
    }
  }

  ngOnInit() {
    let daoTokenId = this.route.snapshot.paramMap.get('dao');

    this.daoService.getDao(daoTokenId).then(async(dao) => {
      this.dao = this.mapWrongDAO(dao);
      await this.initProposals(false);
    }).catch(error => {
      this.notificationsService.showNotification(error.message);
    });

    this.eventsSubscription = this.smartNodeSdkService.getEventsObserver().subscribe(async(event) => {
      if(event.method == 'error') {
        this.loading.dismiss();
      }

      if(event.method == 'events' && 
      event.payload.action == 'dao.proposal.create' && 
      event.event == 'transaction.offline.signed') {
        if(this.loading) {
          this.loading.dismiss();
        }
        
        this.segment = 'proposals';
        this.cleanProposals();
        this.cleanProposalForm();
        await this.initProposals(true);
      }
    }); 
  }

  generateImageUrl(image: string) {
    if(image.startsWith('http') || image.startsWith('assets')) {
      return image;
    } else {
      let node = this.smartNodeSdkService.getNetworkService().getCurrentNode().url;
      return `${node}/${image}`;
    }
  }

  getColor(proposal: any): string {
    let color = 'primary';

    switch (proposal.status) {
      case 'active':
      case 'approved':
        color = 'primary';
        break;
      case 'closed':
      case 'rejected':
        color = 'medium';
        break;
      case 'pending':
        color = 'danger';
        break;
    }

    return color;
  }

  filterPrivateProposals(event) {
    switch(event.detail.value) {
      case 'all':
        this.filteredCouncilProposals = this.councilProposals;
        break;
      case 'approved':
      case 'pending':
      case 'rejected':
        this.filteredCouncilProposals = this.councilProposals.filter(proposal => {
          if (proposal.status == event.detail.value.toLowerCase()) {
            return proposal;
          }
        });
        break;       
    }
  }

  filterPublicProposals(event) {
    switch(event.detail.value) {
      case 'all':
        this.filteredPublicProposals = this.publicProposals;
        break;
      case 'active':
      case 'pending':
      case 'closed':
        this.filteredPublicProposals = this.publicProposals.filter(proposal => {
          if (proposal.status == event.detail.value.toLowerCase()) {
            return proposal;
          }
        });
        break;       
    }
  }

  onBlur(event: any) {
    const value = event.target.value;
    if (!value) {
      this.focused = false;
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  startDateChanged(value) {
    this.newProposal.start_date = moment(value);
    this.startShowPicker = false;
  }

  endDateChanged(value) {
    this.newProposal.end_date = moment(value);
    this.endShowPicker = false;
  }

}
