import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from './user.service';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { AngularMaterialModule } from './angular-material.module';
import { HttpClientModule } from '@angular/common/http';
import { TabModule } from '@syncfusion/ej2-angular-navigations';


import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SearchComponent } from './search/search.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataStorageService } from './data-storage.service';
import { AppRoutingModule } from './app-routing.module';
import { LocationService } from './map/location.service';
import { DynamicSearchService } from './dynamic-search.service';
import { ScheduleModule, RecurrenceEditorModule, DayService, WeekService, WorkWeekService, MonthService, MonthAgendaService, DragAndDropService, ResizeService } from '@syncfusion/ej2-angular-schedule';
import { CalenderComponent } from './calender/calender.component';
import { NavBarService } from './nav-bar.service'

import { GridModule, RowDDService, EditService } from '@syncfusion/ej2-angular-grids';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DynamicSearchComponent } from './dynamic-search/dynamic-search.component';

import { environment } from '../environments/environment';
import { CalenderResolver } from './calender-resolver.service';
import { HomePageComponent } from './home-page/home-page.component';
import { NavBarComponent} from './nav-bar/nav-bar.component';
import { HorizontlListComponent } from './horizontl-list/horizontl-list.component';
import { NguCarouselModule } from '@ngu/carousel';
import { PlanOverviewComponent } from './plan-overview/plan-overview.component';
import { PostDialogComponent } from './post-dialog/post-dialog.component';


import { MapLocationService } from './map-locations.service';
import { LocationPostComponent } from './location-post/location-post.component';
import { CommentComponent } from './location-post/comment/comment.component';
import { LocationCarouselComponent } from './location-post/location-carousel/location-carousel.component';

import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { LocationPostService } from './location-post/location-post.service';
import { ProfileComponent, UnfollowDialog } from './profile/profile.component';
import { TopPlannersComponent } from './top-planners/top-planners.component';
import { MyPlanComponent } from './my-plan/my-plan.component';

import { MyPlanService } from './my-plan.service';
import { ProfileService } from './profile.service';


import { TopPlannersService } from './top-planners.service';
import { PostLocationComponent } from './post-location/post-location.component';

import { PostLocationService } from './post-location.service';

import { MyLocationService } from './my-location.service';
import { PlanComponent } from './plan/plan.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { FollowerDialogComponent } from './follower-dialog/follower-dialog.component';

import { StarRatingComponent } from './start-rating/star-rating.component';

@NgModule({
   declarations: [
      AppComponent,
      MapComponent,
      HeaderComponent,
      LoginComponent,
      RegisterComponent,
      SearchComponent,
      CalenderComponent,
      DynamicSearchComponent,
      HomePageComponent,
      NavBarComponent,
      HorizontlListComponent,
      PlanOverviewComponent,
      PostDialogComponent,
      LocationPostComponent,
      CommentComponent,
      LocationCarouselComponent,
      TopPlannersComponent,
      MyPlanComponent,
      ProfileComponent,
      UnfollowDialog,
      PostLocationComponent,
      PlanComponent,
      LandingPageComponent,
      FollowerDialogComponent,
      StarRatingComponent
   ],
   imports: [
      BrowserModule,
      FormsModule,
      BrowserAnimationsModule,
      AngularMaterialModule,
      ReactiveFormsModule,
      HttpClientModule,
      AppRoutingModule,
      MatSelectModule,
      MatToolbarModule,
      MatFormFieldModule,
      MatIconModule,
      NgxMatSelectSearchModule,
      MatButtonModule,
      FlexLayoutModule,
      ScheduleModule,
      RecurrenceEditorModule,
      GridModule,
      DropDownListModule,
      DateTimePickerModule,
      NguCarouselModule,
      TabModule,
      MDBBootstrapModule,
   ],

   providers: [ DataStorageService, MyPlanService, MyLocationService, ProfileService, PostLocationService, TopPlannersService, UserService, LocationService, DynamicSearchService, CalenderResolver, MapLocationService, NavBarService, LocationPostService],
   bootstrap: [
      AppComponent
   ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
