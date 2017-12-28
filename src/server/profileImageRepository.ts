import * as DataStore from "nedb";

import ProfileImage from "./profileImage";

class ProfileImageRepository {
    private db;

    public constructor() {
        this.db = new DataStore({ filename: "db/profileImage.db" });
    }

    public async load(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.loadDatabase((error) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                /* tslint:disable-next-line:no-shadowed-variable */
                this.db.ensureIndex({ fieldName: "screenName", unique: true }, (error) => {
                    if (error !== null) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });
        });
    }

    public async upsert(screenName: string, sourceUrl: string, localFileName: string) {
        return new Promise<ProfileImage>((resolve, reject) => {
            const query = { screenName };
            const update = { screenName, sourceUrl, localFileName };
            const options = { upsert: true, returnUpdatedDocs: true };
            this.db.update(query, update, options, (error, numAffected, affectedDocuments) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve(affectedDocuments[0]);
            });

        });
    }

    public async find(screenName: string) {
        return new Promise<ProfileImage | null>((resolve, reject) => {
            this.db.findOne({ screenName }, (error, doc: ProfileImage | null) => {
                if (error !== null) {
                    reject(error);
                }

                resolve(doc);
            });
        });
    }
}

export default new ProfileImageRepository();
