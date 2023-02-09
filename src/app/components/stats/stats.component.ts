import { Component, OnInit, Input } from '@angular/core';
import { FormatsHelper } from '../../helpers/formats';

@Component({
  selector: 'hsuite-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {

  private formatsHelper: FormatsHelper;

  constructor() {
    this.formatsHelper = new FormatsHelper();
  }

  @Input() List: Array<any> = undefined;
  @Input() Data: string[] = undefined;
  @Input() GlobalStats: boolean = false;
  @Input() Prefixes: string[] = undefined;
  @Input() Display: string[] = undefined;


  @Input() Index: number = 0;
  @Input() NameLogo: string = '';

  ngOnInit() {
  }

  formatLabel(text: string){
    return text.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
  }

  formatNumber(value: string) {
    return this.formatsHelper.formatNumber(value, ',', '.', 'HBAR', 2);
  }

  formatBigNumber(value: number) {
    let number = this.formatsHelper.formatBigNumber(value, 2);
    return number;
  }

  setData(List: Array<any>, Data: string) {
    if(List && Data) {
      switch(Data) {
        case 'floor_price':
        case 'roof_price':
        case 'average_price':
          return Number(List['latest_statistics']['stats'][Data]['amount']);
          break;          
        case 'volume':
        case 'tvl':
          return this.formatBigNumber(Number(List['latest_statistics']['stats'][Data]['amount']));
          break;
        default:
          return this.formatBigNumber(List['latest_statistics']['stats'][Data]['amount']);
          break;
      }
      
    }
    return '0';
  }

  setGlobalData(List: Array<any>, Data: string) {
      let sum = 0;
      List.forEach(item => {
        sum += Number(item['latest_statistics']['stats'][Data]['amount']);
      });

      return this.formatBigNumber(sum);
  }

}
