import { Injectable } from '@angular/core';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import { Observable } from 'rxjs';
import { NotificationsService } from '../notifications/notifications.service';
import { SmartService } from '../smart/smart.service';

@Injectable({
  providedIn: 'root'
})
export class DaoService extends SmartService {  

  private daos: Array<any> = new Array<any>();
  private proposals: Object = new Object();

  constructor(
    protected smartNodeSdkService: SmartNodeSdkService,
    protected notificationsService: NotificationsService
  ) {
    super(smartNodeSdkService, notificationsService);
  }

  async getList(): Promise<Array<any>> {
    return new Promise(async(resolve, reject) => {
      try {
        let daos = await this.smartNodeSdkService.getRestService().loadDAOs();
        this.daos = daos.data;
        resolve(this.daos);
      } catch(error) {
        reject(error);
      }
    })
  }

  async getDao(tokenId: string): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        if(this.daos.length == 0) {
          await this.getList();
        }

        resolve(this.daos.find(dao => dao.tokenId == tokenId));
      } catch(error) {
        reject(error);
      }
    })
  }

  async getProposals(tokenId: string, noCache?: boolean): Promise<Array<any>> {
    return new Promise(async(resolve, reject) => {
      try {
        if(!this.proposals[tokenId] || noCache) {
          this.proposals[tokenId] = (await this.smartNodeSdkService.getRestService().loadProposals(tokenId)).data;
        }
        
        resolve(this.proposals[tokenId]);
      } catch(error) {
        reject(error);
      }
    })
  }

  async getProposal(tokenId: string, consensus_timestamp: string, type: 'public' | 'private'): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let proposal = (await this.smartNodeSdkService.getRestService().loadProposal(tokenId, consensus_timestamp, type)).data;
        resolve(proposal);
      } catch(error) {
        reject(error);
      }
    })
  }

  getVotes(topicId: string): Observable<any> {
    return new Observable((observer) => {
      let votes = [];

      let subscription = this.getMainSocket().fromEvent('voteReceived')
      .subscribe((response: any) => {
        switch(response.sender) {
          case 'hcs':
            votes.push(response.message);
            break;
          case 'cache':
            votes = response.message.map(x => x.message);
            break;
        }

        observer.next(votes);
      });

      this.getMainSocket().emit('observeVotes', {
        topicId: topicId
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }

  async getSnapshot(tokenId: string, consensus_timestamp: string, type: 'public' | 'private'): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let snapshot = (await this.smartNodeSdkService.getRestService().loadSnapshot(tokenId, consensus_timestamp, type)).data;
        resolve(snapshot);
      } catch(error) {
        reject(error);
      }
    })
  }

  async validateSnapshot(walletId: string, tokenId: string, consensus_timestamp: string, type: 'public' | 'private'): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let snapshotItem = (await this.smartNodeSdkService.getRestService().loadSnapshotValidate(walletId, tokenId, consensus_timestamp, type)).data;
        resolve(snapshotItem);
      } catch(error) {
        reject(error);
      }
    })
  }

  async getFees(
    service: 'daos' | 'proposals' | 'votes'
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let fees = await this.smartNodeSdkService.getRestService().loadFees('daos');
        let feesObject = null;

        switch(service) {
          case 'daos':
            feesObject = {
              wallet: fees.data.wallet,
              ...fees.data.dao
            }
            break;
          case 'proposals':
            feesObject = {
              wallet: fees.data.wallet,
              ...fees.data.proposals
            }            
            break; 
          case 'votes':
            feesObject = {
              wallet: fees.data.wallet,
              ...fees.data.votes
            } 
            break;
        }

        resolve(feesObject);
      } catch(error) {
        reject(error);
      }
    });
  }

  async retryVoteProposal(
    actionId: string
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let responseData = await this.smartNodeSdkService.voteProposalRetry(
          actionId
        );

        resolve(responseData);
      } catch(error) {
        reject(error);
      }
    })
  }

  async createProposalRetry(
    actionId: string
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let responseData = await this.smartNodeSdkService.createProposalRetry(
          actionId
        );

        resolve(responseData);
      } catch(error) {
        reject(error);
      }
    })
  }

  async createDaoRetry(
    actionId: string
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let responseData = await this.smartNodeSdkService.createDaoRetry(
          actionId
        );

        resolve(responseData);
      } catch(error) {
        reject(error);
      }
    })
  }

  async createDaoTransaction(
    tokenId: string,
    sender: string,
    dao: {
      about: string
      tokenId: string
      image: string
      limited: {
        councilNftId: string
      }
    },
    fees: any
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let responseData = await this.smartNodeSdkService.createDaoTransaction(
          tokenId,
          sender,
          dao,
          fees
        );

        resolve(responseData);
      } catch(error) {
        reject(error);
      }
    })
  }

  async voteTransaction(
    tokenId: string,
    proposal: any,
    index: number,
    sender: string,
    fees: any
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let responseData = await this.smartNodeSdkService.voteTransaction(
          tokenId,
          proposal,
          index,
          sender,
          fees
        );

        resolve(responseData);
      } catch(error) {
        reject(error);
      }
    })
  }

  async proposalTransaction(
    tokenId: string,
    proposal: any,
    sender: string,
    fees: any
  ): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let responseData = await this.smartNodeSdkService.proposalTransaction(
          tokenId,
          proposal,
          sender,
          fees
        );

        resolve(responseData);
      } catch(error) {
        reject(error);
      }
    })
  }

  async getTokenInfos(tokenId: string): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let tokenInfos = await this.smartNodeSdkService.getRestService().getTokenChainInfos(tokenId);
        resolve(tokenInfos);
      } catch(error) {
        reject(error);
      }
    });
  }
}
