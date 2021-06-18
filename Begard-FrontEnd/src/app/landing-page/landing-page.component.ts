import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {

  public baseUrl;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.baseUrl = environment.baseUrl;
  }

  goToLogin() {
    this.router.navigate(['/login']);

  }

  scrollTo($element1, $element2) {

    var y = $element1.offsetTop - $element2.offsetHeight;
    window.scrollTo({
      top: y,
      left: 0,
      behavior: 'smooth'
    });
  }
}
