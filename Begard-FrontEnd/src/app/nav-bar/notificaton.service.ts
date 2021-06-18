import { Injectable, EventEmitter } from '@angular/core';
import { AuthService } from '../auth.service';
import { exhaustMap, take } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface ReqUser {
    id: number,
    request_from: number,
    date: string,
    profile_img: string,
    username: string
}

@Injectable({
    providedIn: 'root',
})
export class NotifService {
    constructor(private authService: AuthService,
        private http: HttpClient) { }

    NotifNumUpdated = new EventEmitter();

    getFollowRequests() {
        return this.authService.user.pipe(take(1), exhaustMap(user => {
            var token = 'token ' + user.token;
            var url = environment.baseUrl+'/followers/requests/';
            return this.http.get<ReqUser[]>(url,
                {
                    headers: new HttpHeaders({ 'Authorization': token })
                }
            );
        }));

    }

    onAction(action: string, id: number) {
        return this.authService.user.pipe(take(1), exhaustMap(user => {
            var token = 'token ' + user.token;
            var url = environment.baseUrl +'/followers/requests/' + id + '/?action=' + action;
            return this.http.patch(url, {},
                {
                    headers: new HttpHeaders({ 'Authorization': token })
                }
            );
        }))

    }


}