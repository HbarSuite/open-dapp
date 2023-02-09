import { Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'hsuite-call-to-action',
  templateUrl: './call-to-action.component.html',
  styleUrls: ['./call-to-action.component.scss'],
})
export class CallToActionComponent implements OnInit {

  @Input() BgImage: string = '';
  @Input() Logo: string = '';
  @Input() Avatar: string = '';
  @Input() Title: string = 'Your title here';
  @Input() Subtitle: string = '';
  @Input() TitleFontSize: string = '20px';
  @Input() SubtitleFontSize: string = '16px';
  // @Input() ButtonText: string = '';
  // @Input() Route: string = '';
  // @Input() Callback: any = null;

  @Input() Template: number = 1;


  constructor() {}

  ngOnInit() {}

}
