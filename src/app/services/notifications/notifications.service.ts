import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import { FormatsHelper } from 'src/app/helpers/formats';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private tokens: Array<any> = new Array<any>();
  private formatsHelper: FormatsHelper;
  private loading: any;
  private offlineToastMessage: any;

  constructor(
    private toastController: ToastController,
    private smartNodeSdkService: SmartNodeSdkService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    this.formatsHelper = new FormatsHelper();
  }

  public async showLoading(message: string): Promise<any> {
    this.loading = await this.loadingController.create({
      message: message
    });

    this.loading.present();
  }

  public async showNotification(message: string, color?: string, duration?: number) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration ? duration: 5000,
      color: color ? color : 'danger',
      icon: color ? 'timer-outline' : 'alert-circle-outline'
    });

    toast.present();
  }

  public removeOfflineToastMessage() {
    if(this.offlineToastMessage) {
      this.offlineToastMessage.dismiss();
    }
  }

  private async getTokens(): Promise<Array<any>> {
    return new Promise(async(resolve, reject) => {
      try {
        if(this.tokens.length) {
          resolve(this.tokens);
        } else {
          this.tokens = (await this.smartNodeSdkService.getRestService().loadTokens()).data;
        }

        resolve(this.tokens);
      } catch(error) {
        reject(error);
      }
    })
  }

  public async showServerNotification(message: any) {
    let toast, sentTokens, sentHbars, sentSentence, poolTitle  = null;
    this.tokens = await this.getTokens();

    switch(message.payload.action) {
      // NFT DEX    
      case 'nft_exchange.create_pool':
        switch(message.event) {
          case 'transaction.offline.error':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            this.offlineToastMessage = await this.createServerMessage(
              `Error`,
              message.payload.error,
              5000,
              'danger'
            );
            this.offlineToastMessage.present();
            break;
          case 'transaction.offline.created':
            this.offlineToastMessage = await this.createServerMessage(
              `Sending your pool creation request`,
              'the transaction is going to be signed by the whole network...',
              null,
              'warning'
            );
            this.offlineToastMessage.present();
            break;
          case 'transaction.offline.signed':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            toast = await this.createServerMessage(
              `Transaction Executed`,
              `your nft pool request has been completed`,
              5000,
              'success',
              'checkmark-done-circle-outline'
            );

            toast.present();
            break;
        }
        break;             
      // DAO
      case 'dao.entity.create':
        switch(message.event) {
          case 'transaction.offline.error':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            this.offlineToastMessage = await this.createServerMessage(
              `Error`,
              message.payload.error,
              5000,
              'danger'
            );
            this.offlineToastMessage.present();
            break;
          case 'transaction.offline.created':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            this.offlineToastMessage = await this.createServerMessage(
              'Your DAO has been validated',
              'the network will now take the snapshot and write the DAO into HCS...',
              null,
              'warning'
            );

            this.offlineToastMessage.present();
            break;
          case 'transaction.offline.signed':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            const alert = await this.alertController.create({
              mode: 'ios',
              header: message.payload.dao.name,
              subHeader: message.payload.dao.description,
              message: `your DAO creation request has been sent, thanks for using HbarSuite!`,
              buttons: ['OK'],
            });

            await alert.present();
            break;
        }
        break;
      case 'dao.proposal.create':
        switch(message.event) {
          case 'transaction.offline.error':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            this.offlineToastMessage = await this.createServerMessage(
              `Error`,
              message.payload.error,
              5000,
              'danger'
            );
            this.offlineToastMessage.present();
            break;
          case 'transaction.offline.created':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            this.offlineToastMessage = await this.createServerMessage(
              'Your proposal has been validated',
              'the network will now take the snapshot and write the proposal into HCS...',
              null,
              'warning'
            );

            this.offlineToastMessage.present();
            break;
          case 'transaction.offline.signed':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            const alert = await this.alertController.create({
              mode: 'ios',
              header: message.payload.proposal.title,
              subHeader: `by ${message.payload.proposal.author}`,
              message: `your proposal has been created, thanks for being an active member of ${message.payload.dao.name}`,
              buttons: ['OK'],
            });

            await alert.present();
            break;
        }
        break;
      case 'dao.vote.create':
        switch(message.event) {
          case 'dao.vote.create.pending':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            const alert = await this.alertController.create({
              mode: 'ios',
              header: message.payload.vote.message.dao,
              subHeader: message.payload.vote.message.proposal,
              message: `you voted ${message.payload.vote.message.option}`,
              buttons: ['OK'],
            });

            await alert.present();
            break;
        }
      case 'dao.proposal.vote':
        switch(message.event) {
          case 'transaction.offline.error':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            this.offlineToastMessage = await this.createServerMessage(
              `Error`,
              message.payload.error,
              5000,
              'danger'
            );
            this.offlineToastMessage.present();
            break;
          case 'transaction.offline.created':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            this.offlineToastMessage = await this.createServerMessage(
              message.payload.transaction,
              'Your vote has been validated, and will now be written into HCS...',
              null,
              'warning'
            );

            this.offlineToastMessage.present();
            break;
        }
        break;
      // DEX
      case 'exchange.pool.join':
        switch(message.event) {
          case 'transaction.offline.error':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            this.offlineToastMessage = await this.createServerMessage(
              `Error`,
              message.payload.error,
              5000,
              'danger'
            );
            this.offlineToastMessage.present();
            break;
          case 'transaction.offline.created':
            sentTokens = message.payload.join.tokens.filter(transfer => transfer.amount < 0);
            sentHbars = message.payload.join.hbars.filter(transfer => transfer.amount < 0);

            poolTitle = "Joining ";
            sentTokens.forEach((sentToken, index) => {
              let tokenInfo = this.tokens.find(token => token.tokenId == sentToken.token);

              if(tokenInfo) {
                if(index == sentTokens.length - 1) {
                  poolTitle += `${tokenInfo.symbol}`;
                } else {
                  poolTitle += `${tokenInfo.symbol}/`;
                }
              }
            });

            sentHbars.forEach(sentHbar => {
              let tokenInfo = this.tokens.find(token => token.tokenId == 'HBAR');
              poolTitle += `/${tokenInfo.symbol}`
            });

            this.offlineToastMessage = await this.createServerMessage(
              poolTitle,
              'the transaction is going to be signed by the whole network...',
              null,
              'warning'
            );

            this.offlineToastMessage.present();
            break;
          case 'transaction.offline.signed':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            sentTokens = message.payload.join.tokens.filter(transfer => transfer.amount < 0);
            sentHbars = message.payload.join.hbars.filter(transfer => transfer.amount < 0);

            sentSentence = '<b>You sent:</b>';
            poolTitle = "";
            sentTokens.forEach((sentToken, index) => {
              let tokenInfo = this.tokens.find(token => token.tokenId == sentToken.token);

              if(tokenInfo) {
                let formatAmount = this.formatsHelper.formatNumber(
                  sentToken.amount / (10 ** tokenInfo.decimals),
                  ',',
                  '.',
                  tokenInfo.symbol,
                  tokenInfo.decimals);
                sentSentence += `<br/> ${formatAmount}`;

                if(index == sentTokens.length - 1) {
                  poolTitle += `${tokenInfo.symbol}`;
                } else {
                  poolTitle += `${tokenInfo.symbol}/`;
                }
              }
            });

            sentHbars.forEach(sentHbar => {
              let tokenInfo = this.tokens.find(token => token.tokenId == 'HBAR');
              let formatAmount = this.formatsHelper.formatNumber(
                sentHbar.amount,
                ',',
                '.',
                tokenInfo.symbol,
                tokenInfo.decimals);
              sentSentence += `<br/> ${formatAmount}`;
              poolTitle += `/${tokenInfo.symbol}`
            });

            sentSentence += `<br/><b>You received a liquidity NFT:</b> <br/> ${message.payload.position.token}/#${message.payload.position.serialNumber}`;

            this.offlineToastMessage = await this.createServerMessage(
              poolTitle,
              sentSentence,
              5000,
              'success',
              'checkmark-done-circle-outline'
            );

            this.offlineToastMessage.present();
            break;
        }
        break;
      case 'exchange.pool.exit':
        switch(message.event) {
          case 'transaction.offline.error':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            this.offlineToastMessage = await this.createServerMessage(
              `Error`,
              message.payload.error,
              5000,
              'danger'
            );
            this.offlineToastMessage.present();
            break;
          case 'transaction.offline.created':
            sentTokens = message.payload.exit.tokens.filter(transfer => transfer.amount < 0);
            sentHbars = message.payload.exit.hbars.filter(transfer => transfer.amount < 0);

            poolTitle = "Exiting ";
            sentTokens.forEach((sentToken, index) => {
              let tokenInfo = this.tokens.find(token => token.tokenId == sentToken.token);

              if(index == sentTokens.length - 1) {
                poolTitle += `${tokenInfo.symbol}`;
              } else {
                poolTitle += `${tokenInfo.symbol}/`;
              }
            });

            sentHbars.forEach(sentHbar => {
              let tokenInfo = this.tokens.find(token => token.tokenId == 'HBAR');
              poolTitle += `${tokenInfo.symbol}`
            });

            this.offlineToastMessage = await this.createServerMessage(
              poolTitle,
              'the transaction is going to be signed by the whole network...',
              null,
              'warning'
            );

            this.offlineToastMessage.present();
            break;
          case 'transaction.offline.signed':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            sentTokens = message.payload.exit.tokens.filter(transfer => transfer.amount < 0);
            sentHbars = message.payload.exit.hbars.filter(transfer => transfer.amount < 0);

            sentSentence = '<b>You received:</b>';
            poolTitle = "";
            sentTokens.forEach((sentToken, index) => {
              let tokenInfo = this.tokens.find(token => token.tokenId == sentToken.token);
              let formatAmount = this.formatsHelper.formatNumber(
                sentToken.amount / (10 ** tokenInfo.decimals),
                ',',
                '.',
                tokenInfo.symbol,
                tokenInfo.decimals);
              sentSentence += `<br/> ${formatAmount}`;

              if(index == sentTokens.length - 1) {
                poolTitle += `${tokenInfo.symbol}`;
              } else {
                poolTitle += `${tokenInfo.symbol}/`;
              }
            });

            sentHbars.forEach(sentHbar => {
              let tokenInfo = this.tokens.find(token => token.tokenId == 'HBAR');
              let formatAmount = this.formatsHelper.formatNumber(
                sentHbar.amount,
                ',',
                '.',
                tokenInfo.symbol,
                tokenInfo.decimals);
              sentSentence += `<br/> ${formatAmount}`;
              poolTitle += `${tokenInfo.symbol}`
            });

            sentSentence += `<br/><b>You sent a liquidity NFT:</b> <br/> ${message.payload.position.token}/#${message.payload.position.serialNumber}`;

            this.offlineToastMessage = await this.createServerMessage(
              poolTitle,
              sentSentence,
              5000,
              'success',
              'checkmark-done-circle-outline'
            );

            this.offlineToastMessage.present();
            break;
        }
        break;
    }
  }

  public async createServerMessage(header: string, message: string, duration?: number, color?: string, icon?: string) {
    if(this.loading) {
      this.loading.dismiss();
      this.loading = null;
    }

    const toast = await this.toastController.create({
      header: header,
      message: message,
      duration: duration,
      color: color,
      icon: icon ? icon : 'timer-outline',
      position: 'top'
    });

    return toast;
  }
}
