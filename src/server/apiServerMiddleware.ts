import * as KoaRouter from "koa-router";

const router = new KoaRouter();

router.post("/api/analyzeTask", async (ctx, next) => {
    console.log(`/api/analyzeTask called`);

    ctx.body = {};
});

export default router.routes();
