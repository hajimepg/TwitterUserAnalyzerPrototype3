import * as Twitter from "twitter";

import User from "./model/user";

interface ITwitterCredential {
    access_token_key: string | undefined;
    access_token_secret: string | undefined;
    consumer_key: string | undefined;
    consumer_secret: string | undefined;
}

class TwitterGateway {
    protected client;

    public init(credential: ITwitterCredential) {
        this.client = new Twitter(credential);
    }

    public getFollowers(
        onRequest: (numuber) => void,
        onRequestSuccuess: (numuber) => void,
        onRateLimit: () => void
    ): Promise<User[]> {
        return this.getUserList("followers/list", onRequest, onRequestSuccuess, onRateLimit);
    }

    public getFriends(
        onRequest: (numuber) => void,
        onRequestSuccuess: (numuber) => void,
        onRateLimit: () => void
    ): Promise<User[]> {
        return this.getUserList("friends/list", onRequest, onRequestSuccuess, onRateLimit);
    }

    protected getUserList(
        endpoint: string,
        onRequest: (numuber) => void,
        onRequestSuccuess: (numuber) => void,
        onRateLimit: () => void
    ): Promise<User[]> {
        const self = this;

        return new Promise<User[]>((resolve, reject) => {
            const users: User[] = [];

            function getUserListInternal(cursor: number) {
                onRequest(cursor);

                const options = { skip_status: true, count: 200, cursor };

                self.client.get(endpoint, options, (error, response) => {
                    if (error) {
                        if (error[0].message !== "Rate limit exceeded") {
                            reject(error);
                            return;
                        }

                        onRateLimit();
                        setTimeout(() => { getUserListInternal(cursor); }, 60 * 1000);
                        return;
                    }

                    for (const user of response.users) {
                        users.push({
                            profileImageUrl: user.profile_image_url,
                            screenName: user.screen_name,
                        });
                    }

                    onRequestSuccuess(cursor);

                    if (response.next_cursor === 0) {
                        resolve(users);
                    }
                    else {
                        getUserListInternal(response.next_cursor);
                    }
                });
            }

            getUserListInternal(-1);
        });
    }
}

export default new TwitterGateway();
