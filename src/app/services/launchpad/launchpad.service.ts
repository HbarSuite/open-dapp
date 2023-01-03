import { Injectable } from '@angular/core';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import Decimal from 'decimal.js';
import { Observable } from 'rxjs';
import { NotificationsService } from '../notifications/notifications.service';
import { SmartService } from '../smart/smart.service';

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

  async getList(): Promise<Array<any>> {
    return new Promise(async(resolve, reject) => {
      try {
        let launchpads = await this.smartNodeSdkService.getRestService().loadLaunchpads();
        this.launchpads = launchpads.data;
        resolve(this.launchpads);
      } catch(error) {
        reject(error);
      }
    })
  }

  async getLaunchpad(launchpadId: string): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        if(this.launchpads.length == 0) {
          await this.getList();
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
        let discount = await this.smartNodeSdkService.getRestService().calculateLaunchpadDiscount(
          token.launchpad.consensus_timestamp,
          sender
        );
        
        resolve(discount.data);
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
        let responseData = await this.smartNodeSdkService.launchpadNftBuy(
          buyer,
          priceAmount,
          tokenId
        );

        resolve(responseData);
      } catch(error) {
        reject(error);
      }
    })
  }

  async launchpadBuy(
    buyer: string, 
    hbarAmount: Decimal, 
    tokenId: string,
    referral: string
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let response = await this.smartNodeSdkService.launchpadBuy(
          buyer,
          hbarAmount,
          tokenId,
          referral
        );

        resolve(response);
      } catch(error) {
        reject(error);
      }
    })
  }

  async launchpadConfirm(
    transactionId: string,
    success: boolean,
    message: string
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let record = await this.smartNodeSdkService.launchpadConfirm(
          transactionId, 
          success, 
          message
        );

        resolve(record);
      } catch(error) {
        reject(error);
      }
    })
  }
}
