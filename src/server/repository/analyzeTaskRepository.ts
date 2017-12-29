import * as DataStore from "nedb";

import AnalyzeResult from "../model/analyzeResult";
import AnalyzeTask from "../model/analyzeTask";

class AnalyzeTaskRepository {
    private db;

    public constructor() {
        this.db = new DataStore({ filename: "db/analyazeTask.db" });
    }

    public async init(): Promise<void> {
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
            this.db.insert({ screenName, progresses: [], status: "init" }, (error, newDoc) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve(newDoc);
            });
        });
    }

    public async updateStatus(task: AnalyzeTask, newStatus: string): Promise<AnalyzeTask> {
        return new Promise<AnalyzeTask>((resolve, reject) => {
            const query = { _id: task._id };
            const update = { status: newStatus };
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

    public async updateResult(task: AnalyzeTask, result: AnalyzeResult) {
        return new Promise<AnalyzeTask>((resolve, reject) => {
            const query = { _id: task._id };
            const update = { $set: { result } };
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

    /* tslint:disable-next-line:variable-name */
    public async find(_id: string) {
        return new Promise<AnalyzeTask | null>((resolve, reject) => {
            this.db.findOne({ _id }, (error, doc: AnalyzeTask | null) => {
                if (error !== null) {
                    reject(error);
                }

                resolve(doc);
            });
        });
    }

    public compactiton() {
        this.db.persistence.compactDatafile();
    }
}

export default new AnalyzeTaskRepository();
