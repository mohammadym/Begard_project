export class MyPlan {
    id;
    destination_city_name;
    destination_city_id;
    creation_date;
    cover;

    constructor(id, destination_city_name, destination_city_id, creation_date, cover) {
        this.id = id;
        this.destination_city_name = destination_city_name;
        this.destination_city_id = destination_city_id;
        this.creation_date = creation_date;
        this.cover = cover;
    }
}
