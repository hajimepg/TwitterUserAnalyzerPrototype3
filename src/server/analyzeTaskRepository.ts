import * as DataStore from "nedb";

import AnalyzeTask from "./analyzeTask";

class AnalyzeTaskRepository {
    private db;

    public constructor() {
        this.db = new DataStore({ filename: "db/analyazeTask.db" });
    }

    public async load(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.loadDatabase((error) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    }

    public async insert(screenName: string): Promise<AnalyzeTask> {
        return new Promise<AnalyzeTask>((resolve, reject) => {
            this.db.insert({ screenName, progresses: [] }, (error, newDoc) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve(newDoc);
            });
        });
    }

    public async updateProgress(task: AnalyzeTask, newProgress: string): Promise<AnalyzeTask> {
        return new Promise<AnalyzeTask>((resolve, reject) => {
            const query = { _id: task._id };
            const update = { $push: { progresses: newProgress } };
            const options = { returnUpdatedDocs: true };
            this.db.update(query, update, options, (error, numAffected, affectedDocuments) => {
                if (error != null) {
                    reject(error);
                    return;
                }

                if (numAffected !== 1) {
                    reject(new Error(`unexpected rows(id=${task._id}, expected=1, actual=${numAffected}`));
                    return;
                }

                resolve(affectedDocuments[0]);
            });
        });
    }

    public compactiton() {
        this.db.persistence.compactDatafile();
    }
}

export default new AnalyzeTaskRepository();
