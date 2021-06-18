import { Location } from './location.model';
import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlanItem } from '../data-storage.service';
import { MapMarker } from './mapmarker.model';

@Injectable()

export class LocationService {

    constructor(private httpClinet: HttpClient) {

    }

    cityId: number = 1;
    locationSelected = new EventEmitter<Location>();

    public locations: MapMarker[];

    getLocations() {
        return this.locations.slice();
    }

    getLocation(id: number) {
        return this.locations.slice()[id];
    }

    setId(id: number) {
        this.cityId = id;
    }

    setLocation(planitems: PlanItem[]) {
        this.locations = [];
        for (var i = 0; i < planitems.length; i++) {
            this.locations.push({ lan: planitems[i].place_info.lng, lat: planitems[i].place_info.lat, place_name: planitems[i].place_name });
        }
    }
}
