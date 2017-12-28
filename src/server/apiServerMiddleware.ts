import * as KoaRouter from "koa-router";
import * as lodash from "lodash";

import AnalyzeTask from "./analyzeTask";
import AnalyzeTaskRepository from "./analyzeTaskRepository";
import User from "./model/user";
import ProfileImageDownloader from "./profileImageDownloader";
import TwitterGateway from "./twitterGateway";

const router = new KoaRouter();

async function analyze(task: AnalyzeTask) {
    await AnalyzeTaskRepository.updateProgress(task, "analyzing started");

    let followers: User[];
    let friends: User[];
    try {
        followers = await TwitterGateway.getFollowers(
            async (cursor: number) => {
                await AnalyzeTaskRepository.updateProgress(task, `get followers(${cursor})`);
            },
            async (cursor: number) => {
                await AnalyzeTaskRepository.updateProgress(task, `get followers(${cursor}) finished.`);
            },
            async () => {
                await AnalyzeTaskRepository.updateProgress(task, "Rate limit exceeded. wait 60 sec.");
            }
        );
        friends = await TwitterGateway.getFriends(
            async (cursor: number) => {
                await AnalyzeTaskRepository.updateProgress(task, `get friends(${cursor})`);
            },
            async (cursor: number) => {
                await AnalyzeTaskRepository.updateProgress(task, `get friends(${cursor}) finished.`);
            },
            async () => {
                await AnalyzeTaskRepository.updateProgress(task, "Rate limit exceeded. wait 60 sec.");
            }
        );
    }
    catch (error) {
        console.error(JSON.stringify(error, null, 4));
        return;
    }

    await AnalyzeTaskRepository.updateProgress(task, "user grouping start");
    const userComparator = (a, b) => a.screenName === b.screenName;
    const followEachOther = lodash.intersectionWith(followers, friends, userComparator);
    const followedOnly = lodash.differenceWith(followers, friends, userComparator);
    const followOnly = lodash.differenceWith(friends, followers, userComparator);
    /* tslint:disable-next-line:object-literal-sort-keys */
    await AnalyzeTaskRepository.updateResult(task, { followEachOther, followedOnly, followOnly });
    await AnalyzeTaskRepository.updateProgress(task, "user grouping finish");

    await AnalyzeTaskRepository.updateProgress(task, "profile image download start");
    const downloader = new ProfileImageDownloader();
    downloader.add(followers);
    downloader.add(followEachOther);
    const result = await downloader.download();
    console.log(JSON.stringify(result, null, 4));
    await AnalyzeTaskRepository.updateProgress(task, "profile image download finish");

    await AnalyzeTaskRepository.updateProgress(task, "Analyzing finish!!");
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
