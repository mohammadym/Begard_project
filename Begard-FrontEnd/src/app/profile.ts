
export class Profile {
    username: string;
    profile_image: string;
    posts_count: number;
    followings_count: number;
    followers_count: number;
    following_state: string;
    follow_request_id: string;

    constructor(username: string,
        profile_image: string,
        posts_count: number,
        followings_count: number,
        followers_count: number,
        following_state: string) {

        this.username = username
        this.profile_image = profile_image
        this.posts_count = posts_count
        this.followings_count = followings_count
        this.followers_count = followers_count
        this.following_state = following_state
    }
}