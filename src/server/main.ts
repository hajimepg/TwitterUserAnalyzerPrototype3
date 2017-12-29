#!/usr/bin/env node

import * as path from "path";

import * as Koa from "koa";
import * as KoaBodyParser from "koa-body-parser";
import * as KoaStatic from "koa-static";
import * as Twitter from "twitter";

import AnalyzeTaskRepository from "./repository/analyzeTaskRepository";
import ProfileImageRepository from "./repository/profileImageRepository";
import TwitterGateway from "./twitterGateway";

import ApiServerMiddleware from "./apiServerMiddleware";

const twitterClient = new Twitter({
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
});
TwitterGateway.init(twitterClient);

const app = new Koa();

app.use(KoaStatic(path.join(__dirname, "../../static")));
app.use(KoaStatic(path.join(__dirname, "../client")));

app.use(KoaBodyParser());

app.use(ApiServerMiddleware);

AnalyzeTaskRepository.init()
    .then(() => { ProfileImageRepository.init(); })
    .then(() => { app.listen(3000); })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
