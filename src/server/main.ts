#!/usr/bin/env node

import * as path from "path";

import * as Koa from "koa";
import * as KoaBodyParser from "koa-body-parser";
import * as KoaStatic from "koa-static";

import ApiServerMiddleware from "./apiServerMiddleware";

const app = new Koa();

app.use(KoaStatic(path.join(__dirname, "../../static")));
app.use(KoaStatic(path.join(__dirname, "../client")));

app.use(KoaBodyParser());

app.use(ApiServerMiddleware);

app.listen(3000);
