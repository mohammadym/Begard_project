import { Injectable } from '@angular/core';
import { take, exhaustMap, map } from 'rxjs/operators'
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface PlanItem {
  id;
  place_id;
  start_date;
  finish_date;
}

export interface Plan {
  id;
  destination_city;
  creation_date;
  start_date;
  finish_date;
  plan_items: PlanItem[];
}

export interface MyPlan {
  id;
  destination_city_name;
  destination_city_id;
  creation_date;
  cover;
  user;
}

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  constructor(private http: HttpClient, private authservice: AuthService) { }

  getPlan(planId) {
    const url = environment.baseUrl + '/plans/' + planId;

    return this.authservice.user.pipe(take(1), exhaustMap(user => {
      if (user == null) {
        return this.http
          .get<Plan[]>(url, {
            observe: 'response',
          })
          .pipe(
            map(res => {
              return res.body;
            })
          );
      } else {
        var token = 'token ' + user.token;
        alert(token)
        return this.http
          .get<Plan[]>(url, {
            observe: 'response',
            headers: new HttpHeaders({ 'Authorization': token })
          })
          .pipe(
            map(res => {
              return res.body;
            })
          );
      }

    }));
  }

  getUserPlans(userId): Observable<MyPlan[]> {
    const url = environment.baseUrl + '/user/' + userId + "/plans/";

    return this.authservice.user.pipe(take(1), exhaustMap(user => {
      return this.http
        .get<MyPlan[]>(url, {
          observe: 'response',
        })
        .pipe(
          map(res => {
            return res.body;
          })
        );
    }));
  }
}
