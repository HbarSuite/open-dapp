import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
})
export class SearchbarComponent implements OnInit {
  @ViewChild('searchBar', {static: false}) searchBar: any;
  @Output() searchStringEvent = new EventEmitter();
  public isSearchBarOpen: boolean = true;

  constructor() { }

  ngOnInit() {}

  handleChange(event) {
    this.searchStringEvent.emit({value: event.detail.value})
  }

  searchClick() {
    this.isSearchBarOpen = !this.isSearchBarOpen;

    if(this.isSearchBarOpen) {
      setTimeout(async() => {
        this.searchBar.nativeElement.querySelector('input').focus();
      }, 500);
    }
  }

}
