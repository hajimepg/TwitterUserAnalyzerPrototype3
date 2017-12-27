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
            this.db.insert({ screenName }, (error, newDoc) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve(newDoc);
            });
        });
    }
}

export default new AnalyzeTaskRepository();
