import axios from "axios";
import * as lodash from "lodash";

import User from "./model/user";
import ProfileImageRepository from "./profileImageRepository";

export default class ProfileImageDownloader {
    protected downloadQueue: User[];

    public add(users: User[]): void {
        const userComparator = (a, b) => a.screenName === b.screenName;

        this.downloadQueue = lodash.unionWith(this.downloadQueue, users, userComparator);
    }

    public download() {
        return new Promise<void>(async (resolve, reject) => {
            while (true) {
                const target = this.downloadQueue.shift();

                if (target === undefined) {
                    resolve();
                    return;
                }

                const oldProfileImage = await ProfileImageRepository.find(target.screenName);
                if (oldProfileImage !== null && oldProfileImage.sourceUrl === target.profileImageUrl) {
                    console.log(`profile image for ${target.screenName} is already downloaded. skip.`);
                    continue;
                }

                const response = await axios.get(target.profileImageUrl, { responseType: "arraybuffer" });

                if (response.status !== 200) {
                    console.log(`download ${target.profileImageUrl} failed. statusCode=${response.status}`);
                    continue;
                }

                const contentType = response.headers["content-type"];
                const extension = this.getExtension(contentType);
                if (extension === "") {
                    console.log(`Unsupported content-type: ${contentType}`);
                    continue;
                }

                const filename = `${target.screenName}.${extension}`;
                ProfileImageRepository.upsert(target.screenName, target.profileImageUrl, filename,
                    new Buffer(response.data, "binary"));
            }
        });
    }

    protected getExtension(contentType: string): string {
        switch (contentType) {
            case "image/jpeg":
                return "jpg";
            case "image/png":
                return "png";
            default:
                return "";
        }
    }
}
