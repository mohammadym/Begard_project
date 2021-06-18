import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MapComponent } from './map/map.component';
import { SearchComponent } from './search/search.component';
import { DataStorageService } from './data-storage.service';
import { CalenderComponent } from './calender/calender.component';
import { CalenderResolver } from './calender-resolver.service';
import { HomePageComponent } from './home-page/home-page.component';
import { LocationPostComponent } from './location-post/location-post.component';
import { MyPlanComponent } from './my-plan/my-plan.component';
import { ProfileComponent } from './profile/profile.component';
import { PlanComponent } from './plan/plan.component'
import { LandingPageComponent } from './landing-page/landing-page.component';


const appRoutes: Routes = [
    { path: '', redirectTo: '/landingpage', pathMatch: 'full' },
    { path: 'landingpage', component: LandingPageComponent},
    { path: 'login', component: LoginComponent },
    { path: 'register', component: LoginComponent },
    { path: 'search', component: SearchComponent },
    { path: 'myplans', component: MyPlanComponent },
    { path: 'homepage', component: HomePageComponent },
    { path: 'calender/:city', component: CalenderComponent, resolve: { plan: CalenderResolver } },
    { path: 'myplan/:planId', component: PlanComponent },
    { path: 'plan/:planId', component: PlanComponent },
    { path: 'postlocatio', component: LocationPostComponent },
    { path: 'profile/:id', component: ProfileComponent }

]

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]

})
export class AppRoutingModule {

}