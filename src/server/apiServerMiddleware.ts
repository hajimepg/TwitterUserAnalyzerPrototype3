import * as KoaRouter from "koa-router";

import AnalyzeTask from "./analyzeTask";
import AnalyzeTaskRepository from "./analyzeTaskRepository";

const router = new KoaRouter();

async function analyze(task: AnalyzeTask) {
    console.log(`analyzing ${task._id} started`);

    return;
}

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

    setImmediate(() => { analyze(task); });

    ctx.body = { id: task._id };
});

export default router.routes();
