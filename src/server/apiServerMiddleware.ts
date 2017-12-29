import * as KoaRouter from "koa-router";

import * as BackgroundJob from "./backgroundJob";
import AnalyzeTaskRepository from "./repository/analyzeTaskRepository";

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

    ctx.body = task;
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
