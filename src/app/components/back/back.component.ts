import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'hsuite-back',
  templateUrl: './back.component.html',
  styleUrls: ['./back.component.scss'],
})
export class BackComponent implements OnInit {

  constructor( private navController: NavController ) { }

  ngOnInit() {}

  goBack() {
    this.navController.back();
  }

}
