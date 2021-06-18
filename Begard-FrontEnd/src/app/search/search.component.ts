import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { City } from '../city.model';
import { LocationService } from '../map/location.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataStorageService } from '../data-storage.service';
import { inArray } from '@syncfusion/ej2-angular-grids';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {

  startDateControl: FormControl = new FormControl('', [Validators.required]);
  endDateControl: FormControl = new FormControl('', [Validators.required]);
  endDateDisable = true;
  endDateMin: Date;
  startDateMin: Date;
  startDate: Date;
  endDate: Date;

  suggestButtonDisabled = true;

  /** list of cities */
  protected cities: City[] = [];


  /** control for the selected city */
  public cityCtrl: FormControl = new FormControl('', [Validators.required]);

  /** control for the MatSelect filter keyword */
  public cityFilterCtrl: FormControl = new FormControl('', [Validators.required]);

  /** list of cities filtered by search keyword */
  public filteredCities: ReplaySubject<City[]> = new ReplaySubject<City[]>(1);

  @ViewChild('citySelect', { static: true }) citySelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();


  constructor(private locationService: LocationService,
    private router: Router,
    private route: ActivatedRoute,
    private dataStorageService: DataStorageService) {
  }

  ngOnInit() {
    this.getCities();
    // set initial selection
    this.cityCtrl.setValue(this.cities[0]);

    // load the initial city list
    this.filteredCities.next(this.cities.slice());

    // listen for search field value changes
    this.cityFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCities();
      });

    //set start min date to current date
    this.startDateMin = new Date();
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Sets the initial value after the filteredCities are loaded initially
   */
  protected setInitialValue() {
    this.filteredCities
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredCities are loaded initially
        // and after the mat-option elements are available
        this.citySelect.compareWith = (a: City, b: City) => a && b && a.id === b.id;
      });
  }

  protected filterCities() {
    if (!this.cities) {
      return;
    }
    // get the search keyword
    let search = this.cityFilterCtrl.value;
    if (!search) {
      this.filteredCities.next(this.cities.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the cities
    this.filteredCities.next(
      this.cities.filter(city => city.name.toLowerCase().indexOf(search) > -1)
    );
  }

  onSearch() {
    if (!this.startDateControl.valid || !this.endDateControl.valid || !this.isDestinationValid()) {
      return;
    }
    var startdate = new Date(this.startDateControl.value);
    var enddate = new Date(this.endDateControl.value);
    var startday: string = startdate.getFullYear() + '-' + (+startdate.getMonth() + 1) + '-' +
      startdate.getDate() + 'T0:0Z';
    var endday: string = enddate.getFullYear() + '-' + (+enddate.getMonth() + 1) + '-' +
      enddate.getDate() + 'T0:0Z';
    this.dataStorageService.planUrl = environment.baseUrl +'/cities/' + this.cityCtrl.value?.id + '/suggest-plan/?start_date=' +
      startday + '&finish_date=' + endday;
    this.dataStorageService.setStartDate(startday);
    this.dataStorageService.setEndDate(endday);
    this.dataStorageService.setCityName(this.cityCtrl.value?.name)
    this.dataStorageService.setCity(this.cityCtrl.value?.id);
  }


  private getCities() {
    const promise = new Promise((resolve, reject) => {
      this.dataStorageService.getCities()
        .toPromise()
        .then((cities: City[]) => {
          this.cities = cities;
          resolve();
        },
          err => {
            reject(err);
          }
        );
    });
    return promise;
  }

  onStartDateChanged(startDate) {
    this.startDate = startDate;
    if (startDate == null) {
      this.endDateDisable = true;
      this.endDateMin = null;
    }
    else {
      this.startDate = startDate;
      this.endDateDisable = false;
      this.endDateMin = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getUTCDate() + 2);
    }
  }

  onEndDateChanged(endDate) {
    this.endDate = endDate;
    this.updateSuggestButtonEnabled();
  }

  updateSuggestButtonEnabled() {
    this.suggestButtonDisabled = !(this.cityCtrl.valid && this.startDateControl.valid && this.endDateControl.valid)
  }

  isDestinationValid() {
    //TODO : check the entry with list of cities. we have to find the best practice. this is temporary
    return this.cityCtrl.valid;
  }

  onSelectionChanged(){
    this.updateSuggestButtonEnabled()
  }
}
