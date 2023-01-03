import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import { FormatsHelper } from 'src/app/helpers/formats';
import { DaoService } from 'src/app/services/dao/dao.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import Decimal from 'decimal.js';
import * as lodash from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-proposals',
  templateUrl: './proposals.page.html',
  styleUrls: ['./proposals.page.scss'],
})
export class ProposalsPage implements OnInit, OnDestroy {
  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private smartNodeSdkService: SmartNodeSdkService,
    private daoService: DaoService,
    private notificationsService: NotificationsService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  private daoTokenId: string;
  private daoProposal: string;
  private proposalType: 'public' | 'private';

  public dao: any = null;
  public proposal: any = null;
  public votes: Array<any> = new Array<any>();
  public snapshot: any = null;
  public results: any = {};
  private formatsHelper: FormatsHelper;

  private eventsSubscription: Subscription;
  private hashpackSubscription: Subscription;
  private votesSubscription: Subscription;

  public isVoting: boolean = false;
  public show = false;
  public showVotes = false;
  public selectedOption: {
    index: number, 
    value: string
  } = {
    index: null,
    value: null
  };
  public wallet: string;
  public isLoggedIn: boolean = true;

  ngOnDestroy(): void {
    if(this.hashpackSubscription) {
      this.hashpackSubscription.unsubscribe();
    }

    if(this.votesSubscription) {
      this.votesSubscription.unsubscribe();
    }

    if(this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  private linkify(text) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return '<a target="_blank" href="' + url + '">' + url + '</a><br/><br/>';
    });
  }

  private async _init(): Promise<boolean> {
    return new Promise(async(resolve, reject) => {
      try {
        this.proposal = await this.daoService.getProposal(this.daoTokenId, this.daoProposal, this.proposalType);
        this.proposal.content = this.linkify(this.proposal.content);
        this.proposal.content = this.proposal.content.replaceAll(/(?<!\b(?:https?:\/\/|www)\S*)\. /g,'.<br/><br/>');

        if((this.proposal.type == 'public' && this.proposal.status == 'active') 
          || (this.proposal.type == 'private' && this.proposal.status == 'pending')
        ) {
          this.showVotes = true;

          this.votesSubscription = this.daoService.getVotes(this.proposal.votes).subscribe(votes => {
            this.votes = votes;
          });
                
          this.snapshot = await this.daoService.validateSnapshot(this.wallet, this.daoTokenId, this.daoProposal, this.proposalType);
        } else {
          this.snapshot = [];
        }

        resolve(true);
      } catch(error) {
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
    this.formatsHelper = new FormatsHelper();

    this.daoService.loadHashconnectData().then(async(hashConnectData) => {
      try {
        this.wallet = lodash.first(hashConnectData.accountIds);
        this.daoTokenId = this.route.snapshot.paramMap.get('dao');
        this.daoProposal = this.route.snapshot.paramMap.get('proposal');
        this.proposalType = <'public' | 'private'> this.route.snapshot.paramMap.get('type');

        this.dao = this.mapWrongDAO(await this.daoService.getDao(this.daoTokenId));

        if(!this.wallet) {
          this.isLoggedIn = false;
        } else {
          await this._init();

          this.hashpackSubscription = this.smartNodeSdkService.getHashPackService().observeHashpackConnection.subscribe(async(savedData) => {
            if(!savedData.accountIds.length) {
              this.isLoggedIn = false;
            }
          });
          
          this.eventsSubscription = this.smartNodeSdkService.getEventsObserver().subscribe(async(event) => {
            if(event.method == 'error' || event.event == 'transaction.offline.error') {
              this.isVoting = false;
            }

            if(event.method == 'events' && 
            event.payload.action == 'dao.proposal.vote' && 
            event.event == 'transaction.offline.signed') {
              await this.updateAfterVote(event.payload.proposal);
            }
      
            if(event.method == 'authenticate') {
              this.isLoggedIn = true;
              await this._init();
            }
          });          
        }
      } catch(error) {
        this.notificationsService.showNotification(error.message);
      }    
    }).catch(error => {
      this.notificationsService.showNotification(error.message);
    });
  }

  async updateAfterVote(proposal: any) {
    try {
      this.proposal = proposal;
      this.votes = new Array<any>();

      this.votesSubscription = this.daoService.getVotes(this.proposal.votes).subscribe(votes => {
        this.votes = votes;
      });

      this.isVoting = false;
    } catch(error) {
      this.notificationsService.showNotification(error.message);
    }
  }

  hasVoted(): boolean {
    let hasVoted = this.votes.find(x => x.wallet == this.wallet);

    if(hasVoted) {
      this.selectedOption.value = hasVoted.option;
      return true;
    } else {
      return false;
    }
  }

  calculateVotePercentage(proposal: any, result: any) {
    let percentage = new Decimal(result.value.weight).div(proposal.latestStatistics.weights).times(100).toDecimalPlaces(2);
    if(percentage.isNaN()) {
      return 0;
    } else {
      return percentage.toNumber();
    }
  }

  calculateVoteProgressBar(proposal: any, result: any) {
    let progressBar = new Decimal(result.value.weight).div(proposal.latestStatistics.weights).toDecimalPlaces(2);

    if(progressBar.isNaN()) {
      return 0;
    } else {
      return progressBar.toNumber();
    }
  }

  formatDate(date: string) {
    return moment(date, "x").format('MMMM Do YYYY, h:mm:ss a');
  }

  getColor(proposal: any): string {
    let color = 'primary';

    switch(proposal.status) {
      case 'active':
        color = 'primary';
        break;
      case 'closed':
        color = 'medium';
        break;        
      case 'pending':
        color = 'danger';
        break;        
    }

    return color;
  }

  async presentAlert(header: string, subHeader: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async voteProposal(proposal: any) {
    try {
      let isLoggedAuth = await this.daoService.checkLoginAuth();
      if(isLoggedAuth) {
        let start = moment(proposal.start_date, "x");

        if(start.isAfter()) {
          await this.presentAlert('Wait...', 'this proposal is still in pending', `it will start in ${start.fromNow()}`);
        } else {
          if(this.snapshot) {
            const loading = await this.loadingController.create({
              message: 'Sending your vote...'
            });
    
            loading.present();
            this.isVoting = true;
    
            let fees = await this.daoService.getFees("votes");
            let responseData = await this.daoService.voteTransaction(
              this.dao.tokenId,
              this.proposal,
              this.selectedOption.index,
              this.wallet,
              fees
            );

            loading.dismiss();

            if(responseData.status == 'SUCCESS') {
              await this.notificationsService.showNotification(
                'Transaction sent correctly, it will be shortly processed by the network...',
                'success',
                2500
              );
            } else {
              await this.notificationsService.showNotification(responseData.payload);
              this.isVoting = false;
            }
          } else {
            if(this.proposal.type == 'private') {
              await this.presentAlert('Ops...', `You are not a ${this.dao.name}'s council member`, `You need to wait for the council to approve this proposal to be able to vote on it.`);
            } else {
              await this.presentAlert('Ops...', `You are not an ${this.dao.name} holder`, `You need to hold some ${this.dao.name} token to have the rights to vote.`);
            }
          }
        }         
      }
    } catch(error) {
      this.notificationsService.showNotification(error.message);
    }
  }

  formatBigNumber(value: number) {
    return this.formatsHelper.formatBigNumber(value, this.dao.decimals);
  }

  goBack() {
    this.navCtrl.back();
  }

  selectOption(index: number) {
    this.selectedOption.index = index;
    this.selectedOption.value = this.proposal.options[index];
  }

  generateImageUrl(image: string) {
    if(image.startsWith('http') || image.startsWith('assets')) {
      return image;
    } else {
      let node = this.smartNodeSdkService.getNetworkService().getCurrentNode().url;
      return `${node}/${image}`;
    }
  }

}
