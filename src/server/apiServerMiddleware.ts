import * as KoaRouter from "koa-router";

import AnalyzeTask from "./analyzeTask";
import AnalyzeTaskRepository from "./analyzeTaskRepository";
import User from "./model/user";
import TwitterGateway from "./twitterGateway";

const router = new KoaRouter();

function getList(
    endpoint: string,
    onRequest: (numuber) => void,
    onRequestSuccuess: (numuber) => void,
    onRateLimit: () => void
): Promise<User[]> {
    return new Promise<User[]>((resolve, reject) => {
        const users: User[] = [];

        function getUserListInternal(cursor: number) {
            onRequest(cursor);

            const options = { skip_status: true, count: 200, cursor };

            TwitterGateway.client.get(endpoint, options, (error, response) => {
                if (error) {
                    if (error[0].message !== "Rate limit exceeded") {
                        reject(error);
                        return;
                    }

                    onRateLimit();
                    setTimeout(() => { getUserListInternal(cursor); }, 60 * 1000);
                    return;
                }

                for (const user of response.users) {
                    users.push({
                        profileImageUrl: user.profile_image_url,
                        screenName: user.screen_name,
                    });
                }

                onRequestSuccuess(cursor);

                if (response.next_cursor === 0) {
                    resolve(users);
                }
                else {
                    getUserListInternal(response.next_cursor);
                }
            });
        }

        getUserListInternal(-1);
    });
}

function getFollowers(task: AnalyzeTask): Promise<User[]> {
    return getList(
        "followers/list",
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
}

// debug
async function setTimeoutPromise(delay: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        setTimeout(resolve, delay);
    });
}
// ここまでdebug

async function analyze(task: AnalyzeTask) {
    await AnalyzeTaskRepository.updateProgress(task, "analyzing started");
    try {
        const followers = await getFollowers(task);
    }
    catch (error) {
        console.error(JSON.stringify(error, null, 4));
    }
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
