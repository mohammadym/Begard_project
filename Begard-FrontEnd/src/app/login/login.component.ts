import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  error: string = null;
  isRegister;

  constructor(private router: Router, private authService: AuthService, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    if (this.router.url.toString().includes("register")) {
      this.isRegister = true;
    } else {
      this.isRegister = false;
    }
  }

  onLogin(loginData: NgForm) {

    this.authService.login(loginData.value)
      .subscribe(
        resData => {
          this.openSnackBar("logged in successfully")
          this.router.navigate(['/homepage']);
        },
        errorMessage => {
          this.openSnackBar("something went wrong!")
        }
      );
    loginData.reset();
  }

  onCreateUser(registerData: NgForm) {
    if (!registerData.valid) {
      return;
    }
    this.authService.signup(registerData.value)
      .subscribe(
        resData => {
          this.openSnackBar("registered successfully")
          this.router.navigate(['/homepage']);
        },
        errorMessage => {
          this.openSnackBar("something went wrong!")
        }
      );
    registerData.reset();
  }

  openSnackBar(message) {
    this.snackbar.open(
      message, "", {
      duration: 3 * 1000
    }
    );
  }
}
