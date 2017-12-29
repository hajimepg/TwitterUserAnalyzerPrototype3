import * as lodash from "lodash";

import AnalyzeTask from "./model/analyzeTask";
import User from "./model/user";
import ProfileImageDownloader from "./profileImageDownloader";
import AnalyzeTaskRepository from "./repository/analyzeTaskRepository";
import TwitterGateway from "./twitterGateway";

export async function analyze(task: AnalyzeTask) {
    await AnalyzeTaskRepository.updateStatus(task, "analyze");
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
    const followerScreenNames = followers.map((u) => u.screenName);
    const friendScreenNames = friends.map((u) => u.screenName);
    const followEachOther = lodash.intersectionWith(followerScreenNames, friendScreenNames);
    const followedOnly = lodash.differenceWith(followerScreenNames, friendScreenNames);
    const followOnly = lodash.differenceWith(friendScreenNames, followerScreenNames);
    /* tslint:disable-next-line:object-literal-sort-keys */
    await AnalyzeTaskRepository.updateResult(task, { followEachOther, followedOnly, followOnly });
    await AnalyzeTaskRepository.updateProgress(task, "user grouping finish");

    await AnalyzeTaskRepository.updateProgress(task, "profile image download start");
    const downloader = new ProfileImageDownloader();
    downloader.add(followers);
    downloader.add(followEachOther);
    const result = await downloader.download();
    await AnalyzeTaskRepository.updateProgress(task, "profile image download finish");

    await AnalyzeTaskRepository.updateProgress(task, "Analyzing finish!!");
    await AnalyzeTaskRepository.updateStatus(task, "finish");
}
