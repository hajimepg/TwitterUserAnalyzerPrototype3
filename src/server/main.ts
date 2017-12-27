#!/usr/bin/env node

import * as path from "path";

import * as Koa from "koa";
import * as KoaBodyParser from "koa-body-parser";
import * as KoaStatic from "koa-static";

import AnalyzeTaskRepository from "./analyzeTaskRepository";
import TwitterGateway from "./twitterGateway";

import ApiServerMiddleware from "./apiServerMiddleware";

TwitterGateway.init({
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
});

const app = new Koa();

app.use(KoaStatic(path.join(__dirname, "../../static")));
app.use(KoaStatic(path.join(__dirname, "../client")));

app.use(KoaBodyParser());

app.use(ApiServerMiddleware);

AnalyzeTaskRepository.load().then(() => {
    app.listen(3000);
});
