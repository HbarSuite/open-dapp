import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
@Component({
  selector: 'hsuite-table',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TablesComponent {

  @Input() Name: string = 'Name';
  @Input() NameData: string = 'name';
  @Input() Headers: string[] = [];
  public List: Array<any> = new Array<any>();
  public InfiniteList: Array<any> = new Array<any>();
  public isLoading: boolean = true;
  private searchFilter: string = null;

  @Input() AmountOfItems: number = null;
  @Input() Data: string[] = [];
  @Input() Subtitle: boolean = false;
  @Input() Route: string = '';
  @Input() RouteParam: string = '';
  @Input() ExternalLink: string = '';

  @Input() Index: boolean = false;
  @Input() SpecificData: boolean = false;
  @Input() GenericImage: string = '';

  public placeholder = new Array(10).fill({'width': this.randomWidth()});

  constructor(private router: Router) {}

  setList(list: Array<any>) {
    this.List = list;

    if(this.AmountOfItems) {
      this.InfiniteList = this.List.slice(0, this.AmountOfItems);
    } else {
      this.InfiniteList = this.List.slice(0, 10);
    }

    this.isLoading = false;
  }

  routerRedirect(list){
    if(this.Route != ''){
      this.router.navigate([this.Route + list[this.RouteParam]]);
    } else if(this.ExternalLink != ''){
      window.open(this.ExternalLink + list[this.RouteParam], '_blank');
    }
  }

  randomWidth() {
    return Math.floor(Math.random() * (80 - 10 + 1)+ 10) + '%';
  }

  setData(List: Array<any>, Data: string) {
    if(List && Data) {
      if(Data.includes('%')){
        let data =  List['latest_statistics']['stats'][Data.slice(0, -1)]['amount'];
        let percentage = List['latest_statistics']['stats'][Data.slice(0, -1)]['percentage'];
        let color = percentage >= 0 ? 'positive' : 'negative';
        return data + " (" + "<span class='" + color + "'>" + percentage + "%" + "</span>" + ")";      
      } else {
        if(Data=='tvl'){
          let tvl = parseFloat(List['latest_statistics']['stats'][Data]['amount']);
          return tvl.toFixed(0);
        } else return List['latest_statistics']['stats'][Data]['amount'];
      }

    }
    return '0';
  }

  setSpecificData(List: Array<any>, Data: string) {
    let ListPath = List;
    Data.split('.').forEach(path => {
      if(ListPath[path] == 'hsuite') {
        ListPath = ListPath[path].toUpperCase();
      } else {
        if(path == 'delta') {
          if(List['settings']['amm']['bondingCurve'] == 'linear') {
            ListPath = <any> `${ListPath[path]} ${List['settings']['asset']['fungible_common'] == 'hbar' ? 'ℏ' : 'HSUITE'}`;
            console.log(List['settings']['amm']['bondingCurve']);
          } else {
            ListPath = <any> `${ListPath[path]}%`;
            console.log(List['settings']['amm']['bondingCurve']);
          }
        } else {
          ListPath = ListPath[path];
        }
      }
    });

    return ListPath;
  }

  loadMoreCollections(event) {
    if(this.AmountOfItems == null) {
      if(!this.searchFilter) {
        this.InfiniteList = this.InfiniteList.concat(this.List
        .slice(this.InfiniteList.length, this.InfiniteList.length + 10));
      } else {
        this.InfiniteList = this.InfiniteList.concat(this.List
          .filter((collection) => collection.name.toLowerCase().includes(this.searchFilter.toLowerCase()))
          .slice(this.InfiniteList.length, this.InfiniteList.length + 10));
      }

      setTimeout(() => {
        (event as InfiniteScrollCustomEvent).target.complete();
      }, 500);
    }
  }

  onSearch(searchFilter) {
    this.searchFilter = searchFilter;

    this.InfiniteList = this.List
      .filter((collection) => 
      collection.name.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
      collection.symbol.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
      collection.id == this.searchFilter)
      .slice(0, this.InfiniteList.length + 10);
  }
}
