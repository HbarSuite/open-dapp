import { Injectable } from '@angular/core';
import { Hbar, HbarUnit, TransferTransaction } from '@hashgraph/sdk';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';
import Decimal from 'decimal.js';
import { Observable } from 'rxjs';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { SmartService } from 'src/app/services/smart/smart.service';


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

  async list(): Promise<Array<any>> {
    return new Promise(async(resolve, reject) => {
      try {
        let response = await this.smartNodeSdkService.getNetworkService().getApiEndpoint(`dao/list`);
        resolve(response);
      } catch(error) {
        reject(error);        
      }
    });
  }

  async get(tokenId: string): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        if(this.daos.length == 0) {
          this.daos =  await this.list();
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
        let response = await this.smartNodeSdkService.getNetworkService().getApiEndpoint(
          `dao/proposals`,
          { params: {
            tokenId: tokenId
          } }          
        );

        resolve(response);
      } catch(error) {
        reject(error);        
      }
    });
  }

  async getProposal(tokenId: string, consensus_timestamp: string, type: 'public' | 'private'): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let response = await this.smartNodeSdkService.getNetworkService().getApiEndpoint(
          `dao/proposal`,
          { params: {
            tokenId: tokenId,
            consensus_timestamp: consensus_timestamp,
            type: type
          } }
        );

        resolve(response);
      } catch(error) {
        reject(error);        
      }
    });
  }

  getVotes(topicId: string): Observable<any> {
    return new Observable((observer) => {
      let smartNodeSocket = this.smartNodeSdkService.getSocketsService().getMainSocket()
      let votes = [];

      let subscription = smartNodeSocket.fromEvent('voteReceived')
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

      smartNodeSocket.emit('observeVotes', {
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
        let response = await this.smartNodeSdkService.getNetworkService().getApiEndpoint(
          `dao/snapshot`,
          { params: {
            tokenId: tokenId,
            consensus_timestamp: consensus_timestamp,
            type: type
          } }
        );

        resolve(response);
      } catch(error) {
        reject(error);        
      }
    });
  }

  async validateSnapshot(walletId: string, tokenId: string, consensus_timestamp: string, type: 'public' | 'private'): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try {
        let response = await this.smartNodeSdkService.getNetworkService().getApiEndpoint(
          `dao/snapshot/validate`,
          { params: {
            walletId: walletId,
            tokenId: tokenId,
            consensus_timestamp: consensus_timestamp,
            type: type
          } }
        );

        resolve(response);
      } catch(error) {
        reject(error);        
      }
    });
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
  ): Promise<{status: 'SUCCESS' | 'ERROR', payload: any}> {
    return new Promise(async(resolve, reject) => {
      try {
        let smartNodeSocket = this.smartNodeSdkService.getSocketsService().getMainSocket();
        smartNodeSocket.emit('voteProposalRetry', {
          type: 'voteProposalRetry',
          actionId: actionId
        });

        resolve({
          status: 'SUCCESS',
          payload: null
        });
      } catch(error) {
        reject(error);
      }
    });
  }

  async createProposalRetry(
    actionId: string
  ): Promise<{status: 'SUCCESS' | 'ERROR', payload: any}> {
    return new Promise(async(resolve, reject) => {
      try {
        let smartNodeSocket = this.smartNodeSdkService.getSocketsService().getMainSocket();
        smartNodeSocket.emit('createProposalRetry', {
          type: 'createProposalRetry',
          actionId: actionId
        });

        resolve({
          status: 'SUCCESS',
          payload: null
        });
      } catch(error) {
        reject(error);
      }
    });
  }

  async createDaoRetry(
    actionId: string
  ): Promise<{status: 'SUCCESS' | 'ERROR', payload: any}> {
    return new Promise(async(resolve, reject) => {
      try {
        let smartNodeSocket = this.smartNodeSdkService.getSocketsService().getMainSocket();
        smartNodeSocket.emit('createDaoRetry', {
          type: 'createDaoRetry',
          actionId: actionId
        });

        resolve({
          status: 'SUCCESS',
          payload: null
        });
      } catch(error) {
        reject(error);
      }
    });
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
  ): Promise<{status: 'SUCCESS' | 'ERROR', payload: any}> {
    return new Promise(async(resolve, reject) => {
      try {
        let utilities = await this.getUtilities();
        let hsuiteInfos = (await this.smartNodeSdkService.getRestService().getTokenInfos(utilities.hsuite.id)).data;
        let veHsuiteReward = new Decimal(fees.fixed.hbar).div(hsuiteInfos.price).times(0.1)
          .times(10 ** hsuiteInfos.decimals).toDecimalPlaces(hsuiteInfos.decimals).toNumber();

        let transaction = new TransferTransaction()
          .addHbarTransfer(sender, Hbar.from(-fees.fixed.hbar, HbarUnit.Hbar))
          .addHbarTransfer(fees.wallet, Hbar.from(fees.fixed.hbar, HbarUnit.Hbar))
          .setTransactionMemo(`${tokenId}/${dao.limited.councilNftId}`)
          .addTokenTransfer(utilities.veHsuite.id, sender, veHsuiteReward)
          .addTokenTransfer(utilities.veHsuite.id, utilities.veHsuite.treasury, -veHsuiteReward);

        let transBytes = await this.smartNodeSdkService.getHederaService().makeBytes(transaction, sender);
        let response: any = await this.smartNodeSdkService.getHashPackService().sendTransaction(transBytes, sender);  

        if(response.success) {
          let signedTransaction = response.signedTransaction;

          let smartNodeSocket = this.smartNodeSdkService.getSocketsService().getMainSocket();
          smartNodeSocket.emit('createDao', {
            type: 'createDao',
            signedTransaction: signedTransaction,
            daoDocument: dao
          });

          resolve({
            status: 'SUCCESS',
            payload: response
          });
        } else {
          resolve({
            status: 'ERROR',
            payload: response.error
          });
        } 
      } catch(error) {
        reject(error);
      }
    });
  }

  async voteTransaction(
    tokenId: string,
    proposal: any,
    index: number,
    sender: string,
    fees: any
  ): Promise<{status: 'SUCCESS' | 'ERROR', payload: any}> {
    return new Promise(async(resolve, reject) => {
      try {
        let utilities = await this.getUtilities();
        let hsuiteInfos = (await this.smartNodeSdkService.getRestService().getTokenInfos(utilities.hsuite.id)).data;
        let veHsuiteReward = new Decimal(fees.fixed.hbar).div(hsuiteInfos.price).times(0.1)
          .times(10 ** hsuiteInfos.decimals).toDecimalPlaces(hsuiteInfos.decimals).toNumber();

        let transaction = new TransferTransaction()
          .addHbarTransfer(sender, Hbar.from(-fees.fixed.hbar, HbarUnit.Hbar))
          .addHbarTransfer(fees.wallet, Hbar.from(fees.fixed.hbar, HbarUnit.Hbar))
          .setTransactionMemo(`${tokenId}/${proposal.consensus_timestamp}/${proposal.type}/${index}`)
          .addTokenTransfer(utilities.veHsuite.id, sender, veHsuiteReward)
          .addTokenTransfer(utilities.veHsuite.id, utilities.veHsuite.treasury, -veHsuiteReward);

        let transBytes = await this.smartNodeSdkService.getHederaService().makeBytes(transaction, sender);
        let response: any = await this.smartNodeSdkService.getHashPackService().sendTransaction(transBytes, sender);

        if(response.success) {
          let signedTransaction = response.signedTransaction;

          let smartNodeSocket = this.smartNodeSdkService.getSocketsService().getMainSocket();
          smartNodeSocket.emit('voteProposal', {
            type: 'voteProposal',
            signedTransaction: signedTransaction
          });

          resolve({
            status: 'SUCCESS',
            payload: response
          });
        } else {
          resolve({
            status: 'ERROR',
            payload: response.error
          });
        } 
      } catch(error) {
        reject(error);
      }
    });
  }

  async proposalTransaction(
    tokenId: string,
    proposal: any,
    sender: string,
    fees: any
  ): Promise<{status: 'SUCCESS' | 'ERROR', payload: any}> {
    return new Promise(async(resolve, reject) => {
      try {
        let utilities = await this.getUtilities();
        let hsuiteInfos = (await this.smartNodeSdkService.getRestService().getTokenInfos(utilities.hsuite.id)).data;
        let veHsuiteReward = new Decimal(fees.fixed.hbar).div(hsuiteInfos.price).times(0.1)
          .times(10 ** hsuiteInfos.decimals).toDecimalPlaces(hsuiteInfos.decimals).toNumber();

        let transaction = new TransferTransaction()
          .addHbarTransfer(sender, Hbar.from(-fees.fixed.hbar, HbarUnit.Hbar))
          .addHbarTransfer(fees.wallet, Hbar.from(fees.fixed.hbar, HbarUnit.Hbar))
          .setTransactionMemo(`${tokenId}`)
          .addTokenTransfer(utilities.veHsuite.id, sender, veHsuiteReward)
          .addTokenTransfer(utilities.veHsuite.id, utilities.veHsuite.treasury, -veHsuiteReward);
console.log(utilities);
        let transBytes = await this.smartNodeSdkService.getHederaService().makeBytes(transaction, sender);
        let response: any = await this.smartNodeSdkService.getHashPackService().sendTransaction(transBytes, sender);

        if(response.success) {
          let signedTransaction = response.signedTransaction;

          let smartNodeSocket = this.smartNodeSdkService.getSocketsService().getMainSocket();
          smartNodeSocket.emit('createProposal', {
            type: 'createProposal',
            signedTransaction: signedTransaction,
            proposalDocument: proposal
          });

          resolve({
            status: 'SUCCESS',
            payload: response
          });
        } else {
          resolve({
            status: 'ERROR',
            payload: response.response.error
          });
        } 
      } catch(error) {
        reject(error);
      }
    });
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
