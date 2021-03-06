#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as process from "process";

import * as Commander from "commander";
import * as Koa from "koa";
import * as KoaBodyParser from "koa-body-parser";
import * as KoaStatic from "koa-static";
import * as Twitter from "twitter";

import AnalyzeTaskRepository from "./repository/analyzeTaskRepository";
import ProfileImageRepository from "./repository/profileImageRepository";

import BackgroundJob from "./backgroundJob";
import TwitterGateway from "./twitterGateway";

import ApiServerMiddleware from "./apiServerMiddleware";

import StubTwitterClient from "./stub/stubTwitterClient";

Commander
    .option("--create-stub")
    .option("--use-stub")
    .parse(process.argv);

if (Commander.createStub) {
    BackgroundJob.init(
        (followers: any[]) => {
            fs.writeFileSync("./stubData/stubTwitterClientDataFollowers.json", JSON.stringify(followers, null, 4));
        },
        (friends: any[]) => {
            fs.writeFileSync("./stubData/stubTwitterClientDataFriends.json", JSON.stringify(friends, null, 4));
        }
    );
}
else {
    /* tslint:disable:no-empty */
    BackgroundJob.init(
        () => {},
        () => {}
    );
    /* tslint:enable:no-empty */
}

const twitterClient = (Commander.useStub)
    ? new StubTwitterClient()
    : new Twitter({
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    });
TwitterGateway.init(twitterClient);

const app = new Koa();

app.use(KoaStatic(path.join(__dirname, "../../static")));
app.use(KoaStatic(path.join(__dirname, "../client")));
app.use(KoaStatic(path.join(__dirname, "../../db/profileImage")));

app.use(KoaBodyParser());

app.use(ApiServerMiddleware);

AnalyzeTaskRepository.init()
    .then(() => { ProfileImageRepository.init(); })
    .then(() => { app.listen(3000); })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });

process.on("unhandledRejection", (reason, promise) => {
    console.error(reason);
});
