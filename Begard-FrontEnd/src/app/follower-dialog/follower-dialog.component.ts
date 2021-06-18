import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Follower } from '../follow.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-follower-dialog',
  templateUrl: './follower-dialog.component.html',
  styleUrls: ['./follower-dialog.component.css']
})
export class FollowerDialogComponent implements OnInit {
  users = []
  type
  noFollower = false
  env = environment.baseUrl
  constructor(public dialogRef: MatDialogRef<FollowerDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: Follower[]) { }

  ngOnInit(): void {
    this.users = this.data['followers'];
    this.type = this.data['type'];
    if (this.users.length == 0){
      this.noFollower = true;
    }
  }

  goToProfile(id) {
    this.dialogRef.close()
    location.assign('/profile/' + id)
  }
}
