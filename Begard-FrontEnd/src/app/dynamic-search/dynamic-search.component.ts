import { Component, OnInit ,Output ,EventEmitter , Input} from '@angular/core';
import { DynamicSearchService } from '../dynamic-search.service';
import { Observable, observable, of } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '../location'
import {
  startWith,
  map,
  debounceTime,
  switchMap,
  catchError
} from 'rxjs/operators';

@Component({
  selector: 'app-dynamic-search',
  templateUrl: './dynamic-search.component.html',
  styleUrls: ['./dynamic-search.component.css']
})
export class DynamicSearchComponent implements OnInit {
  public locationsAutoComplete$: Observable<Location> = null;
  public autoCompleteControl = new FormControl();
  @Input() cityId: number;
  @Output() locationEventEmmiter: EventEmitter<Location> = new EventEmitter<Location>();

  constructor(
    private dynamicSearchService: DynamicSearchService
    , private route: ActivatedRoute
  ) { }

  lookup(value, cityId: number): Observable<Location> {
    return this.dynamicSearchService.search(value.toLowerCase(), cityId).pipe(
      // map the item property of the github results as our return object
      map(results => results),
      // catch errors
      catchError(_ => {
        return of(null);
      })
    );
  }

  ngOnInit() {
    this.locationsAutoComplete$ = this.autoCompleteControl.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '' && typeof value == 'string') {
          // lookup from github
          return this.lookup(value, this.cityId);
        } else {
          // if no value is pressent, return null
          return of(null);
        }
      })
    );
  }

  //send selected location to calender component
  onSelectionChanged(selectedLocation) { 
    this.locationEventEmmiter.emit(selectedLocation.option.value);
   }

   //clean autocomplete input
   displayNull(value) {
    return "";
  }

}
