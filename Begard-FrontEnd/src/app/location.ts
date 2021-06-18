export class Location {
    public place_id: string;
    public name: string;
    public rating: string;
    public address: string;
    public photo_ref: string;
    public lng: string;
    public lat: string;
    public city: number;

    constructor(place_id: string, name: string, rating: string
        , address: string, photo_ref: string, lng: string
        , lat: string, city: number
    ) {
        this.place_id = place_id;
        this.name = name;
        this.rating = rating;
        this.address = address;
        this.photo_ref = photo_ref;
        this.lng = lng;
        this.lat = lat;
        this.city = city;
    }

}
