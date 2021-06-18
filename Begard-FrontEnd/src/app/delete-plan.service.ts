import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take, exhaustMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeletePlanService {

  constructor(private http: HttpClient, private authservice: AuthService
  ) { }

  delete(planId: number): Observable<string> {
    const url = environment.baseUrl + '/plans/' + planId + "/";

    return this.authservice.user.pipe(take(1), exhaustMap(user => {
      var token = 'token ' + user.token;
      return this.http
        .delete<string>(url, {
          observe: 'response',
          headers: new HttpHeaders({
            'Authorization': token, 'Content-Type': 'application/json', 'Accept': 'application/json'
          })
        })
        .pipe(
          map(res => {
            return res.status.toString();
          })
        );
    }));
  }
}
