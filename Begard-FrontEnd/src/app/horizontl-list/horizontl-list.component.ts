import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Observable, interval, observable, BehaviorSubject } from 'rxjs';
import { startWith, take, map } from 'rxjs/operators';
import { NguCarouselConfig } from '@ngu/carousel';
import { slider } from './animation'

import 'hammerjs';
import { PlanOverView } from '../plan-overview';


@Component({
  selector: 'app-horizontl-list',
  templateUrl: './horizontl-list.component.html',
  styleUrls: ['./horizontl-list.component.css']
})
export class HorizontlListComponent implements OnInit {
  @Input() planOverviews: BehaviorSubject<any[]>;
  tempData: string[];

  imgags = [
    'assets/bg.jpg',
    'assets/car.png',
    'assets/canberra.jpg',
    'assets/holi.jpg'
  ];

  public carouselTileItems: any[] = [];
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 2, md: 1, lg: 2, all: 0 },
    speed: 250,
    point: {
      visible: true
    },
    touch: true,
    loop: true,
    interval: { timing: 1500 },
    animation: 'lazy'
  };

  constructor() {

  }

  ngOnInit() {
    this.tempData = [];
    this.planOverviews.toPromise().then(po => { this.setItems(po); })
  }

  setItems(po: PlanOverView[]) {
    for (let i = 0; i < po.length; i++) { this.carouselTileItems.push(po[i]); }
  }
}
