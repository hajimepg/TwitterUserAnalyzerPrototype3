import * as KoaRouter from "koa-router";

import * as BackgroundJob from "./backgroundJob";
import AnalyzeTaskRepository from "./repository/analyzeTaskRepository";
import ProfileImageRepository from "./repository/profileImageRepository";

const router = new KoaRouter();

router.get("/api/analyzeTask", async (ctx, next) => {
    if (("id" in ctx.request.query) === false) {
        ctx.response.status = 400;
        ctx.response.body = {
            error: {
                message: "Invalid id"
            }
        };
        return;
    }

    const task = await AnalyzeTaskRepository.find(ctx.request.query.id);

    if (task === null) {
        ctx.response.status = 404;
        ctx.response.body = {
            error: {
                message: `Task(id=${ctx.request.query.id}) not found`
            }
        };
        return;
    }

    let anaylzeResult: any;
    if (task.result !== undefined) {
        const profileImageFiller = async (screenName) => {
            const profileImage = await ProfileImageRepository.find(screenName);
            const profileImageUrl = (profileImage === null)
                ? ""
                : "http://localhost:3000/" + profileImage.localFileName;

            return { profileImageUrl, screenName };
        };

        const followEachOtherResult = await Promise.all(task.result.followEachOther.map(profileImageFiller));
        const followedOnlyResult = await Promise.all(task.result.followedOnly.map(profileImageFiller));
        const followOnlyResult = await Promise.all(task.result.followOnly.map(profileImageFiller));

        // tslint:disable:object-literal-sort-keys
        anaylzeResult = {
            followEachOther: followEachOtherResult,
            followedOnly: followedOnlyResult,
            followOnly: followOnlyResult
        };
        // tslint:enable:object-literal-sort-keys
    }

    // tslint:disable:object-literal-sort-keys
    ctx.body = {
        _id: task._id,
        screenName: task.screenName,
        status: task.status,
        progresses: task.progresses,
        result: anaylzeResult
    };
    // tslint:enable:object-literal-sort-keys
});

router.post("/api/analyzeTask", async (ctx, next) => {
    if (ctx.request.hasOwnProperty("body") === false) {
        ctx.response.status = 400;
        ctx.response.body = {
            error: {
                message: "Empty Body"
            }
        };
        return;
    }

    if (ctx.request.body.hasOwnProperty("screenName") === false
        || ctx.request.body.screenName.length === 0) {
        ctx.response.status = 400;
        ctx.response.body = {
            error: {
                message: "Invalid screenName"
            }
        };
        return;
    }

    const task = await AnalyzeTaskRepository.insert(ctx.request.body.screenName);

    setImmediate(() => { BackgroundJob.analyze(task); });

    ctx.body = { id: task._id };
});

export default router.routes();
