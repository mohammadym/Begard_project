export class Location{
    public name: string ;
    public lng: string;
    public lat: string;
    public address: string;
    public rating: string;
    public photo_ref: string;
    public place_id: string;
    public city:number;
    

    constructor(address: string , city: number , lat: string , lng: string, name:string,
        photo_ref:string,place_id:string,rating:string ){
            this.name = name;
            this.lng = lng;
            this.lat = lat;
            this.place_id = place_id;
            this.address = address;
            this.rating = rating;
            this.city=city;
            this.photo_ref=photo_ref;
        

    }
}