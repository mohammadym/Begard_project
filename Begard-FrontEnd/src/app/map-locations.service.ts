import { MapMarker } from './map/mapmarker.model';
import { PlanItem, PI } from './data-storage.service';


export class MapLocationService {

    public locations: MapMarker[];

    setLocation(planitems: PlanItem[] | PI[]) {
        this.locations = [];
        for (var i = 0; i < planitems.length; i++) {
            this.locations.push({ lan: planitems[i].place_info.lng, lat: planitems[i].place_info.lat, place_name: planitems[i].place_name });
        }
    }

    getLocations() {
        return this.locations;
    }
}