import { Component, OnInit, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/auth.service';
import { take, exhaustMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface Comment {
  id: number,
  content: string,
  user: number,
  post: number,
  user_name: string,
  user_profile_img: string
}
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  baseUrl = environment.baseUrl

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  @Input() postId: number;

  updateComment(comment: Comment) {
    this.comments.push(comment);

  }

  public comments: Comment[] = [];

  ngOnInit(): void {
    this.getComments(this.postId).subscribe(resdata => {
      for (var i = 0; i < resdata.length; i++) {
        this.comments.push(resdata[i]);
      }
    });
  }

  private getComments(postId: number) {
    return this.authService.user.pipe(take(1), exhaustMap(user => {
      var token = 'token ' + user.token;
      var url = environment.baseUrl +"/posts/" + postId + "/comments/";
      return this.http.get<Comment[]>(url,
        {
          headers: new HttpHeaders({ 'Authorization': token })
        }
      );
    }));
  }



}
