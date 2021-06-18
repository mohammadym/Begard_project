export interface PI {
    start_date: string,
    finish_date: string,
    place_id: string,
}

export class PostPlan {
    destination_city: string;
    description: string;
    start_date: string;
    finish_date: string;
    plan_items: PI[];
    image: string;

    constructor(destination_city: string,
        description: string,
        start_date: string,
        finish_date: string,
        plan_items: PI[],
        image: string) {

        this.start_date = start_date;
        this.finish_date = finish_date;
        this.description = description;
        this.plan_items = plan_items;
        this.destination_city = destination_city;
        this.image = image;
    }

    public setDescription(description) {
        this.description = description;
    }

    public setImage(image) {
        this.image = image;
    }
}
