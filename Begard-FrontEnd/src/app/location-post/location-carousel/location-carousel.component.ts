import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-location-carousel',
  templateUrl: './location-carousel.component.html',
  styleUrls: ['./location-carousel.component.css']
})
export class LocationCarouselComponent implements OnInit {

  @Input() imgSrc: string[];

  imgUrl: string[] = [];

  constructor() { }

  ngOnInit(): void {
    for (var i = 0; i < this.imgSrc.length; i++) {
      this.imgUrl.push(environment.baseUrl + this.imgSrc[i]);
    }

  }

}
