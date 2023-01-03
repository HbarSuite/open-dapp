import { Injectable } from '@angular/core';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class SmartService {

  constructor(
    protected smartNodeSdkService: SmartNodeSdkService,
    protected notificationsService: NotificationsService
  ) {}

  async loadHashconnectData(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const hashconnectData = await this.smartNodeSdkService.getHashPackService().loadHashconnectData();
        resolve(hashconnectData);
      } catch(error) {
        reject(error);
      }
    });
  }

  async getAuthSession(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const authSession = await this.smartNodeSdkService.getHashPackService().getAuthSession();
        resolve(authSession);
      } catch(error) {
        reject(error);
      }
    });
  }

  authorizeWallet(): void {
    this.smartNodeSdkService.getSocketsService().authorizeWallet();
  }

  getCurrentNode(): any {
    return this.smartNodeSdkService.getNetworkService().getCurrentNode();
  }

  getCurrentNodeUrl(): string {
    return this.getCurrentNode().url;
  }

  getMainSocket(): any {
    return this.smartNodeSdkService.getSocketsService().getMainSocket();
  }

  async checkLoginAuth(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const hashconnectData = await this.loadHashconnectData();
        if (hashconnectData.accountIds && hashconnectData.accountIds.length) {
          const authSession = await this.getAuthSession();

          if (authSession && authSession.success) {
            resolve(true);
          } else {
            this.authorizeWallet();
            resolve(false);
          }
        } else {
          await this.notificationsService.showNotification('Please, login first.');
          resolve(false);
        }
      } catch(error) {
        reject(error);
      }
    });
  }

  async getAccountBalance(accountId: string): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let balance = await this.smartNodeSdkService.getRestService().getAccountBalance(accountId);
        resolve(balance);
      } catch(error) {
        reject(error);
      }
    });
  }

  async associateToken(tokenIds: Array<string>, walletId: string): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let responseData: any = await this.smartNodeSdkService.getHederaService().associateToken(tokenIds, walletId);
        resolve(responseData);
      } catch(error) {
        reject(error);
      }
    })
  }

  async hashpackTransaction(transaction: any, buyer: string, hidden_mint: boolean = false): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let hashpackResponse: any = await this.smartNodeSdkService.getHashPackService().sendTransaction(
          transaction, buyer, false, hidden_mint
        );

        resolve(hashpackResponse);
      } catch(error) {
        reject(error);
      }
    });
  }
}
