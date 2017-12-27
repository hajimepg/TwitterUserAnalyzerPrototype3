import * as Twitter from "twitter";

interface ITwitterCredential {
    access_token_key: string | undefined;
    access_token_secret: string | undefined;
    consumer_key: string | undefined;
    consumer_secret: string | undefined;
}

class TwitterGateway {
    public client;

    public init(credential: ITwitterCredential) {
        this.client = new Twitter(credential);
    }
}

export default new TwitterGateway();
