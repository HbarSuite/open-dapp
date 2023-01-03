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
  
    console.log('showServerNotification', message);
    this.tokens = await this.getTokens();
    
    switch(message.payload.action) {
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
              header: message.payload.dao.name,
              subHeader: message.payload.dao.description,
              message: `your DAO has been created, thanks for being using HSuite!`,
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
              header: message.payload.proposal.title,
              subHeader: `by ${message.payload.proposal.author}`,
              message: `your proposal has been created, thanks for being an active member of ${message.payload.dao.name}`,
              buttons: ['OK'],
            });
        
            await alert.present();
            break;
        }
        break;
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
          case 'transaction.offline.signed':
            if(this.offlineToastMessage) {
              this.offlineToastMessage.dismiss();
            }

            const alert = await this.alertController.create({
              header: message.payload.vote.dao,
              subHeader: message.payload.vote.proposal,
              message: `you voted ${message.payload.vote.option}`,
              buttons: ['OK'],
            });
        
            await alert.present();
            break;
        }
        break;
      case 'offline.exchange.swap.requested':
        if(this.offlineToastMessage) {
          this.offlineToastMessage.dismiss();
        }

        this.offlineToastMessage = await this.createServerMessage(
          `Swapping Request`, 
          'your request is being validated by our Oracle...', 
          null, 
          'warning'
        );
        this.offlineToastMessage.present();
        break;
      case 'offline.exchange.swap.approved':
        if(this.offlineToastMessage) {
          this.offlineToastMessage.dismiss();
        }

        this.offlineToastMessage = await this.createServerMessage(
          `Oracle Approved!`, 
          'your transaction will now be processed...', 
          null, 
          'success',
          'checkmark-done-circle-outline'
        );
        this.offlineToastMessage.present();
        break;        
      case 'exchange.swap.execute':
      // case 'exchange.swap.request':
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

            let sent, received = null;

            if(message.payload.swap.from.token != 'HBAR') {
              sent = `sent ${message.payload.swap.from.amount / (10 ** message.payload.swap.from.tokenDetails.decimals)} ${message.payload.swap.from.tokenDetails.symbol}`;
            } else {
              sent = `sent ${message.payload.swap.from.amount} ${message.payload.swap.from.tokenDetails.symbol}`;
            }

            if(message.payload.swap.to.token != 'HBAR') {
              received = `received ${message.payload.swap.to.amount / (10 ** message.payload.swap.to.tokenDetails.decimals)} ${message.payload.swap.to.tokenDetails.symbol}`;
            } else {
              received = `received ${message.payload.swap.to.amount} ${message.payload.swap.to.tokenDetails.symbol}`;
            }
                        
            this.offlineToastMessage = await this.createServerMessage(
              message.payload.transaction, 
              `SWAP <br/> ${sent} <br/> ${received}`, 
              5000, 
              'success', 
              'checkmark-done-circle-outline'
            );
            this.offlineToastMessage.present();
            break;            
        }
        break;  
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
      case 'launchpad.buy':
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
              `Sending ${message.payload.token.symbol}`, 
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
  
            if(message.payload.type == 'FUNGIBLE_COMMON') {
              let amount = this.formatsHelper.formatNumber(
                message.payload.token.amount, 
                ',', 
                '.', 
                message.payload.token.symbol, 
                message.payload.token.decimals);
  
              toast = await this.createServerMessage(
                `Transaction Executed`, 
                `you just received ${amount} <br/> ${message.payload.transaction_id}`, 
                5000, 
                'success', 
                'checkmark-done-circle-outline'
              );
              
              toast.present();              
            } else {
              let messageContent = `you just received ${message.payload.token.id}/${message.payload.token.serialNumber} 
                <br/> ${message.payload.transaction_id} <br/>`;

              if(message.payload.token.bonus) {
                messageContent += `<br/> <b>You also receiver some bonus NFT!!</b> 
                  <br/> ID ${message.payload.token.bonus.id} from ${message.payload.token.bonus.from} to ${message.payload.token.bonus.to}`;
              }

              toast = await this.createServerMessage(
                `Transaction Executed`, 
                messageContent, 
                5000, 
                'success', 
                'checkmark-done-circle-outline'
              );
              
              toast.present(); 
            }
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
