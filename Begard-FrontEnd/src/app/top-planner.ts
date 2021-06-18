export class TopPlanner {
    email;
    average_rate;
    username;
    profile_img;
    is_public;
    pk;
    
    constructor(email, average_rate, username, profile_img, is_public, pk) {
        this.email = email;
        this.average_rate = average_rate;
        this.username = username;
        this.profile_img = profile_img;
        this.is_public = is_public;
        this.pk = pk;
    }
}
