import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { BuyIcoPage } from '../modals/ico/buy-ico/buy-ico.page';
import { NotificationsService } from '../services/notifications/notifications.service';
import { Subscription } from 'rxjs';
import Decimal from 'decimal.js';
import * as lodash from 'lodash';
import { LaunchpadService } from '../services/launchpad/launchpad.service';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@capacitor/clipboard';
import { Transaction } from '@hashgraph/sdk';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-launchpad',
  templateUrl: './launchpad.page.html',
  styleUrls: ['./launchpad.page.scss'],
})
export class LaunchpadPage implements OnInit, OnDestroy {
  public place_holders = new Array();
  public tokens = new Array();
  public filteredTokens = new Array();
  public searchNotFound: boolean;
  private eventsSubscription: Subscription;
  public searchFilter: string = null;
  private referral: string = null;
  private hsuiteTokenInfos: any = null;
  private wallet: string = null;
  public segment: string = 'running';

  constructor(
    private loadingController: LoadingController,
    private modalController: ModalController,
    private notificationsService: NotificationsService,
    private launchpadService: LaunchpadService,
    private smartNodeSdkService: SmartNodeSdkService,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) {
    this.place_holders = Array(4).fill(0, 4).map((x,i)=>i);
  }

  segmentChanged(event) {
    this.filterTokens();
  }

  async showDetails(token) {
    const alert = await this.alertController.create({
      header: token.name,
      subHeader: `$${token.symbol}`,
      message: token.launchpad.infos.description,
      buttons: [
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {},
        },
        {
          text: 'WEBSITE',
          role: 'cancel',
          handler: () => {
            window.open(token.launchpad.infos.url, '_system');
          },
        },        
      ],
    });

    await alert.present();
  }

  async copyShareLink(token: any) {
    try {
      let url = `${window.location.origin}/launchpad?token=${token.id}`;

      if(this.wallet && token.launchpad.referrals && !lodash.isArray(token.launchpad.referrals)) {
        url += `&referral=${this.wallet}`;
      }

      await Clipboard.write({
        string: url
      });
  
      await this.notificationsService.showNotification('Copied to Clipboard!', 'primary'); 
    } catch(error) {
      await this.notificationsService.showNotification(error.message); 
    }    
  }

  private filterTokens() {
    if(this.searchFilter) {
      this.filteredTokens = this.tokens
      .filter((token) => 
        token.name.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
        token.symbol.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
        token.launchpad.description?.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
        token.id.toLowerCase().includes(this.searchFilter.toLowerCase())
      );
    } else {
      this.filteredTokens = this.tokens;
    }

    switch(this.segment) {
      case 'running':
        this.filteredTokens = this.filteredTokens.filter(token => token.launchpad.percentage < 100);
        break;
      case 'sold_out':
        this.filteredTokens = this.filteredTokens.filter(token => token.launchpad.percentage == 100);
        break;
    }

    if(this.filteredTokens.length == 0) {
      this.searchNotFound = true;
    } else {
      this.searchNotFound = false;
    }
  }

  getNodeDetails() {
    let node = this.launchpadService.getCurrentNode();
    let details = `Connected to <a href="${node.url}/api" target="_blank"><b>${node.operator}</b></a>`;
    return details;
  }

  async ngOnInit() {
    this.launchpadService.loadHashconnectData().then(async (hashConnectData) => {
      this.wallet = lodash.first(hashConnectData.accountIds);
    });

    this.smartNodeSdkService.getEventsObserver().subscribe(async (event) => {
      if (event.method == 'authenticate') {
        let hashConnectData = await this.launchpadService.loadHashconnectData();
        this.wallet = lodash.first(hashConnectData.accountIds);
      }
    });

    this.smartNodeSdkService.getHashPackService().observeHashpackConnection.subscribe(async (savedData) => {
      if (!savedData.accountIds.length) {
        this.wallet = null;
      }
    });

    this.route.queryParams
    .subscribe(async(params) => {
      let utilities = (await this.smartNodeSdkService.getRestService().getUtilities()).data;
      this.hsuiteTokenInfos = (await this.smartNodeSdkService.getRestService().getTokenInfos(utilities.hsuite.id)).data;
      await this.loadLaunchpads();

      this.referral = params.referral;

      if(params.token) {
        this.searchFilter = params.token;
        this.filterTokens();
      }
    });
  }

  ngOnDestroy() {
    this.eventsSubscription?.unsubscribe();
  }

  async loadLaunchpads() {
    try {
      this.tokens = await this.launchpadService.getList();
      this.tokens = this.tokens.filter(token => environment.launchpads.includes(token.id));
      
      this.filteredTokens = this.tokens.map(token => {
        token.launchpad.calculatedFees = this.calculateTokenFees(token).formatted;
        return token;
      });

      this.filteredTokens = this.tokens.filter(token => token.launchpad.percentage < 100);
    } catch(error) {
      await this.notificationsService.showNotification(error.message);
      this.place_holders = [];
    }
  }

  calculateTokenFees(token): {value: number, formatted: string} {
    try {
      let calculatedFee = {
        value: 0,
        formatted: ''
      };
  
      switch(token.type) {
        case 'NON_FUNGIBLE_UNIQUE':
          if(token.launchpad.buy_with_token) {
            calculatedFee = {
              value: token.launchpad.fees.fixed.hsuite,
              formatted: `${token.launchpad.fees.fixed.hsuite}`
            }
          } else {
            if(token.launchpad.fees_in_hbar) {
              calculatedFee = {
                value: new Decimal(token.launchpad.price)
                  .times(token.launchpad.fees.percentage.hbar).toNumber(),
                formatted: `${new Decimal(token.launchpad.price)
                  .times(token.launchpad.fees.percentage.hbar).toString()} ℏ`
              }
            } else {
              calculatedFee = {
                value: new Decimal(token.launchpad.price).div(this.hsuiteTokenInfos.price)
                  .times(token.launchpad.fees.percentage.hsuite).toNumber(),
                formatted: `${new Decimal(token.launchpad.price).div(this.hsuiteTokenInfos.price)
                  .times(token.launchpad.fees.percentage.hsuite).toString()} HSUITE`
              }
            }
          }
          break;
        case 'FUNGIBLE_COMMON':
          if(token.launchpad.tokenId != this.hsuiteTokenInfos.id) {
            if(token.launchpad.fees_in_hbar) {
              calculatedFee = {
                value: token.launchpad.fees.percentage.hbar * 100,
                formatted: `${token.launchpad.fees.percentage.hbar * 100}%  ℏ`
              }
            } else {
              calculatedFee = {
                value: token.launchpad.fees.percentage.hsuite * 100,
                formatted: `${token.launchpad.fees.percentage.hsuite * 100}%`
              }
            }
          }
          break;
      }
  
      return calculatedFee;      
    } catch(error) {
      this.notificationsService.showNotification(error.message);
    }
  }

  onSearch(searchFilter) {
    this.searchFilter = searchFilter.detail.value;
    this.filterTokens();
  }

  public async CalculateDiscount(token: any, sender: string): Promise<number> {
    return new Promise(async(resolve, reject) => {
      try {
        let discount = await this.launchpadService.CalculateDiscount(
          token,
          sender
        );

        resolve(discount);
      } catch(error) {
        reject(error);
      }
    });
  }

  getTokenSymbol(launchpad: any) {
    if(launchpad.buy_with_token) {
      return launchpad.buy_with_token.symbol;
    } else {
      return "ℏ";
    }
  }

  public async openBuyModal(token: any, sender: string) {
    try {
      const discount = await this.CalculateDiscount(token, sender);
      const modal = await this.modalController.create({
        component: BuyIcoPage,
        componentProps: {
          token: token,
          sender: sender,
          discount: discount
        },
        ...{
            breakpoints: [0, 0.5, 0.75, 1],
            initialBreakpoint: 1,
            cssClass: 'custom-modal'
          }
      });

      modal.onDidDismiss().then(async(response) => {
        if(response.data && response.data.sender && response.data.hbarAmount) {
          const loading = await this.loadingController.create({
            message: 'Hsuite Network is validating your request, please wait...'
          });

          loading.present();

          let launchpadBuyResponse: any;

          try {
            if(token.type == 'NON_FUNGIBLE_UNIQUE') {
              launchpadBuyResponse = await this.launchpadService.launchpadNftBuy(
                response.data.sender,
                new Decimal(response.data.hbarAmount),
                token.id
                );
            } else {
              launchpadBuyResponse = await this.launchpadService.launchpadBuy(
                response.data.sender,
                new Decimal(response.data.hbarAmount),
                token.id,
                this.referral
              );
            }

            loading.message = 'Please sign the transaction in your wallet...';

            let hashpackResponse: any = await this.launchpadService.hashpackTransaction(
              launchpadBuyResponse.transaction, response.data.sender, token.launchpad.hidden_mint
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
              this.notificationsService.showNotification(error.message);
            }
            
          } catch(error) {
            loading.dismiss();
            await this.notificationsService.showNotification(error.message);
          }
        }
      });

      modal.present();
    } catch(error) {
      await this.notificationsService.showNotification(error.message);
    }
  }

    async checkBalances(wallet: string, tokenToBuy: any): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        let utilities = (await this.smartNodeSdkService.getRestService().getUtilities()).data;
        let accountInfo = (await this.smartNodeSdkService.getRestService().getAccountBalance(wallet)).data;
        let hsuiteFees = this.calculateTokenFees(tokenToBuy); 

        if(tokenToBuy.id == utilities.hsuite.id) {
          resolve(true);
        } else {
          let hsuiteInWallet = accountInfo.tokens.find(token => token.tokenId == utilities.hsuite.id);
          hsuiteInWallet = hsuiteInWallet.balance / (10 ** utilities.hsuite.decimals);

          if(hsuiteInWallet >= hsuiteFees.value) {
            resolve(true);
          } else {
            reject(new Error(`Sorry, you must own enough HSUITE in order to pay fees.`));
          }
        }      
      } catch(error) {
        reject(error);
      }
    });
  }

  async BuyNow(token: any) {
    this.launchpadService.loadHashconnectData().then(async(localData) => {
      if(localData.accountIds && localData.accountIds.length) {
        let authSession = await this.launchpadService.getAuthSession();

        if(authSession && authSession.success) {
          // checking if wallet is associated to token...
          const loading = await this.loadingController.create({
            message: 'Checking token association...'
          });

          loading.present();

          this.launchpadService.getAccountBalance(localData.accountIds[0]).then(async(accountInfo) => {
            let associatedTokens = new Map();

            accountInfo.data.tokens.forEach(token => {
              associatedTokens.set(token.tokenId, {
                balance: token.balance,
                decimals: token.decimals
              })
            });

            let missingTokens = [];

            if(!associatedTokens.get(token.id)) {
              missingTokens.push(token.id);
            }

            missingTokens = [...new Set(missingTokens)];

            if(missingTokens.length == 0) {
              // check for hsuite balance before allowing to buy...
              await this.checkBalances(localData.accountIds[0], token);
              await this.openBuyModal(token, localData.accountIds[0]);
            } else {
              loading.message = "Please approve token association from your wallet...";
              let responseData: any = await this.launchpadService.associateToken(missingTokens, localData.accountIds[0]);
              if(responseData.response.success) {
                await this.openBuyModal(token, localData.accountIds[0]);
              } else {
                await this.notificationsService.showNotification(responseData.response.error);
              }
            }

            loading.dismiss();
          }).catch(async(error) => {
            loading.dismiss();
            await this.notificationsService.showNotification(error.message);
          });
        } else {
          this.launchpadService.authorizeWallet();
        }
      } else {
        await this.notificationsService.showNotification('Please, login first.');
      }
    });
  }
}
