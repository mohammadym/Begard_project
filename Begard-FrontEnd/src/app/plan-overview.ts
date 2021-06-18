export class PlanOverView {
    id;
    creation_date;
    plan_id;
    city;
    user;
    username;
    profile_image;
    cover;
    rate;

    constructor(id, creation_date, rate, user, plan_id, city, username, profile_image, cover) {
        this.creation_date = creation_date;
        this.plan_id = plan_id;
        this.city = city;
        this.username = username;
        this.profile_image = profile_image;
        this.cover = cover;
        this.rate = rate;
        this.id = id;
        this.user = user;
    }
}
