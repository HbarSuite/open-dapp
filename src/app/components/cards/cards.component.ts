import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'hsuite-card',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent implements OnInit {

  constructor() { }

  ngOnInit() {}


  @Input() Template: string = '1'; // template 1 = banner and logo ( for collections ) || template 2 = only banner ( for nfts )

  @Input() Banner: string = ''; // big image
  @Input() Logo: string = ''; // small round image

  @Input() CardTitle: string = 'Your title here'; // Primary text
  @Input() Subtitle: string = ''; // Secondary text

  @Input() Price: string = '';
  @Input() FloorPrice: string = '';
  @Input() RoofPrice: string = '';
  @Input() Floor: boolean = false;

  @Input() PoolWallet: string = null;
  @Input() PoolType: 'hbar' | 'hsuite' = null;

  @Input() TotalVolume: string = '';
  @Input() Likes: string = '';
  @Input() Views: string = '';

  @Input() Button: string = '';
  @Input() ButtonClick: any = null;

  @Input() Selected: boolean = false;
  @Input() Link: string = '';
  @Input() Callback: any = null;

  //Style
  @Input() TitleFontSize: string = '22px';
  @Input() TitleFontWeight: string = '600';
  @Input() SubtitleFontSize: string = '12px';
  @Input() NoContent: boolean = false;
  loaderImg = 'assets/gifs/loader.gif';
  // @Input() CardBorder: string = '0px'; // 0px = default || 1px = small || 2px = medium || 3px = large
}
