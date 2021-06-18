import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TopPlanner } from './top-planner';
import { AuthService } from './auth.service';
import { PlanDetail } from './post-dialog/post-dialog.component'
import { Observable } from 'rxjs';
import { map, take, exhaustMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TopPlannersService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  getTopPlanners() {
    const url = environment.baseUrl + '/top-planners/';

    return this.authService.user.pipe(take(1), exhaustMap(user => {
      if (user == null) {
        return this.http
          .get<TopPlanner[]>(url, {
            observe: 'response',
          }).pipe(
            map(res => res.body))
      } else {
        var token = 'token ' + user.token;
        return this.http
          .get<TopPlanner[]>(url, {
            observe: 'response',
            headers: new HttpHeaders({
              'Authorization': token,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            })
          }).pipe(
            map(res => res.body))
      }
    }))
  }
}

