import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from './profile.service';
import { TopPlannersService } from '../top-planners.service';
import { TopPlanner } from '../top-planner';
import { UserService } from '../user.service';
import { FollowService, Follower } from '../follow.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { PlanService, MyPlan } from '../plan.service';
import { AuthService } from '../auth.service';
import { FollowerDialogComponent } from '../follower-dialog/follower-dialog.component';

export interface DialogData {
  userId: string;
  username: string;
  unfollow: boolean;
  followingRequestId: string
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  allowFollowRequest = false;
  topPlanners = [];
  allTopPlanners = [];
  proUrl: string;
  userId
  isLogged
  noPlannerEnable = false
  followers: Follower[]
  followings: Follower[]
  followingRequestId
  public baseurl = environment.baseUrl;


  ngOnInit(): void {
    this.topPlaners.getTopPlanners().subscribe(tp => { this.allTopPlanners = tp; this.initTopPlanners(tp) });
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });

    this.authService.isLogedIn.subscribe(isLogged => {
      this.isLogged = isLogged;
    })

    this.profileService.getHeaderData(this.id).subscribe(res => {
      this.userName = res.username;
      this.follwersNum = res.followers_count;
      this.follwingsNum = res.followings_count;
      this.postNum = res.posts_count;
      this.imgUrl = environment.baseUrl + res.profile_image;
      this.followingState = res.following_state;
      this.followingRequestId = res.follow_request_id;
      if (this.followingState == "Follow") {
        this.allowFollowRequest = true;
      }
    });

    this.followSerivce.updateFollow.subscribe(res => {
      if (res[1] == "Following" || res[1] == "Requested") {
        this.replaceTopPlanner(res[0]);
        if (res[1] == "Following")
          this.openSnackBar("followed successfully")
        else {
          this.openSnackBar("requested successfully")
        }
      }
    })

    this.user.getUserId().subscribe(res => {
      this.proUrl = '/profile/' + res.pk;
      this.route.params.subscribe(params => {
        if (res.pk == params['id']) {
          this.isOwnPro = true;
        }
        else {
          this.isOwnPro = false;
        }
      })
    })



    this.planService.getUserPlans(this.id).subscribe(plans => {
      for (let i = plans.length - 1; i >= 0 ; i--) {
        this.plans.push({
          id: plans[i].id
          , destination_city_name: plans[i].destination_city_name
          , destination_city_id: plans[i].destination_city_id
          , creation_date: this.setDateCreation(plans[i].creation_date)
          , cover: this.setCoverUrl(plans[i].cover)
          , userId: plans[i].user
        })
      };
    })
  }
  isOwnPro: boolean;

  userName: string;
  postNum: number;
  follwersNum: number;
  follwingsNum: number;
  imgUrl: string;
  followingState: string;
  plans = []

  animal: string;
  name: string;
  id: number;


  constructor(public dialog: MatDialog,
    private route: ActivatedRoute,
    private planService: PlanService,
    private router: Router,
    private profileService: ProfileService,
    private topPlaners: TopPlannersService,
    private user: UserService,
    private followSerivce: FollowService,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {
    this.followSerivce.updateFollow.subscribe(res => {
      if (res[0] == this.id) {
        this.followingState = res[1];
        if (this.followingState == "Requested") {
          this.allowFollowRequest = false;
        } else if (this.followingState == "Following") {
          this.allowFollowRequest = false;
          this.follwersNum += 1;
        } else if (this.followingState == "Remove") {
          this.followingState = "Follow"
          this.allowFollowRequest = true;
        } else {
          this.allowFollowRequest = true;
          this.follwersNum -= 1;
        }
      } else if (this.followingState == "Own") {
        if (res[0] == "Following") {
          this.followSerivce.addFollowing()
        }
      }
    })
  }

  setDateCreation(d) {
    let date = new Date(d);
    let day = date.getUTCDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    let currentDate = new Date();
    let dayDiff = ((currentDate.getFullYear() - year) * 365 + (currentDate.getMonth() - month) * 30 + (currentDate.getUTCDate() - day))
    if (dayDiff >= 2 && dayDiff < 7) {
      return "last week";
    } else if (dayDiff == 1) {
      return "Yesterday";
    } else if (dayDiff == 0) {
      return "Today";
    } else {
      return day + "/" + month + "/" + year;
    }
  }

  setDate(date) {
    let d = new Date(date);
    return "" + d.getFullYear() + "/" + d.getUTCMonth() + "/" + d.getUTCDate();
  }

  setCoverUrl(url) {
    return environment.baseUrl + url;
  }

  goToPlan(id) {
    this.router.navigate(['/plan', id]);
  }

  goToProfile(){
    this.router.navigate([this.proUrl]);
  }

  onFollow() {
    this.profileService.onFollow(this.id).subscribe(res => {
      if (res.status == 'Followed') {
        this.followSerivce.updateFollow.emit([this.id, "Following"]);
      }
      else if (res.status == 'Requested') {
        this.followingRequestId = res.follow_request_id
        this.followSerivce.updateFollow.emit([this.id, "Requested"]);
      }
    });
  }

  openDialog(): void {
    let dialogRef;
    if (this.followingState == 'Requested') {
      dialogRef = this.dialog.open(UnfollowDialog, {
        height: 'auto',
        width: '600px',
        data: { username: this.userName, userId: this.id, unfollow: false, followingRequestId: this.followingRequestId }
      });
    } else {
      dialogRef = this.dialog.open(UnfollowDialog, {
        height: 'auto',
        width: '600px',
        data: { username: this.userName, userId: this.id, unfollow: true }
      });
    }
  }

  refresh() {
    location.reload()
  }

  showFollowers() {
    this.followSerivce.getFollowers(this.id).subscribe(followers => {
      this.followers = followers;
      let dialogRef;
      dialogRef = this.dialog.open(FollowerDialogComponent, {
        height: 'auto',
        minWidth: '300px',
        maxHeight: '400px',
        data: { followers: this.followers, type: "followers" }
      });
    })
  }

  showFollowings() {
    this.followSerivce.getFollowings(this.id).subscribe(followings => {
      this.followings = followings;
      let dialogRef;
      dialogRef = this.dialog.open(FollowerDialogComponent, {
        height: 'auto',
        minWidth: '300px',
        maxHeight: '400px',
        data: { followers: this.followings, type: "followings" }
      });
    })
  }

  goToHome() {
    this.router.navigate(['/homepage']);
  }


  initTopPlanners(tp) {
    for (let i = 0; i < Math.min(tp.length, 6); i++) {
      this.topPlanners.push(this.allTopPlanners[0])
      this.allTopPlanners.splice(0, 1);
    }
    if (this.topPlanners.length == 0) {
      this.noPlannerEnable = true
    } else {
      this.noPlannerEnable = false
    }
  }

  replaceTopPlanner(id) {
    for (let i = 0; i < this.topPlanners.length; i++) {
      if (id == this.topPlanners[i].pk) {
        if (this.allTopPlanners.length > 0) {
          this.topPlanners.splice(i, 1, this.allTopPlanners[0])
          this.allTopPlanners.splice(0, 1)
        }
        else
          this.topPlanners.splice(i, 1)
      }
    }
    if (this.topPlanners.length == 0) {
      this.noPlannerEnable = true
    } else {
      this.noPlannerEnable = false
    }
  }

  openSnackBar(message) {
    this.snackBar.open(
      message, "", {
      duration: 3 * 1000
    }
    );
  }

  goToMyplan() {
    if (this.isLogged)
      this.router.navigate(['/myplans'])
    else
      this.openSnackBar("login to see your plans!")
  }
}


@Component({
  selector: 'unfollow-dialog',
  templateUrl: './unfollow-dialog.html',
})
export class UnfollowDialog {
  username = "";
  userId;
  message;
  followingRequestId
  constructor(
    public dialogRef: MatDialogRef<UnfollowDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private followServce: FollowService,
    private snackBar: MatSnackBar
  ) {
    this.username += data.username;
    this.userId = data.userId;
    this.followingRequestId = data.followingRequestId;
    if (data.unfollow) {
      this.message = "Do you want to unfollow " + this.username + " ?"
    } else {
      this.message = "Do you want to remove request for " + this.username + " ?"
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onUnfollow() {
    if (this.data.unfollow) {
      this.followServce.unfollow(this.userId).subscribe(
        status => { this.handleUnfollowResponse(status, "unfollowed") }
      )
    }
    else {
      this.followServce.removeRequest(this.followingRequestId).subscribe(
        status => { this.handleUnfollowResponse(status, "request removed") }
      )
    }
    this.dialogRef.close();
  }

  handleUnfollowResponse(status, mes) {
    if (status == "200") {
      this.openSnackBar(mes + " successfully")
      this.followServce.updateFollow.next([this.userId, "Follow"])
    } else if (status == "204") {
      this.openSnackBar(mes + " successfully")
      this.followServce.updateFollow.next([this.userId, "Remove"])
    } else {
      this.openSnackBar("something went wrong!")
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
