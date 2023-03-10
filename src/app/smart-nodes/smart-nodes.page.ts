import { Component, OnInit } from '@angular/core';
import { SmartNodeSdkService } from '@hsuite/angular-sdk';

@Component({
  selector: 'app-smart-nodes',
  templateUrl: './smart-nodes.page.html',
  styleUrls: ['./smart-nodes.page.scss'],
})
export class SmartNodesPage implements OnInit {
  public nodesOnline: Map<string, any> = new Map<string, any>();
  public place_holders: Array<any> = new Array<any>();

  constructor(
    private smartNodeSdkService: SmartNodeSdkService
  ) {
    this.place_holders = Array(4).fill(0, 4).map((x,i)=>i);
  }

  ngOnInit() {
    this.nodesOnline = this.smartNodeSdkService.getSocketsService().getNodesOnline();
    console.log(this.nodesOnline)
  }

}
