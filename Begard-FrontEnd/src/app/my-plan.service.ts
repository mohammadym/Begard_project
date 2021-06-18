import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { take, exhaustMap, map } from 'rxjs/operators'
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MyPlan } from './my-plan'
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class MyPlanService {

  constructor(private http: HttpClient, private authservice: AuthService) { }

  getMyPlans() {
    const url = environment.baseUrl + '/plans/';

    return this.authservice.user.pipe(take(1), exhaustMap(user => {
      var token = 'token ' + user.token;
      return this.http
        .get<MyPlan[]>(url, {
          observe: 'response',
          headers: new HttpHeaders({ 'Authorization': token })
        })
        .pipe(
          map(res => {
            return res.body;
          })
        );
    }));
  }
}
