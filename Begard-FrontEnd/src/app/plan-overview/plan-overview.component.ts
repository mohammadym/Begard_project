import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plan-overview',
  templateUrl: './plan-overview.component.html',
  styleUrls: ['./plan-overview.component.css']
})
export class PlanOverviewComponent implements OnInit {
  @Input() plannerUsername;
  @Input() planCity;
  @Input() planCover;
  @Input() planDateCreted;
  @Input() plannerProfileCover;
  @Input() planId;
  @Input() userId;


  constructor(private router: Router) { }

  ngOnInit(): void {
    this.planCover = environment.baseUrl + this.planCover;
    this.plannerProfileCover = environment.baseUrl + this.plannerProfileCover;
    this.setDateCreation();
    this.setUserName();
  }

  setDateCreation() {
    let date = new Date(this.planDateCreted);
    let day = date.getUTCDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    let currentDate = new Date();
    let dayDiff = ((currentDate.getFullYear() - year) * 365 + (currentDate.getMonth() - month) * 30 + (currentDate.getUTCDate() - day))
    if (dayDiff >= 2 && dayDiff < 7) {
      this.planDateCreted = "last week";
    } else if (dayDiff == 1) {
      this.planDateCreted = "Yesterday";
    } else if (dayDiff == 0) {
      this.planDateCreted = "Today";
    } else {
      this.planDateCreted = day + "/" + month + "/" + year;
    }
  }

  setUserName() {
    this.plannerUsername = this.plannerUsername.substring(0, this.plannerUsername.search('@'));
  }

  goToProfile() {
    this.router.navigate(['/profile', this.userId]);
  }

  goToPlan() {
    this.router.navigate(['/plan', this.planId]);
  }
}
