import * as KoaRouter from "koa-router";

import AnalyzeTask from "./analyzeTask";
import AnalyzeTaskRepository from "./analyzeTaskRepository";

const router = new KoaRouter();

// debug
async function setTimeoutPromise(delay: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        setTimeout(resolve, delay);
    });
}
// ここまでdebug

async function analyze(task: AnalyzeTask) {
    await AnalyzeTaskRepository.updateProgress(task, "analyzing started");
    await setTimeoutPromise(1000);
    await AnalyzeTaskRepository.updateProgress(task, "Analyzing (1/3) ...");
    await setTimeoutPromise(1000);
    await AnalyzeTaskRepository.updateProgress(task, "Analyzing (2/3) ...");
    await setTimeoutPromise(1000);
    await AnalyzeTaskRepository.updateProgress(task, "Analyzing (3/3) ...");
    await setTimeoutPromise(1000);
    await AnalyzeTaskRepository.updateProgress(task, "Analyzing finish!!");

    AnalyzeTaskRepository.compactiton(); // debug
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
