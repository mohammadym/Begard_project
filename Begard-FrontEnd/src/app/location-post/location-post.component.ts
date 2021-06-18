import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input } from '@angular/core';
import { LocationPostService, PostRes } from './location-post.service';
import { ThemePalette } from '@angular/material/core';
import { CommentComponent, Comment } from './comment/comment.component';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FollowService } from '../follow.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../user.service';

export class Post {
  constructor(
    public type: string,
    public description: string,
    public imgSrc: string[],
    public placeName: string,
    public city: string,
    public userName: string,
    public userProImgSrc: string,
    public followingState: string,
    public likeNums: number,
    public isLiked: boolean,
    public id: number,
    public usrId: number,
    public disable: boolean,
    public commentNums: number
  ) { }
}



@Component({
  selector: 'app-location-post',
  templateUrl: './location-post.component.html',
  styleUrls: ['./location-post.component.css']
})
export class LocationPostComponent implements OnInit {
  @ViewChildren(CommentComponent) child: QueryList<CommentComponent>;
  @Input() currentUrl;
  public userName: string;
  public defaultValue: string = '';
  public posts: Post[] = [];
  centered = false;
  disabled = false;
  unbounded = false;
  isLoggedIn = false
  userId
  commentFc = new FormControl()
  radius: number;
  color: ThemePalette = "primary";

  constructor(private postservice: LocationPostService,
    private router: Router,
    public authService: AuthService,
    private followService: FollowService,
    private snackBar: MatSnackBar,
    private user: UserService) {

    this.followService.updateFollow.subscribe(res => {
      for (var i = 0; i < this.posts.length; i++) {
        if (this.posts[i].usrId == res[0]) {
          this.posts[i].followingState = res[1];
        }
      }
    })
  }

  ngOnInit(): void {
    if (this.router.url === '/homepage') {
      this.postservice.getPostData().subscribe(resdata => {
        this.setPostData(resdata);
      });
    }
    else {
      this.postservice.getProfilePostData(this.currentUrl).subscribe(resdata => {
        this.setPostData(resdata);
      })
    }

    this.postservice.newPost$.subscribe(np => {
      if (np != null) {
        this.posts.splice(0, 0, np)
      }
    })

    this.authService.isLogedIn.subscribe(isLogged => {
      this.isLoggedIn = isLogged;
    })

    this.user.getUserId().subscribe(res => {
      this.userId = parseInt(res.pk);
    })
  }

  private setPostData(resdata: PostRes[]) {
    this.posts = []
    for (var i = 0; i < resdata.length; i++) {
      this.posts.push(new Post(resdata[i].type,
        resdata[i].content,
        resdata[i].images,
        resdata[i].place_name,
        resdata[i].destination_city,
        resdata[i].user_name,
        environment.baseUrl + resdata[i].user_profile_image,
        resdata[i].following_state,
        resdata[i].number_of_likes,
        resdata[i].is_liked,
        resdata[i].id,
        resdata[i].user,
        true,
        resdata[i].number_of_comments));
    }
  }

  onLike(post: Post) {
    if (!this.isLoggedIn) {
      this.openSnackBar("login to like this post !")
    }
    this.postservice.onLike(post.id).subscribe(resdata => {
      post.isLiked = true;
      post.likeNums++;
    });
  }

  onDislike(post: Post) {
    this.postservice.disLike(post.id).subscribe(resdata => {
      post.isLiked = false;
      post.likeNums--;
    });
  }

  onComment(post: Post) {
    if (this.commentFc.value != '') {
      for (var i = 0; i < this.child.toArray().length; i++) {
        if (this.child.toArray()[i].postId == post.id) {
          var commentChild = this.child.toArray()[i];
          this.postservice.onComment(this.commentFc.value, post.id).subscribe(resdata => {
            commentChild.updateComment(resdata);
            post.commentNums++;
            this.commentFc.reset();
          });
        }
      }
    }
  }

  goToProfile(id: number) {
    this.router.navigate(['/profile/' + id])
  }

  onFollow(post: Post) {
    if (post.followingState == "Follow") {
      this.postservice.onFollow(post.usrId).subscribe(res => {
        if (res.status == "Followed") {
          this.followService.updateFollow.emit([post.usrId, "Following"]);
          for (var i = 0; i < this.posts.length; i++) {
            if (this.posts[i].usrId == post.usrId) {
              this.posts[i].followingState = "Following";
            }
          }
        }
        if (res.status == "Requested") {
          this.followService.updateFollow.emit([post.usrId, "Requested"]);
        }
      });
    }
  }

  onAbleComment(post: Post) {
    if (post.disable == true) {
      if (!this.isLoggedIn) {
        this.openSnackBar("login to leave a comment !")
      }
      post.disable = false;
    }
    else {
      post.disable = true;
    }
  }

  openSnackBar(message) {
    this.snackBar.open(
      message, "", {
      duration: 3 * 1000
    }
    );
  }

}
