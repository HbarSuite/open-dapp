import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteManagerService {
  private _urlParts:BehaviorSubject<any>;
  private _url;

  constructor(private router: Router) { 
    this._urlParts = new BehaviorSubject(null);
  }

  get urlParts() {
    return this._urlParts.asObservable();
  }
  setUrl() {
    this._url = this.router.url;
    let parts = this._url.split('/');
    return this._urlParts.next(parts);
  }
}
