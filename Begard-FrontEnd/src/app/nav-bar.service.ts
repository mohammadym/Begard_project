import { Injectable } from '@angular/core';
import { ReturnStatement } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class NavBarService {
  private _isLogedIn: Boolean;

  constructor() { }

  set isLogedIn(isLogedIn) {
    this._isLogedIn = isLogedIn;
  }

  get isLogedIn() {
    return this._isLogedIn;
  }

}
