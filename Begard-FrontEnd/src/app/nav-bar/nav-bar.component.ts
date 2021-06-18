import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from '../../../node_modules/rxjs';
import { AuthService } from '../auth.service'
import { MatMenuModule } from '@angular/material/menu';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from "@angular/platform-browser";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { take, exhaustMap } from 'rxjs/operators';
import { ReqUser, NotifService } from './notificaton.service';
import { environment } from '../../environments/environment';
import { UserService } from '../user.service';
import { Router } from '@angular/router';


class FollowReq {
  constructor(public userName: string, public proImg: string, public date: string,
    public id: number, public userId: number) { }
}

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})

export class NavBarComponent implements OnInit {

  loginStatus$: Observable<boolean>;

  userEmail$: Observable<string>;

  public userPro : string;

  constructor(public authService: AuthService, public matIconRegistry: MatIconRegistry, public domSanitizer: DomSanitizer,
    public dialog: MatDialog,
    public http: HttpClient,
    private router: Router,
    private notifService: NotifService,
    private user :UserService) {
    //to add custom icon
    this.matIconRegistry.addSvgIcon(
      "begard_logo",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/begard_icon.svg")
    );
    this.notifService.NotifNumUpdated.subscribe(res => {
      this.notfiNums--;
    });
  }
  items: FollowReq[] = [];
  public notfiNums;
  public url;

  ngOnInit(): void {
    this.user.getUserId().subscribe(res => {
      this.userPro = '/profile/' + res.pk;
    });

    this.notifService.getFollowRequests().subscribe(res => {
      this.setItems(res);
    });
    this.notifService.getFollowRequests().subscribe(res => {
      this.notfiNums = res.length;
    });
    this.loginStatus$ = this.authService.isLogedIn;
    this.userEmail$ = this.authService.userEmail;
    this.url = environment.baseUrl;
  }

  setItems(res: ReqUser[]) {
    for (let i = 0; i < res.length; i++) {
      this.items.push(new FollowReq(res[i].username, environment.baseUrl + res[i].profile_img, res[i].date, res[i].id, res[i].request_from));
    }
  }

  logout() {
    this.authService.logout();
    if (this.router.url.toString().includes('register') || this.router.url.toString().includes('login'))
      location.reload()
    else
      this.router.navigate(['/landingpage'])
  }

  openDialog(event: Event): void {
    document.getElementById("myPopup").classList.toggle("show");
  }

  onAccept(item: FollowReq) {
    this.notifService.onAction('accept', item.id).subscribe(res => {
      this.removeItem(item);
    });
  }

  onDecline(item: FollowReq) {
    this.notifService.onAction('reject', item.id).subscribe(res => {
      this.removeItem(item);
    });
  }

  removeItem(item: FollowReq) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].id == item.id) {
        this.items.splice(i, 1);
        this.notifService.NotifNumUpdated.emit();
      }
    }
  }
}

