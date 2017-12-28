import axios from "axios";
import * as lodash from "lodash";

import User from "./model/user";
import ProfileImageDownloadResult from "./profileImageDownloadResult";
import ProfileImageRepository from "./profileImageRepository";

export default class ProfileImageDownloader {
    protected downloadQueue: User[];

    public add(users: User[]): void {
        const userComparator = (a, b) => a.screenName === b.screenName;

        this.downloadQueue = lodash.unionWith(this.downloadQueue, users, userComparator);
    }

    public download() {
        return new Promise<ProfileImageDownloadResult>(async (resolve, reject) => {
            const result = new ProfileImageDownloadResult();

            while (true) {
                const target = this.downloadQueue.shift();

                if (target === undefined) {
                    resolve(result);
                    return;
                }

                const oldProfileImage = await ProfileImageRepository.find(target.screenName);
                if (oldProfileImage !== null && oldProfileImage.sourceUrl === target.profileImageUrl) {
                    result.skip.push(target);
                    continue;
                }

                const response = await axios.get(target.profileImageUrl, { responseType: "arraybuffer" });

                if (response.status !== 200) {
                    result.fail.push({ user: target, reason: `statusCode=${response.status}` });
                    continue;
                }

                const contentType = response.headers["content-type"];
                const extension = this.getExtension(contentType);
                if (extension === "") {
                    result.fail.push({ user: target, reason: `Unsupported content-type: ${contentType}` });
                    continue;
                }

                const filename = `${target.screenName}.${extension}`;
                ProfileImageRepository.upsert(target.screenName, target.profileImageUrl, filename,
                    new Buffer(response.data, "binary"));
                result.success.push(target);
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
