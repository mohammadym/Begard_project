import { Injectable } from '@angular/core';
import { take, exhaustMap, map } from 'rxjs/operators'
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MyLocation } from './my-location'
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class MyLocationService {

  constructor(private http: HttpClient, private authservice: AuthService) { }

  getMyLocations(planId) {
    const url = environment.baseUrl + '/plans/' + planId + '/locations/';

    return this.authservice.user.pipe(take(1), exhaustMap(user => {
      var token = 'token ' + user.token;
      return this.http
        .get<MyLocation[]>(url, {
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
