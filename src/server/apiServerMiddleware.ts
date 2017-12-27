import * as KoaRouter from "koa-router";

import AnalyzeTaskRepository from "./analyzeTaskRepository";

const router = new KoaRouter();

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

    ctx.body = { id: task._id };
});

export default router.routes();
