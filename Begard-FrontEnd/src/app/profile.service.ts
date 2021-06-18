import { Injectable } from '@angular/core';
import { PlanOverView } from './plan-overview';
import { exhaustMap, take, map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PostPlan } from './post-plan';
import { AuthService } from './auth.service';
import { Profile } from './profile'
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient, private authservice: AuthService) { }

  getProfile(id) {
    var url = environment.baseUrl + '/profile/' + id + '/header/';

    return this.authservice.user.pipe(take(1), exhaustMap(user => {

      if (user == null) {
        return this.http.get<Profile>(url);
      } else {
        var token = 'token ' + user.token;
        return this.http.get<Profile>(url, {
          headers: new HttpHeaders({
            'Authorization': token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          })
        }
        );
      }
    }));
  }
}
