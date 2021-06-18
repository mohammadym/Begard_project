import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { City } from './city.model';
import { first, map, take, exhaustMap } from 'rxjs/operators'
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PlanItem {
    start_date: string,
    finish_date: string,
    place_name: string,
    place_info: { id: string, lat: string, lng: string }
}

export interface Plan {
    plan: {
        start_date: string,
        finish_date: string,
        plan_items: PlanItem[]
    }
}

export interface PI {
    id;
    place_id;
    finish_date;
    start_date;
    place_info: { id: string, lat: string, lng: string };
    place_name;
}

export interface MyPlan {
    id;
    user;
    destination_city_id;
    destination_city_name;
    description;
    creation_date;
    start_date;
    finish_date;
    cover;
    plan_items: PI[];
}

@Injectable()

export class DataStorageService {
    public planUrl: string = '';
    start_date;
    finish_date;
    city;
    cityName;

    constructor(
        private http: HttpClient,
        private authservice: AuthService
    ) { }


    getSuggestedPlan(): Observable<Plan> {
        return this.authservice.user.pipe(take(1), exhaustMap(user => {
            return this.http.get<Plan>(this.planUrl);
        }));
    }

    getPlan(planId): Observable<MyPlan> {
        let url = environment.baseUrl + "/plans/" + planId + "/"

        return this.authservice.user.pipe(take(1), exhaustMap(user => {
            if (user == null){
                return this.http
                .get<MyPlan>(url, {
                    observe: 'response',
                })
                .pipe(
                    map(res => {
                        return res.body;
                    })
                );
            }else{
                var token = 'token ' + user.token;

                return this.http
                .get<MyPlan>(url, {
                    observe: 'response',
                    headers: new HttpHeaders({ 'Authorization': token })
                })
                .pipe(
                    map(res => {
                        return res.body;
                    })
                );
            }
        }));
    }


    getCities() {
        return this.http.get<City[]>(environment.baseUrl + '/cities/');
    }

    getPlanUrl() {
        return this.planUrl;
    }

    setStartDate(sd) {
        this.start_date = sd;
    }

    setEndDate(ed) {
        this.finish_date = ed;
    }

    setCity(c) {
        this.city = c;
    }

    getStartDate() {
        return this.start_date;
    }

    getEndDate() {
        return this.finish_date;
    }

    getCity() {
        return this.city;
    }

    setCityName(name) {
        this.cityName = name;
    }

    getCityName() {
        return this.cityName;
    }

}
