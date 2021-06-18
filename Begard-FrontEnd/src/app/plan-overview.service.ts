import { Injectable } from '@angular/core';
import { PlanOverView } from './plan-overview';
import { exhaustMap, take, map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PostPlan } from './post-plan';
import { AuthService } from './auth.service';
import { PlanDetail } from './post-dialog/post-dialog.component'
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanOverviewService {
  private planOverviews$: BehaviorSubject<PlanOverView[]>;
  private tempData;

  constructor(private http: HttpClient, private authservice: AuthService) {}

  getPlanOverviews() {
    const url = environment.baseUrl + '/top-posts/';

    return this.authservice.user.pipe(take(1), exhaustMap(user => {
      return this.http
        .get<PlanOverView[]>(url, {
          observe: 'response',
          params: {
            page: '1',
          }
        })
        .pipe(
          map(res => {
            return res.body;
          })
        );
    }));
  }
}
