import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { throwError, Subject, BehaviorSubject } from "rxjs";
import { User } from "./user.model";
import { environment } from 'src/environments/environment';


export interface AuthResponseData {
  key: string;
}


@Injectable({ providedIn: 'root' })
export class AuthService {

  user = new BehaviorSubject<User>(null);
  private loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus());
  private email = new BehaviorSubject<string>(this.getUserEmail());

  constructor(private http: HttpClient) { }

  signup(userData: { email: string, password1: string, password2: string }) {
    var url = environment.baseUrl + '/rest-auth/registration/';
    return this.http.post<AuthResponseData>(url,
      userData)
      .pipe(catchError(this.handleError), tap(resData => {
        this.handleAuthentication(userData.email, resData.key);
      }
      ));
  }

  login(userData: { email: string, password: string }) {
    var url = environment.baseUrl + '/rest-auth/login/';
    return this.http.post<AuthResponseData>(url,
      userData).
      pipe(catchError(this.handleError), tap(resData => {
        this.handleAuthentication(userData.email, resData.key);
      }
      ));
  }

  autoLogin() {
    const userData: {
      email: string,
      _token: string
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }

    const loadedUser = new User(userData.email, userData._token);
    this.user.next(loadedUser);
  }

  private handleAuthentication(email: string, token: string) {
    const user = new User(email, token);
    this.user.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
    this.userEmail.next(email);
    this.loginStatus.next(true);
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error';

    // if(!errorRes.error || !errorRes.error.error){
    //   return throwError(errorMessage);
    // }
    // switch (errorRes.error.error.message) {
    //  case 'Email-exsits':
    //    errorMessage='this email already exists';
    //    break;
    //
    // }

    this.loginStatus.next(false);

    return throwError(errorMessage);
  }

  logout() {
    localStorage.removeItem('userData');
    this.loginStatus.next(false);
    this.user.next(null);
  }

  getUserEmail() {
    const userData: {
      email: string,
      _token: string
    } = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      return userData.email;
    }
    else {
      return "";
    }
  }

  checkLoginStatus() {
    const userData: {
      email: string,
      _token: string
    } = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      return true;
    }
    else {
      return false;
    }
  }

  get isLogedIn() {
    return this.loginStatus;
  }

  get userEmail() {
    return this.email;
  }

}
