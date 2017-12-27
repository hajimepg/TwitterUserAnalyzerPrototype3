import * as KoaRouter from "koa-router";

const router = new KoaRouter();

router.post("/api/analyzeTask", async (ctx, next) => {
    console.log(`/api/analyzeTask called. ctx.request.body.screenName=${ctx.request.body.screenName}`);

    ctx.body = {};
});

export default router.routes();
