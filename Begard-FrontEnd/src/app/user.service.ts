import { Injectable } from '@angular/core';
import { User } from './user.model';
import { AuthService } from './auth.service';
import { exhaustMap, take, map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PostPlan } from './post-plan';
import { environment } from 'src/environments/environment';

export interface UserId {
  email,
  pk,
}

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private user: User;

  constructor(private http: HttpClient, private authservice: AuthService) { }

  getUserId() {
    const url = environment.baseUrl + '/rest-auth/user/';
    return this.authservice.user.pipe(take(1), exhaustMap(user => {

      var token = 'token ' + user.token;
      return this.http
        .put<UserId>(url, null, {
          observe: 'response',
          headers: new HttpHeaders({
            'Authorization': token
            , 'Content-Type': 'application/json'
            , 'Accept': 'application/json'
          })
        })
        .pipe(
          map(res => {
            console.log(JSON.stringify(res))
            return res.body;
          })
        );
    }));
  }
}
