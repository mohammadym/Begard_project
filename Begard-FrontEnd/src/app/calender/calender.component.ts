
import { Component, ViewChild, OnInit } from '@angular/core';
import { closest } from '@syncfusion/ej2-base';
import { EventSettingsModel, View, DayService, WeekService, DragAndDropService, ResizeService, ScheduleComponent, CellClickEventArgs, DragEventArgs, ResizeEventArgs } from '@syncfusion/ej2-angular-schedule';
import { GridComponent, RowDDService, EditService, EditSettingsModel, RowDropSettingsModel } from '@syncfusion/ej2-angular-grids';

import { L10n } from '@syncfusion/ej2-base';
import { DataStorageService, PlanItem, Plan } from '../data-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningItem } from '../plan-item.model';
import { MatDialog } from '@angular/material/dialog';
import { PostDialogComponent } from './../post-dialog/post-dialog.component';
import { PostPlan, PI } from '../post-plan';
import { PostPlanService } from '../post-plan.service';
import { MapLocationService } from '../map-locations.service';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';


L10n.load({
  'en-US': {
    'schedule': {
      'saveButton': 'Add',
      'cancelButton': 'Close',
      'deleteButton': 'Remove',
      'newEvent': 'Add Plan',
      'editEvent': 'Edit Plan'
    }
  }
});


@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css'],
  providers: [DayService, WeekService, DragAndDropService, ResizeService, RowDDService, EditService]
})
export class CalenderComponent implements OnInit {

  postPlan: PostPlan;
  pi: PI[];
  cityId;
  isLoggedIn = false;
  planItems: PlanningItem[] = [];
  gridItems: PlanningItem[] = [];
  loginStatus$: Observable<boolean>;
  cityName

  constructor(
    public dataService: DataStorageService,
    public postPlanService: PostPlanService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private location: MapLocationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginStatus$ = this.authService.isLogedIn;

    this.loginStatus$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn
    })

    this.route.paramMap.subscribe(params => {
      this.cityId = +params.get('city');
    });

    this.route.data.subscribe(data => {
      var plan: Plan = data['plan'];
      this.cityName = this.dataService.getCityName()
      this.location.setLocation(plan.plan.plan_items);
      for (var i = 0; i < plan.plan.plan_items.length; i++) {
        this.planItems.push(new PlanningItem(
          new Date(plan.plan.plan_items[i].start_date).toISOString()
          , new Date(plan.plan.plan_items[i].finish_date).toISOString()
          , plan.plan.plan_items[i].place_name
          , plan.plan.plan_items[i].place_info.id
          , plan.plan.plan_items[i].place_info.id + i
        ));
        this.gridItems.push(new PlanningItem(
          new Date(plan.plan.plan_items[i].start_date).toISOString()
          , new Date(plan.plan.plan_items[i].finish_date).toISOString()
          , plan.plan.plan_items[i].place_name
          , plan.plan.plan_items[i].place_info.id
          , plan.plan.plan_items[i].place_info.id + i
        ));
      }
      this.selectedDate = new Date(plan.plan.plan_items[0].start_date);
    });

  }

  public isSelected: boolean = true;
  public dayInterval: number = 3;
  public weeksInterval: number = 2;
  public weekInterval: number = 1;
  title = 'drag-resize-actions';
  public selectedDate: Date;
  public currentView: View = 'Week';
  public setViews: View[] = ['Day', 'Week', 'Month'];


  public dateParser(data: string) {
    return new Date(data);
  }

  @ViewChild('scheduleObj')
  public scheduleObj: ScheduleComponent;
  @ViewChild('gridObj')
  public gridObj: GridComponent;


  public eventSettings: EventSettingsModel = {
    dataSource: this.planItems,
    fields: {
      id: 'id',
      subject: { name: 'placeName' },
      startTime: { name: 'startDate' },
      endTime: { name: 'finishDate' },
    }
  };

  // Grid data
  public allowDragAndDrop: boolean = true;
  public srcDropOptions: RowDropSettingsModel = { targetID: 'Schedule' };
  public primaryKeyVal: boolean = true;
  public editSettings: EditSettingsModel = {
    allowAdding: true,
    allowEditing: true,
    allowDeleting: true
  };

  onRowDrag(event: any): void {
    event.cancel = true;
  }

  onDragStop(event: any): void {
    event.cancel = true;
    let scheduleElement: Element = <Element>closest(event.target, '.e-content-wrap');
    if (scheduleElement) {
      if (event.target.classList.contains('e-work-cells')) {
        const filteredData: Object = event.data;
        let cellData: CellClickEventArgs = this.scheduleObj.getCellDetails(event.target);
        var newPlan: PlanningItem = new PlanningItem(
          cellData.startTime.toISOString()
          , cellData.endTime.toISOString()
          , filteredData[0].placeName
          , filteredData[0].placeId
          , filteredData[0].placeId + 'a'
        );
        this.scheduleObj.addEvent(newPlan)
        for (var i = 0; i < this.gridItems.length; i++) {
          if (this.gridItems[i].placeName == newPlan.placeName) {
            this.gridItems.splice(i, 1);
          }
        }
        this.gridObj.refresh();
      }
    }
  }

  onDragStart(args: DragEventArgs): void {
    args.scroll.enable = true;
    // args.scroll.scrollBy=500;
    args.interval = 1;
    args.navigation.enable = true;

  }

  onResizeStart(args: ResizeEventArgs): void {
    args.scroll.enable = true;
    args.interval = 1;
  }

  addToLocationList(location) {
    let a: PlanItem
    if (!this.isLocationDuplicate(location)) {
      this.gridObj.addRecord(new PlanningItem(
        location.start_date
        , location.finish_date
        , location.name
        , location.place_id
        , location.place_id
      ));
    } else {
      this.openSnackBar("item exists!")
    }
  }

  isLocationDuplicate(location) {
    for (let i = 0; i < this.gridItems.length; i++) {
      if (this.gridItems[i].placeId == location.place_id) {
        return true;
      }
    }
    return false;
  }

  openDialog(): void {
    if (!this.isLoggedIn) {
      this.openSnackBar("login to save the plan!")
      return;
    }
    this.pi = [];
    this.planItems.forEach(pi => {
      this.pi.push({ start_date: pi.startDate, finish_date: pi.finishDate, place_id: pi.placeId })
    });

    this.postPlanService.setPostPlan(
      new PostPlan(
        this.dataService.getCity() + ""
        , ""
        , this.dataService.getStartDate()
        , this.dataService.getEndDate()
        , this.pi
        , ""
      ))

    const dialogRef = this.dialog.open(PostDialogComponent, {
      maxWidth: '1200px',
      maxHeight: '800px',
      minWidth: '550px',
      height: 'auto',
      width: 'auto',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  addPlanDetails(postDetil) {
  }

  openSnackBar(message) {
    this.snackBar.open(
      message, "", {
      duration: 3 * 1000
    }
    );
  }

  goToMyplan() {
    if (this.isLoggedIn)
      this.router.navigate(['/myplans'])
    else
      this.openSnackBar("login to see your plans!")
  }

  goToProfile() {
    if (this.isLoggedIn)
      this.router.navigate(['/profile', 1])
    else
      this.openSnackBar("login to see your profile!")
  }

}
