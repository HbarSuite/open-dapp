import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormatsHelper } from '../../../helpers/formats';

@Component({
  selector: 'app-buy-ico',
  templateUrl: './buy-ico.page.html',
  styleUrls: ['./buy-ico.page.scss'],
})
export class BuyIcoPage implements OnInit {
  @Input() tokenSymbol: any;
  @Input() token: any;
  @Input() sender: string;
  @Input() discount: number;
  @Input() nfts: Array<any>;
  private formatsHelper: FormatsHelper;
  private hbarAmount: number;
  public tokenAmount: number = 0;
  
  constructor(
    private modalController: ModalController
  ) {
    this.formatsHelper = new FormatsHelper();
  }

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss({dismissed: true});
  }

  async sendBuy() {
    this.modalController.dismiss({
      dismissed: true,
      hbarAmount: this.token.launchpad.type == 'NON_FUNGIBLE_UNIQUE' ? this.token.launchpad.price : this.hbarAmount,
      sender: this.sender
    });
  }

  getTokenSymbol() {
    if(this.token.launchpad.buy_with_token) {
      return this.token.launchpad.buy_with_token.symbol;
    } else {
      return "ℏ";
    }
  }


  calculateDiscount() {
    let discount = this.token.launchpad.price - (this.token.launchpad.price * this.discount);
    return Number(discount.toFixed(8));
  }

  amountChanged(event) {
    this.hbarAmount = Math.abs(event.detail.value);
    let price = this.discount ? this.calculateDiscount() : this.token.launchpad.price;
    this.tokenAmount = Number((this.hbarAmount / price).toFixed(8));
  }

  formatNumber(value: number) {
    return this.formatsHelper.formatNumber(value, ',', '.', this.token.symbol, 4);
  }

}
