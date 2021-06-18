import { Component, OnInit, Input } from '@angular/core';
import { FollowService } from '../follow.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-top-planners',
  templateUrl: './top-planners.component.html',
  styleUrls: ['./top-planners.component.css']
})
export class TopPlannersComponent implements OnInit {
  @Input() userId
  @Input() email;
  @Input() username;
  @Input() rate;
  @Input() profileImg;
  @Input() isPublic;

  followButtonTitle = "Follow"
  allowFollowRequest = true;

  constructor(private followService: FollowService,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.email = this.email.substring(0, this.email.search('@'));
  }

  onFollow() {
    if (this.allowFollowRequest) {
      this.followService.sendFollowRequest({ request_to: this.userId }).subscribe(res => {
        this.handleResponse(res.status)
      })
    }
  }

  goToProfile(id) {
    location.assign('/profile/' + id)
  }

  handleResponse(status) {
    if (status == "Requested") {
      this.followButtonTitle = "Requested"
      this.allowFollowRequest = false
      this.followService.updateFollow.next([this.userId, "Requested"])
    }
    else if (status == "Followed") {
      this.followButtonTitle = "Following"
      this.allowFollowRequest = false
      this.followService.updateFollow.next([this.userId, "Following"])
      this.followService.addFollowing()
    }
  }
}
