import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map, take, exhaustMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface PL {
  id,
  type,
  creation_date,
  content,
  place_id,
  place_name,
  rate,
  user,
  plan_id,
  user_name,
  user_profile_image,
  destination_city,
  number_of_likes,
  is_liked,
  images,
  following_state
}

@Injectable({
  providedIn: 'root'
})
export class PostLocationService {

  constructor(private http: HttpClient, private authservice: AuthService) { }

  sendPostLocation(postLocation): Observable<PL> {
    const url = environment.baseUrl + '/location-post/';

    return this.authservice.user.pipe(take(1), exhaustMap(user => {
      var token = 'token ' + user.token;
      return this.http
        .post<PL>(url, JSON.stringify(postLocation), {
          observe: 'response',
          headers: new HttpHeaders({
            'Authorization': token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          })
        }).pipe(
          map(res => res.body))
    }))
  }
}
