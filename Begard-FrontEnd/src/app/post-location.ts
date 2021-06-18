export interface Image {
    image: string;
}

export class PostLocation {
    type: string;
    content: string;
    place_id: string;
    plan_id: string;
    place_name: string;
    image: Image[];

    constructor(type: string, content: string,plan_id:string, place_id: string, place_name: string, images: Image[]) {
        this.type = type;
        this.content = content;
        this.place_id = place_id;
        this.place_name = place_name;
        this.image = images;
        this.plan_id = plan_id;
    }
}
