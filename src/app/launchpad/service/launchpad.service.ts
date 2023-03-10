import { Injectable } from '@angular/core';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import Decimal from 'decimal.js';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { SmartService } from 'src/app/services/smart/smart.service';

@Injectable({
  providedIn: 'root'
})
export class LaunchpadService extends SmartService {

  private launchpads: Array<any> = new Array<any>();

  constructor(
    protected smartNodeSdkService: SmartNodeSdkService,
    protected notificationsService: NotificationsService
  ) {
    super(smartNodeSdkService, notificationsService);    
  }

  async list(): Promise<Array<any>> {
    return new Promise(async(resolve, reject) => {
      try {
        let response = await this.smartNodeSdkService.getNetworkService().getApiEndpoint(`launchpad/list`);
        let node = this.smartNodeSdkService.getNetworkService().getCurrentNode();

        response.forEach((data: any) => {
          data.image = `${node.url}/${data.image}`;
          data.launchpad.header = data.launchpad.header ? `${node.url}/${data.launchpad.header}` : null;
        });

        resolve(response);
      } catch(error) {
        reject(error);        
      }
    });
  }

  async get(launchpadId: string): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        if(this.launchpads.length == 0) {
          await this.list();
        }

        resolve(this.launchpads.find(token => token.launchpad.consensus_timestamp == launchpadId));
      } catch(error) {
        reject(error);
      }
    })
  }

  async CalculateDiscount(token: any, sender: string): Promise<number> {
    return new Promise(async(resolve, reject) => {
      try {
        let response = await this.smartNodeSdkService.getNetworkService()
          .getApiEndpoint(`launchpad/${token.launchpad.consensus_timestamp}/discount/${sender}`);

        resolve(response);
      } catch(error) {
        reject(error);        
      }
    });
  }

  async launchpadNftBuy(
    buyer: string, 
    priceAmount: Decimal, 
    tokenId: string
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let smartNodeSocket = this.smartNodeSdkService.getSocketsService().getMainSocket();

        smartNodeSocket.fromOneTimeEvent('launchpadNftBuy')
          .then((response: {status: string, payload: any, error: string}) => {
          if(response.status == 'success') {
            resolve(response.payload);
          } else {
            reject(new Error(response.error));
          }
        }).catch(error => {
          reject(error);
        });

        smartNodeSocket.emit('launchpadNftBuy', {
          type: 'launchpadNftBuy',
          buyer: buyer,
          priceAmount: priceAmount,
          tokenId: tokenId
        });
      } catch(error) {
        reject(error);
      }
    });
  }

  async launchpadBuy(
    buyer: string, 
    hbarAmount: Decimal, 
    tokenId: string,
    referral: string
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let smartNodeSocket = this.smartNodeSdkService.getSocketsService().getMainSocket();
        
        smartNodeSocket.fromOneTimeEvent('launchpadBuy')
          .then((response: {status: string, payload: any, error: string}) => {
          if(response.status == 'success') {
            resolve(response.payload);
          } else {
            reject(new Error(response.error));
          }
        }).catch(error => {
          reject(error);
        });

        smartNodeSocket.emit('launchpadBuy', {
          type: 'launchpadBuy',
          buyer: buyer,
          hbarAmount: hbarAmount,
          tokenId: tokenId,
          referral: referral
        });
      } catch(error) {
        reject(error);
      }
    });
  }

  async launchpadConfirm(
    transactionId: string,
    success: boolean,
    message: string
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let smartNodeSocket = this.smartNodeSdkService.getSocketsService().getMainSocket();

        smartNodeSocket.fromOneTimeEvent('launchpadConfirm')
          .then((response: {status: string, payload: any, error: string}) => {
          if(response.status == 'success') {
            resolve(response.payload);
          } else {
            reject(new Error(response.error));
          }
        }).catch(error => {
          reject(error);
        });

        smartNodeSocket.emit('launchpadConfirm', {
          type: 'launchpadConfirm',
          transactionId: transactionId,
          success: success,
          message: message
        });
      } catch(error) {
        reject(error);
      }
    });
  }
}
