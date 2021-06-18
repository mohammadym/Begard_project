import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, take, exhaustMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Location } from './location';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DynamicSearchService {

  constructor(private http: HttpClient, private authservice: AuthService
  ) { }

  search(query: string, cityId: number): Observable<Location> {
    const url =  environment.baseUrl +'/cities/' + cityId + '/search/simple/';

    return this.authservice.user.pipe(take(1), exhaustMap(user => {
      var token = 'token ' + user.token;
      return this.http
        .get<Location>(url, {
          observe: 'response',
          params: {
            query: query,
            sort: 'stars',
            order: 'desc'
          },
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
