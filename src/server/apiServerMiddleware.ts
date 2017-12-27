import * as KoaRouter from "koa-router";

import AnalyzeTaskRepository from "./analyzeTaskRepository";

const router = new KoaRouter();

router.post("/api/analyzeTask", async (ctx, next) => {
    console.log(`/api/analyzeTask called. ctx.request.body.screenName=${ctx.request.body.screenName}`);

    const task = await AnalyzeTaskRepository.insert(ctx.request.body.screenName);

    ctx.body = { id: task._id };
});

export default router.routes();
