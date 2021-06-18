import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { take, exhaustMap } from 'rxjs/operators';
import { Comment } from './comment/comment.component';
import { FollowService } from '../follow.service';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Post } from './location-post.component'

export interface PostRes {
    "id": number,
    "type": string,
    "creation_date": string,
    "content": string,
    "images": string[],
    "place_id": string,
    "place_name": string,
    "rate": string,
    "user": number,
    "plan_id": number,
    "destination_city": string,
    "user_name": string,
    "user_profile_image": string,
    "number_of_comments": number,
    "number_of_likes": number,
    "is_liked": boolean,
    "following_state": string
}

@Injectable()
export class LocationPostService {
    public newPost$: BehaviorSubject<Post> = new BehaviorSubject<Post>(null);

    constructor(private http: HttpClient,
        private authService: AuthService,
        private followServie: FollowService) { }

    getProfilePostData(id: string) {
        var url = environment.baseUrl + "/profile/" + id + "/posts/";

        return this.authService.user.pipe(take(1), exhaustMap(user => {
            if (user == null) {
                return this.http.get<PostRes[]>(url);
            } else {
                var token = 'token ' + user.token;
                return this.http.get<PostRes[]>(url,
                    {
                        headers: new HttpHeaders({ 'Authorization': token })
                    }
                );
            }

        }));
    }

    getPostData() {
        return this.authService.user.pipe(take(1), exhaustMap(user => {
            if (user == null) {
                var url = environment.baseUrl + "/posts/?page=1";
                return this.http.get<PostRes[]>(url);
            } else {
                var token = 'token ' + user.token;
                var url = environment.baseUrl + "/posts/?page=1";
                return this.http.get<PostRes[]>(url,
                    {
                        headers: new HttpHeaders({ 'Authorization': token })
                    }
                );
            }
        }));
    }

    onLike(id: number) {

        return this.authService.user.pipe(take(1), exhaustMap(user => {
            var token = 'token ' + user.token;
            var url = environment.baseUrl + '/posts/' + id + '/likes/';
            return this.http.post(url, {},
                {
                    headers: new HttpHeaders({ 'Authorization': token })
                }
            );
        }));


    }

    disLike(id: number) {

        return this.authService.user.pipe(take(1), exhaustMap(user => {
            var token = 'token ' + user.token;
            var url = environment.baseUrl + '/posts/' + id + '/likes/';
            return this.http.delete(url,
                {
                    headers: new HttpHeaders({ 'Authorization': token })
                }
            );
        }));


    }

    onComment(content: string, postid: number) {
        return this.authService.user.pipe(take(1), exhaustMap(user => {
            var token = 'token ' + user.token;
            var url = environment.baseUrl + '/posts/' + postid + '/comments/';
            return this.http.post<Comment>(url, { content },
                {
                    headers: new HttpHeaders({ 'Authorization': token })
                }
            );
        }));

    }

    onFollow(id: number) {
        return this.followServie.sendFollowRequest({ request_to: id });
    }

    addPost(post: Post) {
        this.newPost$.next(post);
    }
}
